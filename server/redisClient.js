// src/redisClient.js
const { createClient } = require("redis");

const client = createClient({
  url: "redis://redis:6379", // Use the service name defined in docker-compose.yml
});

client.on("error", (err) => {
  console.error(`Redis error: ${err}`);
});

client
  .connect()
  .catch((err) => console.error(`Redis connection error: ${err}`));

module.exports = client;
