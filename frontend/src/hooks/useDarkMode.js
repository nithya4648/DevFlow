import { useEffect, useState } from "react";
import useAuth from "./useAuth";

export const useDarkMode = () => {
  let authContext = null;
  try {
    authContext = useAuth();
  } catch (e) {
    // Graceful fallback if invoked outside AuthProvider
  }
  const user = authContext?.user;

  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("devflow_theme");
    if (stored) return stored;
    if (user?.preferences?.theme) return user.preferences.theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Sync initial theme from user preferences if no local storage preference is set yet
  useEffect(() => {
    const stored = localStorage.getItem("devflow_theme");
    if (!stored && user?.preferences?.theme) {
      setTheme(user.preferences.theme);
    }
  }, [user?.preferences?.theme]);

  // Apply dark class to document.documentElement and write to localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("devflow_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark";
      }
      return prev === "dark" ? "light" : "dark";
    });
  };

  return [theme, toggleTheme, setTheme];
};

export default useDarkMode;
