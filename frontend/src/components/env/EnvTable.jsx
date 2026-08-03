import { useState } from "react";
import useCopyToClipboard from "../../hooks/useCopyToClipboard";

function MaskedValue({ value }) {
  const [show, setShow] = useState(false);
  const [copied, copy] = useCopyToClipboard();

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-gh-text min-w-[200px]">
        {show ? value : "••••••••••••••••••••"}
      </span>
      <button
        onClick={() => setShow(!show)}
        className="p-1 rounded text-gh-muted hover:text-gh-heading hover:bg-gh-subtle transition"
        title={show ? "Hide value" : "Reveal value"}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {show ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.71-2.29c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          )}
        </svg>
      </button>
      <button
        onClick={() => copy(value)}
        className="p-1 rounded text-gh-muted hover:text-accent-fg hover:bg-accent-light transition"
        title="Copy to clipboard"
      >
        {copied ? (
          <svg className="w-3.5 h-3.5 text-accent-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
        )}
      </button>
    </div>
  );
}

export default function EnvTable({ envVars, onEdit, onDelete }) {
  if (envVars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gh-card font-ui">
        <p className="text-gh-muted text-xs font-mono">No environment variables found in this scope.</p>
      </div>
    );
  }

  return (
    <div className="gh-card overflow-hidden font-ui">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gh-border bg-gh-subtle text-[11px] text-gh-muted font-mono font-semibold uppercase tracking-wider">
            <th className="px-4 py-2.5 w-1/3">Key</th>
            <th className="px-4 py-2.5">Value</th>
            <th className="px-4 py-2.5 w-20 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gh-border">
          {envVars.map((v) => (
            <tr key={v._id} className="hover:bg-gh-subtle transition group">
              <td className="px-4 py-2.5 font-mono text-xs font-semibold text-accent-fg">
                {v.key}
              </td>
              <td className="px-4 py-2.5">
                <MaskedValue value={v.value} />
              </td>
              <td className="px-4 py-2.5 text-right">
                <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => onEdit(v)}
                    className="p-1.5 rounded-md text-gh-muted hover:text-accent-fg hover:bg-accent-light transition"
                    title="Edit"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(v._id)}
                    className="p-1.5 rounded-md text-gh-muted hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
