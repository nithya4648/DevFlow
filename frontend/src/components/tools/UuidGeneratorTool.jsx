// src/components/tools/UuidGeneratorTool.jsx
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ToolCard from "./ToolCard";
import CopyButton from "./CopyButton";
import { FaTrash, FaSyncAlt } from "react-icons/fa";

export default function UuidGeneratorTool() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState(() => Array.from({ length: 5 }, () => uuidv4()));
  const [uppercase, setUppercase] = useState(false);

  const generate = () => {
    setUuids(Array.from({ length: count }, () => uuidv4()));
  };

  const display = (id) => (uppercase ? id.toUpperCase() : id);

  return (
    <div className="space-y-4 font-ui">
      {/* Controls */}
      <ToolCard title="Options">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono font-medium text-gh-muted">Count:</label>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.min(50, Math.max(1, Number(e.target.value))))}
              className="w-16 gh-input text-xs font-mono text-center"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded border-gh-border text-accent-fg focus:ring-accent-border"
            />
            <span className="text-xs font-mono text-gh-muted">Uppercase</span>
          </label>
          <button
            onClick={generate}
            className="btn-primary text-xs font-mono ml-auto"
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
        <div className="space-y-1.5">
          {uuids.map((id, i) => (
            <div
              key={id}
              className="group flex items-center justify-between gap-3 rounded-md bg-gh-subtle border border-gh-border px-3 py-2 hover:border-accent-border transition-colors"
            >
              <span className="text-xs font-mono text-gh-muted w-5">{i + 1}</span>
              <code className="flex-1 text-xs font-mono text-gh-heading tracking-wider">
                {display(id)}
              </code>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton text={display(id)} />
                <button
                  onClick={() => setUuids(uuids.filter((_, j) => j !== i))}
                  className="rounded p-1 text-gh-muted hover:text-red-400 transition-colors"
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
