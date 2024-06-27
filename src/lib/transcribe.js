const {
  TranscribeClient,
  StartTranscriptionJobCommand,
  ListTranscriptionJobsCommand,
  DeleteTranscriptionJobCommand,
} = require("@aws-sdk/client-transcribe");

const client = new TranscribeClient({ region: process.env.AWS_REGION });

module.exports.startJob = async (params) => {
  console.log(`startJob params: ${JSON.stringify(params, null, 2)}`);
  const command = new StartTranscriptionJobCommand(params);
  const response = await client.send(command);
  return response;
};

module.exports.findJobsByName = async (name) => {
  console.log(`findJobsByName name: ${name}`);
  const params = {
    JobNameContains: name,
  };
  const command = new ListTranscriptionJobsCommand(params);
  const response = await client.send(command);
  return response.TranscriptionJobSummaries;
};

module.exports.deleteJob = async (name) => {
  console.log(`deleteJob name: ${name}`);
  const params = {
    TranscriptionJobName: name,
  };
  const command = new DeleteTranscriptionJobCommand(params);
  const response = await client.send(command);
  return response;
};