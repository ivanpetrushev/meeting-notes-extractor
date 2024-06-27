const { config } = require("../config");
const fetch = require("node-fetch");
const { getFileContent, put } = require("../lib/s3");

const escapeNewlinesInStrings = (jsonString) => {
  return jsonString.replace(/(?<!\\)\n/g, "\\n");
};

module.exports.announceOutput = async (event, settings) => {
  console.log(`Event: ${JSON.stringify(event)}`);
  console.log(`config: ${JSON.stringify(config, null, 2)}`);

  const outputKey = event.detail.object.key;

  let outputContent = await getFileContent({
    Bucket: process.env.S3_BUCKET_OUTPUT,
    Key: outputKey,
  });
  outputContent = outputContent.toString();

  const output = JSON.parse(outputContent);

  let message = {
    text: `*A new transcription is ready for review: ${outputKey}*\n${output.description}\n\n${output.summary}\n`,
  };
  // add segments
  if (output.segments) {
    message.text += "\n*Segments:*\n";
    for (const segment of output.segments) {
      message.text += `- ${segment.time_start} - ${segment.time_end} - ${segment.title} : \n`;
      for (const bullet of segment.segment_summary_bullets) {
        message.text += ` -- ${bullet}\n`;
      }
    }
  }
  // add action items
  if (output.action_items) {
    message.text += "\n*Action items:*\n";
    for (const actionItem of output.action_items) {
      message.text += `- ${actionItem}\n`;
    }
  }

  const sendPromises = [];
  for (const rule of config.routing_rules) {
    console.log(`Evaluating rule: ${JSON.stringify(rule, null, 2)}`);
    if (outputKey.match(rule.match)) {
      console.log(`Matched rule: ${JSON.stringify(rule, null, 2)}`);
      sendPromises.push(sendMessage(message, rule.chat_webhook));
    }
  }
  await Promise.all(sendPromises);
};

const sendMessage = async (message, webhook) => {
  const response = await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }
};
