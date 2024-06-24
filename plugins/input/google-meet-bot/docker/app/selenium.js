require("chromedriver");
const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

console.log(`Starting the browser: ${process.env.BROWSER_URL}`);

(async function example() {
  let options = new chrome.Options();
  options.addArguments(
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--remote-debugging-port=9222",
    "--remote-debugging-address=0.0.0.0",
    "--autoplay-policy=no-user-gesture-required",
    "--use-fake-ui-for-media-stream"
  );

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    await driver.get(process.env.BROWSER_URL);
    // Add any additional actions here

    // Keep the browser open
    await new Promise((resolve) => setTimeout(resolve, 1000000));
  } finally {
    await driver.quit();
  }
})();
