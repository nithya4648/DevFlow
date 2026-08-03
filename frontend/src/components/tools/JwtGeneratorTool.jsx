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
    <div className="space-y-4 font-ui">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ToolCard title="Payload (JSON)">
          <textarea
            rows={8}
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="gh-input text-xs font-mono resize-none w-full"
          />
        </ToolCard>
        <ToolCard title="Secret Key">
          <div className="space-y-3">
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter your secret key…"
              className="gh-input text-xs font-mono w-full"
            />
            <div className="rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs font-mono text-amber-400">
              ⚠️ This generates tokens in your browser. Never expose real secrets in production.
            </div>
            <button
              onClick={generate}
              disabled={loading}
              className="btn-primary text-xs font-mono w-full justify-center"
            >
              {loading ? "Generating…" : "Generate Token"}
            </button>
          </div>
        </ToolCard>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-mono text-red-400">
          {error}
        </div>
      )}

      {token && (
        <ToolCard title="Generated JWT" actions={<CopyButton text={token} />}>
          <div className="rounded-md bg-gh-bg border border-gh-border p-3 text-xs font-mono break-all leading-relaxed">
            {token.split(".").map((part, i) => (
              <span
                key={i}
                className={
                  i === 0
                    ? "text-red-400"
                    : i === 1
                    ? "text-accent-fg"
                    : "text-green-400"
                }
              >
                {part}
                {i < 2 ? <span className="text-gh-muted">.</span> : null}
              </span>
            ))}
          </div>
        </ToolCard>
      )}
    </div>
  );
}
