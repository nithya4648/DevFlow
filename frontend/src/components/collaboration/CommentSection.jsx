// frontend/src/components/collaboration/CommentSection.jsx
import { useState } from "react";
import { useComments, useCreateComment, useDeleteComment } from "../../hooks/useComments";
import useAuth from "../../hooks/useAuth";

export default function CommentSection({ targetType, targetId }) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");

  const { data: commentRes, isLoading } = useComments(targetType, targetId);
  const comments = commentRes?.data || [];

  const createMutation = useCreateComment();
  const deleteMutation = useDeleteComment();

  function handleSubmit(e) {
    e.preventDefault();
    if (!commentText.trim()) return;

    createMutation.mutate(
      {
        targetType,
        targetId,
        content: commentText.trim(),
      },
      {
        onSuccess: () => {
          setCommentText("");
        },
      }
    );
  }

  function handleDelete(commentId) {
    deleteMutation.mutate(commentId);
  }

  return (
    <div className="mt-4 pt-4 border-t border-gh-border font-ui">
      <h4 className="text-xs font-mono font-semibold text-gh-heading mb-3 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-gh-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Comments & Notes ({comments.length})
      </h4>

      {/* Comment List */}
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-xs font-mono text-gh-muted animate-pulse">Loading comments…</p>
        ) : comments.length === 0 ? (
          <p className="text-xs font-mono text-gh-muted italic">No comments yet.</p>
        ) : (
          comments.map((comment) => {
            const isAuthor = comment.author?._id === user?._id || comment.author === user?._id;
            return (
              <div
                key={comment._id}
                className="flex items-start justify-between gap-2 p-2.5 rounded-md bg-gh-surface border border-gh-border text-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-medium text-gh-heading">
                      {comment.author?.name || "Anonymous"}
                    </span>
                    <span className="text-[10px] font-mono text-gh-muted">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gh-text whitespace-pre-wrap break-words">{comment.content}</p>
                </div>
                {isAuthor && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="text-gh-muted hover:text-red-400 text-xs font-mono transition-colors shrink-0 p-0.5"
                    title="Delete comment"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment or note…"
          className="gh-input flex-1 text-xs"
        />
        <button
          type="submit"
          disabled={createMutation.isPending || !commentText.trim()}
          className="btn-primary text-xs px-3"
        >
          {createMutation.isPending ? "Posting…" : "Post"}
        </button>
      </form>
    </div>
  );
}
