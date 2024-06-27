# output plugin: google-chat

The goal of this plugin is to send summarized meeting notes to a Google Chat room.
Files created in the `output` S3 bucket will trigger the announce process.

## Prerequisites

Google Chat room webhook URL

To obtain webhook URL go to Google Chat room settings and click "Apps & Integrations" => "+ Add webhooks".

## Configuration

Copy the `src/config.js.example` to `src/config.js` and fill your routing requirements.
You can route all summaries to a single channel with `match_regex` = `.*` or use more specific regex to route summaries to different channels.

## Installation

Generic plugin installation instructions:

```bash
$ cd plugins/output/google-chat
$ make apply
```

This will:
- attach S3 event listener that will trigger the announce Lambda

## Deployed infrastructure

- Lambda function that reads summaries from the `output` S3 bucket and sends to Google Chat rooms
- IAM role for Lambda
- CloudWatch Event Rule to trigger tha Lambda on S3 event for Object Created

## Usage

After the plugin is installed, the Lambda function will be triggered automatically by S3 events.
No further action is required.

## Associated costs

- Lambda: since this plugin invokes Lambda once per summary, the cost is negligible
- S3: since this plugin invokes Lambda once per summary, the cost is negligible

## Status

This plugin is implemented and working as expected.
