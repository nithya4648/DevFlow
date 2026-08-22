import React from "react";
import useAuth from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics.service";
import QuickLaunch from "../components/dashboard/QuickLaunch";
import RecentProjects from "../components/dashboard/RecentProjects";
import RecentBookmarks from "../components/dashboard/RecentBookmarks";
import RecentSnippets from "../components/dashboard/RecentSnippets";
import RecentNotes from "../components/dashboard/RecentNotes";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import PinnedTools from "../components/dashboard/PinnedTools";
import ContributionGraph from "../components/dashboard/ContributionGraph";
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
      {/* 2. Quick Launch Shortcuts (Always at top) */}
      <QuickLaunch />

      {loading ? (
        <div className="h-40 animate-pulse rounded-md bg-gh-surface border border-gh-border" />
      ) : (
        <ContributionGraph />
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
