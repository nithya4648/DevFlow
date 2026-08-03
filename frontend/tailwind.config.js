/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "-apple-system", "sans-serif"],
        sans: ["var(--font-sans)", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        primary: {
          50: "hsl(var(--primary-50) / <alpha-value>)",
          100: "hsl(var(--primary-100) / <alpha-value>)",
          200: "hsl(var(--primary-200) / <alpha-value>)",
          300: "hsl(var(--primary-300) / <alpha-value>)",
          400: "hsl(var(--primary-400) / <alpha-value>)",
          DEFAULT: "hsl(var(--primary-500) / <alpha-value>)",
          500: "hsl(var(--primary-500) / <alpha-value>)",
          600: "hsl(var(--primary-600) / <alpha-value>)",
          700: "hsl(var(--primary-700) / <alpha-value>)",
          800: "hsl(var(--primary-800) / <alpha-value>)",
          900: "hsl(var(--primary-900) / <alpha-value>)",
          dark: "hsl(var(--primary-600) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent-500) / <alpha-value>)",
          500: "hsl(var(--accent-500) / <alpha-value>)",
          600: "hsl(var(--accent-600) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
