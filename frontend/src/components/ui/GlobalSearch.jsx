import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { searchService } from "../../services/search.service";
import {
  FaSearch,
  FaFolder,
  FaCode,
  FaBook,
  FaStickyNote,
  FaBookmark,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

const ICONS = {
  project: FaFolder,
  snippet: FaCode,
  doc: FaBook,
  note: FaStickyNote,
  bookmark: FaBookmark,
};

const TYPE_COLORS = {
  project: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20",
  snippet: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
  doc: "text-teal-500 bg-teal-500/10 dark:bg-teal-500/20",
  note: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20",
  bookmark: "text-rose-500 bg-rose-500/10 dark:bg-rose-500/20",
};

export const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults(null);
        return;
      }
      setIsLoading(true);
      try {
        const data = await searchService.search(debouncedQuery);
        if (data.success) {
          setResults(data.results);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
        setSelectedIndex(0);
      }
    };
    fetchResults();
  }, [debouncedQuery]);

  // Flatten results for keyboard navigation
  const flatResults = useMemo(() => {
    if (!results) return [];
    const flat = [];
    Object.entries(results).forEach(([, items]) => {
      items.forEach((item) => {
        flat.push(item);
      });
    });
    return flat;
  }, [results]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setDebouncedQuery("");
      setResults(null);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation logic
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === "Enter" && flatResults.length > 0) {
      e.preventDefault();
      const selected = flatResults[selectedIndex];
      if (selected) {
        navigate(selected.path);
        setIsOpen(false);
      }
    }
  };

  // Auto-scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(".search-item-selected");
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  return (
    <>
      {/* Search Input Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full max-w-sm items-center gap-3 rounded-lg bg-slate-100/80 px-3.5 py-1.5 text-sm text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition border border-slate-200/80 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        <FaSearch className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="flex-1 text-left text-xs font-medium">Search anywhere...</span>
        <kbd className="hidden sm:inline-flex shrink-0 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          <span className="text-[11px]">⌘</span>K
        </kbd>
      </button>

      {/* Command Palette Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs"
            />
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -16 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-slate-800 pointer-events-auto flex flex-col max-h-[80vh]"
              >
                {/* Search Input */}
                <div className="flex items-center border-b border-slate-200 px-4 dark:border-slate-800 shrink-0">
                  <FaSearch className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-transparent px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
                    placeholder="Search projects, snippets, docs..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  {isLoading && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500 mr-2" />
                  )}
                  <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    ESC
                  </kbd>
                </div>

                {/* Results List */}
                <div ref={listRef} className="flex-1 overflow-y-auto overflow-x-hidden p-2 min-h-[100px]">
                  {!query ? (
                    <div className="flex h-32 flex-col items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                      <p className="font-medium">Start typing to search across DevFlow.</p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        Try searching for a project or snippet title.
                      </p>
                    </div>
                  ) : isLoading && !results ? (
                    <div className="flex h-32 flex-col items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                      Searching...
                    </div>
                  ) : flatResults.length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                      No results found for "<span className="text-slate-900 dark:text-white font-medium">{query}</span>"
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(results).map(([typeKey, items]) => {
                        if (items.length === 0) return null;
                        
                        const label = typeKey.charAt(0).toUpperCase() + typeKey.slice(1);
                        return (
                          <div key={typeKey}>
                            <h3 className="px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs z-10">
                              {label}
                            </h3>
                            <ul className="mt-1 space-y-1">
                              {items.map((item) => {
                                const globalIndex = flatResults.findIndex((r) => r.id === item.id);
                                const isSelected = globalIndex === selectedIndex;
                                const Icon = ICONS[item.type] || FaSearch;
                                const colors = TYPE_COLORS[item.type] || "text-slate-500 bg-slate-100 dark:bg-slate-800";

                                return (
                                  <li
                                    key={item.id}
                                    className={`group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                                      isSelected
                                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 search-item-selected border border-emerald-500/20"
                                        : "hover:bg-slate-100/60 dark:hover:bg-slate-800/60 border border-transparent"
                                    }`}
                                    onClick={() => {
                                      navigate(item.path);
                                      setIsOpen(false);
                                    }}
                                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                                  >
                                    <div className={`shrink-0 rounded-md p-1.5 ${colors}`}>
                                      <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <p className={`truncate text-xs font-semibold ${isSelected ? "text-emerald-700 dark:text-emerald-300" : "text-slate-900 dark:text-slate-100"}`}>
                                          {item.title}
                                        </p>
                                        {item.meta && (
                                          <span className="ml-2 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                            {item.meta}
                                          </span>
                                        )}
                                      </div>
                                      {item.preview && (
                                        <p className="truncate text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                          {item.preview}
                                        </p>
                                      )}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 shrink-0">
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono dark:border-slate-700 dark:bg-slate-800 text-[10px]">
                        ↑
                      </kbd>
                      <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono dark:border-slate-700 dark:bg-slate-800 text-[10px]">
                        ↓
                      </kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono dark:border-slate-700 dark:bg-slate-800 text-[10px]">
                        ↵
                      </kbd>
                      Select
                    </span>
                  </div>
                  <div className="text-[10px] font-mono font-medium text-slate-400">
                    DevFlow Command
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
