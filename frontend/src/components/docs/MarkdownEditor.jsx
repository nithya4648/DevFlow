// frontend/src/components/docs/MarkdownEditor.jsx
import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

// Configure marked for GitHub-style rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

function renderMarkdown(md) {
  const rawHtml = marked.parse(md || "");
  return DOMPurify.sanitize(rawHtml);
}

export default function MarkdownEditor({ docId, title, content, category, onSave, isSaving, readOnly = false }) {
  const [localTitle, setLocalTitle] = useState(title || "");
  const [localContent, setLocalContent] = useState(content || "");
  const [localCategory, setLocalCategory] = useState(category || "General");
  const [preview, setPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [editorWidth, setEditorWidth] = useState(null);
  const autoSaveTimer = useRef(null);
  // Refs that always hold the latest values — used in the unmount-save effect
  // so stale closures can't fire a save with old data.
  const latestTitle = useRef(localTitle);
  const latestContent = useRef(localContent);
  const latestCategory = useRef(localCategory);
  const latestIsDirty = useRef(isDirty);
  const latestOnSave = useRef(onSave);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = e.target.parentElement.getBoundingClientRect().width;
    
    const onMouseMove = (moveEvent) => {
      const newWidth = Math.max(200, startWidth + (moveEvent.clientX - startX));
      setEditorWidth(newWidth);
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Keep refs in sync so the unmount effect always has fresh values
  useEffect(() => { latestTitle.current = localTitle; });
  useEffect(() => { latestContent.current = localContent; });
  useEffect(() => { latestCategory.current = localCategory; });
  useEffect(() => { latestIsDirty.current = isDirty; });
  useEffect(() => { latestOnSave.current = onSave; });

  // Sync props → local state ONLY when the selected document changes.
  // Keying on [docId] (not [title, content, category]) prevents react-query
  // background refetches from silently overwriting in-progress edits.
  useEffect(() => {
    setLocalTitle(title || "");
    setLocalContent(content || "");
    setLocalCategory(category || "General");
    setIsDirty(false);
  }, [docId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    });
    setIsDirty(false);
  }

  function handleDownload() {
    const blob = new Blob([localContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(localTitle || "untitled").replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
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

  // On unmount: flush any pending auto-save using the latest ref values.
  // Empty deps array is intentional — we read state via refs, not the closure.
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      if (latestIsDirty.current) {
        latestOnSave.current({
          title: latestTitle.current,
          content: latestContent.current,
          category: latestCategory.current,
        });
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rendered = renderMarkdown(localContent);

  return (
    <div className="flex flex-col flex-1 min-h-[80vh] font-ui p-2 space-y-2">
      {/* Doc header bar */}
      <div className="flex items-center gap-3 mb-0 flex-wrap justify-between">
        <input
          value={localTitle}
          onChange={(e) => { if (!readOnly) { setLocalTitle(e.target.value); markDirty(); } }}
          placeholder="Document title…"
          readOnly={readOnly}
          className={`flex-1 min-w-0 text-lg font-bold bg-transparent text-gh-heading placeholder-gh-muted border-b border-transparent pb-1 transition font-mono ${
            readOnly ? "cursor-default opacity-80" : "focus:border-accent-border focus:outline-none"
          }`}
        />
        <input
          value={localCategory}
          onChange={(e) => { if (!readOnly) { setLocalCategory(e.target.value); markDirty(); } }}
          placeholder="Category"
          readOnly={readOnly}
          className={`w-32 gh-input text-xs ${readOnly ? "cursor-default opacity-80" : ""}`}
        />


        {/* Editor / Preview toggle */}
        <div className="flex items-center bg-gh-subtle border border-gh-border rounded-md p-0.5">
          <button
            onClick={() => setPreview(false)}
            className={`px-3 py-1 rounded-sm text-xs font-mono font-medium transition-colors ${
              !preview ? "bg-gh-surface text-gh-heading border border-gh-border" : "text-gh-muted hover:text-gh-heading"
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setPreview(true)}
            className={`px-3 py-1 rounded-sm text-xs font-mono font-medium transition-colors ${
              preview ? "bg-gh-surface text-gh-heading border border-gh-border" : "text-gh-muted hover:text-gh-heading"
            }`}
          >
            Preview
          </button>
        </div>

        {/* Save button */}
        {!readOnly && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              isDirty
                ? "btn-primary"
                : "text-gh-muted border border-gh-border bg-gh-subtle"
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

        {/* Download button */}
        {!readOnly && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors text-gh-muted border border-gh-border bg-gh-subtle hover:text-gh-heading hover:bg-gh-surface"
            title="Download as .md"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        )}
      </div>

      {/* Split pane */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Editor pane — always rendered but hidden in preview mode */}
        <div 
          className={`min-h-0 ${preview ? "hidden" : "flex"} flex-col bg-gh-bg rounded-md border border-gh-border overflow-hidden relative`}
          style={editorWidth ? { width: editorWidth, flex: 'none' } : { flex: 1 }}
        >
          {/* Resize Handle */}
          {!preview && (
            <div 
              onMouseDown={handleMouseDown}
              className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-accent-border/50 z-10"
            />
          )}
          <textarea
            value={localContent}
            onChange={(e) => { if (!readOnly) { setLocalContent(e.target.value); markDirty(); } }}
            placeholder={`# Your document\n\nStart writing in **Markdown**…\n\n- Supports GFM (tables, task lists)\n- Code blocks with syntax highlighting\n- Inline \`code\``}
            readOnly={readOnly}
            className={`flex-1 w-full bg-gh-bg px-4 py-3 text-sm text-gh-text font-mono leading-relaxed placeholder-gh-muted resize-none transition ${
              readOnly ? "cursor-default opacity-80" : "focus:outline-none focus:ring-1 focus:ring-accent-border focus:border-accent-border"
            }`}
            spellCheck={false}
          />
          <p className="text-[10px] text-gh-muted font-mono mt-1.5 text-right px-4 pb-2">
            {localContent.length.toLocaleString()} chars · {localContent.split("\n").length} lines
          </p>
        </div>

        {/* Preview pane */}
        {preview && (
          <div className="flex-1 min-h-0 overflow-y-auto bg-gh-surface border border-gh-border rounded-md px-5 py-4 ml-4">
            {localContent.trim() ? (
              <div
                className="prose prose-sm max-w-none prose-headings:text-gh-heading prose-p:text-gh-text prose-a:text-accent-fg prose-code:text-accent-fg prose-pre:bg-gh-surface prose-pre:border prose-pre:border-gh-border prose-blockquote:border-gh-border prose-blockquote:text-gh-muted"
                dangerouslySetInnerHTML={{ __html: rendered }}
              />
            ) : (
              <p className="text-gh-muted text-sm italic font-mono">Nothing to preview yet…</p>
            )}
          </div>
        )}

        {/* Side-by-side in wide layout when not toggled */}
        {!preview && (
          <div className="hidden xl:flex flex-1 min-h-0 overflow-y-auto bg-gh-bg border border-gh-border rounded-md px-5 py-4 flex-col ml-4">
            <p className="text-[10px] uppercase font-mono font-semibold text-gh-muted tracking-wider mb-3">Preview</p>
            {localContent.trim() ? (
              <div
                className="prose prose-sm max-w-none prose-headings:text-gh-heading prose-p:text-gh-text prose-a:text-accent-fg prose-code:text-accent-fg prose-pre:bg-gh-surface prose-pre:border prose-pre:border-gh-border prose-blockquote:border-gh-border prose-blockquote:text-gh-muted"
                dangerouslySetInnerHTML={{ __html: rendered }}
              />
            ) : (
              <p className="text-gh-muted text-sm italic font-mono">Live preview…</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
