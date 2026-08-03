// frontend/src/components/docs/DocVersionHistory.jsx
import { useState } from "react";
import { useDocVersions, useDocVersion } from "../../hooks/useDocs";
import { marked } from "marked";
import DOMPurify from "dompurify";

function renderMarkdown(md) {
  return DOMPurify.sanitize(marked.parse(md || ""));
}

export default function DocVersionHistory({ docId, onClose, onRestore }) {
  const { data: versionsData, isLoading: loadingList } = useDocVersions(docId);
  const versions = versionsData?.data || [];
  const [selectedVersionId, setSelectedVersionId] = useState(null);

  const { data: versionDetail, isLoading: loadingDetail } = useDocVersion(docId, selectedVersionId);
  const selectedVersion = versionDetail?.data;

  return (
    <div className="absolute inset-y-0 right-0 w-[500px] max-w-full bg-gh-surface border-l border-gh-border shadow-lg flex flex-col z-40 font-ui">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gh-border shrink-0 bg-gh-subtle">
        <div>
          <h2 className="text-sm font-bold text-gh-heading font-mono">Version History</h2>
          <p className="text-xs text-gh-muted font-mono mt-0.5">{versions.length} past versions</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-gh-border text-gh-muted hover:text-gh-heading transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Version list (sidebar) */}
        <div className="w-40 border-r border-gh-border bg-gh-bg overflow-y-auto">
          {loadingList ? (
            <div className="p-4 text-xs text-gh-muted font-mono">Loading versions…</div>
          ) : versions.length === 0 ? (
            <div className="p-4 text-xs text-gh-muted font-mono">No history yet.</div>
          ) : (
            <div className="py-1">
              {versions.map((v) => {
                const date = new Date(v.editedAt);
                return (
                  <button
                    key={v._id}
                    onClick={() => setSelectedVersionId(v._id)}
                    className={`w-full text-left px-3 py-2.5 border-b border-gh-border transition-colors ${
                      selectedVersionId === v._id
                        ? "bg-accent-light text-accent-fg"
                        : "text-gh-text hover:bg-gh-subtle hover:text-gh-heading"
                    }`}
                  >
                    <div className="text-xs font-mono font-medium mb-0.5">
                      {date.toLocaleDateString()}
                    </div>
                    <div className="text-[10px] font-mono text-gh-muted">
                      {date.toLocaleTimeString()}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Version preview */}
        <div className="flex-1 flex flex-col min-w-0 bg-gh-surface">
          {!selectedVersionId ? (
            <div className="flex-1 flex items-center justify-center text-xs text-gh-muted font-mono p-6 text-center">
              Select a version from the left to preview its content.
            </div>
          ) : loadingDetail ? (
            <div className="flex-1 p-6 flex justify-center items-center">
              <svg className="w-5 h-5 text-accent-fg animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          ) : selectedVersion ? (
            <>
              <div className="flex items-center justify-between p-4 border-b border-gh-border shrink-0">
                <span className="text-sm font-semibold text-gh-heading font-mono truncate pr-4">
                  {selectedVersion.title}
                </span>
                <button
                  onClick={() => onRestore(selectedVersion)}
                  className="btn-primary text-xs shrink-0"
                >
                  Restore this version
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <div
                  className="prose prose-sm max-w-none prose-headings:text-gh-heading prose-p:text-gh-text prose-a:text-accent-fg prose-code:text-accent-fg prose-pre:bg-gh-bg prose-blockquote:border-gh-border prose-blockquote:text-gh-muted"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedVersion.content) }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 p-6 text-xs text-red-400 font-mono">Failed to load version.</div>
          )}
        </div>
      </div>
    </div>
  );
}
