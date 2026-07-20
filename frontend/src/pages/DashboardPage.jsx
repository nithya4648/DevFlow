import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import UsageStats from "../components/dashboard/UsageStats";
import RecentProjects from "../components/dashboard/RecentProjects";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import PinnedTools from "../components/dashboard/PinnedTools";
import { ListSkeleton } from "../components/ui/Skeleton";

export const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Mock loading animation for widgets to showcase skeletons on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-indigo-500/10 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 p-6 dark:border-indigo-500/20">
        <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
          Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{user?.name}</span> 👋
        </h1>
        <p className="mt-1 text-xs md:text-sm text-gray-400 dark:text-gray-500">
          Here is what is happening across your developer utilities today.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-28 animate-pulse rounded-2xl bg-gray-250 dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        /* Usage Stats Widgets */
        <UsageStats />
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Projects & Pinned Tools */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="h-80 animate-pulse rounded-2xl bg-gray-250 dark:bg-gray-800" />
          ) : (
            <RecentProjects />
          )}

          {loading ? (
            <div className="h-64 animate-pulse rounded-2xl bg-gray-250 dark:bg-gray-800" />
          ) : (
            <PinnedTools />
          )}
        </div>

        {/* Right Column - Live Activity Feed */}
        <div>
          {loading ? (
            <ListSkeleton rows={5} />
          ) : (
            <ActivityFeed />
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
