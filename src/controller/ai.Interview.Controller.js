const {
  startInterview,
  generateNextQuestion,
  endInterview,
  getSession,
} = require("../utils/aiInterviewService");
const axios = require("axios");

const startAIInterview = async (req, res) => {
  try {
    const userId = req.result._id;
    const { mode = "mixed" } = req.body;

    // Validate mode
    const validModes = ["webdev", "dsa", "systemdesign", "mixed"];
    if (!validModes.includes(mode)) {
      return res
        .status(400)
        .json({
          error: "Invalid mode. Use: webdev, dsa, systemdesign, or mixed",
        });
    }

    const sessionId = await startInterview(userId, mode);
    const session = getSession(sessionId);
    const first = await generateNextQuestion(session);

    const videoRoom = await axios.post(
      "https://api.daily.co/v1/rooms",
      {
        properties: {
          exp: Math.round(Date.now() / 1000) + 15 * 60,
          enable_chat: true,
          enable_knocking: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      sessionId,
      mode,
      question: first.question,
      phase: first.phase,
      timeRemaining: first.timeRemaining,
      videoRoom: videoRoom.data.url,
    });
  } catch (error) {
    console.error("Start AI interview error:", error);
    res
      .status(500)
      .json({ error: "Failed to start interview", message: error.message });
  }
};

const getNextAIQuestion = async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId || !answer) {
      return res
        .status(400)
        .json({ error: "sessionId and answer are required" });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found or expired" });
    }

    const next = await generateNextQuestion(session, answer);

    res.json({
      success: true,
      question: next.question,
      phase: next.phase,
      timeRemaining: next.timeRemaining,
      ended: next.ended,
      evaluation: next.evaluation || null,
    });
  } catch (error) {
    console.error("Get next question error:", error);
    res
      .status(500)
      .json({ error: "Failed to get next question", message: error.message });
  }
};

const endAIInterview = (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const result = endInterview(sessionId);

    if (!result.evaluation) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({
      success: true,
      message: result.message,
      evaluation: result.evaluation,
    });
  } catch (error) {
    console.error("End interview error:", error);
    res
      .status(500)
      .json({ error: "Failed to end interview", message: error.message });
  }
};

module.exports = {
  startAIInterview,
  getNextAIQuestion,
  endAIInterview,
};
