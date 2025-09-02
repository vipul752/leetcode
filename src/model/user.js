const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
    },
    lastName: {
      type: String,
      minLength: 3,
      maxLength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      immutable: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    age: {
      type: Number,
      min: 6,
      max: 80,
    },
    password: {
      type: String,
      required: true,
    },

    // ✅ Profile fields
    avatar: {
      type: String, // Cloudinary URL for profile pic
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    bio: {
      type: String,
      maxLength: 200,
    },
    location: {
      type: String,
    },

    // ✅ Problem tracking
    problemSolved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "problem",
      },
    ],
    problemSubmitted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "problem",
      },
    ],

    totalSolved: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastSolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", userSchema);
module.exports = User;
