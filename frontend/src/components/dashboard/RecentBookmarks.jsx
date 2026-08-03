import React from "react";
import { Link } from "react-router-dom";
import { FaBookmark } from "react-icons/fa";
import { useBookmarks } from "../../hooks/useBookmarks";

export const RecentBookmarks = () => {
  const { data, isLoading } = useBookmarks();
  const rawBookmarks = data?.data || [];

  const list = [...rawBookmarks]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5);

  return (
    <div className="gh-card p-4 font-ui">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gh-border">
        <h2 className="text-sm font-bold text-gh-heading font-mono">Recent Bookmarks</h2>
        <Link to="/bookmarks" className="text-xs text-accent-blue font-mono hover:underline">
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-14 animate-pulse rounded-md bg-gh-surface border border-gh-border" />
          <div className="h-14 animate-pulse rounded-md bg-gh-surface border border-gh-border" />
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-xs text-gh-muted font-mono mb-3">No bookmarks saved yet</p>
          <Link to="/bookmarks" className="btn-primary text-xs font-mono">
            + Go to Bookmarks
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {list.map((bm) => {
            let domain = "";
            try {
              domain = new URL(bm.url).hostname;
            } catch (e) {
              domain = "";
            }
            return (
              <Link
                key={bm._id}
                to={`/bookmarks?open=${bm._id}`}
                className="group flex items-start gap-2.5 rounded-md border border-gh-border bg-gh-bg p-2.5 transition-colors hover:border-accent-border hover:bg-gh-subtle block"
              >
                <span className="rounded-md bg-amber-400/10 p-1.5 text-amber-400 border border-amber-400/20 shrink-0 mt-0.5">
                  <FaBookmark className="h-3 w-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-gh-heading group-hover:text-accent-fg transition font-mono truncate">
                    {bm.title}
                  </h3>
                  <p className="text-[10px] text-gh-muted font-mono truncate">
                    {domain || bm.url}
                  </p>
                </div>
                <span className="gh-badge text-[9px] uppercase font-mono shrink-0">
                  {bm.category}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentBookmarks;
