const nodeHtmlToImage = require("node-html-to-image");
const fetch = require("node-fetch");
const fs = require("fs");

async function createImage(imageHash) {
  try {
    const html = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cryptobot</title>
        <style>
            
          body {
            width: 2400px;
            height: 1350px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
  
          #bg{
            position: fixed;
            top: 0;
            left: 0; 
            right: 0;
            bottom: 0;
            width: 100%;
            height:100%;
            object-fit: cover;
          }
          
          #bot{
            width: 80%;
            position: relative;
            z-index: 10;
          }
    
    
        </style>
    </head>
    
    <body>
          <img src={{bg}} id="bg" />
          <img src={{image}} id="bot" />
    </body>
    </html>`;

    const res = await fetch(`https://gateway.pinata.cloud/ipfs/${imageHash}`);
    const imageBase64 = Buffer.from(await res.buffer()).toString();

    const image = fs.readFileSync("./static/bg.jpeg");

    const bgImage = new Buffer.from(image).toString("base64");
    const dataURI = "data:image/jpeg;base64," + bgImage;
    const imageName = `./bot_images/cryptobot${Date.now()}.png`;
    return nodeHtmlToImage({
      output: imageName,
      html: html,
      type: "jpeg",
      content: {
        image: imageBase64,
        bg: await dataURI,
      },
    }).then((res) => imageName);
  } catch (err) {
    console.log("error generating image ->", err.message);
  }
}

module.exports = createImage;
