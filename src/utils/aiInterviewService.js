const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
const activeSessions = new Map();

const startInterview = async (userId) => {
  const sessionId = Math.random().toString(36).substring(2, 15);
  const startTime = Date.now();

  const session = {
    id: sessionId,
    userId,
    history: [],
    startTime,
    endTime: startTime + 15 * 60 * 1000,
    ended: false,
  };

  activeSessions.set(sessionId, session);
  return sessionId;
};

const isExpired = (session) => {
  return Date.now() > session.endTime;
};

const generateNextQuestion = async (session, userMessage = "") => {
  if (isExpired(session)) {
    session.ended = true;
    return { text: "Interview ended. Great work today!", ended: true };
  }

  if (userMessage) session.history.push({ role: "user", text: userMessage });

  const context = session.history
    .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
    .join("\n");

  const prompt = `You are a friendly but challenging software engineering interviewer and web developer interviewer.
Ask one concise question at a time.
If candidate answered, analyze briefly and continue.
Avoid long monologues. Stay professional.

Conversation so far:
${context}

Now give your next question (1–2 sentences only).
If 15 min nearly over, wrap up and provide short closing message.
`;

  const result = await model.generateContent(prompt);

  const aiText = result.response.text().trim();
  session.history.push({ role: "ai", text: aiText });

  return { aiText, ended: false };
};

const endInterview = (sessionId) => {
  const session = activeSessions.get(sessionId);
  if (session) {
    activeSessions.delete(sessionId);
    return { message: "Interview ended successfully." };
  }
  return { message: "Session not found." };
};

const getSession = (id) => activeSessions.get(id);

module.exports = {
  startInterview,
  generateNextQuestion,
  endInterview,
  getSession,
  isExpired,
};
