const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
const activeSessions = new Map();

const detectStrength = (text) => {
  const normalized = text.toLowerCase();

  if (
    normalized.match(
      /(react|vue|angular|node|express|javascript|typescript|mongodb|postgres|sql)/gi
    )
  ) {
    return "webdev";
  }
  if (
    normalized.match(
      /(array|linked list|tree|graph|binary search|dsa|dp|dynamic programming|sorting|hash|stack|queue)/gi
    )
  ) {
    return "dsa";
  }
  if (
    normalized.match(
      /(scalable|database|load balancer|cache|microservice|architecture|distributed|system design)/gi
    )
  ) {
    return "systemdesign";
  }
  return "mixed";
};

const getTimeRemaining = (session) => {
  const elapsed = Date.now() - session.startTime;
  const totalMs = 15 * 60 * 1000;
  const remainingMs = totalMs - elapsed;
  const remainingSeconds = Math.round(remainingMs / 1000);
  return Math.max(0, remainingSeconds);
};

const startInterview = async (userId, mode = "mixed") => {
  const sessionId = Math.random().toString(36).substring(2, 15);
  const startTime = Date.now();

  const session = {
    id: sessionId,
    userId,
    mode, 
    phase: "opening",
    history: [
      {
        role: "model",
        parts: [
          {
            text: "I'll be conducting a technical interview with you today. Let's get started! First, could you please introduce yourself?",
          },
        ],
      },
    ],
    startTime,
    endTime: startTime + 15 * 60 * 1000,
    ended: false,
    questionCount: 0,
    technicalStrength: "mixed",
    scores: {
      technicalAccuracy: 0,
      communication: 0,
      confidence: 0,
      problemSolving: 0,
    },
    feedback: [],
  };

  activeSessions.set(sessionId, session);
  return sessionId;
};

const isExpired = (session) => {
  return Date.now() > session.endTime;
};

const updatePhase = (session) => {
  const secondsRemaining = getTimeRemaining(session);

  if (session.questionCount === 0) {
    session.phase = "opening";
  } else if (session.questionCount === 1) {
    session.phase = "opening";
  } else if (secondsRemaining <= 120) {
    session.phase = "wrapup";
  } else if (session.questionCount > 1) {
    session.phase = session.questionCount % 2 === 0 ? "technical" : "followup";
  }
};

const generateNextQuestion = async (session, userMessage = "") => {
  if (isExpired(session)) {
    session.ended = true;
    return {
      question: "Interview time ended. Thank you for your time today!",
      ended: true,
      evaluation: generateEvaluation(session),
    };
  }

  if (userMessage) {
    session.history.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    session.technicalStrength = detectStrength(userMessage);
    session.questionCount++;
  }

  updatePhase(session);
  const secondsRemaining = getTimeRemaining(session);

  const systemPrompt = `You are a senior software engineer and expert interviewer from Google.

Your voice should follow these rules:
- Sound natural, confident, human, and conversational
- Do NOT sound robotic or overly polite
- No long paragraphs
- No generic fluff
- No filler statements like “Let’s continue” or “Great, next question”
- Avoid repeating the same pattern
- Ask questions like a real human interviewer would

Your interview style:
- Direct and concise (1–2 sentences)
- Slightly challenging but NOT rude
- Professional but friendly
- Curious and analytical
- Adaptive based on the candidate’s previous answer

INTERVIEW STRUCTURE:

1️⃣ **Opening (First 2 questions)**  
Tone: warm, natural, conversational  
- Ask for introduction  
- Ask what the candidate is strongest in  
- Keep it simple

2️⃣ **Technical Round (Main Phase)**  
Choose based on mode (“webdev”, “dsa”, “systemdesign”, or “mixed”)  
AND based on detected strength (“${session.technicalStrength}”)

Rules:
- Ask ONE question at a time  
- Make the question realistic (like real job interviews)  
- No definition questions  
- Focus on applied thinking  
- Push difficulty gradually  
- Follow up based on the candidate’s previous message

3️⃣ **Follow-Up Style**  
If answer is strong:  
- Dive deeper into reasoning or edge cases  

If answer is weak:  
- Ask a clarifying or guiding question  
- Do NOT shame or sound negative  

4️⃣ **Voice Personality**  
Your tone should be:
- Calm
- Human
- Confident
- Minimalistic
- Slightly challenging
- Engaging

Avoid being:
- Robotic
- Repetitive
- Over-explanatory
- Overly polite (“Great!”, “Nice!” every question)

5️⃣ **Wrap-up (Last 1–2 minutes)**  
- Ask one final question  
- Give short, honest overall feedback  
- Keep feedback crisp (2–3 lines)

---

CONVERSATION SO FAR:
${session.history
  .map((msg) => `${msg.role.toUpperCase()}: ${msg.parts[0].text}`)
  .join("\n")}

Now generate ONLY the next interviewer question in a natural, human voice.
Do NOT include explanations.  
Do NOT include self-questions or multi-part questions.  
Only ONE clean question.

Your answer will be spoken aloud to the user, so keep the question short, natural, and easy to read out loud.
Avoid long sentences or complex structures.

`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      ...session.history,
    ],
  });

  const aiText = result.response.text().trim();
  session.history.push({
    role: "model",
    parts: [{ text: aiText }],
  });

  const minutesRemaining = Math.round(secondsRemaining / 60);
  if (minutesRemaining <= 2 && session.phase === "wrapup") {
    return {
      question: aiText,
      ended: true,
      timeRemaining: secondsRemaining,
      timeRemainingFormatted: `${Math.floor(secondsRemaining / 60)}:${String(
        secondsRemaining % 60
      ).padStart(2, "0")}`,
      evaluation: generateEvaluation(session),
    };
  }

  return {
    question: aiText,
    phase: session.phase,
    ended: false,
    timeRemaining: secondsRemaining,
    timeRemainingFormatted: `${Math.floor(secondsRemaining / 60)}:${String(
      secondsRemaining % 60
    ).padStart(2, "0")}`,
  };
};

const generateEvaluation = (session) => {
  const questionCount = session.questionCount;
  const conversationQuality = Math.min(
    100,
    questionCount * 15 + Math.random() * 30
  );

  return {
    technicalAccuracy: Math.round(Math.min(10, 5 + Math.random() * 5)),
    communication: Math.round(Math.min(10, 6 + Math.random() * 4)),
    confidence: Math.round(Math.min(10, 5 + Math.random() * 5)),
    problemSolving: Math.round(Math.min(10, 5 + Math.random() * 5)),
    overallScore: Math.round(Math.min(10, 5.5 + Math.random() * 4.5)),
    areasToImprove: [
      "Practice more system design problems",
      "Work on communication clarity during problem-solving",
      "Deep dive into data structures and algorithms",
    ],
    strengths: [
      "Good approach to problem solving",
      "Clear communication",
      "Quick understanding of requirements",
    ],
    feedback:
      "You demonstrated solid fundamentals. Focus on practicing harder problems and articulating your thought process more clearly.",
  };
};

const endInterview = (sessionId) => {
  const session = activeSessions.get(sessionId);
  if (session) {
    const evaluation = generateEvaluation(session);
    activeSessions.delete(sessionId);
    return {
      message: "Interview ended successfully.",
      evaluation,
    };
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
  generateEvaluation,
};
