export interface BookData {
  id: string;
  title: string;
  totalPages: number;
  currentPage: number;
  targetDate: string; // YYYY-MM-DD
}

export interface CalculationResult {
  pagesRemaining: number;
  daysRemaining: number;
  pagesPerDay: number;
  percentComplete: number;
  isOnTrack: boolean;
  isTargetDateInPast: boolean;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
