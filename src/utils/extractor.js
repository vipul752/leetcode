const pdf = require("pdf-parse");
const mammoth = require("mammoth");

const extractResumeText = async (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

  const mime = file.mimetype;

  const PDF_TYPES = [
    "application/pdf",
    "application/octet-stream",
    "binary/octet-stream",
    "application/x-pdf",
    "application/force-download",
    "application/download",
  ];

  let text = "";

  if (PDF_TYPES.includes(mime)) {
    const data = await pdf(file.buffer);
    text = data.text; 
  }

  else if (
    mime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const doc = await mammoth.extractRawText({ buffer: file.buffer });
    text = doc.value;
  }

  else if (mime === "application/msword") {
    throw new Error(
      "Old .doc format is not supported. Please upload PDF or DOCX."
    );
  } else {
    throw new Error("Unsupported file type: " + mime);
  }

  return text.replace(/\s+/g, " ").trim();
};

module.exports = { extractResumeText };
