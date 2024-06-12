const { startJob } = require("../lib/transcribe");

module.exports.start = async (event) => {
  console.log(`event: ${JSON.stringify(event, null, 2)}`);
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

  const inputKey = event.detail.object.key;
  const extension = inputKey.split(".").pop();
  if (!allowedExtensions.includes(extension)) {
    console.log(`Extension ${extension} not supported`);
    return;
  }

  // job name must satisfy regex pattern: ^[0-9a-zA-Z._-]+$, replace all non-alphanumeric characters with _
  const inputKeyWithoutExtension = inputKey.replace(/\W/g, "_").split(".")[0];

  const startParams = {
    TranscriptionJobName: inputKeyWithoutExtension,
    IdentifyLanguage: true,
    Media: {
      MediaFileUri: `s3://${process.env.S3_BUCKET_INPUT}/${inputKey}`,
    },
    OutputBucketName: process.env.S3_BUCKET_TRANSCRIPTS,
    Subtitles: {
      Formats: ["srt"],
      OutputStartIndex: 1,
    },
  };

  const response = await startJob(startParams);
  console.log(`response: ${JSON.stringify(response, null, 2)}`);
};
