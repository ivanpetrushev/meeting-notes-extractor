const { invokeModel } = require("../lib/bedrock");
const { getFileContent, put } = require("../lib/s3");

module.exports.summarize = async (event) => {
  console.log(`event: ${JSON.stringify(event, null, 2)}`);

  const transcriptS3Key = event.detail.object.key;
  const allowedExtensions = ["srt"];
  const extension = transcriptS3Key.split(".").pop();
  if (!allowedExtensions.includes(extension)) {
    console.log(`Extension ${extension} not supported for summarization`);
    return;
  }

  const transcriptContent = await getFileContent({
    Bucket: process.env.S3_BUCKET_TRANSCRIPTS,
    Key: transcriptS3Key,
  });
  const modelId = process.env.BEDROCK_MODEL_ID;
  const prompt = `
You are an expert in analyzing meeting transcripts.
This is a meeting transcription. Can you make a summary of that transcription?

Transcript segments:
Can you also split the transcript into segments? Each segment should represent a distinct topic or theme discussed during the meeting.
For each segment provide time codes and a brief summary.
Important note: ensure time codes match the content of the transcription. Avoid arbitrary or fixed intervals for time codes. If there are too many small segments, combine neighbouring segments into broader themes to keep the segment count manageable.
Keep the number of segments to a minimum - 5-10 is the ideal number.

Action items:
Can you also extract action items mentioned during the meeting?

Important note: Answer in the language the meeting was held in.

Please, provide the output in the following JSON schema:

{
    "summary": string,
    "segments": [
        {
            id: int, // incremental segment id starting at 0
            title: string, // title of segment
            time_start_ts: int, // timestamp of segment start, in seconds since beginning of meeting
            time_end_ts: int, // timestamp of segment end, in seconds since beginning of meeting
            time_start: string, // timestamp of segment start, in "hh:mm:ss,ms" format
            time_end: string, // timestamp of segment end, in "hh:mm:ss,ms" format
            segment_summary_bullets: [
                string, // bullet items of segment summary
                string,
                ...
            ]
        }
    ],
    "action_items": [
        string, // action item 1
        string, // action item 2 ...
        ...
    ]
}

<transcript>
${transcriptContent.toString()}
</transcript>
`;

  const response = await invokeModel(modelId, prompt);
  console.log(`response: ${JSON.stringify(response, null, 2)}`);
  const result = response.content[0].text;
  console.log(`result: ${result}`);

  // store to output bucket
  const outputKey = `${transcriptS3Key}.json`;
  await put({
    Bucket: process.env.S3_BUCKET_OUTPUT,
    Key: outputKey,
    Body: JSON.stringify(result, null, 2),
  });
};
