// frontend/src/pages/ActivityFeedPage.jsx
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
    <div className="flex-1 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full px-6 py-6 h-full min-h-0">
      
      {/* Sidebar: Teams select */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-4 border-r border-white/5 pr-4">
        <div>
          <h2 className="text-base font-bold text-gray-100 mb-2">Team Activity</h2>
          <p className="text-xs text-gray-500">Select a team to view event logs</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {teamsLoading ? (
            <p className="text-xs text-gray-500">Loading teams...</p>
          ) : teams.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No teams found.</p>
          ) : (
            teams.map((t) => (
              <button
                key={t._id}
                onClick={() => setSelectedTeamId(t._id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all ${
                  selectedTeamId === t._id
                    ? "bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/30"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                👥 {t.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Panel: Activity Log */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-950/40 border border-white/5 rounded-2xl p-6 relative">
        <h2 className="text-base font-bold text-gray-100 mb-4 border-b border-white/5 pb-3">Event Activity Feed Log</h2>

        {activityLoading ? (
          <p className="text-xs text-gray-500">Loading activity feed...</p>
        ) : !selectedTeamId ? (
          <p className="text-xs text-gray-500 italic">Please select a team on the left.</p>
        ) : localActivities.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No activity logged in this workspace yet.</p>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {localActivities.map((act) => (
              <div key={act._id} className="flex items-start gap-3 border-b border-white/5 pb-3 text-xs">
                {act.user?.avatar ? (
                  <img src={act.user.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center font-bold text-gray-200">
                    {act.user?.name ? act.user.name[0].toUpperCase() : "?"}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-gray-300">
                    <span className="font-semibold text-gray-100">{act.user?.name}</span>{" "}
                    {act.action}{" "}
                    {act.targetName && (
                      <span className="font-mono text-[11px] bg-white/5 border border-white/10 px-1 py-0.5 rounded text-indigo-300">
                        {act.targetName}
                      </span>
                    )}
                  </p>
                  <span className="text-[10px] text-gray-650 mt-1 block">
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
