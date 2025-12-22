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
          required: true,
        },
        role: {
          type: String,
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
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
          required: true,
        },
        degree: {
          type: String,
          required: true,
        },
        startYear: {
          type: Number,
          required: true,
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
          required: true,
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
