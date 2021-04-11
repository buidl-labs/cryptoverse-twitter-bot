const puppeteer = require("puppeteer");
const fs = require("fs");
const twitterQueue = require("./queue/twitterQueue");
const { Worker } = require("bullmq");
const uploadCryptobot = require("./uploadCryptobot");
const config = require("./config");

async function takeScreenshot(token_id) {
  const BASE_URL = config.urls.imageServerURL;
  URL = `${BASE_URL}/?id=${token_id}`;
  console.log("Launching chromium");

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  // console.log("URL", URL);

  try {
    await page.goto(URL, { waitUntil: "networkidle0", timeout: 0 });
    await page.setViewport({ width: 1920, height: 900, deviceScaleFactor: 3 });
  } catch (error) {
    console.log(error);
  }

  // console.log("Waiting for page to load...");
  const element = await page.$("model-viewer#cryptobot");
  // console.log("got the element");
  await page.waitForSelector("#cryptobot", { timeout: 1000000 });
  console.log("orientation set");
  await page.waitForTimeout(5000);
  const imageName = `./images/cryptobot${Date.now()}.jpg`;
  console.log(`${imageName} - generated image name`);
  await element.screenshot({
    path: imageName,
    type: "jpeg",
  });
  console.log("CRYPTOBOT SCREENSHOT TAKEN!", imageName);

  console.log("CLOSING Chromium!");
  await page.close();
  await browser.close();
  console.log("Chromium closed.");
  return imageName;
}

async function screenshotHandler() {
  const worker = new Worker(
    "take-screenshot",
    async (job) => {
      console.log(`Take screenshot of Cryptobot-${job.data.token_id}`);
      const imageName = await takeScreenshot(job.data.token_id);
      const cryptobot = await uploadCryptobot(job.data.token_id, imageName);
      fs.unlink(imageName, (err) => {
        if (err) throw err;
        console.log("File is deleted.");
      });
      twitterQueue.add("post-to-twitter", cryptobot);
    },
    config.redis
  );
}

module.exports = screenshotHandler;
