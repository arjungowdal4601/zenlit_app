"use client";

interface Props { label: string }

const DayDivider = ({ label }: Props) => {
  return (
    <div className="flex items-center my-4">
      <div className="flex-1 h-px bg-slate-800" />
      <div className="mx-3 text-xs text-gray-400 border border-slate-800 rounded-full px-3 py-1 bg-black/60" style={{ fontFamily: 'var(--font-inter)' }}>
        {label}
      </div>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  );
};

export default DayDivider;