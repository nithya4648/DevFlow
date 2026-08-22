import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { analyticsService } from "../../services/analytics.service";

export const ActivityFeed = () => {
  const queryClient = useQueryClient();
  const { data: activityRes, isLoading } = useQuery({
    queryKey: ["my-activity"],
    queryFn: analyticsService.getMyActivity,
  });
  const activities = activityRes?.data || [];

  return (
    <div className="gh-card p-4 font-ui">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gh-border">
        <h2 className="text-sm font-bold text-gh-heading font-mono">Activity Feed</h2>
        <Link to="/activity" className="text-xs text-accent-blue font-mono hover:underline">
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-10 animate-pulse rounded-md bg-gh-surface border border-gh-border" />
          <div className="h-10 animate-pulse rounded-md bg-gh-surface border border-gh-border" />
        </div>
      ) : activities.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-gh-muted font-mono">No activity logged yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, 5).map((act, index) => (
            <div key={act._id || index} className="flex gap-2.5 items-start relative group justify-between">
              <div className="flex gap-2.5 items-start flex-1">
                {index !== Math.min(activities.length, 5) - 1 && (
                  <span className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gh-border" />
                )}
                {act.user?.avatar ? (
                  <img src={act.user.avatar} alt="avatar" className="w-6 h-6 rounded-full shrink-0 border border-gh-border" />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-gh-subtle border border-gh-border flex items-center justify-center font-bold text-gh-heading text-[10px] shrink-0 font-mono">
                    {act.user?.name ? act.user.name[0].toUpperCase() : "•"}
                  </span>
                )}
                <div className="flex-1 space-y-0.5 min-w-0">
                  <p className="text-xs font-medium text-gh-text group-hover:text-gh-heading transition truncate font-mono">
                    {act.action}{" "}
                    {act.targetName && <span className="text-accent-fg font-mono">{act.targetName}</span>}
                  </p>
                  <span className="text-[10px] font-mono text-gh-muted block">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              
              {/* DELETE BUTTON */}
              <button
                onClick={() => {
                  if (window.confirm("Delete this activity?")) {
                    analyticsService.deleteActivity(act._id)
                      .then(() => {
                        queryClient.invalidateQueries({ queryKey: ["my-activity"] });
                      })
                      .catch(err => console.error(err));
                  }
                }}
                className="p-1 text-gh-muted hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                title="Delete activity"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
