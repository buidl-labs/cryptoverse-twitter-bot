const runServer = require("./src/botServer");
const processContractOperations = require("./src/tezosStream");
const { screenshotHandler, takeScreenshot } = require("./src/takeScreenshot");
const twitterBot = require("./src/twitterBot");
const config = require("./src/config");
const fetch = require("node-fetch");

// KT1W5fvP8xiZHLSGuy2pyXhLvPZ1dHq2Y8pR

async function main() {
  screenshotHandler();
  twitterBot();
  let serverRunning = await runServer();
  if (serverRunning) {
    processContractOperations();
  }
}

main();
