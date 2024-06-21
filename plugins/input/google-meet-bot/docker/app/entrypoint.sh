#!/usr/bin/env bash

set -xeo pipefail


pulseaudio -D --exit-idle-time=-1
pacmd load-module module-virtual-sink sink_name=v1  # Load a virtual sink as `v1`
pacmd set-default-sink v1  # Set the `v1` as the default sink device
pacmd set-default-source v1.monitor  # Set the monitor of the v1 sink to be the default source

Xvfb :99 -ac -screen 0 1280x1024x16 > /dev/null 2>&1 &
sleep 0.5


# Start chrome
# node ./puppeteer.js &

mplayer -loop 0 -really-quiet ./sample-15s.mp3 &

sleep 1  # Ensure this has started before moving on
# xdotool mousemove 1 1 click 1  # Move mouse out of the way so it doesn't trigger the "pause" overlay on the video tile

ffmpeg -hide_banner -nostdin -f pulse -i v1.monitor -f mp3 -y /output/output.mp3