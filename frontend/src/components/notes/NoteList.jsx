// frontend/src/components/notes/NoteList.jsx
import { Skeleton } from "../ui/Skeleton";

export default function NoteList({ notes, isLoading, selectedNoteId, onSelectNote, onNewNote, onDeleteNote }) {
  if (isLoading && !notes.length) {
    return (
      <div className="w-64 shrink-0 border-r border-white/8 pr-3 flex flex-col gap-2">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-64 shrink-0 flex flex-col border-r border-white/8 pr-3">
      {/* New Note Button */}
      <button
        onClick={onNewNote}
        className="flex items-center justify-center gap-2 w-full py-2 mb-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-medium rounded-xl transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Note
      </button>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {notes.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No notes found.</p>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              onClick={() => onSelectNote(note._id)}
              className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                selectedNoteId === note._id
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-white/3 border-transparent hover:border-white/10 hover:bg-white/5"
              }`}
            >
              <h4 className={`text-sm font-medium truncate mb-1 pr-6 ${selectedNoteId === note._id ? "text-amber-400" : "text-gray-200"}`}>
                {note.title || "Untitled Note"}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {note.content || "Empty note..."}
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-gray-600 font-medium">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
                {note.folder && note.folder !== "Unfiled" && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10 max-w-[80px] truncate">
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
                className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all"
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
