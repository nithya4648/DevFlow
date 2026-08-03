import { useState } from "react";
import useCopyToClipboard from "../../hooks/useCopyToClipboard";

function MaskedValue({ value }) {
  const [show, setShow] = useState(false);
  const [copied, copy] = useCopyToClipboard();

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs text-slate-700 dark:text-slate-300 min-w-[200px]">
        {show ? value : "••••••••••••••••••••"}
      </span>
      <button
        onClick={() => setShow(!show)}
        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
        className="p-1 rounded text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition"
        title="Copy to clipboard"
      >
        {copied ? (
          <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
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
      <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400 text-xs">No environment variables found in this scope.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 font-display text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <th className="px-5 py-3 w-1/3">Key</th>
            <th className="px-5 py-3">Value</th>
            <th className="px-5 py-3 w-24 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {envVars.map((v) => (
            <tr key={v._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group">
              <td className="px-5 py-3 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {v.key}
              </td>
              <td className="px-5 py-3">
                <MaskedValue value={v.value} />
              </td>
              <td className="px-5 py-3 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => onEdit(v)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-500/10 transition"
                    title="Edit"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(v._id)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition"
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
