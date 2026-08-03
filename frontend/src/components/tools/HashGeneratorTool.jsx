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
    <div className="space-y-4 font-ui">
      <ToolCard title="Input String">
        <div className="space-y-3">
          <textarea
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter any text to hash…"
            className="gh-input text-xs font-mono resize-none w-full"
          />
          <label className="flex items-center gap-2 cursor-pointer w-fit select-none">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded border-gh-border text-accent-fg focus:ring-accent-border"
            />
            <span className="text-xs font-mono text-gh-muted">Uppercase output</span>
          </label>
        </div>
      </ToolCard>

      <div className="space-y-3">
        {ALGOS.map(({ key, label }) => (
          <ToolCard key={key} title={label} actions={hashes[key] ? <CopyButton text={fmt(hashes[key])} /> : null}>
            <code className="block text-xs font-mono text-gh-text break-all leading-relaxed bg-gh-bg p-2 rounded border border-gh-border">
              {hashes[key] ? fmt(hashes[key]) : <span className="text-gh-muted">—</span>}
            </code>
          </ToolCard>
        ))}
      </div>
    </div>
  );
}
