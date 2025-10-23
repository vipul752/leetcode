const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    problem_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "problem",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ["c++", "javascript", "java", "python"],
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Wrong", "Error"],
      default: "Pending",
    },
    runtime: {
      type: Number,
      default: 0,
    },
    memory: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    contest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "contest",
      default: null,
    }, // 👈 new
  },
  { timestamps: true }
);

submissionSchema.index({ user_id: 1, problem_id: 1 });

const Submission = mongoose.model("submission", submissionSchema);

module.exports = Submission;
