const { TezosToolkit } = require("@taquito/taquito");
const { bytes2Char } = require("@taquito/tzip16");
const fetch = require("node-fetch");

const config = require("./config");
const createImage = require("./createImage");
const twitterQueue = require("./queue/twitterQueue");

// KT19KiZtHMsDSg5pRF5bS45uzG7EreQSAtJL

const CONFIG = {
  CONTRACT: config.contractData.address,
  RPC_URL: config.contractData.rpcURL,
};

async function streamAndProcessContractOperations() {
  async function getTokenMetadata(token_id) {
    if (!token_id) return;

    try {
      const contract = await tezos.contract.at(CONFIG.CONTRACT);
      const storage = await contract.storage();

      const value = await storage.token_metadata.get(`${token_id}`);
      if (!value) return;
      return bytes2Char(value.token_info.valueMap.get('""'));
    } catch (err) {
      console.log(err.message);
    }
  }

  function process_operation(data) {
    try {
      const entrypoint = data["parameters"]["entrypoint"];
      console.log("Entrypoint called", entrypoint);
      if (entrypoint != "mint") {
        // Do nothing if entrypoint isn't mint.
        return;
      }

      const all_tokens =
        data["metadata"]["operation_result"]["storage"][0].args[0].args[1];
      console.log("all_tokens.length ->", all_tokens.length);
      const token_id = all_tokens[all_tokens.length - 1]["int"];
      console.log("token_id ->", token_id);
      getTokenMetadata(token_id).then(async (uri) => {
        console.log("metadataURI ->", uri);
        const res = await fetch(
          `https://gateway.pinata.cloud/ipfs/${sanitizeJsonUri(uri)}`
        );
        const resJSON = await res.json();
        console.log("imageHash ->", resJSON.displayUri);
        const imageName = await createImage(
          sanitizeJsonUri(resJSON.displayUri)
        );
        console.log(`Image generated: ${imageName}`);
        const jobData = {
          token_id: token_id,
          imageName: imageName,
        };
        console.log("Adding to twitter queue.", jobData);
        twitterQueue.add("post-to-twitter", jobData);
      });
    } catch (err) {
      console.log(err);
    }
  }

  const tezos = new TezosToolkit(CONFIG.RPC_URL);
  const sub = tezos.stream.subscribeOperation({ destination: CONFIG.CONTRACT });

  sub.on("data", process_operation);
  console.log("Listening to contract operations now.");
}

function sanitizeJsonUri(origin) {
  if (origin.startsWith("ipfs://")) {
    return origin.substring(7);
  }
}

module.exports = streamAndProcessContractOperations;
