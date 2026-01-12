/**
 * Returns the current date formatted as YYYY-MM-DD
 */
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Returns the last day of the current month as YYYY-MM-DD
 */
export const getEndOfMonthString = (): string => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return lastDay.toISOString().split('T')[0];
};

/**
 * Calculates days remaining between today (inclusive) and target date
 */
export const calculateDaysRemaining = (targetDateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // If target is today, we count it as 1 day left to read (implied 0+ days range)
  // Usually this is 0 difference in ms, so diffDays is 0.
  // We want to return non-negative logic for the math.
  return diffDays >= 0 ? diffDays : 0;
};

/**
 * Checks if the target date is strictly in the past (before today)
 */
export const isDateInPast = (targetDateStr: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);

  return target.getTime() < today.getTime();
};