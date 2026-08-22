import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics.service";

export default function ActivityFeedPage() {
  const { data: activityRes, isLoading } = useQuery({
    queryKey: ["my-activity"],
    queryFn: analyticsService.getMyActivity,
  });
  const activities = activityRes?.data || [];

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
              <div key={act._id} className="flex items-start gap-3 border-b border-gh-border pb-3 text-xs font-mono">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
