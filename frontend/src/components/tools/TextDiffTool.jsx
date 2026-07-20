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
              className={`flex items-start gap-0 text-xs font-mono leading-6 ${
                isAdd ? "bg-green-500/10 dark:bg-green-500/5" : isRem ? "bg-red-500/10 dark:bg-red-500/5" : ""
              }`}
            >
              <span className="w-10 shrink-0 text-right pr-2 text-gray-300 dark:text-gray-700 select-none border-r border-gray-100 dark:border-gray-800">
                {isAdd ? "" : lineA}
              </span>
              <span className="w-10 shrink-0 text-right pr-2 text-gray-300 dark:text-gray-700 select-none border-r border-gray-100 dark:border-gray-800">
                {isRem ? "" : lineB}
              </span>
              <span className={`w-5 shrink-0 text-center ${isAdd ? "text-green-500" : isRem ? "text-red-500" : "text-gray-300 dark:text-gray-700"}`}>
                {isAdd ? "+" : isRem ? "−" : " "}
              </span>
              <span className={`flex-1 px-2 break-all ${isAdd ? "text-green-700 dark:text-green-400" : isRem ? "text-red-700 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>
                {line || " "}
              </span>
            </div>
          );
        });
      });
    }

    // Word or char mode — inline spans
    return (
      <p className="text-xs font-mono leading-7 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all px-4 py-3">
        {diff.map((part, i) => (
          <span
            key={i}
            className={
              part.added
                ? "bg-green-300 text-green-900 dark:bg-green-500/30 dark:text-green-300 rounded px-0.5"
                : part.removed
                ? "bg-red-300 text-red-900 line-through dark:bg-red-500/30 dark:text-red-300 rounded px-0.5"
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
    <div className="space-y-4">
      {/* Text inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ToolCard title="Original" actions={<CopyButton text={original} />}>
          <textarea
            rows={10}
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs font-mono text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-200 transition"
          />
        </ToolCard>
        <ToolCard title="Modified" actions={<CopyButton text={modified} />}>
          <textarea
            rows={10}
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs font-mono text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-200 transition"
          />
        </ToolCard>
      </div>

      {/* Controls + stats */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
          {["lines", "words", "chars"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-4 py-2 text-xs font-bold capitalize transition ${
                mode === m ? "bg-indigo-500 text-white shadow" : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-600 dark:text-green-400">
            +{stats.added} added
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-500">
            −{stats.removed} removed
          </span>
        </div>
      </div>

      {/* Diff output */}
      <ToolCard title="Diff Output">
        <div className="overflow-x-auto rounded-xl bg-gray-50 dark:bg-gray-950/50">
          {renderDiff()}
        </div>
      </ToolCard>
    </div>
  );
}
