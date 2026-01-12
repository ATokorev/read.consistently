import React from 'react';
import { ClockIcon, CheckBadgeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Toggle from './Toggle';
import '../types';

const PRESETS = [10, 15, 30, 45, 60];

interface ReadingTimerProps {
  isRunning: boolean;
  isPaused?: boolean;
  minimal?: boolean;
  isCountdownMode: boolean;
  setIsCountdownMode: (mode: boolean) => void;
  duration: number; // in minutes
  setDuration: (mins: number) => void;
}

// Sub-component for animating individual digits
const AnimatedDigit = ({ char, className }: { char: string, className?: string }) => {
  const isNumber = /[0-9]/.test(char);
  
  // If not a number, just render the character (like :)
  if (!isNumber) {
    return <span className={`inline-block text-neutral-400 dark:text-neutral-600 ${className}`}>{char}</span>;
  }

  // Slot machine animation
  // We render a column of numbers 0-9 and translate Y based on the current digit
  return (
    <div className={`relative overflow-hidden inline-flex flex-col h-[1em] w-[0.6em] items-center align-top ${className}`}>
       <div 
         className="flex flex-col transition-transform duration-500 ease-in-out will-change-transform" 
         style={{ transform: `translateY(-${parseInt(char) * 10}%)` }}
       >
          {[0,1,2,3,4,5,6,7,8,9].map(n => (
            <span key={n} className="h-[1em] flex items-center justify-center leading-none">{n}</span>
          ))}
       </div>
    </div>
  );
}

const TimeDisplay = ({ timeStr, sizeClass }: { timeStr: string, sizeClass: string }) => {
  return (
    <div className={`flex justify-center font-mono font-bold tracking-tight leading-none text-black dark:text-white ${sizeClass}`}>
      {timeStr.split('').map((char, i) => (
        <AnimatedDigit key={i} char={char} />
      ))}
    </div>
  );
}

const ReadingTimer: React.FC<ReadingTimerProps> = ({ 
  isRunning, 
  isPaused = false,
  minimal = false,
  isCountdownMode, 
  setIsCountdownMode,
  duration,
  setDuration
}) => {
  // Internal State for running values
  const [timeLeft, setTimeLeft] = React.useState(duration * 60);
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [initialTime, setInitialTime] = React.useState(duration * 60);
  const [isFinished, setIsFinished] = React.useState(false);
  const [customMinutes, setCustomMinutes] = React.useState('');
  
  // Audio context ref for the "ding"
  const audioContextRef = React.useRef<AudioContext | null>(null);

  // Sync internal duration state when props change (only if not running)
  React.useEffect(() => {
    if (!isRunning) {
      setInitialTime(duration * 60);
      setTimeLeft(duration * 60);
      setElapsedTime(0);
      setIsFinished(false);
    }
  }, [duration, isRunning]);

  // Timer Logic
  React.useEffect(() => {
    let interval: any = null;

    // Only run if active, not paused, and not finished
    if (isRunning && !isPaused && !isFinished) {
      interval = setInterval(() => {
        if (isCountdownMode) {
          setTimeLeft((prev) => {
            if (prev <= 1) {
               finishTimer();
               return 0;
            }
            return prev - 1;
          });
        } else {
          setElapsedTime((prev) => prev + 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, isCountdownMode, isFinished]);

  const playNotificationSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(500, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const finishTimer = () => {
    setIsFinished(true);
    playNotificationSound();
  };

  const handleCustomDuration = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutes);
    if (mins > 0) {
      setDuration(mins);
      setCustomMinutes('');
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    return `${pad(minutes)}:${pad(secs)}`;
  };

  // --- RENDERING ---

  // Minimal Mode (Fullscreen Session)
  if (minimal) {
    const currentTime = isCountdownMode ? timeLeft : elapsedTime;
    const timeStr = formatTime(currentTime);
    
    return (
       <div className="flex flex-col items-center justify-center p-0 animate-in zoom-in-95 duration-500">
         {isFinished ? (
            <div className="flex flex-col items-center gap-4 text-green-500">
                <CheckBadgeIcon className="w-20 h-20" />
                <span className="text-4xl font-bold">Done!</span>
            </div>
         ) : (
             <div className="text-center relative">
                <div className={`transition-opacity ${isPaused ? 'opacity-50' : 'opacity-100'}`}>
                   <TimeDisplay timeStr={timeStr} sizeClass="text-8xl md:text-[10rem] lg:text-[12rem]" />
                </div>
                {isPaused && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-black text-white dark:bg-white dark:text-black px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase shadow-lg">Paused</span>
                    </div>
                )}
             </div>
         )}
       </div>
    );
  }

  // 1. Finished View (Overlay) - Standard Mode
  if (isFinished && isRunning) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 h-full flex flex-col items-center justify-center text-center gap-4 animate-in fade-in min-h-[220px]">
        <div className="bg-green-500 text-white p-3 rounded-full">
          <CheckBadgeIcon className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-black dark:text-white">Timer Complete!</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Take a break or keep reading.</p>
        </div>
      </div>
    );
  }

  // 2. Running View - Standard Mode
  if (isRunning) {
    const currentTime = isCountdownMode ? timeLeft : elapsedTime;
    const progress = isCountdownMode && initialTime > 0 
        ? ((initialTime - timeLeft) / initialTime) * 100 
        : 100;
    const timeStr = formatTime(currentTime);

    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 h-full flex flex-col items-center justify-center gap-4 relative overflow-hidden min-h-[220px]">
         {/* Background Progress Bar */}
         <div 
          className={`absolute bottom-0 left-0 h-1 bg-black dark:bg-white transition-all duration-1000 ease-linear ${(!isCountdownMode && !isPaused) ? 'animate-pulse' : ''}`}
          style={{ width: `${progress}%` }}
        ></div>

        <div className="flex items-center gap-2 z-10">
          <ClockIcon className="w-5 h-5 text-neutral-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {isCountdownMode ? 'Time Remaining' : 'Time Elapsed'}
          </span>
        </div>

        <div className={`z-10 ${isPaused ? 'opacity-50' : ''}`}>
           <TimeDisplay timeStr={timeStr} sizeClass="text-6xl" />
        </div>
        
        {isPaused && <span className="absolute text-xs font-bold uppercase tracking-widest bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">Paused</span>}
      </div>
    );
  }

  // 3. Setup View (Default)
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 h-full flex flex-col min-h-[220px]">
      
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <ClockIcon className="w-6 h-6 text-black dark:text-white" />
            <h3 className="text-lg font-bold text-black dark:text-white">Timer</h3>
        </div>
        <Toggle 
          checked={isCountdownMode} 
          onChange={setIsCountdownMode} 
        />
      </div>

      <div className="flex-grow flex flex-col justify-center">
        {!isCountdownMode ? (
            // Stopwatch Info
            <div className="flex flex-col items-center justify-center text-center gap-2">
                <div className="text-4xl font-mono font-bold text-neutral-300 dark:text-neutral-700 tracking-wider">
                    00:00
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 max-w-[200px]">
                    Timer counts up when you start.
                </p>
            </div>
        ) : (
            // Countdown Options
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="grid grid-cols-3 gap-2">
                    {PRESETS.map(min => (
                    <button
                        key={min}
                        onClick={() => setDuration(min)}
                        className={`px-2 py-3 rounded-lg font-bold transition-all border text-sm ${
                          duration === min 
                          ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                          : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
                        }`}
                    >
                        {min}m
                    </button>
                    ))}
                    
                    {/* Custom Input Integrated in Grid */}
                    <form onSubmit={handleCustomDuration} className="relative group">
                        <input 
                            type="number"
                            min="1"
                            max="480"
                            placeholder="Set"
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(e.target.value)}
                            className="w-full h-full px-1 py-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-transparent focus:border-black dark:focus:border-white text-center text-sm font-bold outline-none transition-all placeholder:font-normal placeholder:text-neutral-400 appearance-none"
                        />
                        <button 
                             type="submit"
                             className={`absolute right-1 top-1/2 -translate-y-1/2 text-black dark:text-white p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-opacity ${customMinutes ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <ArrowRightIcon className="w-3 h-3" />
                        </button>
                    </form>
                </div>
                
                <div className="text-center mt-1">
                   <span className="text-xs text-neutral-400">Target: <span className="text-black dark:text-white font-bold">{duration} min</span></span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ReadingTimer;