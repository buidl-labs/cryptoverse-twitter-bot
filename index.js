const runServer = require("./src/botServer");
const processContractOperations = require("./src/tezosStream");
const screenshotHandler = require("./src/takeScreenshot");
const twitterBot = require("./src/twitterBot");

async function main() {
  screenshotHandler();
  twitterBot();
  let serverRunning = await runServer();
  if (serverRunning) {
    processContractOperations();
  }
}

main();
