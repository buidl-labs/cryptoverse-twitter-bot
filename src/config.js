require("dotenv").config();

module.exports = {
  twitterKeys: {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  },
  contractData: {
    address: process.env.CONTRACT_ADDRESS,
    rpcURL: process.env.RPC_URL,
    indexerNetwork: process.env.INDEXER_NETWORK,
  },
  urls: {
    imageServerURL: process.env.SELF_URL,
    apiURL: process.env.API_URL,
  },
  redis: {
    connection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  },
};
