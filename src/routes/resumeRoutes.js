const express = require("express");
const multer = require("multer");
const {
  analyzeResume,
  generateResumePDF,
} = require("../controller/resume.controller");
const userMiddleware = require("../middleware/userMiddleware");

const resumeRouter = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

resumeRouter.post("/analyze", upload.single("resume"), analyzeResume);
resumeRouter.post("/generate-pdf", userMiddleware, generateResumePDF);

module.exports = resumeRouter;
