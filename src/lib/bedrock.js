const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const BEDROCK_REGION = process.env.BEDROCK_REGION || "us-east-1";
const client = new BedrockRuntimeClient({ region: BEDROCK_REGION });

module.exports.invokeModel = async (modelId, prompt) => {
  const body = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 3000,
    temperature: 0.2,
    top_k: 250,
    top_p: 0.999,
    stop_sequences: ["\n\nHuman:"],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  };
  console.log(`invokeModel: modelId=${modelId}, prompt=${prompt}`);
  const command = new InvokeModelCommand({
    contentType: "application/json",
    accept: "application/json",
    modelId,
    body: JSON.stringify(body),
  });

  const response = await client.send(command);
  // console.log('response', JSON.stringify(response, null, 2));
  const decodedResponseBody = new TextDecoder().decode(response.body);
  const responseBody = JSON.parse(decodedResponseBody);
  console.log("responseBody", JSON.stringify(responseBody, null, 2));
  return responseBody;
  // return JSON.parse(response.Payload);
};
