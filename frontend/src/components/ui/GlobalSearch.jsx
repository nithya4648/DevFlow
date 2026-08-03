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
        className="flex w-full max-w-sm items-center gap-2.5 rounded-md bg-gh-subtle px-3 py-1.5 text-xs text-gh-muted hover:text-gh-heading hover:bg-gh-border transition-colors border border-gh-border font-ui"
      >
        <FaSearch className="h-3 w-3 shrink-0 text-gh-muted" />
        <span className="flex-1 text-left font-mono">Search anywhere...</span>
        <kbd className="hidden sm:inline-flex shrink-0 items-center gap-0.5 rounded border border-gh-border bg-gh-bg px-1.5 font-mono text-[10px] text-gh-muted">
          <span>⌘</span>K
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
              className="fixed inset-0 z-50 bg-black/60 font-ui"
            />
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 pointer-events-none font-ui">
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: -12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -12 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                className="w-full max-w-2xl overflow-hidden rounded-md bg-gh-surface border border-gh-border shadow-lg pointer-events-auto flex flex-col max-h-[80vh]"
              >
                {/* Search Input */}
                <div className="flex items-center border-b border-gh-border px-3.5 shrink-0 bg-gh-subtle">
                  <FaSearch className="h-3.5 w-3.5 text-gh-muted" />
                  <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-transparent px-3 py-3 text-xs font-mono text-gh-heading placeholder-gh-muted focus:outline-none"
                    placeholder="Search projects, snippets, docs..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  {isLoading && (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gh-border border-t-accent-fg mr-2" />
                  )}
                  <kbd className="hidden sm:inline-flex items-center rounded border border-gh-border bg-gh-bg px-1.5 py-0.5 font-mono text-[10px] text-gh-muted">
                    ESC
                  </kbd>
                </div>

                {/* Results List */}
                <div ref={listRef} className="flex-1 overflow-y-auto overflow-x-hidden p-2 min-h-[100px]">
                  {!query ? (
                    <div className="flex h-32 flex-col items-center justify-center text-xs font-mono text-gh-muted">
                      <p>Start typing to search across DevFlow.</p>
                      <p className="mt-1 text-[11px] text-gh-muted">
                        Try searching for a project or snippet title.
                      </p>
                    </div>
                  ) : isLoading && !results ? (
                    <div className="flex h-32 flex-col items-center justify-center text-xs font-mono text-gh-muted">
                      Searching...
                    </div>
                  ) : flatResults.length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center text-xs font-mono text-gh-muted">
                      No results found for "<span className="text-gh-heading">{query}</span>"
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(results).map(([typeKey, items]) => {
                        if (items.length === 0) return null;

                        const label = typeKey.charAt(0).toUpperCase() + typeKey.slice(1);
                        return (
                          <div key={typeKey}>
                            <h3 className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-gh-muted sticky top-0 bg-gh-surface z-10">
                              {label}
                            </h3>
                            <ul className="mt-1 space-y-0.5">
                              {items.map((item) => {
                                const globalIndex = flatResults.findIndex((r) => r.id === item.id);
                                const isSelected = globalIndex === selectedIndex;
                                const Icon = ICONS[item.type] || FaSearch;

                                return (
                                  <li
                                    key={item.id}
                                    className={`group flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors ${
                                      isSelected
                                        ? "bg-accent-light text-accent-fg border border-accent-border search-item-selected"
                                        : "hover:bg-gh-subtle text-gh-text border border-transparent"
                                    }`}
                                    onClick={() => {
                                      navigate(item.path);
                                      setIsOpen(false);
                                    }}
                                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                                  >
                                    <div className="shrink-0 rounded p-1 bg-gh-bg border border-gh-border text-gh-muted">
                                      <Icon className="h-3 w-3" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <p className={`truncate text-xs font-mono font-semibold ${isSelected ? "text-accent-fg" : "text-gh-heading"}`}>
                                          {item.title}
                                        </p>
                                        {item.meta && (
                                          <span className="ml-2 shrink-0 rounded bg-gh-bg border border-gh-border px-1.5 py-0.5 font-mono text-[9px] text-gh-muted">
                                            {item.meta}
                                          </span>
                                        )}
                                      </div>
                                      {item.preview && (
                                        <p className="truncate text-[11px] font-mono text-gh-muted mt-0.5">
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
                <div className="flex items-center justify-between border-t border-gh-border bg-gh-subtle px-3.5 py-2 shrink-0">
                  <div className="flex items-center gap-3 text-[11px] font-mono text-gh-muted">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-gh-border bg-gh-bg px-1 py-0.5 text-[10px]">
                        ↑
                      </kbd>
                      <kbd className="rounded border border-gh-border bg-gh-bg px-1 py-0.5 text-[10px]">
                        ↓
                      </kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-gh-border bg-gh-bg px-1 py-0.5 text-[10px]">
                        ↵
                      </kbd>
                      Select
                    </span>
                  </div>
                  <div className="text-[10px] font-mono font-medium text-gh-muted">
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
