const fetch = require("node-fetch");
const fs = require("fs");
const FormData = require("form-data");
const config = require("./config");

async function uploadCryptobot(token_id, imageName) {
  try {
    const URL = config.urls.apiURL;
    console.log("Inside uploadCryptobot");
    // console.log({ token_id, imageName });

    const formData = createFormData(imageName);

    const response = await fetch(`${URL}/cryptobot/upload-image`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    const imageURI = result.body.ipfsHash;
    // console.log(`${imageURI} - ipfs CID`);

    const cryptobotResponse = await fetch(`${URL}/cryptobot`, {
      method: "POST",
      body: JSON.stringify({ id: token_id, imageURI: `ipfs://${imageURI}` }),
      headers: { "Content-Type": "application/json" },
    });

    const cryptobot = await cryptobotResponse.json();
    // console.log("Returing from upload cryptobot");
    return cryptobot;
  } catch (err) {
    console.log(err);
  }
}

function createFormData(imageName) {
  let formData = new FormData();
  formData.append("botImage", fs.createReadStream(imageName));
  return formData;
}

module.exports = uploadCryptobot;
