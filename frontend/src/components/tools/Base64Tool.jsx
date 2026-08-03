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
    <div className="space-y-4 font-ui">
      {/* Mode toggle */}
      <div className="inline-flex rounded-md border border-gh-border bg-gh-subtle p-0.5">
        {["encode", "decode"].map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(""); }}
            className={`rounded-sm px-4 py-1.5 text-xs font-mono font-medium capitalize transition-colors ${
              mode === m
                ? "bg-gh-surface text-gh-heading border border-gh-border shadow-xs"
                : "text-gh-muted hover:text-gh-heading"
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
            className="gh-input text-xs font-mono resize-none w-full"
          />
        </ToolCard>
        <ToolCard title={mode === "encode" ? "Base64" : "Plain Text"} actions={<CopyButton text={output} />}>
          <textarea
            rows={8}
            value={output}
            readOnly
            placeholder="Output appears here…"
            className="gh-input text-xs font-mono resize-none w-full bg-gh-bg"
          />
        </ToolCard>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-mono text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={process}
          className="btn-primary text-xs font-mono"
        >
          {mode === "encode" ? "Encode →" : "Decode →"}
        </button>
        <button
          onClick={swap}
          disabled={!output}
          className="btn-secondary text-xs font-mono"
        >
          ⇄ Swap
        </button>
      </div>
    </div>
  );
}
