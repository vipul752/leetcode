const {
  startAIInterview,
  getNextAIQuestion,
  endAIInterview,
} = require("../controller/ai.Interview.Controller");

const express = require("express");
const aiInterviewRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");

aiInterviewRouter.post("/start", userMiddleware, startAIInterview);
aiInterviewRouter.post("/next", userMiddleware, getNextAIQuestion);
aiInterviewRouter.post("/end", userMiddleware, endAIInterview);

module.exports = aiInterviewRouter;
