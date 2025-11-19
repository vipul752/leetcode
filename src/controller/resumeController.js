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
    const aiData = await aiAnalyze(resumeText);

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
    console.log(error);
    res.status(500).json({
      message: "Resume analysis failed",
      error: error.message,
    });
  }
};

module.exports = {
  analyzeResume,
};
