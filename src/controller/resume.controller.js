const { extractResumeText } = require("../utils/extractor");
const { computeATS } = require("../utils/atsEngine");
const { aiAnalyze } = require("../utils/aiAnalyzer");

const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume file uploaded" });
    }

    const resumeText = await extractResumeText(req.file);
    const { jobDescription } = req.body;

    const atsData = computeATS(resumeText, jobDescription || "");

    let aiData;
    try {
      aiData = await aiAnalyze(resumeText);
    } catch (aiError) {
      console.error("AI Analysis Error:", aiError.message);
      aiData = {
        experienceScore: 65,
        recommendations: [
          "Add more action verbs to describe achievements",
          "Include quantifiable metrics and results",
          "Improve formatting with consistent bullet points",
          "Add relevant technical skills section",
          "Include measurable impact in previous roles",
        ],
        summaryImprovement:
          "Strengthen professional summary with specific accomplishments and key skills that match job requirements.",
      };
    }

    return res.json({
      success: true,
      ats: {
        ...atsData,
        experienceScore: aiData.experienceScore,
      },
      recommendations: aiData.recommendations,
      summaryImprovement: aiData.summaryImprovement,
    });
  } catch (error) {
    console.error("Resume analysis error:", error);
    res.status(500).json({
      message: "Resume analysis failed",
      error: error.message,
    });
  }
};

module.exports = {
  analyzeResume,
};
