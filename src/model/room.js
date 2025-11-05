const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomId: String,
  users: [String], // userIds
  questions: [String], // selected problem IDs
  startTime: Date,
  endTime: Date,
  status: { type: String, default: "waiting" }, // waiting | active | ended
});
module.exports = mongoose.model("room", RoomSchema);
