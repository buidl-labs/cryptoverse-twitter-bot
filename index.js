/*
  1. Listen to operations on the smart contract. 
  2. On every mint operation, generate a screenshot of the cryptobot
  3. Store the generated image on IPFS
  4. Add the operation to the queue to post on twitter.
  5. Periodically post the pictures to twitter
*/
const processContractOperations = require("./src/tezosStream");

const runServer = require("./src/botServer");
const takeScreenshot = require("./src/takeScreenshot");

// processContractOperations();
async function main() {
  let serverRunning = await runServer();
  if (serverRunning) {
    processContractOperations();
    // takeScreenshot(3);
  }
}

main();
