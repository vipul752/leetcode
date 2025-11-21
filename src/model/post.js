const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    text: { type: String, required: true },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],

    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
