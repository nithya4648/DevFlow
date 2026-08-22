// frontend/src/components/snippets/SnippetCard.jsx
import useCopyToClipboard from "../../hooks/useCopyToClipboard";

// Map language → file extension for export
const LANG_EXT = {
  javascript: "js", typescript: "ts", python: "py", rust: "rs",
  go: "go", java: "java", cpp: "cpp", c: "c", csharp: "cs",
  php: "php", ruby: "rb", swift: "swift", kotlin: "kt",
  html: "html", css: "css", scss: "scss", json: "json",
  yaml: "yaml", markdown: "md", sql: "sql", bash: "sh",
  shell: "sh", plaintext: "txt", xml: "xml", dart: "dart",
};

const LANG_COLOR = {
  javascript: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  typescript: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  python:     "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  rust:       "text-orange-400 bg-orange-400/10 border-orange-400/20",
  go:         "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  java:       "text-red-400 bg-red-400/10 border-red-400/20",
  html:       "text-orange-400 bg-orange-400/10 border-orange-400/20",
  css:        "text-pink-400 bg-pink-400/10 border-pink-400/20",
  sql:        "text-violet-400 bg-violet-400/10 border-violet-400/20",
  bash:       "text-accent-fg bg-accent-light border-accent-border",
  shell:      "text-accent-fg bg-accent-light border-accent-border",
};

function exportSnippet(snippet) {
  const ext = LANG_EXT[snippet.language] || "txt";
  const blob = new Blob([snippet.code], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${snippet.title.replace(/\s+/g, "_")}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SnippetCard({ snippet, onEdit, onDelete, onToggleFavorite, canEdit = true, canDelete = true }) {
  const [copied, copy] = useCopyToClipboard();
  const langColor = LANG_COLOR[snippet.language] || "text-gh-muted bg-gh-subtle border-gh-border";
  const codePreview = snippet.code.split("\n").slice(0, 5).join("\n");
  const lineCount = snippet.code.split("\n").length;

  return (
    <div className="group gh-card overflow-hidden hover:border-accent-border transition-colors font-ui">
      {/* Card header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md border ${langColor}`}>
              {snippet.language}
            </span>
            {snippet.folder && (
              <span className="text-[10px] text-gh-muted font-mono flex items-center gap-1">
                📁 {snippet.folder}
              </span>
            )}
          </div>
          <h3
            onClick={() => canEdit && onEdit && onEdit(snippet)}
            className={`text-sm font-semibold text-gh-heading truncate ${canEdit && onEdit ? "cursor-pointer hover:text-accent-fg transition-colors" : ""}`}
          >
            {snippet.title}
          </h3>
          {snippet.description && (
            <p className="text-xs text-gh-muted line-clamp-1 mt-0.5 font-mono">{snippet.description}</p>
          )}
        </div>

        {/* Favorite star */}
        <button
          onClick={() => onToggleFavorite(snippet._id, !snippet.isFavorite)}
          className={`shrink-0 transition-colors ${
            snippet.isFavorite ? "text-amber-400" : "text-gh-muted hover:text-amber-400"
          }`}
          title={snippet.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg className="w-4 h-4" fill={snippet.isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>

      {/* Code preview */}
      <div className="mx-4 mb-3 rounded-md bg-gh-bg border border-gh-border overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-gh-border bg-gh-subtle">
          <span className="text-[10px] text-gh-muted font-mono">{lineCount} lines</span>
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500/40" />
            <span className="w-2 h-2 rounded-full bg-amber-500/40" />
            <span className="w-2 h-2 rounded-full bg-accent-fg/40" />
          </div>
        </div>
        <pre className="px-3 py-2.5 text-[11px] text-gh-text font-mono overflow-hidden leading-relaxed">
          <code>{codePreview}{lineCount > 5 ? "\n…" : ""}</code>
        </pre>
      </div>

      {/* Tags */}
      {snippet.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 px-4 mb-3">
          {snippet.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="gh-badge">
              #{tag}
            </span>
          ))}
          {snippet.tags.length > 4 && (
            <span className="text-[10px] text-gh-muted font-mono">+{snippet.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between px-4 pb-3 gap-2 border-t border-gh-border pt-2">
        <span className="text-[10px] text-gh-muted font-mono">
          {new Date(snippet.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>

        <div className="flex items-center gap-0.5">
          {/* Copy */}
          <button
            onClick={() => copy(snippet.code)}
            title="Copy code"
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono text-gh-muted hover:text-accent-fg hover:bg-accent-light transition-colors"
          >
            {copied ? (
              <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Copied</>
            ) : (
              <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg> Copy</>
            )}
          </button>

          {/* Export */}
          <button
            onClick={() => exportSnippet(snippet)}
            title="Download as file"
            className="p-1.5 rounded-md text-gh-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          {/* Edit */}
          {canEdit && (
            <button
              onClick={() => onEdit(snippet)}
              title="Edit snippet"
              className="p-1.5 rounded-md text-gh-muted hover:text-gh-heading hover:bg-gh-subtle transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          {/* Delete */}
          {canDelete && (
            <button
              onClick={() => onDelete(snippet._id)}
              title="Delete snippet"
              className="p-1.5 rounded-md text-gh-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
