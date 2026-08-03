import React from "react";

export const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800/70 ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/50">
      <Skeleton className="h-5 w-1/3 mb-4 rounded-sm" />
      <div className="space-y-2.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </div>
  );
};

export const ListSkeleton = ({ rows = 4 }) => {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/50">
      <Skeleton className="h-5 w-1/4 mb-5 rounded-sm" />
      <div className="space-y-3.5">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3.5">
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;
