const axios = require("axios");
const { cleanJSON } = require("./cleanJson");

const aiAnalyze = async (resumeText) => {
  const prompt = `
You are an ATS + ResumeWorded style evaluator. Analyze the resume deeply and return JSON ONLY.
Return output in VALID JSON ONLY. 
NO bullet characters, NO extra text, NO explanation.

Return result in EXACTLY this format:

{
  "experienceScore": number,
  "recommendations": string[], 
  "summaryImprovement": string
}

Use real ATS logic and compute:

{
  "atsScore": number,            // 0–100
  "keywordScore": number,        // 0–100
  "skillsMatched": [],
  "skillsMissing": [],
  "formatScore": number,         // 0–100
  "lengthScore": number,         // 0–100
  "experienceScore": number,     // 0–1 or 0–100
  "recommendations": [],
  "summaryImprovement": ""
}

Important:
- Do NOT return static values.
- Score must vary based on content quality.
- KeywordScore must be based on detected tech skills.
- FormatScore must depend on structure consistency.
- atsScore = weighted average the model decides.
- Produce realistic ATS behavior like ResumeWorded.
- Always return clean valid JSON.

Rules:
- ALWAYS return at least 3-5 recommendations.
- Recommendations must be actionable, specific, and measurable.
- NEVER return an empty recommendations array.
- Use ResumeWorded-style suggestions such as:
  • Add more action verbs
  • Add quantifiable impact
  • Improve formatting
  • Add missing technical skills
  • Improve summary strength
  • Fix bullet structure
  • Add leadership achievements
  • Add relevant keywords for ATS
  • Expand experience details
  • Improve sentence clarity
- Avoid generic comments like "Improve skills section".

Now analyze this resume:

${resumeText}
`;

  const result = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are an ATS resume analyzer." },
        { role: "user", content: prompt },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
    }
  );
  const content = result.data.choices[0].message.content;

  try {
    const cleaned = cleanJSON(content);

    if (!cleaned) {
      throw new Error("Could not extract JSON from response");
    }

    const parsed = JSON.parse(cleaned);

    // Validate required fields
    if (
      !parsed.recommendations ||
      !Array.isArray(parsed.recommendations) ||
      parsed.recommendations.length === 0
    ) {
      parsed.recommendations = [
        "Add more action verbs to describe achievements",
        "Include quantifiable metrics and results",
        "Improve formatting with consistent bullet points",
        "Add relevant technical skills section",
        "Include measurable impact in previous roles",
      ];
    }

    if (!parsed.summaryImprovement) {
      parsed.summaryImprovement =
        "Strengthen professional summary with specific accomplishments and key skills that match job requirements.";
    }

    if (!parsed.experienceScore) {
      parsed.experienceScore = 70;
    }

    return parsed;
  } catch (error) {
    console.error("JSON Parse Error:", error.message);
    console.error("Content received:", content.substring(0, 200));

    // Return fallback response on parse error
    return {
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
};

module.exports = { aiAnalyze };
