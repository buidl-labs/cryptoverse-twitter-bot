const processContractOperations = require("./src/tezosStream");
const runServer = require("./src/botServer");
const Twit = require("twit");
const config = require("./src/config");

const createImage = require("./src/createImage");

async function main() {
  /* 
  1. Listen to mint operations
  2. Generate Image
    1. Listen to contract operations
      1. Fetch image from IPFS
      2. Process the image to add a background
    3. Post to twitter  
  */
  const twitterBot = new Twit(config.twitterKeys);
  const serverRunning = await runServer();
  if (serverRunning) {
    console.log("Server running now.");
    processContractOperations(twitterBot);
  }
}

main();
