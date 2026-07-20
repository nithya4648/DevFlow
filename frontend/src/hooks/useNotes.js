// frontend/src/hooks/useNotes.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { noteService } from "../services/note.service";

const NOTE_KEY = "notes";

export function useNotes(filters = {}) {
  return useQuery({
    queryKey: [NOTE_KEY, filters],
    queryFn: () => noteService.getNotes(filters),
    staleTime: 1000 * 30,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => noteService.createNote(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTE_KEY] }),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => noteService.updateNote(id, data),
    // Optimistic update for fast UI response
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: [NOTE_KEY] });
      const previousNotes = qc.getQueriesData({ queryKey: [NOTE_KEY] });
      
      qc.setQueriesData({ queryKey: [NOTE_KEY] }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((note) =>
            note._id === id ? { ...note, ...data } : note
          ),
        };
      });
      return { previousNotes };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousNotes) {
        context.previousNotes.forEach(([queryKey, data]) => {
          qc.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [NOTE_KEY] }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => noteService.deleteNote(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTE_KEY] }),
  });
}
