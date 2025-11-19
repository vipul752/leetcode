const SKILL_WEIGHTS = {
  // Senior/High-value skills
  "machine learning": 9,
  "deep learning": 9,
  llm: 9,
  "cloud architecture": 8,
  "system design": 8,
  kubernetes: 8,
  docker: 8,

  // Core programming languages
  python: 7,
  java: 7,
  "c++": 7,
  javascript: 6,
  typescript: 6,
  go: 6,
  rust: 6,

  // Frameworks/Tools
  react: 6,
  "node.js": 6,
  express: 6,
  django: 6,
  "spring boot": 6,
  aws: 7,
  gcp: 7,
  azure: 7,
  sql: 5,
  nosql: 5,
  mongodb: 5,
  postgres: 5,
  redis: 5,

  // Soft skills
  leadership: 5,
  communication: 4,
  agile: 4,
  scrum: 4,
};

const extractEmailAndPhone = (text) => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex =
    /(\+?1?\s*)?(\([0-9]{3}\)|[0-9]{3})[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}/;

  return {
    hasEmail: emailRegex.test(text),
    hasPhone: phoneRegex.test(text),
  };
};

const extractLinkedInAndGitHub = (text) => {
  const linkedInRegex = /(linkedin\.com|linkedin)/i;
  const githubRegex = /(github\.com|github)/i;

  return {
    hasLinkedIn: linkedInRegex.test(text),
    hasGitHub: githubRegex.test(text),
  };
};

const computeKeywordScore = (resumeText, jobDescription) => {
  const normalizedResume = resumeText.toLowerCase();
  const normalizedJD = jobDescription.toLowerCase();

  // Extract all potential keywords (2+ chars)
  const jdWords = normalizedJD.match(/\b[a-z+#]{2,}\b/gi) || [];
  const uniqueJDWords = [...new Set(jdWords)];

  let weightedScore = 0;
  let totalWeight = 0;
  const matched = [];
  const missing = [];

  uniqueJDWords.forEach((keyword) => {
    const weight = SKILL_WEIGHTS[keyword.toLowerCase()] || 1;
    totalWeight += weight;

    if (normalizedResume.includes(keyword.toLowerCase())) {
      weightedScore += weight;
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  return {
    score: totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0,
    matched: [...new Set(matched)],
    missing: [...new Set(missing)],
  };
};

const extractProjects = (text) => {
  const projectRegex = /(project|portfolio|built|developed|implemented)/gi;
  const matches = [...text.matchAll(projectRegex)];
  return matches.length;
};

const extractYearsOfExperience = (text) => {
  const yearPattern = /(\d{4})\s*[-–—\/]\s*(\d{2,4}|present|current)/gi;
  const matches = [...text.matchAll(yearPattern)];

  let totalMonths = 0;
  const currentYear = new Date().getFullYear();

  for (const match of matches) {
    let startYear = parseInt(match[1]);
    let endRaw = match[2];

    let endYear;

    if (!endRaw) {
      endYear = startYear;
    } else if (
      endRaw.toLowerCase() === "present" ||
      endRaw.toLowerCase() === "current"
    ) {
      endYear = currentYear;
    } else if (endRaw.length === 2) {
      // Convert 2-digit year to full year
      const twoDigit = parseInt(endRaw);
      endYear = twoDigit < 30 ? 2000 + twoDigit : 1900 + twoDigit;
    } else {
      endYear = parseInt(endRaw);
    }

    if (endYear >= startYear) {
      totalMonths += (endYear - startYear) * 12;
    }
  }

  return Math.max(0, Math.round(totalMonths / 12));
};

const extractEducation = (text) => {
  const educationKeywords = [
    "bachelor",
    "master",
    "phd",
    "bs",
    "ms",
    "ma",
    "mba",
    "associate",
    "diploma",
    "certification",
    "bootcamp",
  ];

  const normalizedText = text.toLowerCase();
  const foundEducation = educationKeywords.filter((keyword) =>
    normalizedText.includes(keyword)
  );

  // Check for reputable institutions
  const topUniversities = [
    "mit",
    "stanford",
    "harvard",
    "berkeley",
    "carnegie mellon",
    "university of michigan",
    "yale",
    "princeton",
    "caltech",
    "northwestern",
    "duke",
    "cornell",
  ];

  const hasTopUniversity = topUniversities.some((uni) =>
    normalizedText.includes(uni.toLowerCase())
  );

  return {
    hasDegree: foundEducation.length > 0,
    degreeTypes: foundEducation,
    fromTopUniversity: hasTopUniversity,
  };
};

const extractAchievements = (text) => {
  // Look for quantifiable achievements
  const numberPatterns = [
    /(\d+)%\s*(?:increase|growth|improvement|reduction)/gi,
    /saved\s*\$?(\d+[km]?)/gi,
    /(\d+)\s*(?:users|customers|clients)/gi,
    /(\d+)\s*(?:hours|days|weeks|months)\s*(?:faster|reduction)/gi,
    /improved\s*(?:performance|efficiency)\s*by\s*(\d+)%/gi,
  ];

  let achievementCount = 0;
  const achievements = [];

  numberPatterns.forEach((pattern) => {
    const matches = [...text.matchAll(pattern)];
    achievementCount += matches.length;
    achievements.push(...matches.map((m) => m[0]));
  });

  return {
    count: achievementCount,
    examples: achievements.slice(0, 5),
  };
};

const computeFormatScore = (text) => {
  let score = 0;

  const bulletPoints = (text.match(/[•·\-\*]/g) || []).length;
  if (bulletPoints > 10) score += 25;
  else if (bulletPoints > 5) score += 15;
  else score += 5;

  const sectionHeaders = (
    text.match(
      /^(experience|education|skills|projects|certifications|summary|contact)/gim
    ) || []
  ).length;
  score += Math.min(sectionHeaders * 5, 20);

  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const avgLineLength =
    lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  if (avgLineLength < 100) score += 20;
  else if (avgLineLength < 150) score += 10;

  const datePattern = /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4})\b/g;
  const dateMatches = text.match(datePattern) || [];
  if (dateMatches.length > 2) score += 15;

  const firstLines = text.split("\n").slice(0, 5).join(" ").toLowerCase();
  if (
    firstLines.includes("email") ||
    firstLines.includes("phone") ||
    firstLines.includes("linkedin")
  ) {
    score += 10;
  }

  return Math.min(score, 100);
};

const computeLengthScore = (text) => {
  const wordCount = text.split(/\s+/).length;

  if (wordCount >= 400 && wordCount <= 650) return 100;
  if (wordCount >= 300 && wordCount < 400) return 80;
  if (wordCount > 800 && wordCount <= 1000) return 80;
  if (wordCount >= 200 && wordCount < 300) return 60;
  if (wordCount > 1000 && wordCount <= 1200) return 60;
  return Math.max(0, 30); // Too short or too long
};

const computeATS = (resumeText, jobDescription = "") => {
  if (!resumeText) {
    return {
      atsScore: 0,
      details: { error: "Missing resume text" },
    };
  }
  let keywordScore = 0;
  let keywordAnalysis = { matched: [], missing: [] };

  if (jobDescription && jobDescription.trim()) {
    const analysis = computeKeywordScore(resumeText, jobDescription);
    keywordScore = analysis.score;
    keywordAnalysis = analysis;
  } else {
    const normalized = resumeText.toLowerCase();
    const commonSkills = Object.keys(SKILL_WEIGHTS);
    const matched = commonSkills.filter((skill) =>
      normalized.includes(skill.toLowerCase())
    );

    const count = matched.length;

    if (count === 0) keywordScore = 40;
    else if (count <= 3) keywordScore = 55;
    else if (count <= 6) keywordScore = 70;
    else if (count <= 12) keywordScore = 85;
    else keywordScore = 95;

    keywordAnalysis = { matched, missing: [] };
  }


  const detectFresher = (text) => {
    const normalized = text.toLowerCase();

    // If education ends after 2022 → treat as fresher
    if (/2023|2024|2025|2026/.test(normalized)) return true;

    // No valid experience period means fresher
    const hasDateRange = /(\d{4})\s*[-–—]\s*(\d{4}|present|current)/i.test(
      normalized
    );
    if (!hasDateRange) return true;

    // keywords
    const fresherKeywords = ["fresher", "internship", "entry level"];
    if (fresherKeywords.some((k) => normalized.includes(k))) return true;

    return false;
  };

  const isFresher = detectFresher(resumeText);


  let years = extractYearsOfExperience(resumeText); 
  let experienceScore = 0;

  if (isFresher) {
    experienceScore = 70; 
  } else {
    experienceScore = Math.min((years / 5) * 100, 100);
  }

  const projectCount = extractProjects(resumeText);
  let projectScore = 0;

  if (isFresher) {
    if (projectCount >= 5) projectScore = 100;
    else if (projectCount >= 3) projectScore = 80;
    else if (projectCount >= 1) projectScore = 60;
    else projectScore = 30;
  }

  const formatScore = computeFormatScore(resumeText);
  const lengthScore = computeLengthScore(resumeText);

  const contactInfo = extractEmailAndPhone(resumeText);
  const links = extractLinkedInAndGitHub(resumeText);
  const contactRawScore =
    (contactInfo.hasEmail ? 50 : 0) +
    (contactInfo.hasPhone ? 25 : 0) +
    (links.hasLinkedIn ? 15 : 0) +
    (links.hasGitHub ? 10 : 0);
  const contactScore = Math.min(contactRawScore, 100);

  const education = extractEducation(resumeText);
  const educationScore = education.hasDegree
    ? education.fromTopUniversity
      ? 100
      : 80
    : 40;

  const achievements = extractAchievements(resumeText);
  const achievementBonus = Math.min(achievements.count * 2, 5);


  const atsScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        keywordScore * 0.4 +
          experienceScore * (isFresher ? 0.1 : 0.25) +
          formatScore * 0.15 +
          lengthScore * 0.1 +
          (contactScore / 100) * 5 +
          (educationScore / 100) * 5 +
          achievementBonus +
          (isFresher ? projectScore * 0.2 : 0)
      )
    )
  );

  return {
    atsScore,
    isFresher,
    details: {
      keywordScore: Math.round(keywordScore),
      experienceScore: Math.round(experienceScore),
      formatScore: Math.round(formatScore),
      lengthScore: Math.round(lengthScore),
      contactScore: Math.round(contactScore),
      educationScore: Math.round(educationScore),
      achievementBonus,
      projectScore: isFresher ? projectScore : 0,
    },
    skillsMatched: keywordAnalysis.matched,
    skillsMissing: keywordAnalysis.missing,
    yearsOfExperience: years,
    projectCount: projectCount,
    education,
    achievements,
    contactInfo,
    links,
  };
};

module.exports = { computeATS };
