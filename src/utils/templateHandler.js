// Template configurations and utilities
const TEMPLATES = {
  standard: {
    name: "Standard",
    description: "Professional standard resume layout",
    sections: [
      "personalInfo",
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
    ],
    styling: {
      fontSize: "11px",
      fontFamily: "Arial",
      colors: {
        primary: "#000000",
        secondary: "#333333",
      },
    },
  },
  modern: {
    name: "Modern",
    description: "Contemporary design with sidebar",
    sections: [
      "personalInfo",
      "summary",
      "skills",
      "experience",
      "education",
      "projects",
    ],
    styling: {
      fontSize: "10px",
      fontFamily: "Calibri",
      colors: {
        primary: "#1e40af",
        secondary: "#3b82f6",
      },
    },
  },
  minimal: {
    name: "Minimal",
    description: "Clean and simple design",
    sections: ["personalInfo", "experience", "education", "skills", "projects"],
    styling: {
      fontSize: "12px",
      fontFamily: "Helvetica",
      colors: {
        primary: "#1f2937",
        secondary: "#6b7280",
      },
    },
  },
};

// Get all available templates
const getAvailableTemplates = () => {
  return Object.keys(TEMPLATES).map((key) => ({
    id: key,
    ...TEMPLATES[key],
  }));
};

// Get specific template
const getTemplate = (templateName) => {
  if (!TEMPLATES[templateName]) {
    throw new Error(`Template '${templateName}' not found`);
  }
  return TEMPLATES[templateName];
};

// Validate template
const isValidTemplate = (templateName) => {
  return templateName in TEMPLATES;
};

// Render template (return formatted resume data based on template)
const renderTemplate = (resumeData, templateName) => {
  const template = getTemplate(templateName);

  const renderedData = {
    template: templateName,
    styling: template.styling,
    sections: {},
  };

  // Filter sections based on template configuration
  template.sections.forEach((section) => {
    if (resumeData[section]) {
      renderedData.sections[section] = resumeData[section];
    }
  });

  return renderedData;
};

modules.exports = {
  TEMPLATES,
  getAvailableTemplates,
  getTemplate,
  isValidTemplate,
  renderTemplate,
};
