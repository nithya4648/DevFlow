import React from "react";
import { FaGitAlt, FaRegStickyNote, FaCode, FaKey } from "react-icons/fa";

export const ActivityFeed = ({ activities }) => {
  const defaultActivities = [
    {
      id: 1,
      type: "git",
      message: "Git push to repository devflow-backend",
      time: "10 mins ago",
      icon: FaGitAlt,
      color: "text-amber-400 bg-amber-400/10 border border-amber-400/20",
    },
    {
      id: 2,
      type: "notes",
      message: "Saved environment variable changes to vault",
      time: "2 hours ago",
      icon: FaKey,
      color: "text-accent-fg bg-accent-light border border-accent-border",
    },
    {
      id: 3,
      type: "snippets",
      message: "Created React useDebounce hook snippet",
      time: "Yesterday",
      icon: FaCode,
      color: "text-sky-400 bg-sky-400/10 border border-sky-400/20",
    },
    {
      id: 4,
      type: "notes",
      message: "Updated Docker Compose notes in Workspace",
      time: "3 days ago",
      icon: FaRegStickyNote,
      color: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
    },
  ];

  const list = activities || defaultActivities;

  return (
    <div className="gh-card p-4 font-ui">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gh-border">
        <h2 className="text-sm font-bold text-gh-heading font-mono">Activity Feed</h2>
        <span className="text-xs text-accent-blue font-mono cursor-pointer hover:underline">Clear</span>
      </div>
      <div className="space-y-3">
        {list.map((act, index) => {
          const Icon = act.icon || FaCode;
          return (
            <div key={act.id} className="flex gap-3 items-start relative group">
              {/* Timeline Connector Line */}
              {index !== list.length - 1 && (
                <span className="absolute left-[15px] top-7 bottom-0 w-0.5 bg-gh-border" />
              )}
              <span className={`rounded-md p-1.5 ${act.color} text-xs shrink-0`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="flex-1 space-y-0.5 min-w-0">
                <p className="text-xs font-medium text-gh-text group-hover:text-gh-heading transition truncate">
                  {act.message}
                </p>
                <span className="text-[10px] font-mono text-gh-muted block">
                  {act.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
