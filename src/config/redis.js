const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_KEY,
  socket: {
    host: "redis-15776.c278.us-east-1-4.ec2.redns.redis-cloud.com",
    port: 15776,
  },
});

module.exports = redisClient;
