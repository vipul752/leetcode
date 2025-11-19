function cleanJSON(str) {
  if (!str) return "";

  return str
    .replace(/^[^{\[]+/, "") // remove junk before JSON
    .replace(/[^\]}]+$/, "") // remove junk after JSON
    .replace(/[•●▪︎▪•\-–—]/g, "") // remove all bullet characters
    .replace(/(\r\n|\n|\r)/gm, " ") // remove line breaks
    .replace(/\s+/g, " "); // normalize whitespace
}

module.exports = { cleanJSON };
