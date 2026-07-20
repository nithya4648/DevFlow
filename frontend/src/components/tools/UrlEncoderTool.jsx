// src/components/tools/UrlEncoderTool.jsx
import { useState } from "react";
import ToolCard from "./ToolCard";
import CopyButton from "./CopyButton";

export default function UrlEncoderTool() {
  const [mode, setMode] = useState("encode");
  const [input, setInput] = useState("https://devflow.app/search?q=hello world&lang=en&page=1");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [encodeType, setEncodeType] = useState("component"); // "component" | "full"

  const process = () => {
    setError("");
    try {
      if (mode === "encode") {
        setOutput(
          encodeType === "component" ? encodeURIComponent(input) : encodeURI(input)
        );
      } else {
        setOutput(
          encodeType === "component" ? decodeURIComponent(input.trim()) : decodeURI(input.trim())
        );
      }
    } catch (e) {
      setError("Invalid input: " + e.message);
      setOutput("");
    }
  };

  const swap = () => {
    setInput(output);
    setOutput(input);
    setMode(mode === "encode" ? "decode" : "encode");
    setError("");
  };

  return (
    <div className="space-y-4">
      {/* Mode + Type */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
          {["encode", "decode"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`rounded-lg px-5 py-2 text-xs font-bold capitalize transition ${
                mode === m
                  ? "bg-indigo-500 text-white shadow"
                  : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
          {[
            { key: "component", label: "encodeURIComponent" },
            { key: "full", label: "encodeURI" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setEncodeType(t.key)}
              className={`rounded-lg px-4 py-2 text-xs font-mono font-bold transition ${
                encodeType === t.key
                  ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
                  : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ToolCard title="Input" actions={<CopyButton text={input} />}>
          <textarea
            rows={7}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-200 transition"
          />
        </ToolCard>
        <ToolCard title="Output" actions={<CopyButton text={output} />}>
          <textarea
            rows={7}
            readOnly
            value={output}
            placeholder="Output appears here…"
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800 placeholder-gray-400 outline-none dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-200 dark:placeholder-gray-600"
          />
        </ToolCard>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs font-medium text-red-500">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={process}
          className="rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-600 transition"
        >
          {mode === "encode" ? "Encode →" : "Decode →"}
        </button>
        <button
          onClick={swap}
          disabled={!output}
          className="rounded-xl bg-gray-100 px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-40 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition"
        >
          ⇄ Swap
        </button>
      </div>
    </div>
  );
}
