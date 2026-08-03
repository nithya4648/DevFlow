import { useState } from "react";

const STATUS_DOT = {
  "todo":        "bg-gh-muted",
  "in-progress": "bg-accent-blue",
  "done":        "bg-accent-fg",
};

const PRIORITY_BORDER = {
  high:   "border-l-red-500",
  medium: "border-l-amber-500",
  low:    "border-l-accent-fg",
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
    <div className="gh-card p-4 font-ui">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="btn-secondary p-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-sm font-mono font-bold text-gh-heading">
          {monthName} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="btn-secondary p-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1 border-b border-gh-border pb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center font-mono text-[10px] font-semibold uppercase tracking-wider text-gh-muted py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-gh-border rounded-md overflow-hidden border border-gh-border">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="bg-gh-bg min-h-[84px]" />;

          const dayStr = String(day).padStart(2, "0");
          const monthStr = String(month + 1).padStart(2, "0");
          const dateKey = `${year}-${monthStr}-${dayStr}`;
          const dayProjects = byDate[dateKey] || [];
          const isToday = dateKey === todayKey;

          return (
            <div
              key={dateKey}
              className={`bg-gh-surface min-h-[84px] p-1.5 flex flex-col transition ${
                isToday ? "ring-1 ring-inset ring-accent-border bg-accent-light" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`font-mono text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center ${
                    isToday
                      ? "bg-accent text-white"
                      : "text-gh-muted"
                  }`}
                >
                  {day}
                </span>
                {dayProjects.length > 0 && (
                  <span className="font-mono text-[9px] font-bold text-gh-muted">
                    {dayProjects.length}
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-0.5 overflow-y-auto max-h-[60px]">
                {dayProjects.map((p) => {
                  const borderCls = PRIORITY_BORDER[p.priority] || "border-l-gh-muted";
                  const dotCls = STATUS_DOT[p.status] || "bg-gh-muted";
                  return (
                    <button
                      key={p._id}
                      onClick={() => onEdit(p)}
                      className={`w-full text-left p-1 rounded text-[10px] bg-gh-bg border-l-2 ${borderCls} hover:bg-gh-subtle transition truncate flex items-center gap-1.5 font-mono`}
                      title={p.title}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls}`} />
                      <span className="truncate text-gh-text font-medium">
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
