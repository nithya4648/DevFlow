import { Skeleton } from "../ui/Skeleton";

export default function NoteList({ notes, isLoading, selectedNoteId, onSelectNote, onNewNote, onDeleteNote }) {
  if (isLoading && !notes.length) {
    return (
      <div className="w-60 shrink-0 border-r border-gh-border pr-3 flex flex-col gap-2 font-ui">
        <Skeleton className="h-8 rounded-md" />
        <Skeleton className="h-16 rounded-md" />
        <Skeleton className="h-16 rounded-md" />
      </div>
    );
  }

  return (
    <div className="w-60 shrink-0 flex flex-col border-r border-gh-border pr-3 font-ui">
      {/* New Note Button */}
      <button
        onClick={onNewNote}
        className="btn-primary flex items-center justify-center gap-2 w-full text-xs mb-3"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Note
      </button>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
        {notes.length === 0 ? (
          <p className="text-xs text-gh-muted text-center py-4 font-mono">No notes found.</p>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              onClick={() => onSelectNote(note._id)}
              className={`group relative p-2.5 rounded-md cursor-pointer transition-colors border ${
                selectedNoteId === note._id
                  ? "bg-accent-light border-accent-border"
                  : "bg-gh-surface border-gh-border hover:border-accent-border hover:bg-gh-subtle"
              }`}
            >
              <h4 className={`text-xs font-mono font-semibold truncate mb-1 pr-6 ${selectedNoteId === note._id ? "text-accent-fg" : "text-gh-heading"}`}>
                {note.title || "Untitled Note"}
              </h4>
              <p className="text-[11px] text-gh-muted line-clamp-2 leading-relaxed font-mono">
                {note.content || "Empty note..."}
              </p>

              <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-gh-border">
                <span className="font-mono text-[10px] text-gh-muted">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
                {note.folder && note.folder !== "Unfiled" && (
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-md bg-gh-bg border border-gh-border text-gh-muted max-w-[70px] truncate">
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
                className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-gh-muted hover:text-red-400 transition-all"
                title="Delete note"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
