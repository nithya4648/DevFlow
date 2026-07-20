// src/components/tools/RegexPlaygroundTool.jsx
import { useState, useMemo } from "react";
import ToolCard from "./ToolCard";
import useDebounce from "../../hooks/useDebounce";

const FLAGS = ["g", "i", "m", "s"];

export default function RegexPlaygroundTool() {
  const [pattern, setPattern] = useState("\\b\\w+ing\\b");
  const [flags, setFlags] = useState(["g", "i"]);
  const [testString, setTestString] = useState(
    "The quick brown fox is jumping over the lazy dog. It is running and laughing."
  );

  const debouncedPattern = useDebounce(pattern, 300);
  const debouncedText = useDebounce(testString, 300);

  const toggleFlag = (f) =>
    setFlags((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const { segments, matchCount, error } = useMemo(() => {
    if (!debouncedPattern) return { segments: [{ text: debouncedText, match: false }], matchCount: 0, error: null };
    try {
      const re = new RegExp(debouncedPattern, flags.join(""));
      const matches = [...debouncedText.matchAll(new RegExp(debouncedPattern, "g" + flags.filter((f) => f !== "g").join("")))];
      if (!matches.length) return { segments: [{ text: debouncedText, match: false }], matchCount: 0, error: null };

      const segs = [];
      let cursor = 0;
      matches.forEach((m) => {
        if (m.index > cursor) segs.push({ text: debouncedText.slice(cursor, m.index), match: false });
        segs.push({ text: m[0], match: true });
        cursor = m.index + m[0].length;
      });
      if (cursor < debouncedText.length) segs.push({ text: debouncedText.slice(cursor), match: false });

      return { segments: segs, matchCount: matches.length, error: null };
    } catch (e) {
      return { segments: [{ text: debouncedText, match: false }], matchCount: 0, error: e.message };
    }
  }, [debouncedPattern, debouncedText, flags]);

  return (
    <div className="space-y-4">
      {/* Regex input */}
      <ToolCard title="Regular Expression">
        <div className="flex gap-3 items-center">
          <span className="text-xl font-black text-gray-300 dark:text-gray-700">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern…"
            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-mono text-gray-800 outline-none transition dark:text-gray-200 ${
              error
                ? "border-red-500 bg-red-500/5 focus:ring-red-500/20"
                : "border-gray-200 bg-gray-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950/50"
            }`}
          />
          <span className="text-xl font-black text-gray-300 dark:text-gray-700">/</span>
          <div className="flex gap-1.5">
            {FLAGS.map((f) => (
              <button
                key={f}
                onClick={() => toggleFlag(f)}
                className={`h-8 w-8 rounded-lg text-xs font-black font-mono transition ${
                  flags.includes(f)
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-500">{error}</p>
        )}
      </ToolCard>

      {/* Test String */}
      <ToolCard title="Test String">
        <textarea
          rows={4}
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-200 transition"
        />
      </ToolCard>

      {/* Match Result */}
      <ToolCard
        title="Match Highlights"
        actions={
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${matchCount > 0 ? "bg-green-500/10 text-green-500" : "bg-gray-100 text-gray-400 dark:bg-gray-800"}`}>
            {matchCount} match{matchCount !== 1 ? "es" : ""}
          </span>
        }
      >
        <p className="rounded-xl bg-gray-50 dark:bg-gray-950/50 p-4 text-sm font-mono leading-relaxed text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">
          {segments.map((seg, i) =>
            seg.match ? (
              <mark
                key={i}
                className="rounded bg-yellow-300 text-yellow-900 px-0.5 dark:bg-yellow-500/30 dark:text-yellow-300"
              >
                {seg.text}
              </mark>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          )}
        </p>
      </ToolCard>
    </div>
  );
}
