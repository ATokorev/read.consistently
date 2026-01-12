import React from 'react';
import '../types';

interface ProgressBarProps {
  percentage: number;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, label }) => {
  // Clamp percentage between 0 and 100
  const validPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        {label && <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{label}</span>}
        <span className="text-xs font-mono font-medium text-neutral-900 dark:text-neutral-100">{Math.round(validPercentage)}%</span>
      </div>
      <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-black dark:bg-white h-2 rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${validPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;