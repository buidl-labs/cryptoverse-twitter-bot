const { Queue } = require("bullmq");
const config = require("../config");
const queueName = "take-screenshot";
const screenshotQueue = new Queue(queueName, config.redis);

module.exports = screenshotQueue;
