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
      color: "text-orange-500 bg-orange-500/10 dark:bg-orange-500/20",
    },
    {
      id: 2,
      type: "notes",
      message: "Saved environment variable changes to vault",
      time: "2 hours ago",
      icon: FaKey,
      color: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
    },
    {
      id: 3,
      type: "snippets",
      message: "Created React useDebounce hook snippet",
      time: "Yesterday",
      icon: FaCode,
      color: "text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20",
    },
    {
      id: 4,
      type: "notes",
      message: "Updated Docker Compose notes in Workspace",
      time: "3 days ago",
      icon: FaRegStickyNote,
      color: "text-sky-500 bg-sky-500/10 dark:bg-sky-500/20",
    },
  ];

  const list = activities || defaultActivities;

  return (
    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Activity Feed</h3>
        <span className="text-xs text-indigo-500 font-semibold cursor-pointer hover:underline">Clear</span>
      </div>
      <div className="space-y-4">
        {list.map((act, index) => {
          const Icon = act.icon || FaCode;
          return (
            <div key={act.id} className="flex gap-4 items-start relative group">
              {/* Timeline Connector Line */}
              {index !== list.length - 1 && (
                <span className="absolute left-[18px] top-9 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-500/20 transition duration-300" />
              )}
              <span className={`rounded-full p-2.5 ${act.color} transition duration-300 group-hover:scale-110`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-250 group-hover:text-indigo-400 transition">
                  {act.message}
                </p>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 block">
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
