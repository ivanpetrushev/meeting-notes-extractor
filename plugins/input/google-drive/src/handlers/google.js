const dynamoDb = require("../lib/dynamodb");
const { OAuth2Client } = require("google-auth-library");
const keys = require("../keys.json");
const { config } = require("../config");

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

module.exports.auth = async (event) => {
  console.log("event", event);

  // when invoked from browser, it will request for favicon
  if (event?.rawPath === "/favicon.ico") {
    return {
      statusCode: 200,
      body: "",
    };
  }

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

    const oAuth2Client = new OAuth2Client(
      keys.web.client_id,
      keys.web.client_secret,
      keys.web.redirect_uris[0]
    );

    const { tokens } = await oAuth2Client.getToken(code);
    console.log("tokens", tokens);

    await storeTokens(tokens);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Auth successful",
      }),
    };
  }

  const tokens = await getTokens();
  console.log("tokens", tokens);
  // hopefully invoked from browser - first run
  if (!tokens) {
    const oAuth2Client = new OAuth2Client(
      keys.web.client_id,
      keys.web.client_secret,
      keys.web.redirect_uris[0]
    );

    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: "https://www.googleapis.com/auth/drive",
    });

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

  const lastSyncTime = await getTimeLastSynced();
  // normal procedure - walk the config and list each folder
  for (const rule of config.routing_rules) {
    const files = await listFilesInFoler(rule.folder_id, tokens);
    console.log("files", files);
    for (const file of files) {
      const extension = file.name.split(".").pop();
      if (!allowedExtensions.includes(extension)) {
        console.log(`Extension ${extension} not supported`);
        continue;
      }

      if (!lastSyncTime) {
        // first run, assume all files exist, so just add them
        // TODO: we also need the "other" type of logic - to assume all files should be imported
        await storeFile(file.id, file.name);
        continue;
      }

      // if file was not seen before, resend it to input S3 bucket
      const existingFile = await getFile(file.id, file.name);
      if (!existingFile) {
        await processFile(file);
      }
    }
  }

  // lastly - update last sync time
  await putTimeLastSynced();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello, world!",
    }),
  };
};

const processFile = async (file) => {
  // TODO: implement
};

const listFilesInFoler = async (folderId, tokens) => {
  // TODO: pagination for large folders
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents`,
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    }
  );
  const result = await response.json();
  return result;
};

// DynamoDB methods

const getTimeLastSynced = async () => {
  const params = {
    TableName: process.env.DDB_TABLE,
    Key: {
      pk: "global",
      sk: "lastSynced",
    },
  };

  const result = await dynamoDb.get(params);
  return result.Item;
};

const putTimeLastSynced = async () => {
  // store in iso format
  const time = new Date().toISOString();
  const params = {
    TableName: process.env.DDB_TABLE,
    Item: {
      pk: "global",
      sk: "lastSynced",
      updatedAt: time,
    },
  };
  await dynamoDb.put(params);
};

const getTokens = async () => {
  const params = {
    TableName: process.env.DDB_TABLE,
    Key: {
      pk: "global",
      sk: "tokens",
    },
  };

  const result = await dynamoDb.get(params);
  return result.Item;
};

const storeTokens = async (tokens) => {
  const params = {
    TableName: process.env.DDB_TABLE,
    Item: {
      pk: "global",
      sk: "tokens",
      ...tokens,
    },
  };

  await dynamoDb.put(params);
};

const storeFile = async (id, fileName) => {
  const params = {
    TableName: process.env.DDB_TABLE,
    Item: {
      pk: id,
      sk: fileName,
      createdAt: new Date().toISOString(),
    },
  };

  await dynamoDb.put(params);
};

const getFile = async (id, fileName) => {
  const params = {
    TableName: process.env.DDB_TABLE,
    Key: {
      pk: id,
      sk: fileName,
    },
  };

  const result = await dynamoDb.get(params);
  return result.Item;
};