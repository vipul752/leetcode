const express = require("express");
const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  
} = require("../controller/problem.controller");

problemRouter.post("/create", adminMiddleware, createProblem);
problemRouter.put("/update/:id", adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);

problemRouter.get("/getProblem/:id", getProblemById);
problemRouter.get("/getAllProblem", getAllProblem);
// problemRouter.get("/userProblem", solvedProblemByUser);

module.exports = problemRouter;
