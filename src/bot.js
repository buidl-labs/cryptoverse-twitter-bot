// listen on port so now.sh likes it
const express = require("express");
const fetch = require("node-fetch");
const { bytes2Char } = require("@taquito/tzip16");
const app = express();
const puppeteer = require("puppeteer");

const Twit = require("twit"),
  config = require("./config");
// Initialize bot
//  let T = new Twit(config.twitterKeys);

app.set("view engine", "ejs");
app.use(express.static("static"));

// console.log(":tada: twitter bot running :tada:");
// const CONTRACT_ADDRESS = "KT1V6cNW5jTUxEwmMhxvNHkMF3Bkm5a9Cfrt";
// const INDEXER_NETWORK = "mainnet";
// const url = process.env.url;
// const waitForElement = "#cryptobot";

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
  console.log("got the element");
  await page.waitForSelector(waitForElement, { timeout: 1000000 });
  console.log("orientation set");
  await page.waitForTimeout(5000);
  const imageName = Date.now();
  await element.screenshot({
    path: `./images/cryptobot${imageName}.jpg`,
    type: "jpeg",
  });
  console.log("CRYPTOBOT SCREENSHOT TAKEN!", imageName);

  console.log("CLOSING Chromium!");
  await page.close();
  await browser.close();
}

app.get("/", function(req, res) {
  const { id } = req.query;
  getAllTokens()
    .then((response) => getNFTMetadata(id, response))
    .then((token) => {
      console.log(token);
      res.render("index", { token: token });
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log(`BOT SERVER RUNNING AT ${PORT}`);
  run();
});

async function takeAScreenShot() {}
