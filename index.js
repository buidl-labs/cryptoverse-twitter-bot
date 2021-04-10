/*
  1. Listen to operations on the smart contract. 
  2. On every mint operation, generate a screenshot of the cryptobot
  3. Store the generated image on IPFS
  4. Add the operation to the queue to post on twitter.
  5. Periodically post the pictures to twitter
*/
// const FormData = require("form-data");
// const fetch = require("node-fetch");
// const fs = require("fs");

const runServer = require("./src/botServer");
const processContractOperations = require("./src/tezosStream");
// const takeScreenshot = require("./src/takeScreenshot");

// processContractOperations();
async function main() {
  // const URL = "http://localhost:3001";
  let serverRunning = await runServer();
  if (serverRunning) {
    // const imageName = await takeScreenshot(26);
    // let formData = new FormData();
    // formData.append("botImage", fs.createReadStream(imageName));
    // console.log("Sending request.");
    // const response = await fetch(`${URL}/cryptobot/upload-image`, {
    //   method: "POST",
    //   body: formData,
    // });
    // const result = await response.json();
    // const imageURI = result.body.ipfsHash;
    // console.log(imageURI);
    // const cryptobotResponse = await fetch(`${URL}/cryptobot`, {
    //   method: "POST",
    //   body: JSON.stringify({ id: 26, imageURI: `ipfs://${imageURI}` }),
    //   headers: { "Content-Type": "application/json" },
    // });
    // console.log(await cryptobotResponse.json());
    processContractOperations();
  }
}

main();
