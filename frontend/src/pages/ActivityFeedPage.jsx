import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics.service";

export default function ActivityFeedPage() {
  const { data: activityRes, isLoading } = useQuery({
    queryKey: ["my-activity"],
    queryFn: analyticsService.getMyActivity,
  });
  const activities = activityRes?.data || [];

  const [deletedActivities, setDeletedActivities] = useState({});
  const [undoToast, setUndoToast] = useState(null);

  const handleDeleteActivity = (activityId) => {
    setDeletedActivities(prev => ({ ...prev, [activityId]: true }));
    const timer = setTimeout(async () => {
      await analyticsService.deleteActivity(activityId);
      setDeletedActivities(prev => {
        const newState = { ...prev };
        delete newState[activityId];
        return newState;
      });
      setUndoToast(null);
    }, 5000);
    setUndoToast({ activityId, timer });
  };

  const handleUndo = () => {
    if (!undoToast) return;
    clearTimeout(undoToast.timer);
    setDeletedActivities(prev => {
      const newState = { ...prev };
      delete newState[undoToast.activityId];
      return newState;
    });
    setUndoToast(null);
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-6 h-full min-h-0 font-ui">
      <div className="gh-card p-5 flex-1 flex flex-col min-h-0">
        <h2 className="text-sm font-bold text-gh-heading font-mono mb-4 border-b border-gh-border pb-3">Your Activity Feed</h2>

        {isLoading ? (
          <p className="text-xs text-gh-muted font-mono">Loading activity feed…</p>
        ) : activities.length === 0 ? (
          <p className="text-xs text-gh-muted font-mono italic">No activity logged yet.</p>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {activities.map((act) => (
              !deletedActivities[act._id] && (
                <div key={act._id} className="group flex items-start gap-3 border-b border-gh-border pb-3 text-xs font-mono">
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
                  <button onClick={() => handleDeleteActivity(act._id)} className="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 transition text-gh-muted hover:text-red-400 hover:bg-red-500/10" title="Delete">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {undoToast && (
        <div className="fixed bottom-4 right-4 bg-gh-surface border border-gh-border rounded-md p-3 flex items-center gap-3 text-sm font-mono animate-in shadow-lg z-50">
          <span className="text-gh-text">Activity deleted</span>
          <button onClick={handleUndo} className="text-accent-fg hover:text-accent-border font-semibold">Undo (5s)</button>
        </div>
      )}
    </div>
  );
}
