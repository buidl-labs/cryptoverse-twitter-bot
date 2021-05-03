function postToTwitter(twitterBot, cryptobot) {
  console.log("Posting to twitter...");
  const { imageName, token_id } = cryptobot;
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
        let copytext = [
          `Say hi👋 to the freshly minted Cryptobot-${token_id} 🤖 into the Cryptoverse 🌐\n\nhttps://cryptocodeschool.in/tezos/cryptobot/${token_id} #cryptobots #nft #tezos`,
          `Welcome Cryptobot-${token_id} 🤖 to the Cryptoverse 🌐\n\nhttps://cryptocodeschool.in/tezos/cryptobot/${token_id} #cryptobots #nft #tezos`,
          `Cryptobot-${token_id} 🤖 joins the Cryptoverse 🌐\n\nhttps://cryptocodeschool.in/tezos/cryptobot/${token_id} #cryptobots #nft #tezos `,
        ];
        // now we can reference the media and post a tweet (media will attach to the tweet)
        let twitterCopy = copytext[Math.floor(Math.random() * copytext.length)];

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
}
module.exports = postToTwitter;
