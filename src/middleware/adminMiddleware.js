const jwt = require("jsonwebtoken");
const User = require("../model/user");

const adminMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) throw new Error("Token not found");

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = payload;
    if (!id) throw new Error("Invalid token payload");

    if (payload.role !== "admin") throw new Error("Access denied, admin only");

    const result = await User.findById(id);
    if (!result) throw new Error("User not found");

    req.result = result;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

module.exports = adminMiddleware;
