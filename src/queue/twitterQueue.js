const { Queue } = require("bullmq");
const config = require("../config");
const queueName = "twitter-queue";

const twitterQueue = new Queue(queueName, config.redis);
console.log(config.redis);
module.exports = twitterQueue;
