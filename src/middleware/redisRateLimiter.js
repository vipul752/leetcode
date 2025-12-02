const redisClient = require("../config/redis");

const submitRateLimiter = async (req, res, next) => {
  const user_id = req.result._id;
  const redisKey = `submit_cooldown${user_id}`;

  try {
    const exist = await redisClient.exists(redisKey);
    if (exist) {
      return res.status(429).json({
        error: "Please wait for 10 sec before submission",
      });
    }

    await redisClient.set(redisKey, "cooldown_active", {
      EX: 10,
      NX: true,
    });
    next();
  } catch (error) {
    console.error("rate limiter error", error);
    res.status(500).send({ error: "internal server error" });
  }
};

module.exports = submitRateLimiter;
