const express = require("express");
const submissionRouter = express.Router();
const { submitCode, runCode } = require("../controller/submission.controller");
const userMiddleware = require("../middleware/userMiddleware");
const submitRateLimiter = require("../middleware/redisRateLimiter");

submissionRouter.post(
  "/submit/:id",
  userMiddleware,
  submitRateLimiter,
  submitCode
);
submissionRouter.post("/run/:id", userMiddleware, runCode);

module.exports = submissionRouter;
