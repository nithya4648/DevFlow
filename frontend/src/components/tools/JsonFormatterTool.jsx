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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Indent:</label>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={"\\t"}>Tab</option>
          </select>
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => format()}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-600 transition"
          >
            Format
          </button>
          <button
            onClick={minify}
            className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition"
          >
            Minify
          </button>
          <button
            onClick={validate}
            className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition"
          >
            Validate
          </button>
        </div>
      </div>

      {/* Status */}
      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs font-medium text-red-500">
          <FaTimesCircle className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : output ? (
        <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-2 text-xs font-medium text-green-500">
          <FaCheckCircle />
          Valid JSON
        </div>
      ) : null}

      {/* Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ToolCard title="Input" actions={<CopyButton text={input} />}>
          <div className="rounded-xl overflow-hidden" style={{ height: 400 }}>
            <Editor
              height="400px"
              defaultLanguage="json"
              value={input}
              onChange={(v) => setInput(v || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
              }}
            />
          </div>
        </ToolCard>
        <ToolCard title="Output" actions={<CopyButton text={output} />}>
          <div className="rounded-xl overflow-hidden" style={{ height: 400 }}>
            <Editor
              height="400px"
              defaultLanguage="json"
              value={output || input}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
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
