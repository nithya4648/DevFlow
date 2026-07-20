import { useEffect, useState } from "react";

export const useDarkMode = () => {
  const [theme, setTheme] = useState(() => {
    // Default to 'dark' for premium SaaS aesthetic if not set, else read stored
    const stored = localStorage.getItem("devflow_theme");
    if (stored) return stored;
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("devflow_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return [theme, toggleTheme];
};

export default useDarkMode;
