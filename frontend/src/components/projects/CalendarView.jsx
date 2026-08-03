import { useState } from "react";

const STATUS_DOT = {
  "todo":        "bg-slate-400",
  "in-progress": "bg-teal-500",
  "done":        "bg-emerald-500",
};

const PRIORITY_COLOR = {
  high:   "border-l-rose-500",
  medium: "border-l-amber-500",
  low:    "border-l-emerald-500",
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
    <div className="bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
          {monthName} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="bg-slate-50 dark:bg-slate-950/60 h-24" />;

          const dayStr = String(day).padStart(2, "0");
          const monthStr = String(month + 1).padStart(2, "0");
          const dateKey = `${year}-${monthStr}-${dayStr}`;
          const dayProjects = byDate[dateKey] || [];
          const isToday = dateKey === todayKey;

          return (
            <div
              key={dateKey}
              className={`bg-white dark:bg-slate-900 min-h-[96px] p-1.5 flex flex-col transition ${
                isToday ? "ring-2 ring-emerald-500/60 inset-0 z-10" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`font-mono text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center ${
                    isToday
                      ? "bg-emerald-600 text-white"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {day}
                </span>
                {dayProjects.length > 0 && (
                  <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-slate-500">
                    {dayProjects.length}
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-1 overflow-y-auto max-h-[70px]">
                {dayProjects.map((p) => {
                  const borderCls = PRIORITY_COLOR[p.priority] || "border-l-slate-400";
                  const dotCls = STATUS_DOT[p.status] || "bg-slate-400";
                  return (
                    <button
                      key={p._id}
                      onClick={() => onEdit(p)}
                      className={`w-full text-left p-1 rounded text-[11px] bg-slate-50 dark:bg-slate-800/80 border-l-2 ${borderCls} hover:bg-slate-100 dark:hover:bg-slate-800 transition truncate flex items-center gap-1.5`}
                      title={p.title}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls}`} />
                      <span className="truncate text-slate-800 dark:text-slate-200 font-medium">
                        {p.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
