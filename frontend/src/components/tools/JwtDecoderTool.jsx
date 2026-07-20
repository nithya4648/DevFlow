// src/components/tools/JwtDecoderTool.jsx
import { useState } from "react";
import ToolCard from "./ToolCard";
import CopyButton from "./CopyButton";
import { FaExclamationTriangle } from "react-icons/fa";

function safeBase64Decode(str) {
  try {
    // Handle URL-safe base64
    const padded = str.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoderTool() {
  const [token, setToken] = useState(SAMPLE_JWT);

  const parts = token.trim().split(".");
  const isValidStructure = parts.length === 3;

  const header = isValidStructure ? safeBase64Decode(parts[0]) : null;
  const payload = isValidStructure ? safeBase64Decode(parts[1]) : null;
  const signature = isValidStructure ? parts[2] : null;

  const Section = ({ title, data, raw, color }) => (
    <ToolCard
      title={title}
      actions={<CopyButton text={JSON.stringify(data, null, 2) || raw} />}
    >
      {data ? (
        <pre className="overflow-x-auto rounded-xl bg-gray-50 dark:bg-gray-950/50 p-4 text-xs leading-relaxed font-mono text-gray-800 dark:text-gray-200">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <div className="rounded-xl bg-gray-50 dark:bg-gray-950/50 p-4 text-xs font-mono break-all text-gray-500 dark:text-gray-400">
          {raw || "—"}
        </div>
      )}
    </ToolCard>
  );

  return (
    <div className="space-y-4">
      <ToolCard title="Token Input" actions={<CopyButton text={token} />}>
        <textarea
          rows={4}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT here…"
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs font-mono text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-200 dark:placeholder-gray-600 transition"
        />
      </ToolCard>

      {!isValidStructure && token.trim() && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-xs font-medium text-amber-500">
          <FaExclamationTriangle />
          Token must have exactly 3 parts separated by dots.
        </div>
      )}

      {isValidStructure && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Section title="Header" data={header} color="blue" />
          <Section title="Payload" data={payload} color="indigo" />
          <div>
            <ToolCard title="Signature" actions={<CopyButton text={signature} />}>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-950/50 p-4 text-xs font-mono break-all text-gray-500 dark:text-gray-400 leading-relaxed">
                {signature}
              </div>
            </ToolCard>
          </div>
        </div>
      )}
    </div>
  );
}
