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

    const sessionId = await startInterview(userId);
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

    // 3️⃣ Return both sessionId & room URL
    res.json({
      sessionId,
      question: first.aiText,
      videoRoom: videoRoom.data.url,
    });
  } catch (error) {
    console.error("Start AI interview error:", error);
    res.status(500).json({ error: "Failed to start interview" });
  }
};

const getNextAIQuestion = async (req, res) => {
  try {
    const { sessionId, answer } = req.body;
    const session = getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const next = await generateNextQuestion(session, answer);
    res.json({ question: next.aiText, ended: next.ended });
  } catch (error) {
    console.error("Get next question error:", error);
    res.status(500).json({ error: "Failed to get next question" });
  }
};

const endAIInterview = (req, res) => {
  try {
    const { sessionId } = req.body;
    const result = endInterview(sessionId);
    res.json(result);
  } catch (error) {
    console.error("End interview error:", error);
    res.status(500).json({ error: "Failed to end interview" });
  }
};

module.exports = {
  startAIInterview,
  getNextAIQuestion,
  endAIInterview,
};
