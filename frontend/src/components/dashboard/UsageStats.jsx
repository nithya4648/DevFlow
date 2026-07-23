import React from "react";
import { FaServer, FaKey, FaBookOpen, FaFileCode } from "react-icons/fa";

export const UsageStats = ({ overview }) => {
  const defaultStats = [
    {
      id: 1,
      label: "Projects",
      value: overview?.totals?.projects || 0,
      limit: "Unlimited",
      pct: 0,
      icon: FaServer,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      id: 2,
      label: "Snippets",
      value: overview?.totals?.snippets || 0,
      limit: "Unlimited",
      pct: 0,
      icon: FaFileCode,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      id: 3,
      label: "Notes",
      value: overview?.totals?.notes || 0,
      limit: "Unlimited",
      pct: 0,
      icon: FaBookOpen,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
    },
    {
      id: 4,
      label: "Bookmarks",
      value: overview?.totals?.bookmarks || 0,
      limit: "Unlimited",
      pct: 0,
      icon: FaKey,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  const list = defaultStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {list.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="group rounded-2xl border border-gray-150 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/40 hover:shadow-md transition duration-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-450 uppercase tracking-wider">
                {stat.label}
              </span>
              <span className={`rounded-xl p-2.5 ${stat.bgColor} ${stat.color} transition duration-300 group-hover:scale-110`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">/ {stat.limit}</span>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-100 dark:bg-gray-850 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stat.pct > 80
                        ? "bg-red-500"
                        : stat.pct > 55
                        ? "bg-amber-500"
                        : "bg-indigo-500"
                    }`}
                    style={{ width: `${stat.pct}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">Usage limit</span>
                  <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400">{stat.pct}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UsageStats;
