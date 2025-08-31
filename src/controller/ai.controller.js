const { GoogleGenerativeAI } = require("@google/generative-ai");

const solveDoubt = async (req, res) => {
  try {
    const { messages, title, description, testCase, startCode } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are an expert Data Structures and Algorithms (DSA) teaching assistant...

CURRENT PROBLEM CONTEXT:
- Problem Title: ${title || "Not provided"}
- Problem Description: ${description || "Not provided"}  
- Test Cases: ${testCase || "Not provided"}
- Starter Code: ${startCode || "Not provided"}

      `,
    });

    // Ensure proper format for Gemini API
    const formattedMessages = (messages || []).map((msg) => ({
      role: msg.role || "user",
      parts: msg.parts?.map((p) => ({ text: p.text })) || [],
    }));

    const result = await model.generateContent({
      contents: formattedMessages,
    });

    const text = result.response.text();

    res.json({ message: text });
  } catch (error) {
    console.error("Error occurred while solving doubt:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { solveDoubt };
