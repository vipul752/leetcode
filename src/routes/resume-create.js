const express = require("express");
const resumeCreation = express.Router();
const userMiddleware = require("../middleware/userMiddleware");

const {
  createResume,
  updateResume,
  deleteResume,
  userResume,
  getSingleResume,
} = require("../controller/resume-create.controller");
resumeCreation.post("/create", userMiddleware, createResume);
resumeCreation.put("/update/:id", userMiddleware, updateResume);
resumeCreation.delete("/delete/:id", userMiddleware, deleteResume);
resumeCreation.get("/user-resumes", userMiddleware, userResume);
resumeCreation.get("/resume/:id", userMiddleware, getSingleResume);

module.exports = resumeCreation;
