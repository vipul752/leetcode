const mongoose = require("mongoose");

const challengeRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  opponent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: null,
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "problem",
    default: null,
  },
  state: {
    type: String,
    enum: ["waiting", "running", "finished"],
    default: "waiting",
  },
  startAt: { type: Date },
  durationSec: { type: Number, default: 1800 },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
});

const ChallengeRoom = mongoose.model("challengeRoom", challengeRoomSchema);

module.exports = ChallengeRoom;
