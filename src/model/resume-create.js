const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
    },
    template: {
      type: String,
      enum: ["standard", "modern", "minimal"],
      default: "standard",
    },
    personalInfo: {
      fullName: {
        type: String,
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
      location: {
        type: String,
      },
      linkedin: {
        type: String,
      },
      github: {
        type: String,
      },
      portfolio: {
        type: String,
      },
    },
    summary: {
      type: String,
    },
    skills: [
      {
        type: String,
      },
    ],
    experience: [
      {
        company: {
          type: String,
        },
        role: {
          type: String,
        },
        startDate: {
          type: Date,

          default: Date.now,
        },
        endDate: {
          type: Date,
          default: Date.now,
        },
        description: {
          type: String,
        },
      },
    ],
    education: [
      {
        institute: {
          type: String,
        },
        degree: {
          type: String,
        },
        startYear: {
          type: Number,
        },
        endYear: {
          type: Number,
        },
      },
    ],
    projects: [
      {
        title: {
          type: String,
        },
        description: {
          type: String,
        },
        techStack: [
          {
            type: String,
          },
        ],
        link: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resume", resumeSchema);
