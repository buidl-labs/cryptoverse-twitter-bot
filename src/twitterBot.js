const config = require("./config");

const { Worker } = require("bullmq");
const Twit = require("twit");
const fetch = require("node-fetch");

function main() {
  try {
    const twitterBot = new Twit(config.twitterKeys);
    const worker = new Worker(
      "twitter-queue",
      async (job) => {
        console.log("twitterBot job being processed.");
        const { token_id, imageURI, mintedBy } = job.data;
        console.log(job.data);
        const imageURL = sanitizeJsonUri(imageURI);
        const imageResp = await fetch(imageURL);
        const imageBuffer = await imageResp.buffer();
        const imageBase64 = imageBuffer.toString("base64");

        twitterBot.post("media/upload", { media_data: imageBase64 }, function(
          err,
          data,
          response
        ) {
          console.log(`Image uploaded to twitter - ${data.media_id_string}`);

          const mediaIdStr = data.media_id_string;
          const altText = `Cryptobot-${token_id} from Cryptoverse Wars`;
          const meta_params = {
            media_id: mediaIdStr,
            alt_text: { text: altText },
          };

          twitterBot.post("media/metadata/create", meta_params, function(
            err,
            data,
            response
          ) {
            if (!err) {
              // now we can reference the media and post a tweet (media will attach to the tweet)
              let twitterCopy;
              if (mintedBy) {
                twitterCopy = `🥳 New Cryptobot joins the Cryptoverse!
                Cryptobot-${token_id} minted by ${mintedBy}
                
                https://cryptocodeschool.in/tezos/cryptobot/${token_id}`;
              } else {
                twitterCopy = `🥳 New Cryptobot joins the Cryptoverse!
                Cryptobot-${token_id} was minted 🤖 ⚡️
              
                https://cryptocodeschool.in/tezos/cryptobot/${token_id}`;
              }
              const params = {
                status: twitterCopy,
                media_ids: [mediaIdStr],
              };

              twitterBot.post("statuses/update", params, function(
                err,
                data,
                response
              ) {
                console.log(data.id);
              });
            }
          });
        });
      },
      config.redis
    );
  } catch (err) {
    console.log(err);
  }
}

function sanitizeJsonUri(origin) {
  if (origin.startsWith("ipfs://")) {
    return `https://cloudflare-ipfs.com/ipfs/${origin.substring(7)}/`;
  }
  return null;
}
module.exports = main;
