# Twitter bot to send updates of Cryptoverse Wars Marketplace

## Setup

### Install and setup Redis.

1. [For mac](https://phoenixnap.com/kb/install-redis-on-mac)
   - Tip - To start the redis server on your system, run `brew services start redis`
2. [For windows](https://dev.to/divshekhar/how-to-install-redis-on-windows-10-3e99)

### Fill up the `.env` file

#### Twitter keys

1. TWITTER_ACCESS_TOKEN
2. TWITTER_ACCESS_TOKEN_SECRET
3. TWITTER_CONSUMER_KEY
4. TWITTER_CONSUMER_SECRET

#### Redis variables

1. REDIS_HOST
2. REDIS_PORT
3. REDIS_PASS

When running on localhost, your `REDIS_PASS` will most probably be left empty.
`REDIS_HOST` and `REDIS_PORT` will be `localhost` and `6379`.

#### Rest of the config

1. CONTRACT_ADDRESS
2. RPC_URL(URL of the RPC that'll be used by Taquito)
3. INDEXER_NETWORK
4. SELF_URL(Should be `http://localhost:3000` when running on localhost)
5. API_URL(URL of the backend for Cryptoverse Wars)

## Running the project

1. `npm install`
2. `node index.js`
