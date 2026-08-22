/**
 * Escapes characters that have special meaning in regular expressions.
 * Used to sanitize user input before constructing RegExp queries to prevent ReDoS attacks.
 * 
 * @param {string} string - The raw string to escape.
 * @returns {string} The escaped string safe for use in RegExp.
 */
function escapeRegex(string) {
  if (typeof string !== "string") return "";
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  escapeRegex,
};
