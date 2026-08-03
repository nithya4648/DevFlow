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
    <div className="gh-card p-4 font-ui">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gh-border">
        <h2 className="text-sm font-bold text-gh-heading font-mono">Pinned Dev Tools</h2>
        <span className="text-xs text-accent-blue font-mono cursor-pointer hover:underline">Customize</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.map((tool) => {
          const Icon = tool.icon || FaTerminal;
          return (
            <div
              key={tool.id}
              className="group cursor-pointer rounded-md border border-gh-border bg-gh-bg p-3 transition-colors hover:border-accent-border hover:bg-gh-subtle"
            >
              <div className="flex items-center gap-2.5">
                <span className="rounded-md bg-accent-light p-1.5 text-accent-fg border border-accent-border shrink-0">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-gh-heading group-hover:text-accent-fg transition truncate font-mono">
                    {tool.name}
                  </h3>
                  <span className="text-[10px] text-gh-muted font-mono font-medium uppercase">
                    {tool.category}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-gh-muted line-clamp-2 font-mono">
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
