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

  // Keyboard Escape / Enter listener
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 select-none pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label="Cosmic Practice Complete"
    >
      {/* Invisible click-outside dismiss surface (preserves 100% Cosmos visual clarity) */}
      <div
        className="absolute inset-0 pointer-events-auto cursor-pointer"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Lightweight Holographic Reward Capsule */}
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${event.skillColor}20 0%, transparent 65%), rgba(7, 10, 22, 0.82)`,
          boxShadow: `0 20px 50px -10px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.12), 0 0 30px -5px ${event.skillColor}35, inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)`,
        }}
        className={cn(
          'relative z-10 w-full max-w-[340px] sm:max-w-[360px] rounded-3xl p-4 sm:p-5 backdrop-blur-2xl pointer-events-auto',
          'flex flex-col space-y-3 animate-scale-in transition-all duration-300',
        )}
      >
        {/* ── 1. Compact Header ───────────────────────────────── */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border shadow-md flex-shrink-0"
              style={{
                backgroundColor: `${event.skillColor}25`,
                borderColor: `${event.skillColor}50`,
                boxShadow: `0 0 14px ${event.skillColor}40`,
              }}
            >
              {event.skillIcon}
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate drop-shadow-sm">
                {event.skillName}
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <span className="font-semibold text-zinc-200">
                  {formatDuration(event.durationSeconds)}
                </span>
                <span>invested</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {event.id.startsWith('dev-preview-') && (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase tracking-wider">
                Preview
              </span>
            )}
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
        </div>

        {/* ── 2. Horizon Crossing Announcement (if triggered) ── */}
        {(event.crossedHorizon || event.crossedStage) && (
          <div
            className="rounded-2xl border px-3 py-2 text-center space-y-0.5 animate-slide-up"
            style={{
              backgroundColor: `${event.skillColor}18`,
              borderColor: `${event.skillColor}50`,
              boxShadow: `0 0 20px ${event.skillColor}25`,
            }}
          >
            <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-300">
              <Sparkles size={11} className="animate-pulse text-amber-400" />
              <span>A New Horizon Has Opened</span>
            </div>
            <p className="text-xs font-bold text-white truncate">
              {event.newStageName}
            </p>
          </div>
        )}

        {/* ── 3. XP & Horizon Stats Pill ──────────────────────── */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Reward</span>
            <span className="text-lg font-extrabold text-accent tabular-nums tracking-tight drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]">
              +{displayedXP} Mastery XP
            </span>
          </div>

          {/* Next Horizon Checkpoint */}
          {event.newHorizonHours ? (
            <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-300">
              <div className="flex items-center gap-1">
                <Compass size={12} className="text-cyan-400" />
                <span className="font-medium">Next Horizon</span>
              </div>
              <span className="font-bold text-white tabular-nums">
                {event.newHorizonHours}h
              </span>
            </div>
          ) : (
            <div className="pt-1.5 border-t border-white/[0.06] flex items-center gap-1 text-[11px] text-amber-300 font-semibold">
              <Sparkles size={12} />
              <span>Journey Horizon Reached</span>
            </div>
          )}
        </div>

        {/* ── 4. Continue CTA Button ──────────────────────────── */}
        <div className="pt-0.5">
          <Button
            variant="primary"
            size="sm"
            onClick={onDismiss}
            className="w-full font-bold gap-1.5 py-2 text-xs shadow-[0_0_18px_rgba(129,140,248,0.4)] hover:shadow-[0_0_26px_rgba(129,140,248,0.6)] cursor-pointer h-9"
          >
            <span>Continue</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </aside>
    </div>
  );
}
