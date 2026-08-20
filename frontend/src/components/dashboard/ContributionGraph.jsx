import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../../services/analytics.service";

const LEVEL_COLORS = [
  "bg-gh-subtle border border-gh-border",           // 0 activities
  "bg-accent-light border border-accent-border",     // 1-2
  "bg-accent/50 border border-accent-border",        // 3-4
  "bg-accent border border-accent-border",           // 5-6
  "bg-accent-fg border border-accent-border",        // 7+
];

function levelFor(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

export const ContributionGraph = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "contributions"],
    queryFn: () => analyticsService.getContributions(365),
  });

  const contributions = data?.contributions || [];

  const { weeks, monthLabels, total } = useMemo(() => {
    if (!contributions.length) return { weeks: [], monthLabels: [], total: 0 };

    const total = contributions.reduce((sum, d) => sum + d.count, 0);

    // Pad the front so the grid starts on a Sunday, matching GitHub's layout
    const first = new Date(contributions[0].date + "T00:00:00");
    const padDays = first.getDay(); // 0 = Sunday
    const padded = [
      ...Array.from({ length: padDays }, () => null),
      ...contributions,
    ];

    const weeks = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }

    // One label per week where a new month starts
    const monthLabels = weeks.map((week) => {
      const firstDay = week.find((d) => d !== null);
      if (!firstDay) return "";
      const date = new Date(firstDay.date + "T00:00:00");
      return date.getDate() <= 7 ? date.toLocaleDateString(undefined, { month: "short" }) : "";
    });

    return { weeks, monthLabels, total };
  }, [contributions]);

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-md bg-gh-surface border border-gh-border" />;
  }

  return (
    <div className="gh-card p-4 font-ui overflow-x-auto">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gh-border">
        <h2 className="text-xs font-mono font-bold text-gh-heading">
          {total} activities in the last year
        </h2>
      </div>

      <div className="inline-flex flex-col gap-1 min-w-max">
        <div className="flex gap-[3px] pl-8">
          {monthLabels.map((label, idx) => (
            <div key={idx} className="w-[11px] text-[10px] font-mono text-gh-muted">
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-[3px]">
          <div className="flex flex-col gap-[3px] pr-1 justify-between text-[10px] font-mono text-gh-muted w-7">
            <span>Sun</span>
            <span>Tue</span>
            <span>Thu</span>
            <span>Sat</span>
          </div>

          <div className="flex gap-[3px]">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3px]">
                {week.map((day, dIdx) =>
                  day ? (
                    <div
                      key={dIdx}
                      title={`${day.count} ${day.count === 1 ? "activity" : "activities"} on ${day.date}`}
                      className={`w-[11px] h-[11px] rounded-sm ${LEVEL_COLORS[levelFor(day.count)]}`}
                    />
                  ) : (
                    <div key={dIdx} className="w-[11px] h-[11px]" />
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 mt-1 pl-8">
          <span className="text-[10px] font-mono text-gh-muted mr-1">Less</span>
          {LEVEL_COLORS.map((c, i) => (
            <div key={i} className={`w-[11px] h-[11px] rounded-sm ${c}`} />
          ))}
          <span className="text-[10px] font-mono text-gh-muted ml-1">More</span>
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;
