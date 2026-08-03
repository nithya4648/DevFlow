import React from "react";
import { FaServer, FaKey, FaBookOpen, FaFileCode } from "react-icons/fa";

export const UsageStats = ({ overview }) => {
  const defaultStats = [
    {
      id: 1,
      label: "Projects",
      value: overview?.totals?.projects || 0,
      limit: "∞",
      pct: 0,
      icon: FaServer,
      color: "text-accent-fg",
      bgColor: "bg-accent-light border border-accent-border",
    },
    {
      id: 2,
      label: "Snippets",
      value: overview?.totals?.snippets || 0,
      limit: "∞",
      pct: 0,
      icon: FaFileCode,
      color: "text-sky-400",
      bgColor: "bg-sky-400/10 border border-sky-400/20",
    },
    {
      id: 3,
      label: "Notes",
      value: overview?.totals?.notes || 0,
      limit: "∞",
      pct: 0,
      icon: FaBookOpen,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10 border border-emerald-400/20",
    },
    {
      id: 4,
      label: "Bookmarks",
      value: overview?.totals?.bookmarks || 0,
      limit: "∞",
      pct: 0,
      icon: FaKey,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10 border border-amber-400/20",
    },
  ];

  const list = defaultStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-ui">
      {list.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="gh-card p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-gh-muted uppercase tracking-wider">
                {stat.label}
              </span>
              <span className={`rounded-md p-1.5 ${stat.bgColor} ${stat.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-bold text-gh-heading">{stat.value}</span>
                <span className="text-xs text-gh-muted">/ {stat.limit}</span>
              </div>
              <div className="mt-2.5">
                <div className="w-full bg-gh-subtle h-1.5 rounded-full overflow-hidden border border-gh-border">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${Math.max(stat.pct, 5)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] font-mono text-gh-muted">Quota</span>
                  <span className="text-[10px] font-mono font-bold text-accent-fg">Active</span>
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
