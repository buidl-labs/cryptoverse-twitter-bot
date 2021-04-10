const { TezosToolkit } = require("@taquito/taquito");
const { bytes2Char } = require("@taquito/tzip16");
const takeScreenshot = require("./takeScreenshot");
const fetch = require("node-fetch");
const fs = require("fs");
const FormData = require("form-data");

const CONFIG = {
  RPC_URL: "https://mainnet.smartpy.io/",
  CONTRACT: "KT1V6cNW5jTUxEwmMhxvNHkMF3Bkm5a9Cfrt",
};

async function streamAndProcessContractOperations() {
  const tezos = new TezosToolkit(CONFIG.RPC_URL);

  const sub = tezos.stream.subscribeOperation({ destination: CONFIG.CONTRACT });

  sub.on("data", process_operation);
  console.log("Listening to contract operations now.");
}

function process_operation(data) {
  const entrypoint = data["parameters"]["entrypoint"];
  console.log("Entrypoint called", entrypoint);
  if (entrypoint != "mint") {
    // Do nothing if entrypoint isn't mint.
    return;
  }
  const all_tokens =
    data["metadata"]["operation_result"]["storage"][0].args[0].args[1];

  const token_id = all_tokens[all_tokens.length - 1]["int"];
  const metadata = data["parameters"].value[0].args[1]["bytes"];
  uploadCryptobot(token_id, metadata).then((cryptobot) =>
    console.log(cryptobot)
  );
}

async function uploadCryptobot(token_id, metadata) {
  const URL = "https://cryptoverse-wars-backend-pr-16.onrender.com";
  console.log(token_id);

  const imageName = await takeScreenshot(token_id);
  let formData = new FormData();
  formData.append("botImage", fs.createReadStream(imageName));

  const response = await fetch(`${URL}/cryptobot/upload-image`, {
    method: "POST",
    body: formData,
  });
  const result = await response.json();
  const imageURI = result.body.ipfsHash;

  const cryptobotResponse = await fetch(`${URL}/cryptobot`, {
    method: "POST",
    body: JSON.stringify({ id: token_id, imageURI: `ipfs://${imageURI}` }),
  });

  const cryptobot = await cryptobotResponse.json();
  return cryptobot;
}

module.exports = streamAndProcessContractOperations;
