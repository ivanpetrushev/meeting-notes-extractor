const {
  TranscribeClient,
  StartTranscriptionJobCommand,
} = require("@aws-sdk/client-transcribe");

const client = new TranscribeClient({ region: process.env.AWS_REGION });

module.exports.startJob = async (params) => {
  console.log(`startJob params: ${JSON.stringify(params, null, 2)}`);
  const command = new StartTranscriptionJobCommand(params);
  const response = await client.send(command);
  return response;
};
