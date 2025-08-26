const jwt = require("jsonwebtoken");
const User = require("../model/user");
const redisClient = require("../config/redis");

const userMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) throw new Error("Token not found");

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id;
    if (!userId) throw new Error("Invalid token payload");

    const result = await User.findById(userId);
    if (!result) throw new Error("User not found");

    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked) throw new Error("Token blocked");

    req.result = result;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

module.exports = userMiddleware;
