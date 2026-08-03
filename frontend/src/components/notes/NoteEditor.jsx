import { useState, useEffect, useRef } from "react";

export default function NoteEditor({ note, onSave, isSaving }) {
  const [localTitle, setLocalTitle] = useState("");
  const [localContent, setLocalContent] = useState("");
  const [localFolder, setLocalFolder] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved"); // saved | saving | unsaved
  
  const saveTimer = useRef(null);
  const isFirstRender = useRef(true);

  // Sync local state when note changes (switching notes)
  useEffect(() => {
    if (note) {
      setLocalTitle(note.title || "");
      setLocalContent(note.content || "");
      setLocalFolder(note.folder || "Unfiled");
      setSaveStatus("saved");
      isFirstRender.current = true;
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
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs">
        <div className="w-14 h-14 mb-4 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Select a Note</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Choose a note from the sidebar or create a new one.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
        <div className="flex-1 min-w-0">
          <input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full bg-transparent font-display text-lg font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-colors mb-1"
          />
          <div className="flex items-center gap-3">
            <input
              value={localFolder}
              onChange={(e) => setLocalFolder(e.target.value)}
              placeholder="Folder (e.g. Ideas)"
              className="font-mono text-xs bg-transparent text-slate-500 dark:text-slate-400 placeholder-slate-400 focus:outline-none w-32 border-b border-transparent focus:border-emerald-500/50 transition-colors"
            />
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 border-l border-slate-200 dark:border-slate-800 pl-3">
              {new Date(note.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Save Status Indicator */}
        <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
          {saveStatus === "saving" ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Saving...</>
          ) : saveStatus === "unsaved" ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Unsaved</>
          ) : (
            <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Saved</>
          )}
        </div>
      </div>

      {/* Editor area */}
      <textarea
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        placeholder="Start typing..."
        className="flex-1 w-full bg-transparent px-6 py-5 text-sm text-slate-800 dark:text-slate-200 leading-relaxed placeholder-slate-400 focus:outline-none resize-none font-sans"
        spellCheck={false}
      />
    </div>
  );
}
