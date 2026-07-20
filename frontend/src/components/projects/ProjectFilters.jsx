// frontend/src/components/projects/ProjectFilters.jsx
import { useRef } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "All Priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function ProjectFilters({ filters, onChange }) {
  const searchTimer = useRef(null);

  function handleSearch(e) {
    const value = e.target.value;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      onChange({ ...filters, search: value });
    }, 350);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          defaultValue={filters.search || ""}
          onChange={handleSearch}
          placeholder="Search projects…"
          className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
        />
      </div>

      {/* Status */}
      <select
        value={filters.status || ""}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="py-2 px-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>
        ))}
      </select>

      {/* Priority */}
      <select
        value={filters.priority || ""}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        className="py-2 px-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
      >
        {PRIORITY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>
        ))}
      </select>

      {/* Clear button */}
      {(filters.search || filters.status || filters.priority) && (
        <button
          onClick={() => onChange({ search: "", status: "", priority: "" })}
          className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
  );
}
