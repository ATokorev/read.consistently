import React from 'react';
import { BookData } from '../types';
import { calculateBookStats } from '../utils/calculations';
import ProgressBar from './ProgressBar';
import { BookOpenIcon, ChevronRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DashboardCardProps {
  book: BookData;
  onClick: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ book, onClick }) => {
  const stats = React.useMemo(() => calculateBookStats(book), [book]);

  const isFinished = stats.pagesRemaining <= 0;
  const isNotStarted = book.currentPage === 0;

  return (
    <div 
      onClick={onClick}
      className="group bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:border-black dark:hover:border-white transition-colors duration-200 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-lg text-black dark:text-white line-clamp-1 pr-4 tracking-tight">
            {book.title || 'Untitled Book'}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
             {stats.isTargetDateInPast && !isFinished ? (
               <span className="text-neutral-800 dark:text-neutral-200 flex items-center gap-1 font-medium">
                 <ExclamationTriangleIcon className="w-3 h-3" /> Date passed
               </span>
             ) : (
                isFinished ? 'Completed' : `Target: ${new Date(book.targetDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}`
             )}
          </p>
        </div>
        <div className={`p-2 rounded-full ${isFinished ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white'}`}>
           <BookOpenIcon className="w-5 h-5" />
        </div>
      </div>

      <div className="mb-6">
        <ProgressBar percentage={stats.percentComplete} />
      </div>

      <div className="flex items-end justify-between border-t border-neutral-100 dark:border-neutral-800 pt-4">
        <div>
           {isFinished ? (
             <span className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">Done</span>
           ) : isNotStarted ? (
             <div className="flex flex-col">
               <span className="text-lg font-bold text-neutral-400 dark:text-neutral-500">Not Started</span>
               <span className="text-xs text-neutral-400 dark:text-neutral-600 uppercase font-semibold">Begin Journey</span>
             </div>
           ) : (
             <div className="flex flex-col">
               <span className="text-2xl font-bold text-black dark:text-white tracking-tight">
                 {stats.pagesPerDay}
               </span>
               <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-semibold">Pages / Day</span>
             </div>
           )}
        </div>
        <button className="text-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DashboardCard;