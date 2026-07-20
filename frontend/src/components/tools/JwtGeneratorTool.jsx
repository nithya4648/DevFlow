// src/components/tools/JwtGeneratorTool.jsx
// Signs a JWT client-side using jose (pure ESM, browser-compatible)
import { useState } from "react";
import * as jose from "jose";
import ToolCard from "./ToolCard";
import CopyButton from "./CopyButton";

const DEFAULT_HEADER = `{
  "alg": "HS256",
  "typ": "JWT"
}`;

const DEFAULT_PAYLOAD = `{
  "sub": "user_123",
  "name": "DevFlow User",
  "iat": ${Math.floor(Date.now() / 1000)},
  "exp": ${Math.floor(Date.now() / 1000) + 3600}
}`;

export default function JwtGeneratorTool() {
  const [header, setHeader] = useState(DEFAULT_HEADER);
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [secret, setSecret] = useState("your-super-secret-key");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const parsedPayload = JSON.parse(payload);
      const secretKey = new TextEncoder().encode(secret);
      const jwt = await new jose.SignJWT(parsedPayload)
        .setProtectedHeader({ alg: "HS256" })
        .sign(secretKey);
      setToken(jwt);
    } catch (e) {
      setError(e.message);
      setToken("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ToolCard title="Payload (JSON)">
          <textarea
            rows={8}
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs font-mono text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-200 transition"
          />
        </ToolCard>
        <ToolCard title="Secret Key">
          <div className="space-y-3">
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter your secret key…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-mono text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-200 transition"
            />
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 px-4 py-3 text-xs text-amber-600 dark:text-amber-400">
              ⚠️ This generates tokens in your browser. Never expose real secrets in production.
            </div>
            <button
              onClick={generate}
              disabled={loading}
              className="w-full rounded-xl bg-indigo-500 py-2.5 text-sm font-bold text-white hover:bg-indigo-600 disabled:opacity-50 transition"
            >
              {loading ? "Generating…" : "Generate Token"}
            </button>
          </div>
        </ToolCard>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs font-medium text-red-500">
          {error}
        </div>
      )}

      {token && (
        <ToolCard title="Generated JWT" actions={<CopyButton text={token} />}>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-950/50 p-4 text-xs font-mono break-all leading-relaxed text-gray-700 dark:text-gray-300">
            {token.split(".").map((part, i) => (
              <span
                key={i}
                className={
                  i === 0
                    ? "text-red-500"
                    : i === 1
                    ? "text-indigo-400"
                    : "text-green-500"
                }
              >
                {part}
                {i < 2 ? <span className="text-gray-400">.</span> : null}
              </span>
            ))}
          </div>
        </ToolCard>
      )}
    </div>
  );
}
