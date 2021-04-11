const { Queue } = require("bullmq");

const queueName = "twitter-queue";
const twitterQueue = new Queue(queueName);

module.exports = twitterQueue;
