const puppeteer = require("puppeteer");

const url = "https://cryptocodeschool.in/tezos/cryptobot/2";
const waitForElement = "#cryptobot";
async function run() {
  console.log("Launching chromium");
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  console.log("Url", url);

  try {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
    await page.setViewport({ width: 1920, height: 900, deviceScaleFactor: 3 });
  } catch (error) {
    console.log(error);
  }

  console.log("Waiting for page to load...");
  const element = await page.$("model-viewer#cryptobot");
  element.autoRotate = false;
  console.log("got the element");
  await page.waitForSelector(waitForElement, { timeout: 100000 });
  await page.waitForTimeout(5000);
  element.orientation = `0deg 0deg 0deg`;
  await page.screenshot({
    path: `./images/cryptobot${Date.now()}.jpg`,
    type: "jpeg",
  });
  console.log("PAGE SCREENSHOT TAKEN!");
  await element.screenshot({
    path: `./images/cryptobot${Date.now() + 1}.jpg`,
    type: "jpeg",
  });
  console.log("CRYPTOBOT SCREENSHOT TAKEN!");

  console.log("CLOSING Chromium!");
  await page.close();
  await browser.close();
}
run();
