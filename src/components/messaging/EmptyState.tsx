"use client";

interface Props {
  title: string;
  subtitle?: string;
}

const EmptyState = ({ title, subtitle }: Props) => {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="text-center">
        <div className="text-gray-300 text-sm">{title}</div>
        {subtitle && <div className="text-gray-500 text-xs mt-1">{subtitle}</div>}
      </div>
    </div>
  );
};

export default EmptyState;