// frontend/src/hooks/useSnippets.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { snippetService } from "../services/snippet.service";

const SNIPPET_KEY = "snippets";

export function useSnippets(filters = {}) {
  return useQuery({
    queryKey: [SNIPPET_KEY, filters],
    queryFn: () => snippetService.getSnippets(filters),
    staleTime: 1000 * 30,
  });
}

export function useCreateSnippet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => snippetService.createSnippet(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SNIPPET_KEY] }),
  });
}

export function useUpdateSnippet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => snippetService.updateSnippet(id, data),
    // Optimistic update for favorite toggle responsiveness
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: [SNIPPET_KEY] });
      const prev = qc.getQueriesData({ queryKey: [SNIPPET_KEY] });
      qc.setQueriesData({ queryKey: [SNIPPET_KEY] }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((s) => (s._id === id ? { ...s, ...data } : s)),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) ctx.prev.forEach(([key, val]) => qc.setQueryData(key, val));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [SNIPPET_KEY] }),
  });
}

export function useDeleteSnippet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => snippetService.deleteSnippet(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SNIPPET_KEY] }),
  });
}
