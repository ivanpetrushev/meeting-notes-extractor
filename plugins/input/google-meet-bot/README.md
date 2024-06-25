# input plugin: google-meet-bot

The goal of this plugin is to have a bot that can join a Google Meet call and automatically record audio.
Audio will be send to `aws_s3_bucket.input` bucket. This will trigger the transcribe-summarize process.

*NOTE*: This plugin is not yet implemented and probably will never be. It is a placeholder for future work.

## Installation

These are generic instructions for installing a plugin. 
Run:

```bash
$ cd plugins/input/google-meet-bot
$ make apply
```

This will:
- create infrastructure in AWS
- build docker image and push it to the ECR repository.

## Deployed infrastructure

TBD

## Audio recording

The "bot" consists of a docker container that:
- starts a virtual X server with pulseaudio
- starts a Chrome browser
- uses Puppeteer to automate joining the Google Meet call
- starts `ffmpeg` process that records audio from the virtual pulseaudio device and sends it to S3

## Configuration

The plugin will pull configuration from the main meeting-notes deployment.

Additionally configure:
- bot email address (for inviting to the meeting)
- DNS MX records for SES receiving invitation emails
- TBD: other configurations

## Usage

Use Google Calendar to create a meeting and invite the bot. The bot will join the meeting at the right time and start recording audio.

## Associated costs

- ECR repository: $0.10 per GB-month, currently docker image is ~3GB

## Status

As of this day (2024-06-25) there is no way to join a Google Meet with automated browser.
Google Meet just responds with "This browser or app may not be secure" and does not allow to join the meeting.
Implementation is suspended until a workaround is found.

Components:
- [x] Docker container with X, pulseaudio, Chrome and Puppeteer
- [x] ffmpeg sending audio stream to S3 bucket
- [ ] Automated way to join Google Meet call
- [ ] Infrastructure to receive invitation emails
- [ ] Infrastructure to start Fargate tasks when meeting is due