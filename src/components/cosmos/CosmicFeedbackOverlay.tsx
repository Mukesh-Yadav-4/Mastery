import { useState, useEffect, useRef } from 'react';
import type { CosmicFeedbackEvent } from '../../types';
import { formatDuration } from '../../utils/calculations';
import { Button } from '../ui/Button';
import { Sparkles, ArrowRight, Compass, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CosmicFeedbackOverlayProps {
  event: CosmicFeedbackEvent;
  onDismiss: () => void;
}

export function CosmicFeedbackOverlay({
  event,
  onDismiss,
}: CosmicFeedbackOverlayProps) {
  const [displayedXP, setDisplayedXP] = useState(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return prefersReducedMotion ? event.xpEarned : 0;
  });
  const animFrameRef = useRef<number | null>(null);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  // Smooth XP count-up animation
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return;
    }

    const startTime = performance.now();
    const duration = 650;

    const animateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayedXP(Math.round(easeOut * event.xpEarned));

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateCount);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateCount);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [event.xpEarned]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label="Cosmic Practice Complete"
    >
      {/* Subtle non-blocking ambient vignette backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto animate-fade-in"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Holographic Floating Feedback Window */}
      <div
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${event.skillColor}22 0%, transparent 70%), rgba(7, 10, 22, 0.85)`,
          boxShadow: `0 24px 60px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.12), 0 0 35px -5px ${event.skillColor}35, inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)`,
        }}
        className={cn(
          'relative z-10 w-full max-w-sm rounded-3xl p-5 sm:p-6 backdrop-blur-2xl pointer-events-auto',
          'flex flex-col space-y-4 animate-scale-in transition-all duration-300',
        )}
      >
        {/* ── 1. Skill Header ─────────────────────────────────── */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border shadow-md"
              style={{
                backgroundColor: `${event.skillColor}25`,
                borderColor: `${event.skillColor}60`,
                boxShadow: `0 0 16px ${event.skillColor}40`,
              }}
            >
              {event.skillIcon}
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <h3 className="text-base font-bold text-white uppercase tracking-tight truncate">
              {event.skillName}
            </h3>
            <span
              className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full border"
              style={{
                backgroundColor: `${event.skillColor}18`,
                borderColor: `${event.skillColor}40`,
                color: event.skillColor,
              }}
            >
              <Zap size={9} className="fill-current" />
              Lv.{event.newSkillLevel.level}
            </span>
          </div>

          <p className="text-xs text-zinc-400 font-medium">
            <span className="text-zinc-100 font-bold">
              {formatDuration(event.durationSeconds)}
            </span>{' '}
            invested
          </p>
        </div>

        {/* ── 2. Horizon Crossing Announcement (if triggered) ── */}
        {(event.crossedHorizon || event.crossedStage) && (
          <div
            className="rounded-2xl border p-3 text-center space-y-1 animate-slide-up"
            style={{
              backgroundColor: `${event.skillColor}15`,
              borderColor: `${event.skillColor}50`,
              boxShadow: `0 0 20px ${event.skillColor}25`,
            }}
          >
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
              <Sparkles size={13} className="animate-pulse text-amber-400" />
              <span>A New Horizon Has Opened</span>
            </div>
            <p className="text-xs font-bold text-white truncate">
              {event.newStageName}
            </p>
          </div>
        )}

        {/* ── 3. Level-Up Alert (if triggered) ───────────────── */}
        {(event.didLevelUp || event.didSkillLevelUp) && !event.crossedHorizon && (
          <div className="rounded-2xl border border-accent/40 bg-accent/15 p-2.5 text-center space-y-0.5 animate-slide-up shadow-lg shadow-accent/15">
            <span className="text-[10px] font-black uppercase tracking-wider text-accent flex items-center justify-center gap-1">
              <Sparkles size={12} />
              Level Up!
            </span>
            <p className="text-xs font-bold text-white">
              {event.didLevelUp
                ? `Mastery Level ${event.previousGlobalLevel.level} → Level ${event.newGlobalLevel.level} ⚡`
                : `${event.skillName} Level ${event.previousSkillLevel.level} → Level ${event.newSkillLevel.level} ⚡`}
            </p>
          </div>
        )}

        {/* ── 4. XP & Horizon Stats Capsule ──────────────────── */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-3.5 space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Mastery XP</span>
            <span className="text-xl font-extrabold text-accent tabular-nums tracking-tight drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]">
              +{displayedXP} XP
            </span>
          </div>

          {/* Next Horizon Checkpoint */}
          {event.newHorizonHours ? (
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-300">
              <div className="flex items-center gap-1.5">
                <Compass size={13} className="text-cyan-400" />
                <span className="font-semibold">Next Horizon</span>
              </div>
              <span className="font-bold text-white tabular-nums">
                {event.newHorizonHours}h
              </span>
            </div>
          ) : (
            <div className="pt-2 border-t border-white/[0.06] flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
              <Sparkles size={13} />
              <span>Journey Horizon Reached</span>
            </div>
          )}
        </div>

        {/* ── 5. Continue CTA Button ──────────────────────────── */}
        <div className="pt-1">
          <Button
            variant="primary"
            size="lg"
            onClick={onDismiss}
            className="w-full font-bold gap-2 py-2.5 text-sm shadow-[0_0_20px_rgba(129,140,248,0.4)] hover:shadow-[0_0_28px_rgba(129,140,248,0.6)] cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
