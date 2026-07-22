// frontend/src/components/docs/MarkdownEditor.jsx
import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useTeams } from "../../hooks/useTeams";

// Configure marked for GitHub-style rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

function renderMarkdown(md) {
  const rawHtml = marked.parse(md || "");
  return DOMPurify.sanitize(rawHtml);
}

export default function MarkdownEditor({ title, content, category, teamId, onSave, isSaving, readOnly = false }) {
  const [localTitle, setLocalTitle] = useState(title || "");
  const [localContent, setLocalContent] = useState(content || "");
  const [localCategory, setLocalCategory] = useState(category || "General");
  const [localTeamId, setLocalTeamId] = useState(teamId || "");
  const [preview, setPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const autoSaveTimer = useRef(null);

  const { data: teamsRes } = useTeams();
  const teams = teamsRes?.data || [];

  // Sync props when doc changes
  useEffect(() => {
    setLocalTitle(title || "");
    setLocalContent(content || "");
    setLocalCategory(category || "General");
    setLocalTeamId(teamId ? (teamId._id || teamId) : "");
    setIsDirty(false);
  }, [title, content, category, teamId]);

  function markDirty() {
    setIsDirty(true);
    // Auto-save after 3s of inactivity
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleSave();
    }, 3000);
  }

  function handleSave() {
    clearTimeout(autoSaveTimer.current);
    onSave({
      title: localTitle,
      content: localContent,
      category: localCategory,
      teamId: localTeamId || null,
    });
    setIsDirty(false);
  }

  // Cmd/Ctrl+S to save
  useEffect(() => {
    function handler(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const rendered = renderMarkdown(localContent);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Doc header bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input
          value={localTitle}
          onChange={(e) => { if (!readOnly) { setLocalTitle(e.target.value); markDirty(); } }}
          placeholder="Document title…"
          readOnly={readOnly}
          className={`flex-1 min-w-0 text-xl font-bold bg-transparent text-gray-100 placeholder-gray-600 border-b border-transparent pb-1 transition ${
            readOnly ? "cursor-default opacity-80" : "focus:border-indigo-500/50 focus:outline-none"
          }`}
        />
        <input
          value={localCategory}
          onChange={(e) => { if (!readOnly) { setLocalCategory(e.target.value); markDirty(); } }}
          placeholder="Category"
          readOnly={readOnly}
          className={`w-36 text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-gray-300 placeholder-gray-600 transition ${
            readOnly ? "cursor-default opacity-80" : "focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          }`}
        />

        {/* Team Scope Select */}
        {!readOnly && (
          <select
            value={localTeamId}
            onChange={(e) => { setLocalTeamId(e.target.value); markDirty(); }}
            className="w-36 text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
          >
            <option value="">Private (Personal)</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        )}

        {/* Editor / Preview toggle */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5">
          <button
            onClick={() => setPreview(false)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              !preview ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setPreview(true)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              preview ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-250"
            }`}
          >
            Preview
          </button>
        </div>

        {/* Save button - hidden for viewers */}
        {!readOnly && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isDirty
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30"
                : "bg-white/5 text-gray-500 border border-white/10"
            }`}
          >
            {isSaving ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </>
            ) : isDirty ? "Save  ⌘S" : "Saved ✓"}
          </button>
        )}
      </div>

      {/* Split pane */}
      <div className="flex-1 min-h-0 flex gap-4">
        {/* Editor pane — always rendered but hidden in preview mode */}
        <div className={`flex-1 min-h-0 ${preview ? "hidden" : "flex"} flex-col`}>
          <textarea
            value={localContent}
            onChange={(e) => { if (!readOnly) { setLocalContent(e.target.value); markDirty(); } }}
            placeholder={`# Your document\n\nStart writing in **Markdown**…\n\n- Supports GFM (tables, task lists)\n- Code blocks with syntax highlighting\n- Inline \`code\``}
            readOnly={readOnly}
            className={`flex-1 w-full bg-gray-950/40 border border-white/8 rounded-2xl px-5 py-4 text-sm text-gray-200 font-mono leading-relaxed placeholder-gray-600 resize-none transition ${
              readOnly ? "cursor-default opacity-80" : "focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            }`}
            spellCheck={false}
          />
          <p className="text-[10px] text-gray-600 mt-1.5 text-right">
            {localContent.length.toLocaleString()} chars · {localContent.split("\n").length} lines
          </p>
        </div>

        {/* Preview pane */}
        {preview && (
          <div className="flex-1 min-h-0 overflow-y-auto bg-gray-950/40 border border-white/8 rounded-2xl px-6 py-5">
            {localContent.trim() ? (
              <div
                className="prose prose-invert prose-sm max-w-none prose-headings:text-gray-100 prose-p:text-gray-300 prose-a:text-indigo-400 prose-code:text-indigo-300 prose-pre:bg-gray-900 prose-blockquote:border-indigo-500 prose-blockquote:text-gray-400"
                dangerouslySetInnerHTML={{ __html: rendered }}
              />
            ) : (
              <p className="text-gray-600 text-sm italic">Nothing to preview yet…</p>
            )}
          </div>
        )}

        {/* Side-by-side in wide layout when not toggled */}
        {!preview && (
          <div className="hidden xl:flex flex-1 min-h-0 overflow-y-auto bg-gray-950/40 border border-white/8 rounded-2xl px-6 py-5 flex-col">
            <p className="text-[10px] uppercase font-semibold text-gray-600 tracking-wider mb-3">Preview</p>
            {localContent.trim() ? (
              <div
                className="prose prose-invert prose-sm max-w-none prose-headings:text-gray-100 prose-p:text-gray-300 prose-a:text-indigo-400 prose-code:text-indigo-300 prose-pre:bg-gray-900 prose-blockquote:border-indigo-500 prose-blockquote:text-gray-400"
                dangerouslySetInnerHTML={{ __html: rendered }}
              />
            ) : (
              <p className="text-gray-600 text-sm italic">Live preview…</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
