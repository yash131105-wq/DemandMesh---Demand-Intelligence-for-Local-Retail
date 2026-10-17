import React from 'react';

interface DemoDataBadgeProps {
  label?: string;
  className?: string;
}

export const DemoDataBadge: React.FC<DemoDataBadgeProps> = ({ 
  label = 'DEMO DATA', 
  className = '' 
}) => {
  return (
    <span 
      className={`inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-slate-500 uppercase ${className}`}
      title="This figure is illustrative demonstration data for evaluation"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#0BA69C]/60" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
