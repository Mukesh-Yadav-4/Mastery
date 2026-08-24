import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  History,
  BarChart2,
  User,
  Compass,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { ActiveView } from '../../types';
import { soundEngine, AMBIENT_TRACKS, type AmbientTrackId } from '../../utils/audio';
import { AudioMiniPlayer } from '../audio/AudioMiniPlayer';

interface NavItem {
  view: ActiveView;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { view: 'history', label: 'History', icon: History },
  { view: 'analytics', label: 'Analytics', icon: BarChart2 },
  { view: 'settings', label: 'Profile', icon: User },
];

export function AppShell({
  children,
  onNavigateLanding,
}: {
  children: React.ReactNode;
  onNavigateLanding?: () => void;
}) {
  const { activeView, setActiveView, activeTimer, pauseTimer, resumeTimer } = useApp();
  const [isAmbienceOn, setIsAmbienceOn] = useState(() =>
    soundEngine.getIsAmbienceActive(),
  );
  const [activeTrack, setActiveTrack] = useState<AmbientTrackId>(() =>
    soundEngine.getActiveTrackId(),
  );
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  useEffect(() => {
    const unsubAudio = soundEngine.subscribeAmbience((playing) =>
      setIsAmbienceOn(playing),
    );
    const unsubTrack = soundEngine.subscribeTrack((trackId) =>
      setActiveTrack(trackId),
    );
    return () => {
      unsubAudio();
      unsubTrack();
    };
  }, []);

  // Global Keyboard Shortcuts (M: Mute/Unmute, T: Next Track, Space: Timer Pause/Resume)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeTag === 'select' ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      if (isInput) return;

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        soundEngine.toggleAmbience();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        soundEngine.nextTrack();
      } else if (e.key === ' ' && activeTimer) {
        e.preventDefault();
        if (activeTimer.status === 'running') {
          pauseTimer();
        } else {
          resumeTimer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTimer, pauseTimer, resumeTimer]);

  const handleToggleAmbience = () => {
    soundEngine.toggleAmbience();
  };

  // Hide shell when timer is active (immersive mode)
  if (activeTimer) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        'flex flex-col bg-[#060813]',
        activeView === 'dashboard' ? 'h-dvh overflow-hidden' : 'min-h-dvh bg-canvas',
      )}
    >
      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-6 h-14 flex-shrink-0 border-b border-white/[0.08] bg-[#060813]/65 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onNavigateLanding}
            className="text-base font-semibold tracking-tight text-zinc-100 flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer group"
            title="View Landing Page & Philosophy"
          >
            <span className="text-accent text-sm drop-shadow-[0_0_8px_rgba(129,140,248,0.8)] group-hover:scale-110 transition-transform">⚡</span>
            <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent font-bold">Mastery</span>
          </button>
        </div>

        <nav className="flex items-center gap-1.5">
          {/* Holographic Navigation Tabs Capsule */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-inner">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.view}
                type="button"
                onClick={() => setActiveView(item.view)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer',
                  activeView === item.view
                    ? 'text-white bg-white/[0.12] border border-white/20 shadow-[0_0_16px_rgba(129,140,248,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Ambient Cosmic Soundscape Button & Mini-Player Drawer */}
          <div className="relative">
            <div className="flex items-center rounded-xl bg-white/[0.03] border border-white/[0.08] p-0.5 backdrop-blur-md">
              <button
                type="button"
                onClick={handleToggleAmbience}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer',
                  isAmbienceOn
                    ? 'bg-accent/20 text-accent shadow-[0_0_12px_rgba(129,140,248,0.3)]'
                    : 'text-zinc-400 hover:text-zinc-200',
                )}
                title={isAmbienceOn ? 'Mute Ambience (M)' : 'Play Ambience (M)'}
              >
                {isAmbienceOn ? (
                  <>
                    <Volume2 size={13} className="text-accent animate-pulse" />
                    <span className="hidden sm:inline font-semibold">
                      {AMBIENT_TRACKS.find((t) => t.id === activeTrack)?.shortName ?? 'Music'}
                    </span>
                  </>
                ) : (
                  <>
                    <VolumeX size={13} className="text-zinc-500" />
                    <span className="hidden sm:inline">Ambience</span>
                  </>
                )}
              </button>

              {/* Mini Player & Volume Trigger */}
              <button
                type="button"
                onClick={() => setShowAudioPlayer((prev) => !prev)}
                className={cn(
                  'px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1',
                  showAudioPlayer
                    ? 'bg-white/[0.12] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]',
                )}
                title="Open Ambient Player & Volume Controls"
              >
                <span>Track ⇄</span>
              </button>
            </div>

            {/* Audio Mini-Player Popover */}
            <AudioMiniPlayer
              isOpen={showAudioPlayer}
              onClose={() => setShowAudioPlayer(false)}
            />
          </div>

          {onNavigateLanding && (
            <button
              type="button"
              onClick={onNavigateLanding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all duration-150 cursor-pointer"
              title="Philosophy & Landing"
            >
              <Compass size={13} className="text-cyan-400" />
              <span>About</span>
            </button>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 min-h-0 w-full',
          activeView === 'dashboard'
            ? 'relative overflow-hidden p-0 m-0 pb-14 md:pb-0'
            : 'mx-auto px-4 md:px-6 py-6 pb-20 md:pb-6 max-w-2xl',
        )}
      >
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#070a16]/85 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-10px_30px_rgba(0,0,0,0.6)] safe-area-bottom">
        <div className="flex items-center justify-around h-14 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => setActiveView(item.view)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-4 py-1.5 rounded-2xl transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'text-accent bg-white/[0.08] border border-white/15 shadow-[0_0_14px_rgba(129,140,248,0.3)]'
                    : 'text-zinc-500 hover:text-zinc-300',
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={16} className={cn(isActive && 'drop-shadow-[0_0_6px_rgba(129,140,248,0.8)]')} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
