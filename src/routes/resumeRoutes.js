const express = require("express");
const multer = require("multer");
const { analyzeResume } = require("../controller/resume.controller");

const resumeRouter = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

resumeRouter.post("/analyze", upload.single("resume"), analyzeResume);

module.exports = resumeRouter;
