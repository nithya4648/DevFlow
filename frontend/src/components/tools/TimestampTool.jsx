// src/components/tools/TimestampTool.jsx
import { useState } from "react";
import ToolCard from "./ToolCard";
import CopyButton from "./CopyButton";
import { FaClock } from "react-icons/fa";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];

export default function TimestampTool() {
  const [unix, setUnix] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [humanInput, setHumanInput] = useState(() => new Date().toISOString().slice(0, 16));
  const [timezone, setTimezone] = useState("UTC");
  const [activeTab, setActiveTab] = useState("unix-to-human");

  const now = () => {
    const t = Math.floor(Date.now() / 1000);
    setUnix(String(t));
  };

  // unix -> human
  const fromUnix = () => {
    const ts = Number(unix);
    if (isNaN(ts)) return "Invalid timestamp";
    return new Date(ts * 1000).toLocaleString("en-US", { timeZone: timezone, hour12: false });
  };

  const fromUnixISO = () => {
    const ts = Number(unix);
    if (isNaN(ts)) return "—";
    return new Date(ts * 1000).toISOString();
  };

  // human -> unix
  const toUnix = () => {
    const d = new Date(humanInput);
    if (isNaN(d.getTime())) return "Invalid date";
    return String(Math.floor(d.getTime() / 1000));
  };

  return (
    <div className="space-y-4 font-ui">
      {/* Tab */}
      <div className="inline-flex rounded-md border border-gh-border bg-gh-subtle p-0.5">
        {[
          { key: "unix-to-human", label: "Unix → Human" },
          { key: "human-to-unix", label: "Human → Unix" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-sm px-4 py-1.5 text-xs font-mono font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-gh-surface text-gh-heading border border-gh-border"
                : "text-gh-muted hover:text-gh-heading"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timezone */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-mono font-medium text-gh-muted">Timezone:</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="gh-input text-xs font-mono py-1 px-2"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz} className="bg-gh-surface">{tz}</option>
          ))}
        </select>
      </div>

      {activeTab === "unix-to-human" ? (
        <div className="space-y-4">
          <ToolCard title="Unix Timestamp (seconds)">
            <div className="flex gap-2">
              <input
                type="text"
                value={unix}
                onChange={(e) => setUnix(e.target.value)}
                className="gh-input flex-1 text-xs font-mono"
              />
              <button
                onClick={now}
                className="btn-secondary text-xs font-mono"
              >
                <FaClock className="h-3 w-3" />
                Now
              </button>
            </div>
          </ToolCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToolCard title="Local Date & Time" actions={<CopyButton text={fromUnix()} />}>
              <p className="text-base font-bold text-gh-heading font-mono">{fromUnix()}</p>
              <p className="text-xs text-gh-muted font-mono mt-1">{timezone}</p>
            </ToolCard>
            <ToolCard title="ISO 8601" actions={<CopyButton text={fromUnixISO()} />}>
              <p className="text-base font-bold text-gh-heading font-mono break-all">{fromUnixISO()}</p>
              <p className="text-xs text-gh-muted font-mono mt-1">UTC</p>
            </ToolCard>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <ToolCard title="Date / Time Input">
            <input
              type="datetime-local"
              value={humanInput}
              onChange={(e) => setHumanInput(e.target.value)}
              className="gh-input text-xs font-mono"
            />
          </ToolCard>
          <ToolCard title="Unix Timestamp" actions={<CopyButton text={toUnix()} />}>
            <p className="text-xl font-bold text-accent-fg font-mono">{toUnix()}</p>
            <p className="text-xs text-gh-muted font-mono mt-1">seconds since epoch</p>
          </ToolCard>
        </div>
      )}
    </div>
  );
}
