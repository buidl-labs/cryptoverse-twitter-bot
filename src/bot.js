// listen on port so now.sh likes it
const { createServer } = require("http");
const https = require("https");
const fetch = require("node-fetch");

const { bytes2Char } = require("@taquito/tzip16");
const Twit = require("twit"),
  config = require("./config");

// Initialize bot
//  let T = new Twit(config.twitterKeys);
console.log("🎉 twitter bot running 🎉");

const CONTRACT_ADDRESS = "KT1V6cNW5jTUxEwmMhxvNHkMF3Bkm5a9Cfrt";
const INDEXER_NETWORK = "mainnet";

function sanitizeJsonUri(origin) {
  if (origin.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${origin.substring(7)}/`;
  }

  return null;
}

function sanitizeIpfsLink(origin) {
  if (origin.startsWith("ipfs://")) {
    return origin.substring(7);
  }

  return null;
}

async function getNFTfromTokenId(token_id) {
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

  for (let i = 0; i < 2; i++) {
    tk = await fetch(
      `https://api.better-call.dev/v1/bigmap/${INDEXER_NETWORK}/${
        tokens.value
      }/keys?offset=${10 * i}`
    );
    all_tokens.push(...(await tk.json()));
    // console.log("all_tokens", all_tokens.length);
    if (all_tokens.length == num_keys) break;
  }

  if (typeof all_tokens === "undefined" || all_tokens.length <= 0) {
    return [];
  }

  const grabContent = (elm) => {
    // console.log("elm", elm);
    return fetch(
      sanitizeJsonUri(bytes2Char(elm.data.value.children[1].children[0].value))
    )
      .then((res) => res.json())
      .then((obj) => {
        // console.log("from indexer", obj);
        return {
          tokenId: elm.data.key.value,
          uri: sanitizeIpfsLink(obj.artifactUri),
          timestamp: elm.data.timestamp,
          imageURI: sanitizeIpfsLink(obj.displayUri),
        };
      });
  };

  const filtered = await Promise.all(all_tokens.map(grabContent));
  const token = filtered.find((bot) => bot.tokenId == token_id);
  // console.log('filtered allTokens', filtered);
  return token;
}

const NFT = getNFTfromTokenId(2);
console.log(NFT);

async function getAllTokensCount() {
  const response = await fetch(
    `https://api.better-call.dev/v1/contract/${INDEXER_NETWORK}/${CONTRACT_ADDRESS}/storage`
  );

  const result = await response.json();

  const getAllTokenObject = result[0].children.find(
    (elm) => elm.name === "all_tokens"
  );
  console.log(getAllTokenObject.children.length);
  return getAllTokenObject.children.length;
}

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
