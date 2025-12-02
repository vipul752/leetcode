function cleanJSON(str) {
  if (!str) return "";

  let cleaned = str.replace(/^```json\n?/i, "").replace(/\n?```$/, "");

  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1 || jsonStart > jsonEnd) {
    return "";
  }

  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

  cleaned = cleaned
    .replace(/,\s*([}\]])/g, "$1") 
    .replace(/([{,:\[])\s*"?([a-zA-Z_][a-zA-Z0-9_]*)"?\s*:/g, '$1"$2":') 
    .replace(/:\s*'([^']*)'/g, ': "$1"') 
    .replace(/\n/g, " ") 
    .replace(/\s+/g, " ") 
    .trim();

  return cleaned;
}

module.exports = { cleanJSON };
