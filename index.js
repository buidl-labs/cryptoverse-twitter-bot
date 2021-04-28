const processContractOperations = require("./src/tezosStream");
const twitterBot = require("./src/twitterBot");

twitterBot();
async function main() {
  /* 
  1. Listen to mint operations
  2. Generate Image
    1. Listen to contract operations
      1. Fetch image from IPFS
      2. Process the image to add a background
    3. Post to twitter
  */
  processContractOperations();
}

main();
