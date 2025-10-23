const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "problem" }],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  status: {
    type: String,
    enum: ["upcoming", "live", "ended"],
    default: "upcoming",
  },
});


const Contest = mongoose.model("contest", contestSchema);

module.exports = Contest;
