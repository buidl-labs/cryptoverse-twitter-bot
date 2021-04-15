const express = require("express");
const fetch = require("node-fetch");
const { bytes2Char } = require("@taquito/tzip16");
const config = require("./config");
app = express();

app.set("view engine", "ejs");
app.use(express.static("static"));

// const CONTRACT_ADDRESS = "KT1V6cNW5jTUxEwmMhxvNHkMF3Bkm5a9Cfrt";
// const INDEXER_NETWORK = "mainnet";

const CONTRACT_ADDRESS = config.contractData.address;
const INDEXER_NETWORK = config.contractData.indexerNetwork;

// const url = "http://localhost:3000";
// const waitForElement = "#cryptobot";

async function runServer() {
  app.get("/", async function(req, res) {
    const { id } = req.query;
    console.log("Waiting...");
    setTimeout(() => {
      getTokenData(id).then((resp) => {
        console.log(resp);
        console.log("Rendering.");
        const token = {
          tokenID: resp.token_id,
          Bot3dModelURI: sanitizeJsonUri(resp.artifact_uri),
          timestamp: resp.timestamp,
          imageURI: sanitizeJsonUri(resp.display_uri),
        };
        console.log(token);
        res.render("index", { token: token });
      });
    }, 30000);
  });

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT, function() {
    console.log(`BOT SERVER RUNNING AT ${PORT}`);
  });
  return true;
}

function sanitizeJsonUri(origin) {
  if (origin.startsWith("ipfs://")) {
    return `https://cloudflare-ipfs.com/ipfs/${origin.substring(7)}/`;
  }
  return null;
}

// async function getAllTokens() {
//   const response = await fetch(
//     `https://api.better-call.dev/v1/contract/${INDEXER_NETWORK}/${CONTRACT_ADDRESS}/storage`
//   );
//   const result = await response.json();
//   const tokens = result[0].children.find(
//     (elm) => elm.name === "token_metadata"
//   );
//   const tokensMetataData = await fetch(
//     `https://api.better-call.dev/v1/bigmap/${INDEXER_NETWORK}/${tokens.value}`
//   );
//   const tokensMetataDataJSON = await tokensMetataData.json();
//   // console.log("tokenMetadata", tokensMetataDataJSON);
//   const num_keys = tokensMetataDataJSON.active_keys;
//   const all_tokens = [];
//   let tk;
//   // console.log(num_keys);
//   for (let i = 0; i < parseInt(num_keys / 10) + 1; i++) {
//     tk = await fetch(
//       `https://api.better-call.dev/v1/bigmap/${INDEXER_NETWORK}/${
//         tokens.value
//       }/keys?offset=${10 * i}`
//     );
//     all_tokens.push(...(await tk.json()));
//     // console.log("all_tokens", all_tokens.length);
//     if (all_tokens.length == num_keys) break;
//   }

//   return all_tokens;
// }

async function getNFTMetadata(token_id, tokens) {
  const token = tokens.find((tk) => tk.data.key.value == token_id);

  if (!token) {
    console.log(`token with id(${token_id}) not found.`);
    return;
  }
  let metadataLink = sanitizeJsonUri(
    bytes2Char(token.data.value.children[1].children[0].value)
  );
  const resp = await fetch(metadataLink);
  const res = await resp.json();
  // console.log(sanitizeJsonUri(res.artifactUri));
  return {
    tokenID: token.data.key.value,
    Bot3dModelURI: sanitizeJsonUri(res.artifactUri),
    timestamp: token.data.timestamp,
    imageURI: sanitizeJsonUri(res.displayUri),
  };
}

async function getTokenData(token_id) {
  try {
    const response = await fetch(
      `https://api.better-call.dev/v1/contract/${INDEXER_NETWORK}/${CONTRACT_ADDRESS}/tokens?token_id=${token_id}`
    );

    const tokens = await response.json();

    if (tokens.length == 0) {
      return;
    }
    let token = tokens.find((tk) => tk.token_id == token_id);
    return token;
  } catch (err) {
    return err;
  }
}

module.exports = runServer;
