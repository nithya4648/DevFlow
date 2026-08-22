import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../../services/analytics.service";

export const ActivityFeed = () => {
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
            <div key={act._id || index} className="flex gap-2.5 items-start relative group">
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
                  {act.targetName && (
                    <span className="text-accent-fg font-mono">
                      {act.targetName}
                    </span>
                  )}
                </p>
                <span className="text-[10px] font-mono text-gh-muted block">
                  {new Date(act.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
