import React from "react";
import { Link } from "react-router-dom";
import { FaCode } from "react-icons/fa";
import { useProjects } from "../../hooks/useProjects";

export const RecentProjects = () => {
  const { data, isLoading } = useProjects();
  const rawProjects = data?.data || [];

  const list = [...rawProjects]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5);

  return (
    <div className="gh-card p-4 font-ui">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gh-border">
        <h2 className="text-sm font-bold text-gh-heading font-mono">Recent Projects</h2>
        <Link to="/projects" className="text-xs text-accent-blue font-mono hover:underline">
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-16 animate-pulse rounded-md bg-gh-surface border border-gh-border" />
          <div className="h-16 animate-pulse rounded-md bg-gh-surface border border-gh-border" />
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-xs text-gh-muted font-mono mb-3">No projects yet — create your first one</p>
          <Link to="/projects" className="btn-primary text-xs font-mono">
            + Go to Projects
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((proj) => (
            <Link
              key={proj._id}
              to="/projects"
              className="group flex flex-col justify-between gap-2 rounded-md border border-gh-border bg-gh-bg p-3 transition-colors hover:border-accent-border hover:bg-gh-subtle block"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-md bg-accent-light p-1.5 text-accent-fg border border-accent-border shrink-0">
                    <FaCode className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-gh-heading group-hover:text-accent-fg transition font-mono">
                      {proj.title}
                    </h3>
                    <span className="text-[10px] uppercase font-mono font-medium text-gh-muted">
                      {proj.priority || "Normal"} Priority
                    </span>
                  </div>
                </div>
              </div>
              {proj.description && (
                <p className="text-xs text-gh-muted line-clamp-2 font-mono">
                  {proj.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1 text-[10px] font-mono text-gh-muted">
                  <span>Updated {new Date(proj.updatedAt || proj.createdAt).toLocaleDateString()}</span>
                </div>
                <span
                  className={`gh-badge text-[10px] ${
                    proj.status === "in-progress" || proj.status === "active"
                      ? "border-accent-border bg-accent-light text-accent-fg"
                      : proj.status === "done" || proj.status === "completed"
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {proj.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentProjects;
