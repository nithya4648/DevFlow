import { useState, useEffect } from "react";
import { useTeams, useTeamActivity } from "../hooks/useTeams";
import { useNotifications } from "../context/NotificationContext";

export default function ActivityFeedPage() {
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const { data: teamsRes, isLoading: teamsLoading } = useTeams();
  const teams = teamsRes?.data || [];

  const { data: activityRes, isLoading: activityLoading } = useTeamActivity(selectedTeamId);
  const activities = activityRes?.data || [];

  const { socket } = useNotifications();
  const [localActivities, setLocalActivities] = useState([]);

  // Auto-select first team
  if (teams.length > 0 && !selectedTeamId) {
    setSelectedTeamId(teams[0]._id);
  }

  useEffect(() => {
    if (activities.length > 0) {
      setLocalActivities(activities);
    } else {
      setLocalActivities([]);
    }
  }, [activities]);

  // Real-time updates via Socket
  useEffect(() => {
    if (!socket || !selectedTeamId) return;

    const handleNewActivity = (activity) => {
      if (activity.team === selectedTeamId) {
        setLocalActivities((prev) => {
          if (prev.some((a) => a._id === activity._id)) return prev;
          return [activity, ...prev];
        });
      }
    };

    socket.on("activity:new", handleNewActivity);

    return () => {
      socket.off("activity:new", handleNewActivity);
    };
  }, [socket, selectedTeamId]);

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full px-6 py-6 h-full min-h-0 font-ui">

      {/* Sidebar: Teams select */}
      <div className="w-full md:w-56 shrink-0 flex flex-col gap-4 border-r border-gh-border pr-4">
        <div>
          <h2 className="text-sm font-bold text-gh-heading font-mono">Team Activity</h2>
          <p className="text-xs text-gh-muted font-mono">Select a team to view event logs</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {teamsLoading ? (
            <p className="text-xs text-gh-muted font-mono">Loading teams…</p>
          ) : teams.length === 0 ? (
            <p className="text-xs text-gh-muted font-mono italic">No teams found.</p>
          ) : (
            teams.map((t) => (
              <button
                key={t._id}
                onClick={() => setSelectedTeamId(t._id)}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-mono transition-colors ${
                  selectedTeamId === t._id
                    ? "bg-accent-light text-accent-fg border border-accent-border font-semibold"
                    : "text-gh-text hover:text-gh-heading hover:bg-gh-subtle border border-transparent"
                }`}
              >
                👥 {t.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Panel: Activity Log */}
      <div className="flex-1 flex flex-col min-w-0 gh-card p-5 relative">
        <h2 className="text-sm font-bold text-gh-heading font-mono mb-4 border-b border-gh-border pb-3">Event Activity Feed Log</h2>

        {activityLoading ? (
          <p className="text-xs text-gh-muted font-mono">Loading activity feed…</p>
        ) : !selectedTeamId ? (
          <p className="text-xs text-gh-muted font-mono italic">Please select a team on the left.</p>
        ) : localActivities.length === 0 ? (
          <p className="text-xs text-gh-muted font-mono italic">No activity logged in this workspace yet.</p>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {localActivities.map((act) => (
              <div key={act._id} className="flex items-start gap-3 border-b border-gh-border pb-3 text-xs font-mono">
                {act.user?.avatar ? (
                  <img src={act.user.avatar} alt="avatar" className="w-6 h-6 rounded-full shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gh-border flex items-center justify-center font-bold text-gh-heading text-[10px] shrink-0">
                    {act.user?.name ? act.user.name[0].toUpperCase() : "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-gh-text">
                    <span className="font-semibold text-gh-heading">{act.user?.name}</span>{" "}
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
