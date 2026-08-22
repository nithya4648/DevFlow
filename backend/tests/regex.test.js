const { escapeRegex } = require("../utils/regex.utils");

describe("Regex Utility (ReDoS Prevention)", () => {
  test("escapes special regex characters correctly", () => {
    const raw = "test[a-z]+.*$^?(){}|\\";
    const escaped = escapeRegex(raw);
    expect(escaped).toBe("test\\[a-z\\]\\+\\.\\*\\$\\^\\?\\(\\)\\{\\}\\|\\\\");
  });

  test("handles non-string inputs gracefully", () => {
    expect(escapeRegex(null)).toBe("");
    expect(escapeRegex(undefined)).toBe("");
    expect(escapeRegex(123)).toBe("");
  });

  test("safe for RegExp compilation without syntax errors", () => {
    const maliciousReDoS = "(a+)+$";
    const escaped = escapeRegex(maliciousReDoS);
    const regex = new RegExp(escaped, "i");
    expect(regex.test("(a+)+$")).toBe(true);
    expect(regex.test("aaaaa")).toBe(false);
  });
});
