import React, { useState, useEffect } from "react";
import { FaPlus, FaTimes, FaExternalLinkAlt } from "react-icons/fa";

const DEFAULT_SHORTCUTS = [
  { id: "1", name: "GitHub", url: "https://github.com", domain: "github.com" },
  { id: "2", name: "ChatGPT", url: "https://chatgpt.com", domain: "chatgpt.com" },
  { id: "3", name: "Claude", url: "https://claude.ai", domain: "claude.ai" },
  { id: "4", name: "Stack Overflow", url: "https://stackoverflow.com", domain: "stackoverflow.com" },
  { id: "5", name: "MDN Web Docs", url: "https://developer.mozilla.org", domain: "developer.mozilla.org" },
  { id: "6", name: "Vercel", url: "https://vercel.com", domain: "vercel.com" },
  { id: "7", name: "npm", url: "https://npmjs.com", domain: "npmjs.com" },
  { id: "8", name: "Hacker News", url: "https://news.ycombinator.com", domain: "news.ycombinator.com" },
];

export const QuickLaunch = () => {
  const [shortcuts, setShortcuts] = useState(() => {
    try {
      const saved = localStorage.getItem("devflow_quick_launch");
      return saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS;
    } catch (e) {
      return DEFAULT_SHORTCUTS;
    }
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("devflow_quick_launch", JSON.stringify(shortcuts));
    } catch (e) {
      // ignore
    }
  }, [shortcuts]);

  const handleAddShortcut = (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }

    let domain = "";
    try {
      domain = new URL(formattedUrl).hostname;
    } catch (err) {
      domain = formattedUrl.replace(/^https?:\/\//i, "").split("/")[0];
    }

    const calculatedName = newName.trim() || domain.replace(/^www\./i, "");

    const newShortcut = {
      id: Date.now().toString(),
      name: calculatedName,
      url: formattedUrl,
      domain: domain,
    };

    setShortcuts((prev) => [...prev.slice(0, 9), newShortcut]);
    setNewUrl("");
    setNewName("");
    setIsAdding(false);
  };

  const handleRemoveShortcut = (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    setShortcuts((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="gh-card p-4 font-ui">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gh-border">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-gh-heading font-mono">Quick Launch</h2>
          <span className="text-[10px] text-gh-muted font-mono">({shortcuts.length}/10)</span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs text-accent-fg font-mono hover:underline flex items-center gap-1"
        >
          <FaPlus className="h-3 w-3" /> Add Shortcut
        </button>
      </div>

      {/* Add Shortcut Form Modal/Bar */}
      {isAdding && (
        <form onSubmit={handleAddShortcut} className="mb-4 p-3 rounded-md bg-gh-subtle border border-gh-border space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="https://example.com"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="gh-input text-xs font-mono flex-1"
              required
            />
            <input
              type="text"
              placeholder="Name (optional)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="gh-input text-xs font-mono sm:w-36"
            />
            <div className="flex gap-1.5">
              <button type="submit" className="btn-primary text-xs font-mono py-1 px-3">
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="btn-secondary text-xs font-mono py-1 px-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Shortcuts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-2.5">
        {shortcuts.map((site) => {
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${site.domain}&sz=64`;
          return (
            <a
              key={site.id}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center justify-center p-2.5 rounded-md border border-gh-border bg-gh-bg hover:border-accent-border hover:bg-gh-subtle transition-all text-center"
            >
              <button
                onClick={(e) => handleRemoveShortcut(site.id, e)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-gh-muted hover:text-red-400 transition"
                title="Remove shortcut"
              >
                <FaTimes className="h-2.5 w-2.5" />
              </button>
              <img
                src={faviconUrl}
                alt={site.name}
                className="w-6 h-6 rounded mb-1.5 object-contain bg-gh-subtle border border-gh-border p-0.5"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://www.google.com/s2/favicons?domain=google.com&sz=64";
                }}
              />
              <span className="text-[11px] font-mono font-medium text-gh-heading group-hover:text-accent-fg transition truncate w-full">
                {site.name}
              </span>
            </a>
          );
        })}

        {shortcuts.length < 10 && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex flex-col items-center justify-center p-2.5 rounded-md border border-dashed border-gh-border bg-gh-bg hover:border-accent-border hover:bg-gh-subtle transition text-center text-gh-muted hover:text-accent-fg h-full"
          >
            <FaPlus className="h-4 w-4 mb-1" />
            <span className="text-[10px] font-mono">Add</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickLaunch;
