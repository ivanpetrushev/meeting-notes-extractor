include ../../../.env
export $(shell sed 's/=.*//' ../../../.env)

build:
	docker build -t google-meet-bot docker/ --no-cache

build-quick:
	docker build -t google-meet-bot docker/


combine-envs:
	cat ../../../.env .env.bot > .env.combined

clear-envs:
	rm .env.combined


run: build-quick combine-envs
	docker run -it --env-file .env.combined \
		-p 9222:9222 --network host \
		-m 4g --cpus 4 \
		--rm --name google-meet-bot \
		-v ./docker/output/:/output/ \
		google-meet-bot

run-puppeteer:
	export BROWSER_URL="https://www.youtube.com/watch?v=okK7oSTe2EQ" && cd docker/app/ && npm install && node puppeteer.js