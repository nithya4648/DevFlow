// frontend/src/hooks/useBookmarks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookmarkService } from "../services/bookmark.service";

const BOOKMARK_KEY = "bookmarks";

export function useBookmarks(filters = {}) {
  return useQuery({
    queryKey: [BOOKMARK_KEY, filters],
    queryFn: () => bookmarkService.getBookmarks(filters),
    staleTime: 1000 * 30,
  });
}

export function useCreateBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => bookmarkService.createBookmark(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BOOKMARK_KEY] }),
  });
}

export function useUpdateBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => bookmarkService.updateBookmark(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BOOKMARK_KEY] }),
  });
}

export function useDeleteBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => bookmarkService.deleteBookmark(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BOOKMARK_KEY] }),
  });
}
