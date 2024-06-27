const transcribeLib = require("../lib/transcribe");

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
  const jobName = inputKey.replace(/\W/g, "_").split(".")[0];
  const outputKey = inputKey
    .replace(/[^a-zA-Z0-9-_.!*'()/]/g, "_")
    .split(".")[0];

  // find if job exists
  const jobs = await transcribeLib.findJobsByName(jobName);
  console.log(`existing jobs: ${JSON.stringify(jobs, null, 2)}`);
  if (jobs.length > 0) {
    console.log(`Job ${jobName} already exists, deleting`);
    for (const job of jobs) {
      await transcribeLib.deleteJob(job.TranscriptionJobName);
    }
  }

  const startParams = {
    TranscriptionJobName: jobName,
    IdentifyLanguage: true,
    Media: {
      MediaFileUri: `s3://${process.env.S3_BUCKET_INPUT}/${inputKey}`,
    },
    OutputBucketName: process.env.S3_BUCKET_TRANSCRIPTS,
    OutputKey: `${outputKey}.json`,
    Subtitles: {
      Formats: ["srt"],
      OutputStartIndex: 1,
    },
  };

  const response = await transcribeLib.startJob(startParams);
  console.log(`response: ${JSON.stringify(response, null, 2)}`);
};
