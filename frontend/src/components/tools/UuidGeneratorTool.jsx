// src/components/tools/UuidGeneratorTool.jsx
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ToolCard from "./ToolCard";
import CopyButton from "./CopyButton";
import { FaPlus, FaTrash, FaSyncAlt } from "react-icons/fa";

export default function UuidGeneratorTool() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState(() => Array.from({ length: 5 }, () => uuidv4()));
  const [uppercase, setUppercase] = useState(false);

  const generate = () => {
    setUuids(Array.from({ length: count }, () => uuidv4()));
  };

  const display = (id) => (uppercase ? id.toUpperCase() : id);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <ToolCard title="Options">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Count:</label>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.min(50, Math.max(1, Number(e.target.value))))}
              className="w-20 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-center text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 outline-none"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setUppercase(!uppercase)}
              className={`relative h-5 w-10 rounded-full transition-colors ${uppercase ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-700"}`}
            >
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${uppercase ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Uppercase</span>
          </label>
          <button
            onClick={generate}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-600 transition"
          >
            <FaSyncAlt className="h-3 w-3" />
            Regenerate
          </button>
        </div>
      </ToolCard>

      {/* UUID List */}
      <ToolCard
        title={`${uuids.length} UUID${uuids.length !== 1 ? "s" : ""} (v4)`}
        actions={<CopyButton text={uuids.map(display).join("\n")} label="Copy All" />}
      >
        <div className="space-y-2">
          {uuids.map((id, i) => (
            <div
              key={id}
              className="group flex items-center justify-between gap-4 rounded-xl bg-gray-50 dark:bg-gray-950/50 px-4 py-2.5 hover:bg-indigo-500/5 transition"
            >
              <span className="text-xs text-gray-400 dark:text-gray-600 w-5">{i + 1}</span>
              <code className="flex-1 text-xs font-mono text-gray-700 dark:text-gray-300 tracking-wider">
                {display(id)}
              </code>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                <CopyButton text={display(id)} />
                <button
                  onClick={() => setUuids(uuids.filter((_, j) => j !== i))}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 transition"
                >
                  <FaTrash className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </ToolCard>
    </div>
  );
}
