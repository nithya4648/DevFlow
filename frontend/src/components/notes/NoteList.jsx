import { Skeleton } from "../ui/Skeleton";

export default function NoteList({ notes, isLoading, selectedNoteId, onSelectNote, onNewNote, onDeleteNote }) {
  if (isLoading && !notes.length) {
    return (
      <div className="w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-800 pr-3 flex flex-col gap-2">
        <Skeleton className="h-9 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="w-64 shrink-0 flex flex-col border-r border-slate-200/80 dark:border-slate-800 pr-3">
      {/* New Note Button */}
      <button
        onClick={onNewNote}
        className="flex items-center justify-center gap-2 w-full py-2 mb-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Note
      </button>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {notes.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No notes found.</p>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              onClick={() => onSelectNote(note._id)}
              className={`group relative p-3 rounded-lg cursor-pointer transition-all border ${
                selectedNoteId === note._id
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300 font-medium"
                  : "bg-white dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <h4 className={`text-xs font-semibold truncate mb-1 pr-6 ${selectedNoteId === note._id ? "text-emerald-700 dark:text-emerald-300" : "text-slate-900 dark:text-slate-100"}`}>
                {note.title || "Untitled Note"}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {note.content || "Empty note..."}
              </p>
              
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                <span className="font-mono text-[10px] text-slate-400">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
                {note.folder && note.folder !== "Unfiled" && (
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 max-w-[80px] truncate">
                    {note.folder}
                  </span>
                )}
              </div>

              {/* Delete button (hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(note._id);
                }}
                className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 transition-all"
                title="Delete note"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
