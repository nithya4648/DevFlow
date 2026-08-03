import React from "react";

export const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-gh-border ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="gh-card p-4">
      <Skeleton className="h-4 w-1/3 mb-3 rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
};

export const ListSkeleton = ({ rows = 4 }) => {
  return (
    <div className="gh-card p-4">
      <Skeleton className="h-4 w-1/4 mb-4 rounded-md" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 rounded-md shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-2.5 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;
