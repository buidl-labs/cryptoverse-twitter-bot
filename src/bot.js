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

console.log(":tada: twitter bot running :tada:");
const CONTRACT_ADDRESS = "KT1V6cNW5jTUxEwmMhxvNHkMF3Bkm5a9Cfrt";
const INDEXER_NETWORK = "mainnet";
const url = process.env.url;
const waitForElement = "#cryptobot";

function sanitizeJsonUri(origin) {
  if (origin.startsWith("ipfs://")) {
    return `https://cloudflare-ipfs.com/ipfs/${origin.substring(7)}/`;
  }
  return null;
}

async function getAllTokens() {
  const response = await fetch(
    `https://api.better-call.dev/v1/contract/${INDEXER_NETWORK}/${CONTRACT_ADDRESS}/storage`
  );
  const result = await response.json();
  const tokens = result[0].children.find(
    (elm) => elm.name === "token_metadata"
  );
  const tokensMetataData = await fetch(
    `https://api.better-call.dev/v1/bigmap/${INDEXER_NETWORK}/${tokens.value}`
  );
  const tokensMetataDataJSON = await tokensMetataData.json();
  // console.log("tokenMetadata", tokensMetataDataJSON);
  const num_keys = tokensMetataDataJSON.active_keys;
  const all_tokens = [];
  let tk;
  console.log(num_keys);
  for (let i = 0; i < parseInt(num_keys / 10) + 1; i++) {
    tk = await fetch(
      `https://api.better-call.dev/v1/bigmap/${INDEXER_NETWORK}/${
        tokens.value
      }/keys?offset=${10 * i}`
    );
    all_tokens.push(...(await tk.json()));
    // console.log("all_tokens", all_tokens.length);
    if (all_tokens.length == num_keys) break;
  }
  return all_tokens;
}
async function getNFTMetadata(token_id, tokens) {
  console.log(tokens[0].data.key.value);
  const token = tokens.find((tk) => tk.data.key.value == token_id);
  let metadataLink = sanitizeJsonUri(
    bytes2Char(token.data.value.children[1].children[0].value)
  );
  const resp = await fetch(metadataLink);
  const res = await resp.json();
  console.log(sanitizeJsonUri(res.displayUri));
  return {
    tokenID: token.data.key.value,
    Bot3dModelURI: sanitizeJsonUri(res.artifactUri),
    timestamp: token.data.timestamp,
    imageURI: sanitizeJsonUri(res.displayUri),
  };
}

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
  getAllTokens()
    .then((response) => getNFTMetadata(1, response))
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
