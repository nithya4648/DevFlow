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
  FaTimes,
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
  snippet: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/20",
  doc: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
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
    Object.entries(results).forEach(([typeKey, items]) => {
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
      {/* Dummy Navbar Input */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full max-w-sm items-center gap-3 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-500 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors border border-transparent dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <FaSearch className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Search anywhere...</span>
        <kbd className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded bg-gray-200 px-1.5 font-mono text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
          <span className="text-xs">⌘</span>K
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
              className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10 pointer-events-auto flex flex-col max-h-[80vh]"
              >
                {/* Search Input */}
                <div className="flex items-center border-b border-gray-150 px-4 dark:border-gray-800 shrink-0">
                  <FaSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-transparent px-4 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100"
                    placeholder="Search projects, snippets, docs..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  {isLoading && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500 mr-2" />
                  )}
                  <kbd className="hidden sm:inline-flex items-center rounded border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-[10px] font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                    ESC
                  </kbd>
                </div>

                {/* Results List */}
                <div ref={listRef} className="flex-1 overflow-y-auto overflow-x-hidden p-2 min-h-[100px]">
                  {!query ? (
                    <div className="flex h-32 flex-col items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                      <p>Start typing to search across DevFlow.</p>
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Try searching for a project or snippet title.
                      </p>
                    </div>
                  ) : isLoading && !results ? (
                    <div className="flex h-32 flex-col items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                      Searching...
                    </div>
                  ) : flatResults.length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                      No results found for "<span className="text-gray-900 dark:text-white font-medium">{query}</span>"
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(results).map(([typeKey, items]) => {
                        if (items.length === 0) return null;
                        
                        const label = typeKey.charAt(0).toUpperCase() + typeKey.slice(1);
                        return (
                          <div key={typeKey}>
                            <h3 className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur z-10">
                              {label}
                            </h3>
                            <ul className="mt-1 space-y-1">
                              {items.map((item) => {
                                const globalIndex = flatResults.findIndex((r) => r.id === item.id);
                                const isSelected = globalIndex === selectedIndex;
                                const Icon = ICONS[item.type] || FaSearch;
                                const colors = TYPE_COLORS[item.type] || "text-gray-500 bg-gray-100 dark:bg-gray-800";

                                return (
                                  <li
                                    key={item.id}
                                    className={`group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                                      isSelected
                                        ? "bg-indigo-50 dark:bg-indigo-500/10 search-item-selected"
                                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    }`}
                                    onClick={() => {
                                      navigate(item.path);
                                      setIsOpen(false);
                                    }}
                                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                                  >
                                    <div className={`shrink-0 rounded-lg p-2 ${colors}`}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <p className={`truncate text-sm font-medium ${isSelected ? "text-indigo-700 dark:text-indigo-400" : "text-gray-900 dark:text-gray-100"}`}>
                                          {item.title}
                                        </p>
                                        {item.meta && (
                                          <span className="ml-2 shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                            {item.meta}
                                          </span>
                                        )}
                                      </div>
                                      {item.preview && (
                                        <p className="truncate text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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
                <div className="flex items-center justify-between border-t border-gray-150 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50 shrink-0">
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono dark:border-gray-700 dark:bg-gray-900 text-[10px]">
                        ↑
                      </kbd>
                      <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono dark:border-gray-700 dark:bg-gray-900 text-[10px]">
                        ↓
                      </kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono dark:border-gray-700 dark:bg-gray-900 text-[10px]">
                        ↵
                      </kbd>
                      Select
                    </span>
                  </div>
                  <div className="text-[10px] font-medium text-gray-400">
                    DevFlow Global Search
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
