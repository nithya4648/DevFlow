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
    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Projects</h3>
        <span className="text-xs text-indigo-500 font-semibold cursor-pointer hover:underline">View All</span>
      </div>
      <div className="space-y-4">
        {list.map((proj) => (
          <div
            key={proj.id}
            className="group flex flex-col justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all duration-300 hover:border-indigo-500/30 hover:bg-indigo-50/5 dark:border-gray-800/60 dark:bg-gray-950/20 dark:hover:border-indigo-500/20 dark:hover:bg-indigo-500/5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500 dark:bg-indigo-500/20">
                  <FaCode className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-400 transition">
                    {proj.name}
                  </h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                    {proj.language}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition duration-300">
                <button className="text-gray-400 hover:text-white">
                  <FaGithub className="h-3.5 w-3.5" />
                </button>
                <button className="text-gray-400 hover:text-white">
                  <FaExternalLinkAlt className="h-3 w-3" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {proj.description}
            </p>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                <span>★ {proj.stars}</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                  proj.status === "active"
                    ? "bg-green-500/10 text-green-500 border border-green-500/25"
                    : proj.status === "completed"
                    ? "bg-blue-500/10 text-blue-500 border border-blue-500/25"
                    : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/25"
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
