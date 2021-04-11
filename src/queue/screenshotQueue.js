const { Queue } = require("bullmq");

const queueName = "take-screenshot";
const screenshotQueue = new Queue(queueName);

module.exports = screenshotQueue;
