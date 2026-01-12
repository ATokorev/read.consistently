import React from 'react';
import '../types';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChange(!checked)}>
      <div 
        className={`relative w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out ${
          checked ? 'bg-green-500' : 'bg-neutral-200 dark:bg-neutral-700'
        }`}
      >
        <div
          className={`bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </div>
      {label && (
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 select-none">
          {label}
        </span>
      )}
    </div>
  );
};

export default Toggle;