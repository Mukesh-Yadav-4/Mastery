import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { formatTimerDisplay, formatHoursMinutes } from '../../utils/calculations';
import { MIN_SESSION_DURATION_SECONDS } from '../../lib/constants';
import { Pause, Play, CheckCircle2, X, Sparkles } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

export function FocusTimer() {
  const {
    activeTimer,
    skills,
    skillProgress,
    pauseTimer,
    resumeTimer,
    completeTimer,
    cancelTimer,
  } = useApp();

  // Calculate elapsed seconds from timestamps
  const getElapsedSeconds = useCallback((): number => {
    if (!activeTimer) return 0;

    const now = Date.now();
    let effectiveEnd = now;

    // If paused, elapsed stops at pause time
    if (activeTimer.status === 'paused' && activeTimer.pausedAt) {
      effectiveEnd = activeTimer.pausedAt;
    }

    const totalMs = effectiveEnd - activeTimer.startedAt - activeTimer.totalPausedMs;
    return Math.max(0, Math.floor(totalMs / 1000));
  }, [activeTimer]);

  const [elapsed, setElapsed] = useState(() => {
    if (!activeTimer) return 0;
    const now = Date.now();
    const effectiveEnd =
      activeTimer.status === 'paused' && activeTimer.pausedAt
        ? activeTimer.pausedAt
        : now;
    const totalMs =
      effectiveEnd - activeTimer.startedAt - activeTimer.totalPausedMs;
    return Math.max(0, Math.floor(totalMs / 1000));
  });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Update elapsed display
  useEffect(() => {
    if (!activeTimer || activeTimer.status !== 'running') return;

    const interval = setInterval(() => {
      setElapsed(getElapsedSeconds());
    }, 250);

    return () => clearInterval(interval);
  }, [activeTimer, getElapsedSeconds]);

  // Handle page visibility change
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        setElapsed(getElapsedSeconds());
      }
    }

    document.addEventListener('visibilitychange', handleVisibility);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility);
  }, [getElapsedSeconds]);

  if (!activeTimer) return null;

  const skill = skills.find((s) => s.id === activeTimer.skillId);
  const progress = skillProgress.find(
    (sp) => sp.skill.id === activeTimer.skillId,
  );

  if (!skill) return null;

  const isRunning = activeTimer.status === 'running';
  const isPaused = activeTimer.status === 'paused';
  const canComplete = elapsed >= MIN_SESSION_DURATION_SECONDS;

  // Calculate projected session progress ratio
  const currentTotalSeconds = progress?.totalSeconds ?? 0;
  const projectedTotalSeconds = currentTotalSeconds + elapsed;
  const projectedPercentage = Math.min(
    skill.targetHours > 0 ? (projectedTotalSeconds / (skill.targetHours * 3600)) * 100 : 0,
    100,
  );

  const handleResume = () => {
    soundEngine.playStart();
    resumeTimer();
  };

  const handleComplete = () => {
    soundEngine.playChime();
    completeTimer();
  };

  // Ring circumference calculation (radius = 110)
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  // Visual session cycle ring (loops gracefully every hour or displays target %)
  const sessionCycleProgress = (elapsed % 3600) / 3600;
  const strokeDashoffset = circumference - sessionCycleProgress * circumference;

  return (
    <div className="fixed inset-0 z-50 bg-[#060813] select-none flex flex-col items-center justify-between p-6 sm:p-8 overflow-hidden animate-fade-in">
      {/* ── 1. Serene Cosmic Atmosphere ─────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Skill-colored central ambient breathing nebula */}
        <div
          style={{
            background: `radial-gradient(circle at 50% 45%, ${skill.color}18 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 75%)`,
          }}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000',
            isRunning ? 'opacity-100 animate-pulse-glow' : 'opacity-60',
          )}
        />

        {/* Sparse ambient cosmic embers */}
        <div className="absolute top-1/4 left-1/5 w-1 h-1 rounded-full bg-white/40 blur-[0.5px] animate-ping opacity-30" />
        <div className="absolute top-3/5 right-1/4 w-1.5 h-1.5 rounded-full bg-white/30 blur-[1px] opacity-40" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 rounded-full bg-cyan-300/30 blur-[0.5px] opacity-30" />
      </div>

      {/* ── 2. Top Header (Skill Context & Exit) ────────────────── */}
      <header className="w-full max-w-md flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl border shadow-lg"
            style={{
              backgroundColor: `${skill.color}20`,
              borderColor: `${skill.color}45`,
              boxShadow: `0 0 16px ${skill.color}30`,
            }}
          >
            {skill.icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-white uppercase tracking-wider">
                {skill.name}
              </h1>
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">
              Focused Practice
            </p>
          </div>
        </div>

        {/* Subtle Discard Button */}
        <button
          type="button"
          onClick={() => setShowCancelConfirm(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all cursor-pointer"
          aria-label="Discard session"
          title="Discard Session"
        >
          <X size={18} />
        </button>
      </header>

      {/* ── 3. Central Focus Chamber (Temporal Energy Ring) ────── */}
      <main className="flex flex-col items-center justify-center my-auto space-y-6">
        {/* Temporal Ring Viewport */}
        <div className="relative flex items-center justify-center">
          {/* Outer Faint Ambient Orbit Ring */}
          <div
            className={cn(
              'absolute w-[276px] h-[276px] rounded-full border border-dashed transition-all duration-1000',
              isRunning
                ? 'border-white/[0.12] animate-spin-slow'
                : 'border-white/[0.06]',
            )}
            style={{ animationDuration: '60s' }}
          />

          {/* SVG Progress Ring */}
          <svg className="w-[260px] h-[260px] -rotate-90 transform" viewBox="0 0 240 240">
            {/* Background Track Ring */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="4"
              fill="transparent"
            />
            {/* Dynamic Energy Arc */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              stroke={skill.color}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                filter: `drop-shadow(0 0 10px ${skill.color}80)`,
                transition: 'stroke-dashoffset 0.35s ease-out',
              }}
            />
          </svg>

          {/* Centered Monospace Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <span
              className={cn(
                'font-extrabold tabular-nums tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]',
                elapsed >= 3600 ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl',
              )}
            >
              {formatTimerDisplay(elapsed)}
            </span>

            {/* State Indicator */}
            <div className="mt-2 flex items-center gap-1.5">
              {isPaused ? (
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse">
                  Paused
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent/90 bg-accent/10 border border-accent/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                  <span>Deep Focus</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── 4. Dual Metric Progress Pill ──────────────────────── */}
        <div className="flex items-center gap-4 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-inner text-center">
          <div className="space-y-0.5 pr-4 border-r border-white/[0.08]">
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 block">
              Invested Before
            </span>
            <span className="text-xs font-bold text-zinc-200 tabular-nums">
              {formatHoursMinutes(currentTotalSeconds)}
            </span>
          </div>
          <div className="space-y-0.5 pl-1">
            <span className="text-[9px] uppercase font-bold tracking-wider text-accent block">
              Target Milestone
            </span>
            <span className="text-xs font-bold text-zinc-200 tabular-nums">
              {skill.targetHours > 0 ? `${projectedPercentage.toFixed(0)}% reached` : 'Continuous'}
            </span>
          </div>
        </div>
      </main>

      {/* ── 5. Bottom Actions & Restrained Mantra ──────────────── */}
      <footer className="w-full max-w-sm flex flex-col items-center space-y-4 pb-2">
        {/* Controls */}
        <div className="w-full flex items-center gap-3">
          {/* Pause / Resume Button (Secondary) */}
          <button
            type="button"
            onClick={isRunning ? pauseTimer : handleResume}
            className={cn(
              'h-12 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs',
              'border transition-all duration-200 cursor-pointer flex-shrink-0',
              isRunning
                ? 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.14] text-zinc-300'
                : 'bg-accent/20 hover:bg-accent/30 border-accent/40 text-accent shadow-[0_0_15px_rgba(129,140,248,0.25)]',
            )}
            aria-label={isRunning ? 'Pause Focus' : 'Resume Focus'}
          >
            {isRunning ? (
              <>
                <Pause size={16} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={16} className="fill-current" />
                <span>Resume</span>
              </>
            )}
          </button>

          {/* Complete Focus Button (Primary) */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleComplete}
            disabled={!canComplete}
            className={cn(
              'flex-1 h-12 rounded-2xl font-bold gap-2 text-xs shadow-[0_0_24px_rgba(129,140,248,0.4)]',
              'hover:shadow-[0_0_32px_rgba(129,140,248,0.6)] cursor-pointer transition-all',
              !canComplete && 'opacity-50 cursor-not-allowed shadow-none',
            )}
          >
            <CheckCircle2 size={16} className="text-white" />
            <span>Complete Focus</span>
          </Button>
        </div>

        {/* Restrained Focus Mantra */}
        <p className="text-[11px] text-zinc-500 font-medium tracking-wide flex items-center gap-1.5">
          <Sparkles size={11} className="text-zinc-600" />
          <span>Stay with the work. Every focused minute leaves a trace.</span>
        </p>
      </footer>

      {/* ── 6. Discard Session Confirmation Dialog ─────────────── */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowCancelConfirm(false)}
          />
          <div className="relative z-10 bg-[#0b0f1e] border border-white/[0.12] rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl backdrop-blur-2xl animate-scale-in space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Discard this session?
              </h3>
              <p className="text-xs text-zinc-400">
                {formatTimerDisplay(elapsed)} of deliberate practice will not be saved to your Cosmos.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 font-semibold text-xs h-9 cursor-pointer"
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep going
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1 font-semibold text-xs h-9 cursor-pointer"
                onClick={cancelTimer}
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
