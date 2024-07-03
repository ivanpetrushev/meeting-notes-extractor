const s3 = require("../lib/s3");
const { config } = require("../config");
const ddbModel = require("../models/dynamodb");
const driveModel = require("../models/drive");

const allowedExtensions = [
  "mp3",
  "mp4",
  "wav",
  "flac",
  "ogg",
  "amr",
  "webm",
  "m4a",
];

module.exports.handler = async (event) => {
  // when invoked from browser, it will request for favicon
  if (event?.rawPath === "/favicon.ico") {
    return {
      statusCode: 200,
      body: "",
    };
  }
  console.log("event", event);

  // invoked from google OAuth2 callback
  if (event?.rawPath === "/callback") {
    const code = event?.queryStringParameters?.code;
    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid code",
        }),
      };
    }
    const tokens = await driveModel.getCallbackTokens(code);
    console.log("tokens", tokens);

    await ddbModel.storeTokens(tokens);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Auth successful",
      }),
    };
  }

  const initialTokens = await ddbModel.getTokens();
  console.log("initialTokens", initialTokens);
  const tokens = await driveModel.refreshToken(initialTokens);
  await ddbModel.storeTokens(tokens);
  // hopefully invoked from browser - first run
  if (!tokens) {
    const authorizeUrl = await driveModel.generateAuthUrl();

    return {
      statusCode: 307,
      body: JSON.stringify({
        message: "Auth required",
        authorizeUrl,
      }),
      headers: {
        Location: authorizeUrl,
      },
    };
  }

  const lastSyncTime = await ddbModel.getTimeLastSynced();
  // normal procedure - walk the config and list each folder
  for (const rule of config.routing_rules) {
    const filesResponse = await driveModel.listFilesInFoler(rule.folder_id, tokens);
    console.log("files", JSON.stringify(filesResponse, null, 2));
    for (const file of filesResponse.files) {
      const extension = file.name.split(".").pop();
      if (!allowedExtensions.includes(extension)) {
        console.log(`Extension ${extension} not supported`);
        continue;
      }

      if (!lastSyncTime) {
        // first run, assume all files exist, so just add them
        // TODO: we also need the "other" type of logic - to assume all files should be imported
        await ddbModel.storeFileMeta(file.id, file.name);
        continue;
      }

      // if file was not seen before, resend it to input S3 bucket
      const existingFile = await ddbModel.getFileMeta(file.id, file.name);
      if (!existingFile) {
        await processFile(file, tokens, rule.s3_key_prefix);
      }
    }
  }

  // lastly - update last sync time
  await ddbModel.putTimeLastSynced();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello, world!",
    }),
  };
};

const processFile = async (file, tokens, s3_key_prefix) => {
  const { id, name, kind } = file;
  // fetch file from Google Drive
  const response = await driveModel.fetchFile(id, tokens);

  // stream contents to S3
  await s3.streamingUpload({
    Bucket: process.env.S3_BUCKET_INPUT,
    Key: s3_key_prefix + name,
    Body: response.body,
  });

  // store in DynamoDB
  await ddbModel.storeFileMeta(file.id, file.name);
};
