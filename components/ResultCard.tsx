import React from 'react';
import { BookData, CalculationResult, LoadingState } from '../types';
import ProgressBar from './ProgressBar';
import { generateMotivation } from '../services/geminiService';
import { SparklesIcon, BookOpenIcon, CalendarIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ResultCardProps {
  stats: CalculationResult;
  bookData: BookData;
}

const ResultCard: React.FC<ResultCardProps> = ({ stats, bookData }) => {
  const [motivation, setMotivation] = React.useState<string | null>(null);
  const [loadingState, setLoadingState] = React.useState<LoadingState>(LoadingState.IDLE);

  // Debounce the AI call
  React.useEffect(() => {
    if (bookData.title && stats.pagesPerDay > 0 && !stats.isTargetDateInPast) {
      setLoadingState(LoadingState.LOADING);
      const timer = setTimeout(async () => {
        try {
          const text = await generateMotivation(bookData, stats);
          setMotivation(text);
          setLoadingState(LoadingState.SUCCESS);
        } catch (e) {
          setLoadingState(LoadingState.ERROR);
        }
      }, 1000); 

      return () => clearTimeout(timer);
    }
  }, [bookData.title, bookData.totalPages, bookData.currentPage, stats.pagesPerDay, stats.isTargetDateInPast]);

  const isFinished = stats.pagesRemaining <= 0;
  
  if (isFinished) {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold text-black dark:text-white mb-2">🎉 You finished the book!</h3>
        <p className="text-neutral-600 dark:text-neutral-400">Great job completing {bookData.title || 'your book'}. Time to pick the next one!</p>
      </div>
    );
  }

  if (stats.isTargetDateInPast) {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <ExclamationTriangleIcon className="w-12 h-12 text-black dark:text-white" />
        </div>
        <h3 className="text-xl font-bold text-black dark:text-white mb-2">Goal Date Passed</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          The date you selected has already passed. Please update your goal date to receive an accurate reading plan.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between gap-8">
      <div className="space-y-8">
        
        {/* Main Hero Stat */}
        <div className="text-center pt-2">
          <p className="text-xs font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest mb-3">Daily Goal</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-8xl font-black text-black dark:text-white tracking-tighter">
              {stats.pagesPerDay}
            </span>
            <span className="text-xl font-medium text-neutral-500 dark:text-neutral-400">pages</span>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar percentage={stats.percentComplete} label="Current Progress" />

        {/* Grid Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center text-center">
            <BookOpenIcon className="w-6 h-6 text-black dark:text-white mb-2" />
            <span className="text-2xl font-bold text-black dark:text-white">{stats.pagesRemaining}</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-bold tracking-wider">Pages Left</span>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center text-center">
            <ClockIcon className="w-6 h-6 text-black dark:text-white mb-2" />
            <span className="text-2xl font-bold text-black dark:text-white">{stats.daysRemaining}</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-bold tracking-wider">Days Left</span>
          </div>
        </div>

        {/* AI Insight Section */}
        <div className="bg-neutral-100 dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 relative mt-2">
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-black px-3 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center gap-1">
              <SparklesIcon className="w-3.5 h-3.5 text-black dark:text-white" />
              <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">Insight</span>
           </div>
          <div className="min-h-[48px] flex items-center justify-center">
            {loadingState === LoadingState.LOADING ? (
              <div className="flex space-x-2 animate-pulse">
                <div className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-600 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-600 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-600 rounded-full"></div>
              </div>
            ) : motivation ? (
              <p className="text-neutral-800 dark:text-neutral-300 italic text-center text-sm leading-relaxed font-serif">"{motivation}"</p>
            ) : (
              <p className="text-neutral-400 dark:text-neutral-600 text-xs text-center">Enter book details to get started.</p>
            )}
          </div>
        </div>

      </div>
      
      {/* Footer Info */}
      <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-auto">
         <div className="flex items-center gap-1">
           <CalendarIcon className="w-4 h-4" />
           <span>Target: {new Date(bookData.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}</span>
         </div>
         <div className="font-medium uppercase tracking-wider">
            {stats.pagesPerDay > 50 ? 'High intensity' : 'Comfortable pace'}
         </div>
      </div>
    </div>
  );
};

export default ResultCard;