// frontend/src/pages/NotesPage.jsx
import { useState, useMemo, useEffect } from "react";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "../hooks/useNotes";
import NoteSidebar from "../components/notes/NoteSidebar";
import NoteList from "../components/notes/NoteList";
import NoteEditor from "../components/notes/NoteEditor";

export default function NotesPage() {
  const [activeFolder, setActiveFolder] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const { data: notesData, isLoading, isError } = useNotes({ search });
  const allNotes = notesData?.data || [];
  const folders = notesData?.meta?.folders || [];

  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  // Filter notes by active folder
  const displayedNotes = useMemo(() => {
    if (!activeFolder) return allNotes;
    return allNotes.filter((n) => n.folder === activeFolder);
  }, [allNotes, activeFolder]);

  const selectedNote = useMemo(() => {
    return allNotes.find((n) => n._id === selectedNoteId) || null;
  }, [allNotes, selectedNoteId]);

  // Clear selection if selected note is deleted or folder changes (if note not in folder)
  useEffect(() => {
    if (selectedNoteId) {
      const exists = displayedNotes.find((n) => n._id === selectedNoteId);
      if (!exists && !isLoading) {
        setSelectedNoteId(null);
      }
    }
  }, [displayedNotes, selectedNoteId, isLoading]);

  function handleNewNote() {
    createMutation.mutate(
      {
        title: "",
        content: "",
        folder: activeFolder || "Unfiled"
      },
      {
        onSuccess: (res) => {
          setSelectedNoteId(res.data._id);
        },
      }
    );
  }

  function handleSaveNote(updatedData) {
    if (!selectedNoteId) return;
    updateMutation.mutate({ id: selectedNoteId, data: updatedData });
  }

  function handleDeleteNote(id) {
    if (window.confirm("Delete this note?")) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className="flex gap-4 h-full min-h-0 pl-1 pr-6 pt-2 pb-6 font-ui">
      {/* Panel 1: Folders & Search */}
      <NoteSidebar
        folders={folders}
        activeFolder={activeFolder}
        onFolderChange={setActiveFolder}
        searchValue={search}
        onSearch={setSearch}
      />

      {/* Panel 2: List of notes in folder */}
      <NoteList
        notes={displayedNotes}
        isLoading={isLoading}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
        onNewNote={handleNewNote}
        onDeleteNote={handleDeleteNote}
      />

      {/* Panel 3: Editor */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {isError && (
          <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
            Failed to load notes.
          </div>
        )}
        <NoteEditor
          note={selectedNote}
          onSave={handleSaveNote}
          isSaving={updateMutation.isPending}
        />
      </div>
    </div>
  );
}
