// src/components/tools/HashGeneratorTool.jsx
// MD5, SHA-1, SHA-256 using crypto-js (client-side only)
import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import ToolCard from "./ToolCard";
import CopyButton from "./CopyButton";
import useDebounce from "../../hooks/useDebounce";

const ALGOS = [
  { key: "md5", label: "MD5", fn: (t) => CryptoJS.MD5(t).toString() },
  { key: "sha1", label: "SHA-1", fn: (t) => CryptoJS.SHA1(t).toString() },
  { key: "sha256", label: "SHA-256", fn: (t) => CryptoJS.SHA256(t).toString() },
  { key: "sha512", label: "SHA-512", fn: (t) => CryptoJS.SHA512(t).toString() },
];

export default function HashGeneratorTool() {
  const [input, setInput] = useState("Hello, DevFlow!");
  const [uppercase, setUppercase] = useState(false);
  const [hashes, setHashes] = useState({});
  const debounced = useDebounce(input, 300);

  useEffect(() => {
    if (!debounced) { setHashes({}); return; }
    const result = {};
    ALGOS.forEach(({ key, fn }) => {
      result[key] = fn(debounced);
    });
    setHashes(result);
  }, [debounced]);

  const fmt = (h) => (uppercase ? h.toUpperCase() : h);

  return (
    <div className="space-y-4">
      <ToolCard title="Input String">
        <div className="space-y-3">
          <textarea
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter any text to hash…"
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-200 dark:placeholder-gray-600 transition"
          />
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <div
              onClick={() => setUppercase(!uppercase)}
              className={`relative h-5 w-10 rounded-full transition-colors ${uppercase ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-700"}`}
            >
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${uppercase ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Uppercase output</span>
          </label>
        </div>
      </ToolCard>

      <div className="space-y-3">
        {ALGOS.map(({ key, label }) => (
          <ToolCard key={key} title={label} actions={hashes[key] ? <CopyButton text={fmt(hashes[key])} /> : null}>
            <code className="block text-xs font-mono text-gray-700 dark:text-gray-300 break-all leading-relaxed">
              {hashes[key] ? fmt(hashes[key]) : <span className="text-gray-300 dark:text-gray-600">—</span>}
            </code>
          </ToolCard>
        ))}
      </div>
    </div>
  );
}
