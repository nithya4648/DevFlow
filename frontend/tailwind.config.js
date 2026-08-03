/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        ui: ["var(--font-ui)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        sans: ["var(--font-ui)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // Restrained neutral palette (GitHub / LeetCode dark mode)
        gh: {
          bg: "#0d1117",
          surface: "#161b22",
          subtle: "#21262d",
          border: "#30363d",
          "border-muted": "#21262d",
          muted: "#8b949e",
          text: "#c9d1d9",
          heading: "#f0f6fc",
        },
        // Dedicated, restrained accent palette
        accent: {
          DEFAULT: "#238636", // Primary action green (GitHub style)
          hover: "#2ea043",
          fg: "#3fb950",
          light: "rgba(35, 134, 54, 0.15)",
          border: "rgba(46, 160, 67, 0.4)",
          blue: "#58a6ff", // Active links / tab highlights
          "blue-hover": "#79c0ff",
        },
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
    },
  },
  plugins: [],
};
