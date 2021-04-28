const config = require("./config");

const { Worker } = require("bullmq");
const Twit = require("twit");
const fs = require("fs");

function main() {
  try {
    const twitterBot = new Twit(config.twitterKeys);
    const worker = new Worker(
      "twitter-queue",
      async (job) => {
        console.log("twitterBot job being processed.");
        const { token_id, imageName } = job.data;
        console.log(job.data);

        twitterBot.postMediaChunked({ file_path: imageName }, function(
          err,
          data,
          response
        ) {
          if (err) {
            console.log(err.message);
            return;
          }
          console.log(`Image uploaded to twitter - ${data.media_id_string}`);
          // deleteImage(imageName);
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
              let twitterCopy = `🥳 New Cryptobot joins the Cryptoverse!\nCryptobot-${token_id} was minted 🤖 ⚡️\n\nhttps://cryptocodeschool.in/tezos/cryptobot/${token_id}`;

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
                if (err) console.log("error uploading tweet ->", err.message);
              });
            } else {
              console.log("error upload image to twitter ->", err.message);
            }
            // deleteImage(imageName);
          });
        });
      },
      config.redis
    );
  } catch (err) {
    console.log(err);
  }
}

function deleteImage(imageName) {
  fs.unlink(imageName, (err) => {
    if (err) throw err;
    console.log("File is deleted.");
  });
}

module.exports = main;
