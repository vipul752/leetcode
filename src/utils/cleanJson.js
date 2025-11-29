function cleanJSON(str) {
  if (!str) return "";

  let cleaned = str.replace(/^```json\n?/i, "").replace(/\n?```$/, "");

  // Find JSON start and end positions
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1 || jsonStart > jsonEnd) {
    return "";
  }

  // Extract only the JSON portion
  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

  // Fix common issues
  cleaned = cleaned
    .replace(/,\s*([}\]])/g, "$1") // Remove trailing commas
    .replace(/([{,:\[])\s*"?([a-zA-Z_][a-zA-Z0-9_]*)"?\s*:/g, '$1"$2":') // Quote unquoted keys
    .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes for values
    .replace(/\n/g, " ") // Remove line breaks
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  return cleaned;
}

module.exports = { cleanJSON };
