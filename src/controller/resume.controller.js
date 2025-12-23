const { extractResumeText } = require("../utils/extractor");
const { computeATS } = require("../utils/atsEngine");
const { aiAnalyze } = require("../utils/aiAnalyzer");
const ResumeCreate = require("../model/resume-create");
const puppeteer = require("puppeteer");

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.getFullYear();
}

function buildTextFromJSON(resume) {
  return `
    ${resume.summary || ""}
    ${resume.skills?.join(" ") || ""}
    ${resume.experience?.map((e) => e.description).join(" ") || ""}
    ${resume.projects?.map((p) => p.description).join(" ") || ""}
    ${resume.projects?.map((p) => p.techStack?.join(" ")).join(" ") || ""}
  `.toLowerCase();
}
function renderResumeHTML(resume) {
  const {
    personalInfo = {},
    summary = "",
    skills = [],
    experience = [],
    education = [],
    projects = [],
  } = resume;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${personalInfo.fullName || "Resume"}</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #000;
      padding: 32px;
    }
    h1, h2 {
      margin-bottom: 6px;
    }
    h1 {
      font-size: 24px;
    }
    h2 {
      font-size: 14px;
      margin-top: 20px;
      border-bottom: 1px solid #000;
      padding-bottom: 2px;
    }
    ul {
      margin: 6px 0 0 18px;
    }
    li {
      margin-bottom: 4px;
    }
    .section {
      margin-bottom: 14px;
    }
    .muted {
      font-size: 11px;
    }
  </style>
</head>

<body>

  <!-- CONTACT -->
  <h1>${personalInfo.fullName || ""}</h1>
  <p class="muted">
    ${personalInfo.email || ""} |
    ${personalInfo.phone || ""} |
    ${personalInfo.linkedin || ""} |
    ${personalInfo.github || ""}
  </p>

  <!-- SUMMARY -->
  ${
    summary
      ? `
  <div class="section">
    <h2>Summary</h2>
    <p>${summary}</p>
  </div>`
      : ""
  }

  <!-- SKILLS -->
  ${
    skills.length
      ? `
  <div class="section">
    <h2>Skills</h2>
    <p>${skills.join(", ")}</p>
  </div>`
      : ""
  }

  <!-- EXPERIENCE -->
  ${
    experience.length
      ? `
  <div class="section">
    <h2>Experience</h2>
    ${experience
      .map(
        (exp) => `
      <p><strong>${exp.role || ""}</strong> - ${exp.company || ""}</p>
      <p class="muted">
        ${formatDate(exp.startDate)} - ${
          exp.endDate ? formatDate(exp.endDate) : "Present"
        }
      </p>
      <ul>
        ${(exp.description || "")
          .split("\n")
          .map((d) => `<li>${d}</li>`)
          .join("")}
      </ul>
    `
      )
      .join("")}
  </div>`
      : ""
  }

  <!-- PROJECTS -->
  ${
    projects.length
      ? `
  <div class="section">
    <h2>Projects</h2>
    ${projects
      .map(
        (proj) => `
      <p><strong>${proj.title || ""}</strong></p>
      <ul>
        <li>${proj.description || ""}</li>
        ${
          proj.techStack?.length
            ? `<li>Technologies: ${proj.techStack.join(", ")}</li>`
            : ""
        }
      </ul>
    `
      )
      .join("")}
  </div>`
      : ""
  }

  <!-- EDUCATION -->
  ${
    education.length
      ? `
  <div class="section">
    <h2>Education</h2>
    ${education
      .map(
        (edu) => `
      <p>
        <strong>${edu.degree || ""}</strong>,
        ${edu.institute || ""}
        (${edu.startYear || ""} - ${edu.endYear || "Present"})
      </p>
    `
      )
      .join("")}
  </div>`
      : ""
  }

</body>
</html>
`;
}

const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume file uploaded" });
    }

    if (req.body.resumeData) {
      resumeText = buildTextFromJSON(req.body.resumeData);
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

const generateResumePDF = async (req, res) => {
  try {
    const resume = await ResumeCreate.findById(req.body.resumeId);
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(`
      <html>
        <body>
          ${renderResumeHTML(resume)}
        </body>
      </html>
    `);

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume.pdf",
    });

    return res.send(pdfBuffer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "PDF generation failed" });
  }
};

module.exports = {
  analyzeResume,
  generateResumePDF,
};
