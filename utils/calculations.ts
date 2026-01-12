import { BookData, CalculationResult } from '../types';
import { calculateDaysRemaining, isDateInPast } from './dateHelpers';

export const calculateBookStats = (book: BookData): CalculationResult => {
  const pagesRemaining = Math.max(0, book.totalPages - book.currentPage);
  const daysRemaining = calculateDaysRemaining(book.targetDate);
  const isTargetDateInPast = isDateInPast(book.targetDate);
  
  let pagesPerDay = 0;
  if (daysRemaining > 0) {
    pagesPerDay = Math.ceil(pagesRemaining / daysRemaining);
  } else if (pagesRemaining > 0 && !isTargetDateInPast) {
    pagesPerDay = pagesRemaining;
  }

  const percentComplete = book.totalPages > 0 
    ? (book.currentPage / book.totalPages) * 100 
    : 0;

  return {
    pagesRemaining,
    daysRemaining,
    pagesPerDay,
    percentComplete,
    isOnTrack: pagesRemaining === 0,
    isTargetDateInPast
  };
};

export const calculateTargetPage = (book: BookData, stats: CalculationResult): number => {
  return Math.min(book.totalPages, book.currentPage + stats.pagesPerDay);
};
