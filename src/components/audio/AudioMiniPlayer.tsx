import { useState, useEffect, useRef } from 'react';
import {
  soundEngine,
  AMBIENT_TRACKS,
  type AmbientTrackId,
} from '../../utils/audio';
import {
  Volume2,
  VolumeX,
  Volume1,
  SkipForward,
  SkipBack,
  Play,
  Pause,
  X,
  Keyboard,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AudioMiniPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AudioMiniPlayer({ isOpen, onClose }: AudioMiniPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(() =>
    soundEngine.getIsAmbienceActive(),
  );
  const [activeTrack, setActiveTrack] = useState<AmbientTrackId>(() =>
    soundEngine.getActiveTrackId(),
  );
  const [volume, setVolume] = useState<number>(() =>
    soundEngine.getAmbienceVolume(),
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubAmbience = soundEngine.subscribeAmbience((playing) =>
      setIsPlaying(playing),
    );
    const unsubTrack = soundEngine.subscribeTrack((trackId) =>
      setActiveTrack(trackId),
    );
    const unsubVol = soundEngine.subscribeVolume((vol) => setVolume(vol));

    return () => {
      unsubAmbience();
      unsubTrack();
      unsubVol();
    };
  }, []);

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTrackInfo =
    AMBIENT_TRACKS.find((t) => t.id === activeTrack) || AMBIENT_TRACKS[0];

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    soundEngine.setAmbienceVolume(newVol);
  };

  const togglePlay = () => {
    soundEngine.toggleAmbience();
  };

  const handleNext = () => {
    soundEngine.nextTrack();
  };

  const handlePrev = () => {
    soundEngine.prevTrack();
  };

  return (
    <div
      ref={containerRef}
      className="fixed top-16 right-3 sm:right-4 z-50 w-80 rounded-3xl bg-[#070a1e]/88 border border-white/20 p-4 backdrop-blur-3xl shadow-2xl shadow-black/90 animate-fade-in space-y-3.5 ring-1 ring-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center text-accent text-xs shadow-[0_0_10px_rgba(129,140,248,0.3)]">
            <Sparkles size={12} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            Ambient Soundscape
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Active Track Highlight Card */}
      <div className="rounded-2xl bg-white/[0.06] border border-white/15 p-3.5 space-y-3 backdrop-blur-md shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/[0.08] flex items-center justify-center text-2xl flex-shrink-0 border border-white/20 shadow-md">
            {currentTrackInfo.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-white truncate">
                {currentTrackInfo.name}
              </h4>
            </div>
            <span className="text-[10px] font-semibold text-accent/90 block">
              {currentTrackInfo.tag}
            </span>
            <p className="text-[10px] text-zinc-300 line-clamp-1 mt-0.5">
              {currentTrackInfo.description}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={handlePrev}
            className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Previous Track"
          >
            <SkipBack size={13} />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className={cn(
              'w-10 h-10 rounded-2xl flex items-center justify-center text-white transition-all cursor-pointer shadow-lg',
              isPlaying
                ? 'bg-accent hover:bg-accent-hover shadow-accent/40 ring-1 ring-white/20'
                : 'bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-zinc-200',
            )}
            title={isPlaying ? 'Pause Ambience' : 'Play Ambience'}
          >
            {isPlaying ? (
              <Pause size={16} className="fill-current" />
            ) : (
              <Play size={16} className="fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Next Track"
          >
            <SkipForward size={13} />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-300 font-semibold">
            <div className="flex items-center gap-1.5">
              {volume === 0 ? (
                <VolumeX size={12} className="text-zinc-500" />
              ) : volume < 0.5 ? (
                <Volume1 size={12} className="text-zinc-400" />
              ) : (
                <Volume2 size={12} className="text-accent" />
              )}
              <span>Volume</span>
            </div>
            <span className="tabular-nums font-bold text-zinc-100">
              {Math.round(volume * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
          />
        </div>
      </div>

      {/* ── Direct Track Picker ── */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block px-1">
          Soundscapes Library
        </span>
        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
          {AMBIENT_TRACKS.map((t) => {
            const isSelected = t.id === activeTrack;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  soundEngine.setTrack(t.id);
                  if (!isPlaying) {
                    soundEngine.startAmbience();
                  }
                }}
                className={cn(
                  'w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group cursor-pointer backdrop-blur-sm',
                  isSelected
                    ? 'bg-accent/20 border border-accent/50 text-white font-semibold shadow-sm'
                    : 'hover:bg-white/[0.07] text-zinc-300 hover:text-white border border-transparent',
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm">{t.icon}</span>
                  <span className="truncate">{t.name}</span>
                </div>
                {isSelected && isPlaying && (
                  <Volume2 size={12} className="text-accent animate-pulse flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyboard Shortcuts Footer */}
      <div className="pt-2 border-t border-edge/30 flex items-center justify-between text-[9px] text-zinc-500 font-medium">
        <div className="flex items-center gap-1.5">
          <Keyboard size={11} />
          <span>Hotkeys:</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/10 text-zinc-400 font-mono">
            M
          </kbd>
          <span>Mute</span>
          <span className="text-zinc-600">•</span>
          <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/10 text-zinc-400 font-mono">
            T
          </kbd>
          <span>Track</span>
          <span className="text-zinc-600">•</span>
          <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/10 text-zinc-400 font-mono">
            Space
          </kbd>
          <span>Timer</span>
        </div>
      </div>
    </div>
  );
}
