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
        // gh-* tokens reference CSS custom properties, responding to .dark
        gh: {
          bg:           "var(--gh-bg)",
          surface:      "var(--gh-surface)",
          subtle:       "var(--gh-subtle)",
          border:       "var(--gh-border)",
          "border-muted": "var(--gh-border-muted)",
          muted:        "var(--gh-muted)",
          text:         "var(--gh-text)",
          heading:      "var(--gh-heading)",
        },
        // Restrained neutral accent palette
        accent: {
          DEFAULT:       "#238636",
          hover:         "#2ea043",
          fg:            "#3fb950",
          light:         "rgba(35, 134, 54, 0.15)",
          border:        "rgba(46, 160, 67, 0.4)",
          blue:          "#3b82f6",
          "blue-hover":  "#60a5fa",
        },
      },
      borderRadius: {
        sm:      "4px",
        DEFAULT: "6px",
        md:      "6px",
        lg:      "8px",
        xl:      "12px",
      },
    },
  },
  plugins: [],
};
