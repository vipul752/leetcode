const express = require("express");
const challengeRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  createNewChallengeRoom,
  joinChallengeRoom,
  leaveChallengeRoom,
} = require("../controller/challenge.controller");

const { getRoomStatus } = require("../controller/challenge.controller");

challengeRouter.post("/create/room", userMiddleware, createNewChallengeRoom);
challengeRouter.post("/join/room/:roomId", userMiddleware, joinChallengeRoom);
challengeRouter.post("/leave/room/:roomId", userMiddleware, leaveChallengeRoom);
challengeRouter.get("/room/status/:roomId", userMiddleware, getRoomStatus);
module.exports = challengeRouter;
