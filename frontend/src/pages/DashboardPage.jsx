import React from "react";
import useAuth from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics.service";
import QuickLaunch from "../components/dashboard/QuickLaunch";
import UsageStats from "../components/dashboard/UsageStats";
import RecentProjects from "../components/dashboard/RecentProjects";
import RecentBookmarks from "../components/dashboard/RecentBookmarks";
import RecentSnippets from "../components/dashboard/RecentSnippets";
import RecentNotes from "../components/dashboard/RecentNotes";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import PinnedTools from "../components/dashboard/PinnedTools";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import { ListSkeleton } from "../components/ui/Skeleton";

export const DashboardPage = () => {
  const { user } = useAuth();
  
  const { data: overview, isLoading: loading } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: analyticsService.getOverview,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });

  return (
    <div className="space-y-5 font-ui">
      {/* 1. Welcome Header */}
      <div className="gh-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gh-heading">
            Welcome back, <span className="text-accent-fg font-mono">{user?.name}</span>
          </h1>
          <p className="mt-0.5 text-xs text-gh-muted font-mono">
            Developer workstation & workspace analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="gh-badge-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /> Live Metrics
          </span>
        </div>
      </div>

      {/* 2. Quick Launch Shortcuts (Always at top) */}
      <QuickLaunch />

      {/* 3. Analytics Overview & Charts */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-24 animate-pulse rounded-md bg-gh-surface border border-gh-border" />
          ))}
        </div>
      ) : (
        <>
          <UsageStats overview={overview} />
          <DashboardCharts overview={overview} />
        </>
      )}

      {/* 4. Grid Content - Widgets & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Columns - Workstation Widgets */}
        <div className="lg:col-span-2 space-y-5">
          {loading ? (
            <div className="space-y-5">
              <div className="h-48 animate-pulse rounded-md bg-gh-surface border border-gh-border" />
              <div className="h-48 animate-pulse rounded-md bg-gh-surface border border-gh-border" />
              <div className="h-48 animate-pulse rounded-md bg-gh-surface border border-gh-border" />
            </div>
          ) : (
            <>
              <RecentProjects />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <RecentBookmarks />
                <RecentSnippets />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <RecentNotes />
                <PinnedTools />
              </div>
            </>
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
