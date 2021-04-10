const { TezosToolkit } = require("@taquito/taquito");
const { bytes2Char } = require("@taquito/tzip16");
const takeScreenshot = require("./takeScreenshot");
const fetch = require("node-fetch");
const fs = require("fs");
const FormData = require("form-data");

// const CONFIG = {
//   RPC_URL: "https://edonet.smartpy.io/",
//   CONTRACT: "KT1QVn7QUtU9DgHPpqrWgohg2cPDg7EWEJRd",
// };
const CONFIG = {
  CONTRACT: "KT1V6cNW5jTUxEwmMhxvNHkMF3Bkm5a9Cfrt",
  RPC_URL: "https://mainnet.smartpy.io/",
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
    // push the Cryptobot to a queue.
    console.log(cryptobot)
  );
}

async function uploadCryptobot(token_id, metadata) {
  const URL = "https://cryptoverse-wars-backend-pr-16.onrender.com";
  // const URL = "http://localhost:3001";
  console.log("token_id", token_id);

  let imageName = await takeScreenshot(token_id);

  const formData = createFormData(imageName);

  const response = await fetch(`${URL}/cryptobot/upload-image`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  const imageURI = result.body.ipfsHash;

  const cryptobotResponse = await fetch(`${URL}/cryptobot`, {
    method: "POST",
    body: JSON.stringify({ id: token_id, imageURI: `ipfs://${imageURI}` }),
    headers: { "Content-Type": "application/json" },
  });

  const cryptobot = await cryptobotResponse.json();
  return cryptobot;
}

function createFormData(imageName) {
  let formData = new FormData();
  formData.append("botImage", fs.createReadStream(imageName));
  return formData;
}

module.exports = streamAndProcessContractOperations;
