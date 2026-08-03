import React from "react";
import { Link } from "react-router-dom";
import { FaCode } from "react-icons/fa";
import { useSnippets } from "../../hooks/useSnippets";

export const RecentSnippets = () => {
  const { data, isLoading } = useSnippets();
  const rawSnippets = data?.data || [];

  const list = [...rawSnippets]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5);

  return (
    <div className="gh-card p-4 font-ui">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gh-border">
        <h2 className="text-sm font-bold text-gh-heading font-mono">Recent Snippets</h2>
        <Link to="/snippets" className="text-xs text-accent-blue font-mono hover:underline">
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
          <p className="text-xs text-gh-muted font-mono mb-3">No code snippets saved yet</p>
          <Link to="/snippets" className="btn-primary text-xs font-mono">
            + Go to Snippets
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {list.map((snippet) => (
            <Link
              key={snippet._id}
              to={`/snippets?open=${snippet._id}`}
              className="group flex items-start gap-2.5 rounded-md border border-gh-border bg-gh-bg p-2.5 transition-colors hover:border-accent-border hover:bg-gh-subtle block"
            >
              <span className="rounded-md bg-sky-400/10 p-1.5 text-sky-400 border border-sky-400/20 shrink-0 mt-0.5">
                <FaCode className="h-3 w-3" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-gh-heading group-hover:text-accent-fg transition font-mono truncate">
                  {snippet.title}
                </h3>
                <p className="text-[10px] text-gh-muted font-mono truncate">
                  {snippet.language} • {snippet.code?.split("\n").length || 1} lines
                </p>
              </div>
              {snippet.folder && (
                <span className="gh-badge text-[9px] uppercase font-mono shrink-0">
                  {snippet.folder}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentSnippets;
