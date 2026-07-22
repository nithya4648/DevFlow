// frontend/src/hooks/useComments.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentService } from "../services/comment.service";

const COMMENT_KEY = "comments";

export function useComments(targetType, targetId) {
  return useQuery({
    queryKey: [COMMENT_KEY, targetType, targetId],
    queryFn: () => commentService.getComments(targetType, targetId),
    enabled: !!targetType && !!targetId,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => commentService.createComment(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [COMMENT_KEY, variables.targetType, variables.targetId] });
    },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, targetType, targetId }) => commentService.deleteComment(id),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [COMMENT_KEY, variables.targetType, variables.targetId] });
    },
  });
}
