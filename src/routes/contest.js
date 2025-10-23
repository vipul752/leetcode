const express = require("express");
const contestRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  createContest,
  getAllContests,
  registerUserToContest,
  unregisterUserFromContest,
  submitContestCode,
  userContestSubmissions,
  getAllContestsParticipants,
  getNumberOfProblemInEachContest,
  getSingleContests,
  getContestProblems,
  userContest,
  getUserSubmissions,
} = require("../controller/contest.controller");

contestRouter.post("/create", adminMiddleware, createContest);
contestRouter.get("/getAllContests", getAllContests);
contestRouter.post(
  "/register/:contestId",
  userMiddleware,
  registerUserToContest
);
contestRouter.post(
  "/unregister/:contestId",
  userMiddleware,
  unregisterUserFromContest
);
contestRouter.post(
  "/:contestId/submit/:problemId",
  userMiddleware,
  submitContestCode
);
contestRouter.get(
  "/:contestId/submissions/:userId",
  userMiddleware,
  userContestSubmissions
);
contestRouter.get("/:contestId/participants", getAllContestsParticipants);
contestRouter.get("/:contestId/problemCount", getNumberOfProblemInEachContest);
contestRouter.get("/:contestId", userMiddleware, getSingleContests);
contestRouter.get("/:contestId/problems", userMiddleware, getContestProblems);
contestRouter.get("/:contestId/user", userMiddleware, userContest);
contestRouter.get(
  "/:contestId/user/submissions",
  userMiddleware,
  getUserSubmissions
);

module.exports = contestRouter;
