// frontend/src/components/projects/CalendarView.jsx
import { useState } from "react";

const STATUS_DOT = {
  "todo":        "bg-gray-400",
  "in-progress": "bg-indigo-400",
  "done":        "bg-emerald-400",
};

const PRIORITY_COLOR = {
  high:   "border-l-red-400",
  medium: "border-l-amber-400",
  low:    "border-l-emerald-400",
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarView({ projects, onEdit }) {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const { year, month } = current;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const monthName = new Date(year, month).toLocaleString("default", { month: "long" });

  // Build map: "YYYY-MM-DD" -> projects[]
  const byDate = {};
  projects.forEach((p) => {
    if (!p.deadline) return;
    const d = new Date(p.deadline);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(p);
  });

  function prevMonth() {
    setCurrent(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  }

  function nextMonth() {
    setCurrent(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );
  }

  // Build grid: leading empty cells + day cells
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="bg-white/3 dark:bg-gray-900/40 rounded-2xl border border-white/10 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-semibold text-gray-100">
          {monthName} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="bg-gray-950/40 h-24" />;

          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayProjects = byDate[dateKey] || [];
          const isToday = dateKey === todayKey;

          return (
            <div
              key={dateKey}
              className={`bg-gray-950/40 dark:bg-gray-900/60 h-24 p-1.5 flex flex-col ${
                isToday ? "ring-1 ring-inset ring-indigo-500/60" : ""
              }`}
            >
              <span
                className={`text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full mb-1 ${
                  isToday
                    ? "bg-indigo-500 text-white"
                    : "text-gray-400"
                }`}
              >
                {day}
              </span>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayProjects.slice(0, 2).map((p) => (
                  <button
                    key={p._id}
                    onClick={() => onEdit(p)}
                    className={`text-[10px] text-left px-1.5 py-0.5 rounded bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 border-l-2 ${PRIORITY_COLOR[p.priority] || "border-l-gray-400"} truncate transition-colors`}
                    title={p.title}
                  >
                    {p.title}
                  </button>
                ))}
                {dayProjects.length > 2 && (
                  <span className="text-[9px] text-gray-500 px-1">
                    +{dayProjects.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 justify-end">
        {Object.entries(STATUS_DOT).map(([status, cls]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${cls}`} />
            <span className="text-xs text-gray-500 capitalize">{status.replace("-", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
