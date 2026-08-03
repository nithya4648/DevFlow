import React from "react";
import { FaCode, FaGithub, FaExternalLinkAlt } from "react-icons/fa";

export const RecentProjects = ({ projects }) => {
  const defaultProjects = [
    {
      id: 1,
      name: "SaaS Billing Engine",
      description: "Node.js + Stripe recurring payment processor integration microservice.",
      language: "JavaScript",
      stars: 12,
      status: "active",
    },
    {
      id: 2,
      name: "DevFlow Extension",
      description: "VS Code sidebar utility to quickly view task boards and bookmarks.",
      language: "TypeScript",
      stars: 45,
      status: "completed",
    },
    {
      id: 3,
      name: "Docker Compose Configs",
      description: "Curated compose templates for microservices development setups.",
      language: "YAML",
      stars: 89,
      status: "planning",
    },
  ];

  const list = projects || defaultProjects;

  return (
    <div className="gh-card p-4 font-ui">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gh-border">
        <h2 className="text-sm font-bold text-gh-heading font-mono">Recent Projects</h2>
        <span className="text-xs text-accent-blue font-mono cursor-pointer hover:underline">View All</span>
      </div>
      <div className="space-y-3">
        {list.map((proj) => (
          <div
            key={proj.id}
            className="group flex flex-col justify-between gap-2 rounded-md border border-gh-border bg-gh-bg p-3 transition-colors hover:border-accent-border hover:bg-gh-subtle"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="rounded-md bg-accent-light p-1.5 text-accent-fg border border-accent-border shrink-0">
                  <FaCode className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-gh-heading group-hover:text-accent-fg transition font-mono">
                    {proj.name}
                  </h3>
                  <span className="text-[10px] uppercase font-mono font-medium text-gh-muted">
                    {proj.language}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button className="text-gh-muted hover:text-gh-heading">
                  <FaGithub className="h-3.5 w-3.5" />
                </button>
                <button className="text-gh-muted hover:text-gh-heading">
                  <FaExternalLinkAlt className="h-3 w-3" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gh-muted line-clamp-2 font-mono">
              {proj.description}
            </p>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1 text-xs font-mono text-gh-muted">
                <span>★ {proj.stars}</span>
              </div>
              <span
                className={`gh-badge text-[10px] ${
                  proj.status === "active"
                    ? "border-accent-border bg-accent-light text-accent-fg"
                    : proj.status === "completed"
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                }`}
              >
                {proj.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentProjects;
