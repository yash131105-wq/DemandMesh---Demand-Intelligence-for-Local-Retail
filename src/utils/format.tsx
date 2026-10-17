import React from 'react';

/**
 * Universal SVG Rupee symbol that renders with 100% precision across all OS/Linux headless environments
 */
export const RupeeSign: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5 inline-block -mt-0.5' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    aria-label="INR"
  >
    <path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3a4 4 0 0 0 0-8" />
  </svg>
);

export function formatNumber(amount: number): string {
  return Math.abs(amount).toLocaleString('en-IN');
}
