import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgressRing } from '../ui/ProgressRing';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { formatTimerDisplay, formatHoursMinutes } from '../../utils/calculations';
import { MIN_SESSION_DURATION_SECONDS } from '../../lib/constants';
import { Pause, Play, Square, X } from 'lucide-react';

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

  const [elapsed, setElapsed] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

  // Update elapsed display
  useEffect(() => {
    setElapsed(getElapsedSeconds());

    if (!activeTimer || activeTimer.status !== 'running') return;

    const interval = setInterval(() => {
      setElapsed(getElapsedSeconds());
    }, 200); // Update slightly faster than 1s for smoother display

    return () => clearInterval(interval);
  }, [activeTimer, getElapsedSeconds]);

  // Handle page visibility change — recalculate on return
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

  // Calculate what progress would be after this session
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

  return (
    <div className="fixed inset-0 z-50 bg-canvas flex flex-col items-center justify-center p-6 animate-fade-in">
      {/* Cancel button (top-right) */}
      <button
        type="button"
        onClick={() => setShowCancelConfirm(true)}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-zinc-600 hover:text-zinc-400 hover:bg-elevated transition-colors duration-150 cursor-pointer"
        aria-label="Cancel session"
      >
        <X size={20} />
      </button>

      {/* Skill info */}
      <div className="text-center mb-8">
        <span className="text-3xl mb-2 block">{skill.icon}</span>
        <h1 className="text-lg font-semibold text-zinc-100">{skill.name}</h1>
        <p className="text-xs text-zinc-500 mt-1">
          {formatHoursMinutes(currentTotalSeconds)} invested
        </p>
      </div>

      {/* Timer Ring */}
      <div
        className={cn(
          'mb-10 transition-shadow duration-1000',
          isRunning && 'animate-pulse-glow rounded-full',
        )}
      >
        <ProgressRing
          percentage={projectedPercentage}
          size={220}
          strokeWidth={5}
          color={skill.color}
        >
          <div className="text-center">
            <p
              className={cn(
                'font-bold tabular-nums tracking-tight',
                elapsed >= 3600 ? 'text-3xl' : 'text-4xl',
              )}
            >
              {formatTimerDisplay(elapsed)}
            </p>
            {isPaused ? (
              <p className="text-xs text-warning mt-1 animate-pulse">
                Paused
              </p>
            ) : null}
          </div>
        </ProgressRing>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Pause / Resume */}
        <button
          type="button"
          onClick={isRunning ? pauseTimer : handleResume}
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center',
            'transition-all duration-200 cursor-pointer',
            isRunning
              ? 'bg-elevated hover:bg-zinc-700 text-zinc-200'
              : 'bg-accent hover:bg-indigo-500 text-white',
          )}
          aria-label={isRunning ? 'Pause' : 'Resume'}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>

        {/* Complete */}
        <Button
          variant={canComplete ? 'primary' : 'secondary'}
          size="lg"
          onClick={handleComplete}
          disabled={!canComplete}
          className="gap-2"
        >
          <Square size={16} />
          Complete
        </Button>
      </div>

      {/* Cancel Confirmation */}
      {showCancelConfirm ? (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowCancelConfirm(false)}
          />
          <div className="relative z-10 bg-surface border border-edge rounded-card p-6 max-w-xs w-full text-center animate-scale-in">
            <h3 className="text-base font-semibold text-zinc-100 mb-2">
              Discard this session?
            </h3>
            <p className="text-sm text-zinc-400 mb-5">
              {formatTimerDisplay(elapsed)} of practice will not be saved.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep going
              </Button>
              <Button
                variant="danger"
                size="md"
                className="flex-1"
                onClick={cancelTimer}
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
