import React from 'react';
import { 
  ForwardIcon, 
  BackwardIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/solid';
import Toggle from './Toggle';
import '../types';

const PLAYLIST = [
  {
    title: "Lofi Study Beat",
    artist: "Reading Vibes",
    src: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112778.mp3"
  },
  {
    title: "Brown Noise",
    artist: "Pure Focus",
    src: "https://cdn.pixabay.com/download/audio/2022/11/04/audio_33a5796062.mp3?filename=brown-noise-125026.mp3"
  },
  {
    title: "Ambient Piano",
    artist: "Focus Flow",
    src: "https://cdn.pixabay.com/download/audio/2022/03/09/audio_c8c8a73467.mp3?filename=ambient-piano-10781.mp3"
  },
  {
    title: "Light Rain",
    artist: "Nature Sounds",
    src: "https://cdn.pixabay.com/download/audio/2021/08/09/audio_0dcdd21708.mp3?filename=light-rain-ambient-114354.mp3"
  }
];

interface MusicPlayerProps {
  isRunning: boolean;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  minimal?: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ isRunning, isEnabled, setIsEnabled, minimal = false }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = React.useState(0);
  const [volume, setVolume] = React.useState(0.5);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const currentTrack = PLAYLIST[currentTrackIndex];

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle Play/Pause based on Session State + Enabled Toggle
  React.useEffect(() => {
    if (!audioRef.current) return;

    if (isRunning && isEnabled) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Auto-play prevented:", error);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isRunning, isEnabled, currentTrackIndex]);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  if (minimal) {
    if (!isEnabled) return null;
    
    return (
      <div className="bg-neutral-100 dark:bg-neutral-900/80 backdrop-blur rounded-full py-2 px-6 flex items-center gap-4 shadow-sm border border-neutral-200 dark:border-neutral-800 animate-in fade-in slide-in-from-bottom-2">
         {/* Audio Element */}
         <audio 
          ref={audioRef} 
          src={currentTrack.src} 
          onEnded={nextTrack}
          loop={false}
        />
        
        <div className="flex items-center gap-3 border-r border-neutral-300 dark:border-neutral-700 pr-4">
           <MusicalNoteIcon className="w-4 h-4 text-black dark:text-white" />
           <div className="flex flex-col">
              <span className="text-xs font-bold text-black dark:text-white whitespace-nowrap">{currentTrack.title}</span>
              <span className="text-[10px] text-neutral-500 whitespace-nowrap">{currentTrack.artist}</span>
           </div>
        </div>

        <div className="flex items-center gap-2">
            <button onClick={prevTrack} className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
               <BackwardIcon className="w-4 h-4" />
            </button>
            <button onClick={nextTrack} className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
               <ForwardIcon className="w-4 h-4" />
            </button>
        </div>
        
         {/* Volume Mini */}
        <div className="flex items-center gap-1 group w-16">
            <button onClick={() => setVolume(v => v === 0 ? 0.5 : 0)} className="text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white">
               {volume === 0 ? <SpeakerXMarkIcon className="w-3 h-3" /> : <SpeakerWaveIcon className="w-3 h-3" />}
            </button>
            <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
            />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 h-full flex flex-col justify-between relative overflow-hidden transition-opacity duration-300 min-h-[220px] ${!isEnabled ? 'opacity-80' : 'opacity-100'}`}>
      
      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        src={currentTrack.src} 
        onEnded={nextTrack}
        loop={false}
      />

      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
            <MusicalNoteIcon className="w-6 h-6 text-black dark:text-white" />
            <h3 className="text-lg font-bold text-black dark:text-white">Music</h3>
        </div>
        <Toggle checked={isEnabled} onChange={setIsEnabled} />
      </div>

      {/* Disabled State Overlay */}
      {!isEnabled && (
        <div className="absolute inset-0 top-16 bg-white/50 dark:bg-black/50 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none">
            <p className="text-sm font-medium text-neutral-500 bg-white dark:bg-neutral-900 px-3 py-1 rounded-full shadow-sm">Disabled</p>
        </div>
      )}

      {/* Info */}
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isRunning && isEnabled ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'}`}>
           <MusicalNoteIcon className="w-5 h-5" />
        </div>
        <div>
           <h4 className="font-bold text-black dark:text-white text-sm line-clamp-1">{currentTrack.title}</h4>
           <p className="text-xs text-neutral-500 dark:text-neutral-400">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Visualizer (Only when playing) */}
      <div className="flex gap-1 items-end h-6 mb-2 justify-center">
        {(isRunning && isEnabled) ? (
            <>
                <div className="w-1 bg-black dark:bg-white animate-[bounce_1s_infinite] h-2 rounded-full"></div>
                <div className="w-1 bg-black dark:bg-white animate-[bounce_1.2s_infinite] h-4 rounded-full"></div>
                <div className="w-1 bg-black dark:bg-white animate-[bounce_0.8s_infinite] h-3 rounded-full"></div>
                <div className="w-1 bg-black dark:bg-white animate-[bounce_1.1s_infinite] h-5 rounded-full"></div>
                <div className="w-1 bg-black dark:bg-white animate-[bounce_0.9s_infinite] h-3 rounded-full"></div>
            </>
        ) : (
            <div className="w-full h-[1px] bg-neutral-200 dark:bg-neutral-800 my-auto"></div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-auto gap-4">
          <div className="flex items-center gap-2">
            <button onClick={prevTrack} disabled={!isEnabled} className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50">
               <BackwardIcon className="w-5 h-5" />
            </button>
            <button onClick={nextTrack} disabled={!isEnabled} className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50">
               <ForwardIcon className="w-5 h-5" />
            </button>
          </div>

        {/* Volume */}
        <div className="flex items-center gap-2 group w-24">
            <button onClick={() => setVolume(v => v === 0 ? 0.5 : 0)} disabled={!isEnabled} className="text-neutral-400 dark:text-neutral-500 disabled:opacity-50">
            {volume === 0 ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
            </button>
            <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            disabled={!isEnabled}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white disabled:opacity-50"
            />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;