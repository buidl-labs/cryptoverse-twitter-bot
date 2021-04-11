const { TezosToolkit } = require("@taquito/taquito");
const { bytes2Char } = require("@taquito/tzip16");

const config = require("./config");
const screenshotQueue = require("./queue/screenshotQueue");

// const CONFIG = {
//   CONTRACT: "KT1V6cNW5jTUxEwmMhxvNHkMF3Bkm5a9Cfrt",
//   RPC_URL: "https://mainnet.smartpy.io/",
// };

const CONFIG = {
  CONTRACT: config.contractData.address,
  RPC_URL: config.contractData.rpcURL,
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
  screenshotQueue.add("take-screenshot", { token_id });
  console.log(`Cryptobot-${token_id} added to screenshot queue.`);
}

module.exports = streamAndProcessContractOperations;
