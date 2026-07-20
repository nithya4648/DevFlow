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
    <div className="space-y-4">
      {/* Tab */}
      <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
        {[
          { key: "unix-to-human", label: "Unix → Human" },
          { key: "human-to-unix", label: "Human → Unix" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-5 py-2 text-xs font-bold transition ${
              activeTab === tab.key
                ? "bg-indigo-500 text-white shadow"
                : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timezone */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Timezone:</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 outline-none"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </div>

      {activeTab === "unix-to-human" ? (
        <div className="space-y-4">
          <ToolCard title="Unix Timestamp (seconds)">
            <div className="flex gap-3">
              <input
                type="text"
                value={unix}
                onChange={(e) => setUnix(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-mono text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-200 transition"
              />
              <button
                onClick={now}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition"
              >
                <FaClock className="h-3 w-3" />
                Now
              </button>
            </div>
          </ToolCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToolCard title="Local Date & Time" actions={<CopyButton text={fromUnix()} />}>
              <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">{fromUnix()}</p>
              <p className="text-xs text-gray-400 mt-1">{timezone}</p>
            </ToolCard>
            <ToolCard title="ISO 8601" actions={<CopyButton text={fromUnixISO()} />}>
              <p className="text-lg font-bold text-gray-900 dark:text-white font-mono break-all">{fromUnixISO()}</p>
              <p className="text-xs text-gray-400 mt-1">UTC</p>
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
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-200 transition"
            />
          </ToolCard>
          <ToolCard title="Unix Timestamp" actions={<CopyButton text={toUnix()} />}>
            <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">{toUnix()}</p>
            <p className="text-xs text-gray-400 mt-1">seconds since epoch</p>
          </ToolCard>
        </div>
      )}
    </div>
  );
}
