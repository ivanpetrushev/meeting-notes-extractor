# FROM node:20.14-bookworm
FROM node:18-bookworm

ENV DEBIAN_FRONTEND noninteractive

RUN curl -sSL https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
  echo "deb http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
RUN apt-get update && apt-get install --no-install-recommends -y \
  gnupg pulseaudio xvfb ffmpeg unzip mplayer pv \
  google-chrome-stable && \
  rm -rf /var/lib/apt/lists/*

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && ./aws/install && rm -rf ./aws

# Set up PulseAudio
RUN useradd -m pulseaudio && \
  mkdir -p /etc/pulse

# selenium
# Download the Chrome Driver
# RUN wget -O /tmp/chromedriver.zip http://chromedriver.storage.googleapis.com/`curl -sS chromedriver.storage.googleapis.com/LATEST_RELEASE`/chromedriver_linux64.zip
# Unzip the Chrome Driver into /usr/local/bin directory
# RUN unzip /tmp/chromedriver.zip chromedriver -d /usr/local/bin/

# RUN wget -O /tmp/chromedriver.zip https://storage.googleapis.com/chrome-for-testing-public/126.0.6478.63/linux64/chromedriver-linux64.zip
# RUN cd /tmp/ && unzip /tmp/chromedriver.zip && ls -la /tmp/ && cp /tmp/chromedriver-linux64/chromedriver /usr/local/bin/


WORKDIR /app
COPY /app/package*.json /app/
RUN npm install

COPY /app .

# expose Chrome debug port
EXPOSE 9222

ENTRYPOINT ["/app/entrypoint.sh"]

