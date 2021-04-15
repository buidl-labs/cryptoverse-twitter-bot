const runServer = require("./src/botServer");
const processContractOperations = require("./src/tezosStream");
const takeScreenshot = require("./src/takeScreenshot");
const twitterBot = require("./src/twitterBot");

async function main() {
  screenshotHandler();
  twitterBot();
  let serverRunning = await runServer();
  if (serverRunning) {
    // processContractOperations();
    takeScreenshot(7);
  }
}

main();
