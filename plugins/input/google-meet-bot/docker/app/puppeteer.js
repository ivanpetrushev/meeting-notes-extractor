const puppeteer = require("puppeteer");

console.log(`Starting the browser: ${process.env.BROWSER_URL}`);

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--remote-debugging-port=9222",
    ],
  });
  const page = await browser.newPage();
  await page.goto(process.env.BROWSER_URL);

  // Wait for the name input to appear and type the name
  await page.waitForSelector('input[placeholder="Your name"]');
  await page.type('input[placeholder="Your name"]', "Your Name");

  // Click the Ask to Join button
  await page.click('button[jsname="L2VOB"]');

  // Additional steps if needed to handle other prompts
  // await page.waitForTimeout(10000); // e.g., wait for 10 seconds

  // Wait for the participant list to load
  await page.waitForSelector(".uGOf1d");

  // Function to get the participant count
  const getParticipantCount = async () => {
    return await page.evaluate(() => {
      const participantElements = document.querySelectorAll(".uGOf1d .zWGUib");
      return participantElements.length;
    });
  };

  // Periodically check the participant count
  const checkInterval = 10000; // Check every 10 seconds
  const checkParticipants = setInterval(async () => {
    const count = await getParticipantCount();
    console.log(`Participant count: ${count}`);

    if (count === 0) {
      console.log("No participants left, closing the browser.");
      clearInterval(checkParticipants);
      await browser.close();
    }
  }, checkInterval);
})();
