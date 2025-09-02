const express = require("express");
const videoRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  generateUploadSignature,
  saveVideoMetaData,
  deleteVideo,
} = require("../controller/video.controller");

videoRouter.get("/create/:id", adminMiddleware, generateUploadSignature);
videoRouter.post("/save", adminMiddleware, saveVideoMetaData);
videoRouter.delete("/delete/:videoId", adminMiddleware, deleteVideo);

module.exports = videoRouter;
