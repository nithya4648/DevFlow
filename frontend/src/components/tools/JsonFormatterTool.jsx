// src/components/tools/JsonFormatterTool.jsx
import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import ToolCard from "./ToolCard";
import CopyButton from "./CopyButton";
import useDebounce from "../../hooks/useDebounce";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function JsonFormatterTool() {
  const [input, setInput] = useState('{\n  "hello": "world",\n  "number": 42\n}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const [indent, setIndent] = useState(2);

  const debouncedInput = useDebounce(input, 400);

  const format = useCallback((text = debouncedInput, spaces = indent) => {
    try {
      const parsed = JSON.parse(text);
      setOutput(JSON.stringify(parsed, null, spaces));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [debouncedInput, indent]);

  const minify = () => {
    try {
      setOutput(JSON.stringify(JSON.parse(input)));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const validate = () => {
    try {
      JSON.parse(input);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-4 font-ui">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono font-medium text-gh-muted">Indent:</label>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="gh-input text-xs font-mono py-1 px-2"
          >
            <option value={2} className="bg-gh-surface">2 spaces</option>
            <option value={4} className="bg-gh-surface">4 spaces</option>
            <option value={"\\t"} className="bg-gh-surface">Tab</option>
          </select>
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => format()}
            className="btn-primary text-xs font-mono"
          >
            Format
          </button>
          <button
            onClick={minify}
            className="btn-secondary text-xs font-mono"
          >
            Minify
          </button>
          <button
            onClick={validate}
            className="btn-secondary text-xs font-mono"
          >
            Validate
          </button>
        </div>
      </div>

      {/* Status */}
      {error ? (
        <div className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-mono text-red-400">
          <FaTimesCircle className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : output ? (
        <div className="flex items-center gap-2 rounded-md border border-green-500/20 bg-green-500/10 px-3.5 py-2 text-xs font-mono text-green-400">
          <FaCheckCircle />
          Valid JSON
        </div>
      ) : null}

      {/* Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ToolCard title="Input" actions={<CopyButton text={input} />}>
          <div className="rounded-md overflow-hidden border border-gh-border" style={{ height: 400 }}>
            <Editor
              height="400px"
              defaultLanguage="json"
              value={input}
              onChange={(v) => setInput(v || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
              }}
            />
          </div>
        </ToolCard>
        <ToolCard title="Output" actions={<CopyButton text={output} />}>
          <div className="rounded-md overflow-hidden border border-gh-border" style={{ height: 400 }}>
            <Editor
              height="400px"
              defaultLanguage="json"
              value={output || input}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                readOnly: true,
                scrollBeyondLastLine: false,
                wordWrap: "on",
              }}
            />
          </div>
        </ToolCard>
      </div>
    </div>
  );
}
