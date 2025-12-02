const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomId: String,
  users: [String], 
  questions: [String],
  startTime: Date,
  endTime: Date,
  status: { type: String, default: "waiting" }, 
});
module.exports = mongoose.model("room", RoomSchema);
