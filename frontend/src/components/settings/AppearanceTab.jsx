import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { userService } from "../../services/user.service";
import { Loader, Moon, Sun, Monitor } from "lucide-react";

const AppearanceTab = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  
  const [theme, setTheme] = useState("dark");
  const [defaultLandingPage, setDefaultLandingPage] = useState("/dashboard");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setTheme(user.preferences.theme || "dark");
      setDefaultLandingPage(user.preferences.defaultLandingPage || "/dashboard");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await userService.updatePreferences({ theme, defaultLandingPage });
      setUser({ ...user, preferences: data.preferences });
      
      // Apply theme to document
      if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      
      addToast("Appearance preferences updated", "success");
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to update preferences", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Customize how DevFlow looks and feels on your device.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Theme</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${
                theme === "light"
                  ? "border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                  : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-400 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              <Sun className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">Light</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${
                theme === "dark"
                  ? "border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                  : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-400 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              <Moon className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">Dark</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${
                theme === "system"
                  ? "border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                  : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-400 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              <Monitor className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">System</span>
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Default Landing Page</h3>
          <select
            value={defaultLandingPage}
            onChange={(e) => setDefaultLandingPage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="/dashboard">Dashboard</option>
            <option value="/projects">Projects</option>
            <option value="/activity">Activity Feed</option>
            <option value="/docs">Documentation</option>
            <option value="/notes">Notes</option>
          </select>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Choose which page you see first after logging in.
          </p>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppearanceTab;
