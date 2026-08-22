import { useState, useEffect, useRef } from "react";

export default function NoteEditor({ note, onSave, isSaving }) {
  const [localTitle, setLocalTitle] = useState("");
  const [localContent, setLocalContent] = useState("");
  const [localFolder, setLocalFolder] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved"); // saved | saving | unsaved

  const saveTimer = useRef(null);
  const isFirstRender = useRef(true);
  const lastNoteId = useRef(null);

  // Sync local state when note changes (switching notes)
  // Tracks note _id so background refetches of the same note don't clobber unsaved edits
  useEffect(() => {
    if (!note) return;
    const isDifferentNote = note._id !== lastNoteId.current;
    const isSafeToResync = saveStatus !== "unsaved" && saveStatus !== "saving";

    if (isDifferentNote || isSafeToResync) {
      setLocalTitle(note.title || "");
      setLocalContent(note.content || "");
      setLocalFolder(note.folder || "Unfiled");
      setSaveStatus("saved");
      isFirstRender.current = true;
      lastNoteId.current = note._id;
    }
  }, [note]);

  // Sync isSaving prop to status
  useEffect(() => {
    if (isSaving) setSaveStatus("saving");
    else if (saveStatus === "saving") setSaveStatus("saved");
  }, [isSaving, saveStatus]);

  // Debounced Auto-save
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (note) {
      setSaveStatus("unsaved");
      clearTimeout(saveTimer.current);

      saveTimer.current = setTimeout(() => {
        // Only save if something actually changed
        if (
          localTitle !== note.title ||
          localContent !== note.content ||
          localFolder !== note.folder
        ) {
          onSave({
            title: localTitle,
            content: localContent,
            folder: localFolder,
          });
        } else {
          setSaveStatus("saved");
        }
      }, 1200); // 1.2s debounce
    }

    return () => clearTimeout(saveTimer.current);
  }, [localTitle, localContent, localFolder, note, onSave]);

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 gh-card p-8 font-ui">
        <div className="w-12 h-12 mb-4 rounded-md bg-accent-light flex items-center justify-center border border-accent-border">
          <svg className="w-6 h-6 text-accent-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h3 className="text-sm font-mono font-bold text-gh-heading mb-1">Select a Note</h3>
        <p className="text-xs text-gh-muted font-mono">Choose a note from the sidebar or create a new one.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 gh-card relative font-ui">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gh-border shrink-0">
        <div className="flex-1 min-w-0">
          <input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full bg-transparent font-mono text-base font-bold text-gh-heading placeholder-gh-muted focus:outline-none transition-colors mb-1"
          />
          <div className="flex items-center gap-3">
            <input
              value={localFolder}
              onChange={(e) => setLocalFolder(e.target.value)}
              placeholder="Folder (e.g. Ideas)"
              className="font-mono text-xs bg-transparent text-gh-muted placeholder-gh-muted focus:outline-none w-32 border-b border-transparent focus:border-accent-border transition-colors"
            />
            <span className="font-mono text-[10px] text-gh-muted border-l border-gh-border pl-3">
              {new Date(note.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Save Status Indicator */}
        <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono font-semibold bg-gh-subtle border border-gh-border text-gh-muted">
          {saveStatus === "saving" ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Saving...</>
          ) : saveStatus === "unsaved" ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-gh-muted" /> Unsaved</>
          ) : (
            <><span className="w-1.5 h-1.5 rounded-full bg-accent-fg" /> Saved</>
          )}
        </div>
      </div>

      {/* Editor area */}
      <textarea
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        placeholder="Start typing..."
        className="flex-1 w-full bg-transparent px-5 py-4 text-sm text-gh-text leading-relaxed placeholder-gh-muted focus:outline-none resize-none font-mono"
        spellCheck={false}
      />
    </div>
  );
}
