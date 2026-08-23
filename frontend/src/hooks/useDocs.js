// frontend/src/hooks/useDocs.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { docService } from "../services/doc.service";

const DOC_KEY = "docs";

export function useDocs(filters = {}) {
  return useQuery({
    queryKey: [DOC_KEY, "list", filters],
    queryFn: () => docService.getDocs(filters),
    staleTime: 1000 * 30,
  });
}

export function useDoc(id) {
  return useQuery({
    queryKey: [DOC_KEY, "detail", id],
    queryFn: () => docService.getDocById(id),
    enabled: !!id,
    staleTime: 1000 * 15,
  });
}

export function useCreateDoc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => docService.createDoc(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DOC_KEY, "list"] }),
  });
}

export function useUpdateDoc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => {
      window.__isDocSaving = true;
      return docService.updateDoc(id, data);
    },
    onMutate: async ({ id, data }) => {
      window.__isDocSaving = true;
      // Cancel outgoing queries to prevent race condition
      await qc.cancelQueries({ queryKey: [DOC_KEY, "detail", id] });
      
      // Snapshot old data for rollback
      const previousDoc = qc.getQueryData([DOC_KEY, "detail", id]);
      
      // Optimistically update UI immediately
      qc.setQueryData([DOC_KEY, "detail", id], (old) => ({
        ...old,
        data: { ...old?.data, ...data }
      }));
      
      return { previousDoc, id };
    },
    onSuccess: (responseData, { id }) => {
      window.__isDocSaving = false;
      // Update with server response (source of truth)
      qc.setQueryData([DOC_KEY, "detail", id], responseData);
      // Invalidate list to reflect updated timestamp
      qc.invalidateQueries({ queryKey: [DOC_KEY, "list"] });
    },
    onError: (error, { id }, context) => {
      window.__isDocSaving = false;
      console.error("Save failed", error);
      // Rollback on error
      if (context?.previousDoc) {
        qc.setQueryData([DOC_KEY, "detail", id], context.previousDoc);
      }
    },
    onSettled: () => {
      window.__isDocSaving = false;
    }
  });
}

export function useDeleteDoc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => docService.deleteDoc(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DOC_KEY] }),
  });
}
