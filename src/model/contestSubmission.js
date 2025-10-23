const mongoose = require("mongoose");

const contestSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "contest",
    required: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "problem",
    required: true,
  },
  code: { type: String, required: true },
  language: { type: String, required: true },

  // Submission result fields
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Wrong Answer", "Error"],
    default: "Pending",
  },
  passedTestCases: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  runtime: { type: Number, default: 0 }, // in seconds
  memory: { type: Number, default: 0 }, // in KB
  errorMessage: { type: String, default: "" },

  timeTaken: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

const ContestSubmission = mongoose.model(
  "contestSubmission",
  contestSubmissionSchema
);

module.exports = ContestSubmission;
