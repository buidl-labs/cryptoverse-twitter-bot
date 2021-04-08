// listen on port so now.sh likes it
const { createServer } = require("http");
const https = require("https");
const fetch = require("node-fetch");
const { bytes2Char } = require("@taquito/tzip16");
const Twit = require("twit"),
  config = require("./config");
// Initialize bot
//  let T = new Twit(config.twitterKeys);
console.log(":tada: twitter bot running :tada:");
const CONTRACT_ADDRESS = "KT1V6cNW5jTUxEwmMhxvNHkMF3Bkm5a9Cfrt";
const INDEXER_NETWORK = "mainnet";
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
getAllTokens()
  .then((res) => getNFTMetadata(4, res))
  .then((token) => console.log(token));
// // Start once
// tweeter();
// // Once every N milliseconds
// setInterval(tweeter, 60 * 5 * 1000);
// // Here is the bot!
// function tweeter() {
//   // This is a random number bot
//   var tweet =
//     "Here's a random number between 0 and 100: " +
//     Math.floor(Math.random() * 100);
//   // Post that tweet!
//   T.post("statuses/update", { status: tweet }, tweeted);
//   // Callback for when the tweet is sent
//   function tweeted(err, data, response) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("Success: " + data.text);
//       //console.log(response);
//     }
//   }
// }
// This will allow the bot to run on now.sh
const server = createServer((req, res) => {
  res.writeHead(200);
  res.send("twitter bot api");
});
const PORT = process.env.PORT || 3000;
server.listen(PORT);
console.log(`BOT SERVER RUNNING AT ${PORT}`);