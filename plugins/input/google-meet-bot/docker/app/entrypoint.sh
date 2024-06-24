#!/usr/bin/env bash

set -xeo pipefail


pulseaudio -D --exit-idle-time=-1
pacmd load-module module-virtual-sink sink_name=v1  # Load a virtual sink as `v1`
pacmd set-default-sink v1  # Set the `v1` as the default sink device
pacmd set-default-source v1.monitor  # Set the monitor of the v1 sink to be the default source

Xvfb :99 -ac -screen 0 1280x1024x16 > /dev/null 2>&1 &
sleep 1

# setup cleanup
# When the container is stopped, we must kill ffmpeg, so the "aws cp" command can finish
cleanup() {
  echo "in cleanup"
  kill -SIGTERM "${FFMPEG_PID}"
  wait "${AWSCP_PID}"
}
trap "cleanup; exit" SIGINT SIGTERM SIGQUIT

# check versions
# google-chrome --version
# chromedriver --version
# Start chrome
node ./puppeteer.js &
# node ./selenium.js &

# debug: play a simple audio file
# mplayer -loop 0 -really-quiet ./sample-15s.mp3 &

sleep 1

# TODO: proper filename schema
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="${TIMESTAMP}-${S3_KEY}"

# grab pulseaudio output and stream to s3
ffmpeg -hide_banner -nostdin -loglevel error -f pulse -i v1.monitor -ab 128k -f mp3 - | aws s3 cp - s3://${S3_BUCKET}/${FILENAME} &

# docker stop should not exit until upload finishes
FFMPEG_PID=$(pgrep ffmpeg)
AWSCP_PID=$(pgrep aws)
wait $FFMPEG_PID