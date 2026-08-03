// src/components/tools/TextDiffTool.jsx
// Line-by-line diff viewer using the 'diff' package
import { useState, useMemo } from "react";
import * as Diff from "diff";
import ToolCard from "./ToolCard";
import CopyButton from "./CopyButton";

const SAMPLE_A = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const x = 10;`;

const SAMPLE_B = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return name;
}

const x = 42;
const y = 100;`;

export default function TextDiffTool() {
  const [original, setOriginal] = useState(SAMPLE_A);
  const [modified, setModified] = useState(SAMPLE_B);
  const [mode, setMode] = useState("lines"); // "lines" | "words" | "chars"

  const diff = useMemo(() => {
    switch (mode) {
      case "words": return Diff.diffWords(original, modified);
      case "chars": return Diff.diffChars(original, modified);
      default: return Diff.diffLines(original, modified);
    }
  }, [original, modified, mode]);

  const stats = useMemo(() => {
    const added = diff.filter((d) => d.added).reduce((acc, d) => acc + (d.count || 0), 0);
    const removed = diff.filter((d) => d.removed).reduce((acc, d) => acc + (d.count || 0), 0);
    return { added, removed };
  }, [diff]);

  const renderDiff = () => {
    if (mode === "lines") {
      let lineNumA = 1, lineNumB = 1;
      return diff.map((part, i) => {
        const lines = part.value.split("\n").filter((_, j, arr) => j < arr.length - 1 || part.value.endsWith("\n") || j === 0);
        return lines.map((line, j) => {
          const isAdd = part.added;
          const isRem = part.removed;
          const rowKey = `${i}-${j}`;
          const lineA = !isAdd ? lineNumA++ : null;
          const lineB = !isRem ? lineNumB++ : null;
          return (
            <div
              key={rowKey}
              className={`flex items-start gap-0 text-xs font-mono leading-5 ${
                isAdd ? "bg-green-500/10" : isRem ? "bg-red-500/10" : ""
              }`}
            >
              <span className="w-9 shrink-0 text-right pr-2 text-gh-muted select-none border-r border-gh-border">
                {isAdd ? "" : lineA}
              </span>
              <span className="w-9 shrink-0 text-right pr-2 text-gh-muted select-none border-r border-gh-border">
                {isRem ? "" : lineB}
              </span>
              <span className={`w-5 shrink-0 text-center ${isAdd ? "text-green-400" : isRem ? "text-red-400" : "text-gh-muted"}`}>
                {isAdd ? "+" : isRem ? "−" : " "}
              </span>
              <span className={`flex-1 px-2 break-all ${isAdd ? "text-green-400" : isRem ? "text-red-400" : "text-gh-text"}`}>
                {line || " "}
              </span>
            </div>
          );
        });
      });
    }

    // Word or char mode — inline spans
    return (
      <p className="text-xs font-mono leading-relaxed text-gh-text whitespace-pre-wrap break-all p-3">
        {diff.map((part, i) => (
          <span
            key={i}
            className={
              part.added
                ? "bg-green-500/20 text-green-300 rounded px-0.5"
                : part.removed
                ? "bg-red-500/20 text-red-300 line-through rounded px-0.5"
                : ""
            }
          >
            {part.value}
          </span>
        ))}
      </p>
    );
  };

  return (
    <div className="space-y-4 font-ui">
      {/* Text inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ToolCard title="Original" actions={<CopyButton text={original} />}>
          <textarea
            rows={8}
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="gh-input text-xs font-mono resize-none w-full"
          />
        </ToolCard>
        <ToolCard title="Modified" actions={<CopyButton text={modified} />}>
          <textarea
            rows={8}
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            className="gh-input text-xs font-mono resize-none w-full"
          />
        </ToolCard>
      </div>

      {/* Controls + stats */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md border border-gh-border bg-gh-subtle p-0.5">
          {["lines", "words", "chars"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-sm px-3 py-1 text-xs font-mono font-medium capitalize transition-colors ${
                mode === m ? "bg-gh-surface text-gh-heading border border-gh-border" : "text-gh-muted hover:text-gh-heading"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <span className="inline-flex items-center gap-1 rounded-md bg-green-500/10 border border-green-500/20 px-2.5 py-1 text-xs font-mono font-semibold text-green-400">
            +{stats.added} added
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-xs font-mono font-semibold text-red-400">
            −{stats.removed} removed
          </span>
        </div>
      </div>

      {/* Diff output */}
      <ToolCard title="Diff Output">
        <div className="overflow-x-auto rounded-md bg-gh-bg border border-gh-border">
          {renderDiff()}
        </div>
      </ToolCard>
    </div>
  );
}
