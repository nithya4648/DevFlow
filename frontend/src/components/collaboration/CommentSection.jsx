// frontend/src/components/collaboration/CommentSection.jsx
import { useState, useEffect } from "react";
import { useComments, useCreateComment, useDeleteComment } from "../../hooks/useComments";
import useAuth from "../../hooks/useAuth";
import { useNotifications } from "../../context/NotificationContext";

export default function CommentSection({ targetType, targetId, teamId }) {
  const { user } = useAuth();
  const { socket } = useNotifications();
  const [commentText, setCommentText] = useState("");

  const { data: commentRes, isLoading } = useComments(targetType, targetId);
  const comments = commentRes?.data || [];

  const createMutation = useCreateComment();
  const deleteMutation = useDeleteComment();

  // Listen to socket for real-time comments if it's a team target
  const [localComments, setLocalComments] = useState([]);

  useEffect(() => {
    if (comments.length > 0) {
      setLocalComments(comments);
    } else {
      setLocalComments([]);
    }
  }, [comments]);

  useEffect(() => {
    if (!socket || !teamId) return;

    const handleNewComment = (newComment) => {
      if (newComment.targetType === targetType && newComment.targetId === targetId) {
        setLocalComments((prev) => {
          // Avoid duplicates
          if (prev.some((c) => c._id === newComment._id)) return prev;
          return [...prev, newComment];
        });
      }
    };

    const handleDeleteComment = ({ id }) => {
      setLocalComments((prev) => prev.filter((c) => c._id !== id));
    };

    socket.on("comment:new", handleNewComment);
    socket.on("comment:deleted", handleDeleteComment);

    return () => {
      socket.off("comment:new", handleNewComment);
      socket.off("comment:deleted", handleDeleteComment);
    };
  }, [socket, teamId, targetType, targetId]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!commentText.trim()) return;

    createMutation.mutate(
      {
        content: commentText,
        targetType,
        targetId,
      },
      {
        onSuccess: () => {
          setCommentText("");
        },
      }
    );
  }

  function handleDelete(id) {
    if (window.confirm("Delete this comment?")) {
      deleteMutation.mutate({ id, targetType, targetId });
    }
  }

  return (
    <div className="mt-8 border-t border-white/5 pt-6">
      <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <span>💬</span> Comments ({localComments.length})
      </h3>

      {/* List */}
      <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2">
        {isLoading && localComments.length === 0 ? (
          <p className="text-xs text-gray-500">Loading comments...</p>
        ) : localComments.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No comments yet. Start the conversation!</p>
        ) : (
          localComments.map((c) => {
            const isAuthor = c.author?._id === user?._id;
            return (
              <div key={c._id} className="flex items-start gap-3 text-xs bg-white/3 border border-white/5 p-3 rounded-xl">
                {c.author?.avatar ? (
                  <img src={c.author.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center font-bold text-gray-200">
                    {c.author?.name ? c.author.name[0].toUpperCase() : "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-300">{c.author?.name || "Unknown"}</span>
                    <span className="text-[10px] text-gray-600">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-400 leading-relaxed font-sans whitespace-pre-wrap">{c.content}</p>
                </div>

                {isAuthor && (
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition shrink-0 self-start"
                    title="Delete comment"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
        />
        <button
          type="submit"
          disabled={createMutation.isPending || !commentText.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-55 text-white text-xs font-semibold rounded-xl transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
