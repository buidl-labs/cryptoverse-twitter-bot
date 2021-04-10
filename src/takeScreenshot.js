const puppeteer = require("puppeteer");

async function takeScreenshot(token_id) {
  URL = `http://localhost:3000/?id=${token_id}`;
  console.log("Launching chromium");
  console.log(URL);
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  console.log("URL", URL);

  try {
    await page.goto(URL, { waitUntil: "networkidle0", timeout: 0 });
    await page.setViewport({ width: 1920, height: 900, deviceScaleFactor: 3 });
  } catch (error) {
    console.log(error);
  }

  // console.log("Waiting for page to load...");
  const element = await page.$("model-viewer#cryptobot");
  console.log("got the element");
  await page.waitForSelector("#cryptobot", { timeout: 1000000 });
  console.log("orientation set");
  await page.waitForTimeout(5000);
  const imageName = `./images/cryptobot${Date.now()}.jpg`;
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

module.exports = takeScreenshot;
