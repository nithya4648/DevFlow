// src/components/tools/Base64Tool.jsx
import { useState } from "react";
import ToolCard from "./ToolCard";
import CopyButton from "./CopyButton";

export default function Base64Tool() {
  const [mode, setMode] = useState("encode"); // "encode" | "decode"
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const process = () => {
    setError("");
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))));
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
      {/* Mode toggle */}
      <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
        {["encode", "decode"].map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(""); }}
            className={`rounded-lg px-6 py-2 text-xs font-bold capitalize transition ${
              mode === m
                ? "bg-indigo-500 text-white shadow"
                : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ToolCard title={mode === "encode" ? "Plain Text" : "Base64"} actions={<CopyButton text={input} />}>
          <textarea
            rows={8}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Enter text to encode…" : "Enter Base64 to decode…"}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-200 dark:placeholder-gray-600 transition"
          />
        </ToolCard>
        <ToolCard title={mode === "encode" ? "Base64" : "Plain Text"} actions={<CopyButton text={output} />}>
          <textarea
            rows={8}
            value={output}
            readOnly
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
