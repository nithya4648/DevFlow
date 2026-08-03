// src/components/tools/JwtDecoderTool.jsx
import { useState } from "react";
import ToolCard from "./ToolCard";
import CopyButton from "./CopyButton";
import { FaExclamationTriangle } from "react-icons/fa";

function safeBase64Decode(str) {
  try {
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

  const Section = ({ title, data, raw }) => (
    <ToolCard
      title={title}
      actions={<CopyButton text={JSON.stringify(data, null, 2) || raw} />}
    >
      {data ? (
        <pre className="overflow-x-auto rounded-md bg-gh-bg border border-gh-border p-3 text-xs leading-relaxed font-mono text-gh-text">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <div className="rounded-md bg-gh-bg border border-gh-border p-3 text-xs font-mono break-all text-gh-muted">
          {raw || "—"}
        </div>
      )}
    </ToolCard>
  );

  return (
    <div className="space-y-4 font-ui">
      <ToolCard title="Token Input" actions={<CopyButton text={token} />}>
        <textarea
          rows={4}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT here…"
          className="gh-input text-xs font-mono resize-none w-full"
        />
      </ToolCard>

      {!isValidStructure && token.trim() && (
        <div className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3.5 py-2 text-xs font-mono text-amber-400">
          <FaExclamationTriangle />
          Token must have exactly 3 parts separated by dots.
        </div>
      )}

      {isValidStructure && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Section title="Header" data={header} />
          <Section title="Payload" data={payload} />
          <div>
            <ToolCard title="Signature" actions={<CopyButton text={signature} />}>
              <div className="rounded-md bg-gh-bg border border-gh-border p-3 text-xs font-mono break-all text-gh-muted leading-relaxed">
                {signature}
              </div>
            </ToolCard>
          </div>
        </div>
      )}
    </div>
  );
}
