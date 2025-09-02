const express = require("express");
const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const userMiddleware = require("../middleware/userMiddleware");
const {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  solvedProblemByUser,
  submittedProblem,
  getUserStats,
} = require("../controller/problem.controller");

problemRouter.post("/create", adminMiddleware, createProblem);
problemRouter.put("/update/:id", adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);

problemRouter.get("/getProblem/:id", userMiddleware, getProblemById);
problemRouter.get("/getAllProblem", userMiddleware, getAllProblem);
problemRouter.get("/userProblem", userMiddleware, solvedProblemByUser);
problemRouter.get("/submittedProblem/:pid", userMiddleware, submittedProblem);
problemRouter.get("/userStats", userMiddleware, getUserStats);

module.exports = problemRouter;
