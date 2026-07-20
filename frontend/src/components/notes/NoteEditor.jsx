// frontend/src/components/notes/NoteEditor.jsx
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
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-200 mb-1">Select a Note</h3>
        <p className="text-sm text-gray-500">Choose a note from the list or create a new one.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-950/40 rounded-2xl border border-white/5 relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 shrink-0">
        <div className="flex-1 min-w-0">
          <input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full bg-transparent text-lg font-bold text-gray-100 placeholder-gray-600 focus:outline-none transition-colors mb-1"
          />
          <div className="flex items-center gap-3">
            <input
              value={localFolder}
              onChange={(e) => setLocalFolder(e.target.value)}
              placeholder="Folder (e.g. Ideas)"
              className="text-xs bg-transparent text-gray-400 placeholder-gray-600 focus:outline-none w-32 border-b border-transparent focus:border-amber-500/50 transition-colors"
            />
            <span className="text-[10px] text-gray-600 border-l border-white/10 pl-3">
              {new Date(note.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Save Status Indicator */}
        <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium bg-white/5 border border-white/10">
          {saveStatus === "saving" ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Saving...</>
          ) : saveStatus === "unsaved" ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Unsaved</>
          ) : (
            <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Saved</>
          )}
        </div>
      </div>

      {/* Editor area */}
      <textarea
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        placeholder="Start typing..."
        className="flex-1 w-full bg-transparent px-6 py-5 text-sm text-gray-300 leading-relaxed placeholder-gray-600 focus:outline-none resize-none"
        spellCheck={false}
      />
    </div>
  );
}
