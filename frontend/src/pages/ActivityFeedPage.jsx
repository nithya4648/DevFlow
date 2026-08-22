import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics.service";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function ActivityFeedPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);

  const { data: activityRes, isLoading } = useQuery({
    queryKey: ["my-activity"],
    queryFn: analyticsService.getMyActivity,
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (activityId) => analyticsService.deleteActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries(["my-activity"]);
      setDeletingId(null);
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => analyticsService.deleteAllActivity(),
    onSuccess: () => {
      queryClient.invalidateQueries(["my-activity"]);
    },
  });

  const activities = activityRes?.data || [];

  const handleDelete = (activityId) => {
    if (confirm("Delete this activity?")) {
      setDeletingId(activityId);
      deleteActivityMutation.mutate(activityId);
    }
  };

  const handleDeleteAll = () => {
    if (confirm("Delete all activities? This cannot be undone.")) {
      deleteAllMutation.mutate();
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-6 h-full min-h-0 font-ui">
      <div className="gh-card p-5 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 border-b border-gh-border pb-3">
          <h2 className="text-sm font-bold text-gh-heading font-mono">Your Activity Feed</h2>
          {activities.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={deleteAllMutation.isPending}
              className="text-xs bg-red-900 hover:bg-red-800 text-red-100 px-3 py-1.5 rounded font-mono disabled:opacity-50"
            >
              {deleteAllMutation.isPending ? "Clearing..." : "Clear All"}
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
              <div key={act._id} className="flex items-start gap-3 border-b border-gh-border pb-3 text-xs font-mono group hover:bg-gh-border/30 p-2 rounded transition">
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
                  disabled={deletingId === act._id || deleteActivityMutation.isPending}
                  className="opacity-0 group-hover:opacity-100 transition p-1 text-gh-muted hover:text-red-500 shrink-0 disabled:opacity-50"
                  title="Delete activity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
