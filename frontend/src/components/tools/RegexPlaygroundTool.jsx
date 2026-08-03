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
    <div className="space-y-4 font-ui">
      {/* Regex input */}
      <ToolCard title="Regular Expression">
        <div className="flex gap-2 items-center">
          <span className="text-lg font-mono font-bold text-gh-muted">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern…"
            className={`flex-1 gh-input text-xs font-mono ${
              error ? "!border-red-400 focus:!ring-red-400" : ""
            }`}
          />
          <span className="text-lg font-mono font-bold text-gh-muted">/</span>
          <div className="flex gap-1">
            {FLAGS.map((f) => (
              <button
                key={f}
                onClick={() => toggleFlag(f)}
                className={`h-7 w-7 rounded-md text-xs font-mono font-semibold transition-colors ${
                  flags.includes(f)
                    ? "bg-accent-light text-accent-fg border border-accent-border"
                    : "btn-secondary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <p className="mt-2 text-xs font-mono text-red-400">{error}</p>
        )}
      </ToolCard>

      {/* Test String */}
      <ToolCard title="Test String">
        <textarea
          rows={4}
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          className="gh-input text-xs font-mono resize-none w-full"
        />
      </ToolCard>

      {/* Match Result */}
      <ToolCard
        title="Match Highlights"
        actions={
          <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md ${matchCount > 0 ? "bg-accent-light text-accent-fg border border-accent-border" : "bg-gh-subtle text-gh-muted border border-gh-border"}`}>
            {matchCount} match{matchCount !== 1 ? "es" : ""}
          </span>
        }
      >
        <p className="rounded-md bg-gh-bg border border-gh-border p-3 text-xs font-mono leading-relaxed text-gh-text break-words whitespace-pre-wrap">
          {segments.map((seg, i) =>
            seg.match ? (
              <mark
                key={i}
                className="rounded bg-accent-light text-accent-fg border border-accent-border px-1 py-0.5"
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
