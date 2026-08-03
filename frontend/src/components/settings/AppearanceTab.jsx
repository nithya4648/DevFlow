import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
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
    <div className="space-y-5 max-w-2xl font-ui">
      <div>
        <h2 className="text-base font-bold text-gh-heading font-mono">Appearance</h2>
        <p className="mt-0.5 text-xs text-gh-muted font-mono">
          Customize how DevFlow looks and feels on your device.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-xs font-mono font-medium text-gh-heading mb-3">Theme</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center justify-center p-3.5 border rounded-md transition-colors font-mono ${
                theme === "light"
                  ? "border-accent-border bg-accent-light text-accent-fg"
                  : "border-gh-border bg-gh-surface text-gh-text hover:bg-gh-subtle"
              }`}
            >
              <Sun className="h-6 w-6 mb-2" />
              <span className="text-xs font-semibold">Light</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center justify-center p-3.5 border rounded-md transition-colors font-mono ${
                theme === "dark"
                  ? "border-accent-border bg-accent-light text-accent-fg"
                  : "border-gh-border bg-gh-surface text-gh-text hover:bg-gh-subtle"
              }`}
            >
              <Moon className="h-6 w-6 mb-2" />
              <span className="text-xs font-semibold">Dark</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center justify-center p-3.5 border rounded-md transition-colors font-mono ${
                theme === "system"
                  ? "border-accent-border bg-accent-light text-accent-fg"
                  : "border-gh-border bg-gh-surface text-gh-text hover:bg-gh-subtle"
              }`}
            >
              <Monitor className="h-6 w-6 mb-2" />
              <span className="text-xs font-semibold">System</span>
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-mono font-medium text-gh-heading mb-2">Default Landing Page</h3>
          <select
            value={defaultLandingPage}
            onChange={(e) => setDefaultLandingPage(e.target.value)}
            className="gh-input text-xs font-mono w-full"
          >
            <option value="/dashboard" className="bg-gh-surface">Dashboard</option>
            <option value="/projects" className="bg-gh-surface">Projects</option>
            <option value="/activity" className="bg-gh-surface">Activity Feed</option>
            <option value="/docs" className="bg-gh-surface">Documentation</option>
            <option value="/notes" className="bg-gh-surface">Notes</option>
          </select>
          <p className="mt-1.5 text-xs text-gh-muted font-mono">
            Choose which page you see first after logging in.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary text-xs font-mono"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2 h-3.5 w-3.5" />
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
