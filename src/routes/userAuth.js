const express = require("express");
const authRouter = express.Router();
const { register, login, logout } = require("../controller/user.controller");
const userMiddleware = require("../middleware/userMiddleware");

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", userMiddleware, logout);
// authRouter.get("/getProfile", getProfile);

module.exports = authRouter;
