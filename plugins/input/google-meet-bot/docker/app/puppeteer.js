const puppeteer = require("puppeteer-extra");
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
// const puppeteer = require("puppeteer");



console.log(`Starting the browser: ${process.env.BROWSER_URL}`);

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    // headless: false, // not good
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--remote-debugging-port=9222",
      "--remote-debugging-address=0.0.0.0",
      "--autoplay-policy=no-user-gesture-required",
      "--use-fake-ui-for-media-stream",
      "--disable-blink-features=AutomationControlled",
    ],
    ignoreDefaultArgs: ["--mute-audio"],
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
  await page.setBypassCSP(true);
  await page.goto(process.env.BROWSER_URL);

})();
