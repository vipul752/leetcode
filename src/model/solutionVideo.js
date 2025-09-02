const mongoose = require("mongoose");

const solutionVideoSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "problem",
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  cloudinaryPublicId: {
    type: String,
    required: true,
    unique: true,
  },
  secureUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
  },
  duration:{
    type:Number,
    required:true,
  }
},
{timestamps:true});

const SolutionVideo = mongoose.model("solutionVideo", solutionVideoSchema);

module.exports = SolutionVideo;
