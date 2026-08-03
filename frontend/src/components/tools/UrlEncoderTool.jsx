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
    <div className="space-y-4 font-ui">
      {/* Mode + Type */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="inline-flex rounded-md border border-gh-border bg-gh-subtle p-0.5">
          {["encode", "decode"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`rounded-sm px-4 py-1.5 text-xs font-mono font-medium capitalize transition-colors ${
                mode === m
                  ? "bg-gh-surface text-gh-heading border border-gh-border"
                  : "text-gh-muted hover:text-gh-heading"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-md border border-gh-border bg-gh-subtle p-0.5">
          {[
            { key: "component", label: "encodeURIComponent" },
            { key: "full", label: "encodeURI" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setEncodeType(t.key)}
              className={`rounded-sm px-3 py-1.5 text-xs font-mono font-medium transition-colors ${
                encodeType === t.key
                  ? "bg-gh-surface text-accent-fg border border-accent-border"
                  : "text-gh-muted hover:text-gh-heading"
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
            className="gh-input text-xs font-mono resize-none w-full"
          />
        </ToolCard>
        <ToolCard title="Output" actions={<CopyButton text={output} />}>
          <textarea
            rows={7}
            readOnly
            value={output}
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
