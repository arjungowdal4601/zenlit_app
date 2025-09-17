"use client";

interface Props { count?: number }

const SkeletonRows = ({ count = 6 }: Props) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-3 px-3 py-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 bg-slate-800 rounded animate-pulse" />
            <div className="h-3 w-1/3 bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonRows;