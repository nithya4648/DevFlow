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
    <div className="absolute inset-y-0 right-0 w-[500px] max-w-full bg-gray-900 border-l border-white/10 shadow-2xl flex flex-col z-40 transform transition-transform">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-gray-950/50">
        <div>
          <h2 className="text-base font-semibold text-gray-100">Version History</h2>
          <p className="text-xs text-gray-500 mt-0.5">{versions.length} past versions</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Version list (sidebar) */}
        <div className="w-40 border-r border-white/5 bg-gray-950/20 overflow-y-auto">
          {loadingList ? (
            <div className="p-4 text-xs text-gray-500">Loading versions…</div>
          ) : versions.length === 0 ? (
            <div className="p-4 text-xs text-gray-500">No history yet.</div>
          ) : (
            <div className="py-2">
              {versions.map((v) => {
                const date = new Date(v.editedAt);
                return (
                  <button
                    key={v._id}
                    onClick={() => setSelectedVersionId(v._id)}
                    className={`w-full text-left px-4 py-3 border-b border-white/5 transition-all ${
                      selectedVersionId === v._id
                        ? "bg-indigo-600/20 text-indigo-300"
                        : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">
                      {date.toLocaleDateString()}
                    </div>
                    <div className="text-[10px] opacity-70">
                      {date.toLocaleTimeString()}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Version preview */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-950/50">
          {!selectedVersionId ? (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-500 p-6 text-center">
              Select a version from the left to preview its content.
            </div>
          ) : loadingDetail ? (
            <div className="flex-1 p-6 flex justify-center">
              <svg className="w-5 h-5 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          ) : selectedVersion ? (
            <>
              <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
                <span className="text-sm font-semibold text-gray-200 truncate pr-4">
                  {selectedVersion.title}
                </span>
                <button
                  onClick={() => onRestore(selectedVersion)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors shrink-0"
                >
                  Restore this version
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <div
                  className="prose prose-invert prose-sm max-w-none opacity-80"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedVersion.content) }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 p-6 text-xs text-red-400">Failed to load version.</div>
          )}
        </div>
      </div>
    </div>
  );
}
