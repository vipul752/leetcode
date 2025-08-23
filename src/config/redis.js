const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_KEY,
  socket: {
    host: "redis-12126.crce206.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 12126,
  },
});

module.exports = redisClient;
