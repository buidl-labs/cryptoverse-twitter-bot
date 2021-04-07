// listen on port so now.sh likes it
const { createServer } = require("http");
const https = require("https");
const axios = require("axios");
const Twit = require("twit"),
  config = require("./config");
  puppeteer = require("puppeteer"),

// Initialize bot
const T = new Twit(config.twitterKeys);
console.log("🎉 twitter bot running 🎉");


// // Start once
// tweeter();

// // Once every N milliseconds
// setInterval(tweeter, 60 * 5 * 1000);

// // Here is the bot!
// function tweeter() {
//   // This is a random number bot
//   var tweet =
//     "Here's a random number between 0 and 100: " +
//     Math.floor(Math.random() * 100);

//   // Post that tweet!
//   T.post("statuses/update", { status: tweet }, tweeted);

//   // Callback for when the tweet is sent
//   function tweeted(err, data, response) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("Success: " + data.text);
//       //console.log(response);
//     }
//   }
// }

// This will allow the bot to run on now.sh
const server = createServer((req, res) => {
  res.writeHead(200);
  res.send("twitter bot api");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT);
console.log(`BOT SERVER RUNNING AT ${PORT}`);
