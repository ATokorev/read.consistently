import React from 'react';
import { BookData, CalculationResult } from './types';
import { getEndOfMonthString } from './utils/dateHelpers';
import { calculateBookStats, calculateTargetPage } from './utils/calculations';
import BookForm from './components/BookForm';
import ResultCard from './components/ResultCard';
import DashboardCard from './components/DashboardCard';
import ReadingTimer from './components/ReadingTimer';
import MusicPlayer from './components/MusicPlayer';
import { SunIcon, MoonIcon, PlusIcon, ArrowLeftIcon, PlayIcon, StopIcon, BookOpenIcon, ChevronDownIcon, PauseIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // --- Book State Management ---
  const [books, setBooks] = React.useState<BookData[]>(() => {
    const saved = localStorage.getItem('bookpace_books');
    return saved ? JSON.parse(saved) : [{
      id: crypto.randomUUID(),
      title: 'Example Book',
      totalPages: 300,
      currentPage: 50,
      targetDate: getEndOfMonthString(),
    }];
  });

  const [activeBookId, setActiveBookId] = React.useState<string | null>(null);

  // --- Session State ---
  const [isSessionActive, setIsSessionActive] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [sessionBookId, setSessionBookId] = React.useState<string>('');
  
  // Session Config with Persistence
  const [isCountdownMode, setIsCountdownMode] = React.useState(() => {
    const saved = localStorage.getItem('bookpace_countdown_mode');
    return saved ? JSON.parse(saved) : false;
  });

  const [timerDuration, setTimerDuration] = React.useState(() => {
    const saved = localStorage.getItem('bookpace_timer_duration');
    return saved ? parseInt(saved, 10) : 30;
  });

  const [isMusicEnabled, setIsMusicEnabled] = React.useState(() => {
    const saved = localStorage.getItem('bookpace_music_enabled');
    return saved ? JSON.parse(saved) : false;
  });

  // Persistence Effects
  React.useEffect(() => {
    localStorage.setItem('bookpace_books', JSON.stringify(books));
  }, [books]);

  React.useEffect(() => {
    localStorage.setItem('bookpace_countdown_mode', JSON.stringify(isCountdownMode));
  }, [isCountdownMode]);

  React.useEffect(() => {
    localStorage.setItem('bookpace_timer_duration', timerDuration.toString());
  }, [timerDuration]);

  React.useEffect(() => {
    localStorage.setItem('bookpace_music_enabled', JSON.stringify(isMusicEnabled));
  }, [isMusicEnabled]);

  // Derived Values
  const activeBook = React.useMemo(() => books.find(b => b.id === activeBookId) || null, [books, activeBookId]);
  const sessionBook = React.useMemo(() => books.find(b => b.id === sessionBookId) || null, [books, sessionBookId]);

  // Sync session book default
  React.useEffect(() => {
    if (books.length > 0 && !sessionBookId) {
      setSessionBookId(books[0].id);
    } else if (books.length === 0) {
      setSessionBookId('');
    }
  }, [books, sessionBookId]);

  // Reset active book if deleted
  React.useEffect(() => {
    if (activeBookId && !activeBook) setActiveBookId(null);
  }, [activeBookId, activeBook]);

  // Calculate Stats using Utility
  const activeStats = React.useMemo(() => activeBook ? calculateBookStats(activeBook) : null, [activeBook]);
  const sessionStats = React.useMemo(() => sessionBook ? calculateBookStats(sessionBook) : null, [sessionBook]);
  const targetPage = React.useMemo(() => sessionBook && sessionStats ? calculateTargetPage(sessionBook, sessionStats) : 0, [sessionBook, sessionStats]);

  // Handlers
  const handleAddNewBook = () => {
    const newBook: BookData = { id: crypto.randomUUID(), title: '', totalPages: 300, currentPage: 0, targetDate: getEndOfMonthString() };
    setBooks(prev => [...prev, newBook]);
    setActiveBookId(newBook.id);
  };

  const handleUpdateBook = (field: keyof BookData, value: string | number) => {
    if (!activeBookId) return;
    setBooks(prev => prev.map(book => book.id === activeBookId ? { ...book, [field]: value } : book));
  };

  const handleDeleteBook = (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
    setActiveBookId(null);
    if (id === sessionBookId) setSessionBookId('');
  };

  const handleStartSession = () => { setIsSessionActive(true); setIsPaused(false); };
  const handleEndSession = () => { setIsSessionActive(false); setIsPaused(false); };

  return (
    <div className={`min-h-screen bg-white dark:bg-black py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-200 font-sans ${isSessionActive ? 'justify-center overflow-hidden h-screen' : ''}`}>
      
      {/* Dark Mode Toggle */}
      <button 
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors z-50"
      >
        {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
      </button>

      {/* Hero Section */}
      {!isSessionActive && (
        <div className="max-w-4xl w-full text-center mb-8 mt-4 animate-fade-in">
          <h1 className="text-5xl font-extrabold text-black dark:text-white tracking-tighter sm:text-7xl mb-6">
            Read More. <span className="text-neutral-500 dark:text-neutral-500">Finish Strong.</span>
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-10">
            Your personal minimalist reading pacer. Plan your reading, track your progress, and stay motivated.
          </p>
          <button 
            onClick={handleStartSession}
            className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full border border-transparent transition-all hover:scale-105 active:scale-95 duration-300 bg-black text-white dark:bg-white dark:text-black shadow-lg"
          >
            <PlayIcon className="w-6 h-6 fill-current" />
            <span className="text-xl font-bold tracking-tight">Start Reading Session</span>
          </button>
        </div>
      )}

      {/* Session Panel */}
      <div className={`w-full transition-all duration-500 ease-in-out ${isSessionActive ? 'fixed inset-0 z-40 bg-white dark:bg-black flex flex-col items-center justify-center' : 'max-w-6xl mb-10 z-10'}`}>
          <div className={`transition-all duration-500 ${isSessionActive ? 'w-full max-w-5xl px-6' : 'bg-neutral-50 dark:bg-neutral-900/40 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-neutral-200 dark:border-neutral-800 relative shadow-xl'}`}>
             
             {/* Header (Setup vs Active) */}
             {!isSessionActive ? (
               <div className="flex flex-col items-center justify-center mb-6 w-full">
                  <div className="flex items-center gap-2 mb-3 text-neutral-500 dark:text-neutral-400 bg-white dark:bg-black/40 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 shadow-sm">
                      <BookOpenIcon className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Currently Reading</span>
                  </div>
                  <div className="relative w-full max-w-md">
                    <div className="relative group">
                      <select 
                        value={sessionBookId}
                        onChange={(e) => setSessionBookId(e.target.value)}
                        className="w-full appearance-none bg-transparent text-xl md:text-3xl font-bold text-black dark:text-white text-center border-b-2 border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors cursor-pointer focus:outline-none py-2 pr-8 pl-8 rounded-t-lg hover:bg-neutral-50 dark:hover:bg-white/5"
                      >
                        {books.length === 0 && <option value="">No books in library</option>}
                        {books.map(book => <option key={book.id} value={book.id}>{book.title || 'Untitled Book'}</option>)}
                      </select>
                      <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  {sessionStats && (
                    <div className="mt-3 flex flex-col items-center animate-in fade-in slide-in-from-top-1">
                       <div className="flex items-center justify-center gap-2">
                           <span className="text-sm text-neutral-500 dark:text-neutral-400">Target for today:</span>
                           <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded text-sm font-bold">{sessionStats.pagesPerDay} pages</span>
                       </div>
                       <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 font-medium">Reach page {targetPage}</div>
                    </div>
                  )}
               </div>
             ) : (
               <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className="flex flex-col items-center gap-2 mb-4">
                     <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        Daily Goal: {sessionStats?.pagesPerDay || 0} Pages
                     </span>
                     <span className="text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-wider font-bold">Reach Page {targetPage}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-2">{sessionBook?.title}</h2>
               </div>
             )}

             {/* Tools */}
             <div className={isSessionActive ? "flex flex-col items-center gap-8 w-full" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                <ReadingTimer 
                  isRunning={isSessionActive}
                  isPaused={isPaused}
                  minimal={isSessionActive}
                  isCountdownMode={isCountdownMode}
                  setIsCountdownMode={setIsCountdownMode}
                  duration={timerDuration}
                  setDuration={setTimerDuration}
                />
                <MusicPlayer 
                  isRunning={isSessionActive && !isPaused}
                  minimal={isSessionActive}
                  isEnabled={isMusicEnabled}
                  setIsEnabled={setIsMusicEnabled}
                />
             </div>

             {/* Active Session Footer Controls */}
             {isSessionActive && (
               <div className="flex items-center justify-center gap-6 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                  <button onClick={() => setIsPaused(!isPaused)} className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                       {isPaused ? <PlayIcon className="w-8 h-8 text-black dark:text-white fill-current" /> : <PauseIcon className="w-8 h-8 text-black dark:text-white" />}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors">{isPaused ? "Resume" : "Pause"}</span>
                  </button>
                  <button onClick={handleEndSession} className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <StopIcon className="w-8 h-8 text-red-500" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 group-hover:text-red-500 transition-colors">End</span>
                  </button>
               </div>
             )}
          </div>
        </div>

      {/* Library / Detail View */}
      {!isSessionActive && (
        <div className="max-w-6xl w-full animate-fade-in">
          {!activeBookId ? (
            <div>
              <div className="flex justify-between items-center mb-6 px-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Your Library</h2>
                <button onClick={handleAddNewBook} className="flex items-center gap-2 bg-white dark:bg-black hover:bg-neutral-100 dark:hover:bg-neutral-900 text-black dark:text-white px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 transition-all active:scale-95 font-medium">
                  <PlusIcon className="w-5 h-5" /> Add Book
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.length === 0 && (
                  <div className="col-span-full py-16 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <PlusIcon className="w-8 h-8 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-black dark:text-white">No books yet</h3>
                  </div>
                )}
                {books.map(book => <DashboardCard key={book.id} book={book} onClick={() => setActiveBookId(book.id)} />)}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              <button onClick={() => setActiveBookId(null)} className="mb-4 flex items-center gap-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors font-medium px-2">
                <ArrowLeftIcon className="w-4 h-4" /> Back to Dashboard
              </button>
              {activeBook && activeStats && (
                <div className="w-full bg-white dark:bg-black rounded-3xl shadow-none border border-neutral-200 dark:border-neutral-800 flex flex-col lg:flex-row transition-all duration-200 min-h-[500px]">
                  <div className="w-full lg:w-5/12 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                    <h2 className="text-lg font-bold text-black dark:text-white mb-8 flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-bold">1</span> Edit Details
                    </h2>
                    <BookForm data={activeBook} onChange={handleUpdateBook} onDelete={handleDeleteBook} onSave={() => setActiveBookId(null)} />
                  </div>
                  <div className="w-full lg:w-7/12 bg-white dark:bg-black flex flex-col">
                    <div className="p-8 lg:p-10 flex-grow flex flex-col h-full">
                      <h2 className="text-lg font-bold text-black dark:text-white mb-8 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full border border-black dark:border-white text-black dark:text-white text-sm font-bold">2</span> Your Plan
                      </h2>
                      <ResultCard stats={activeStats} bookData={activeBook} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;