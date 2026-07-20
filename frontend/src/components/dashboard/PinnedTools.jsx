import React from "react";
import { FaTerminal, FaPlay, FaRegFileCode, FaEye } from "react-icons/fa";

export const PinnedTools = ({ tools }) => {
  const defaultTools = [
    {
      id: 1,
      name: "JSON Formatter",
      category: "Formatter",
      description: "Pretty print and validate JSON structures.",
      icon: FaRegFileCode,
    },
    {
      id: 2,
      name: "Base64 Encoder",
      category: "Encoder",
      description: "Convert strings to base64 strings.",
      icon: FaTerminal,
    },
    {
      id: 3,
      name: "RegEx Sandbox",
      category: "Validator",
      description: "Test regular expressions against target strings.",
      icon: FaPlay,
    },
    {
      id: 4,
      name: "JWT Inspector",
      category: "Security",
      description: "Decode and inspect JSON Web Token values.",
      icon: FaEye,
    },
  ];

  const list = tools || defaultTools;

  return (
    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Pinned Dev Tools</h3>
        <span className="text-xs text-indigo-500 font-semibold cursor-pointer hover:underline">Customize</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.map((tool) => {
          const Icon = tool.icon || FaTerminal;
          return (
            <div
              key={tool.id}
              className="group cursor-pointer rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all duration-300 hover:border-indigo-500/30 hover:bg-indigo-50/5 dark:border-gray-800/60 dark:bg-gray-950/20 dark:hover:border-indigo-500/20 dark:hover:bg-indigo-500/5"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500 transition group-hover:bg-indigo-500/20 group-hover:scale-110">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-400 transition">
                    {tool.name}
                  </h4>
                  <span className="text-[10px] text-indigo-500 dark:text-indigo-400/80 font-bold uppercase tracking-wider">
                    {tool.category}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {tool.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PinnedTools;
