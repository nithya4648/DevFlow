import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics.service";
import { useToast } from "../context/ToastContext";

export default function ActivityFeedPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data: activityRes, isLoading } = useQuery({
    queryKey: ["my-activity"],
    queryFn: analyticsService.getMyActivity,
  });
  const activities = activityRes?.data || [];

  const deleteMutation = useMutation({
    mutationFn: analyticsService.deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-activity"] });
      addToast("Activity removed", "info");
    },
    onError: (err) => {
      addToast(err.response?.data?.message || "Failed to delete activity", "error");
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: analyticsService.clearAllActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-activity"] });
      addToast("All activity history cleared", "info");
    },
    onError: (err) => {
      addToast(err.response?.data?.message || "Failed to clear activity", "error");
    },
  });

  function handleDelete(id) {
    deleteMutation.mutate(id);
  }

  function handleClearAll() {
    if (window.confirm("Are you sure you want to clear your entire activity feed?")) {
      clearAllMutation.mutate();
    }
  }

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-6 h-full min-h-0 font-ui">
      <div className="gh-card p-5 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 border-b border-gh-border pb-3">
          <h2 className="text-sm font-bold text-gh-heading font-mono">Your Activity Feed</h2>
          {activities.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearAllMutation.isPending}
              className="text-xs font-mono text-gh-muted hover:text-red-400 border border-gh-border hover:border-red-500/30 px-2.5 py-1 rounded bg-gh-subtle hover:bg-red-500/10 transition"
              title="Clear all activities"
            >
              {clearAllMutation.isPending ? "Clearing…" : "Clear All"}
            </button>
          )}
        </div>

        {isLoading ? (
          <p className="text-xs text-gh-muted font-mono">Loading activity feed…</p>
        ) : activities.length === 0 ? (
          <p className="text-xs text-gh-muted font-mono italic">No activity logged yet.</p>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {activities.map((act) => (
              <div key={act._id} className="flex items-start gap-3 border-b border-gh-border pb-3 text-xs font-mono group">
                {act.user?.avatar ? (
                  <img src={act.user.avatar} alt="avatar" className="w-6 h-6 rounded-full shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gh-border flex items-center justify-center font-bold text-gh-heading text-[10px] shrink-0">
                    {act.user?.name ? act.user.name[0].toUpperCase() : "•"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-gh-text">
                    {act.action}{" "}
                    {act.targetName && (
                      <span className="font-mono text-[11px] bg-gh-bg border border-gh-border px-1.5 py-0.5 rounded text-accent-fg">
                        {act.targetName}
                      </span>
                    )}
                  </p>
                  <span className="text-[10px] text-gh-muted mt-1 block">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(act._id)}
                  disabled={deleteMutation.isPending}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-gh-muted hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Delete activity"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
