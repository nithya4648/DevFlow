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

export function useDocVersions(docId) {
  return useQuery({
    queryKey: [DOC_KEY, "versions", docId],
    queryFn: () => docService.getVersions(docId),
    enabled: !!docId,
    staleTime: 0, // always fresh
  });
}

export function useDocVersion(docId, versionId) {
  return useQuery({
    queryKey: [DOC_KEY, "version", docId, versionId],
    queryFn: () => docService.getVersionById(docId, versionId),
    enabled: !!docId && !!versionId,
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
    mutationFn: ({ id, data }) => docService.updateDoc(id, data),
    onMutate: async ({ id, data }) => {
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
      // Update with server response (source of truth)
      qc.setQueryData([DOC_KEY, "detail", id], responseData);
      // Invalidate list to reflect updated timestamp
      qc.invalidateQueries({ queryKey: [DOC_KEY, "list"] });
      qc.invalidateQueries({ queryKey: [DOC_KEY, "versions", id] });
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousDoc) {
        qc.setQueryData([DOC_KEY, "detail", id], context.previousDoc);
      }
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
