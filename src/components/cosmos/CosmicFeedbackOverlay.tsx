import { useState, useEffect, useRef } from 'react';
import type { CosmicFeedbackEvent } from '../../types';
import { formatDuration } from '../../utils/calculations';
import { Button } from '../ui/Button';
import { Sparkles, ArrowRight, Compass, Zap, Crown, Layers } from 'lucide-react';
import { soundEngine } from '../../utils/audio';
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

  // Play triumphant chime on level up / horizon / stage evolution
  useEffect(() => {
    if (event.didLevelUp || event.didSkillLevelUp) {
      soundEngine.playLevelUp();
    } else if (event.crossedStage || event.crossedHorizon) {
      soundEngine.playHorizonCross();
    }
  }, [event.didLevelUp, event.didSkillLevelUp, event.crossedStage, event.crossedHorizon]);

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
      {/* Invisible click-outside dismiss surface */}
      <div
        className="absolute inset-0 pointer-events-auto cursor-pointer"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Lightweight Holographic Reward Capsule */}
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${event.skillColor}25 0%, transparent 70%), rgba(7, 10, 22, 0.92)`,
          boxShadow: `0 24px 60px -10px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.14), 0 0 36px -4px ${event.skillColor}40, inset 0 1px 1px 0 rgba(255, 255, 255, 0.22)`,
        }}
        className={cn(
          'relative z-10 w-full max-w-[350px] sm:max-w-[380px] rounded-3xl p-4.5 sm:p-5 backdrop-blur-2xl pointer-events-auto',
          'flex flex-col space-y-3.5 animate-scale-in transition-all duration-300',
        )}
      >
        {/* ── 1. Compact Header ───────────────────────────────── */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border shadow-md flex-shrink-0"
              style={{
                backgroundColor: `${event.skillColor}25`,
                borderColor: `${event.skillColor}50`,
                boxShadow: `0 0 16px ${event.skillColor}45`,
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
                <span>practiced</span>
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
              className="flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full border"
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

        {/* ── 2. GLOBAL LEVEL UP CELEBRATION BANNER ────────────── */}
        {event.didLevelUp && (
          <div className="rounded-2xl p-3 bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-yellow-500/25 border border-amber-400/60 shadow-[0_0_24px_rgba(251,191,36,0.35)] text-center space-y-1 animate-slide-up">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/40">
              <Crown size={12} className="text-amber-400 fill-amber-400 animate-bounce" />
              <span>Global Rank Up!</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-black text-white">
              <span className="text-amber-200">Level {event.previousGlobalLevel.level}</span>
              <ArrowRight size={12} className="text-amber-400" />
              <span className="text-amber-300 text-sm">Level {event.newGlobalLevel.level}</span>
            </div>
          </div>
        )}

        {/* ── 3. SKILL LEVEL UP CELEBRATION BANNER ─────────────── */}
        {event.didSkillLevelUp && !event.didLevelUp && (
          <div
            className="rounded-2xl p-3 border text-center space-y-1 animate-slide-up"
            style={{
              backgroundColor: `${event.skillColor}25`,
              borderColor: `${event.skillColor}60`,
              boxShadow: `0 0 24px ${event.skillColor}35`,
            }}
          >
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-wider border border-white/20" style={{ color: event.skillColor }}>
              <Sparkles size={12} className="animate-spin" />
              <span>Skill Rank Up!</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-black text-white">
              <span className="text-zinc-300">Level {event.previousSkillLevel.level}</span>
              <ArrowRight size={12} style={{ color: event.skillColor }} />
              <span className="text-sm font-bold" style={{ color: event.skillColor }}>Level {event.newSkillLevel.level}</span>
            </div>
          </div>
        )}

        {/* ── 4. STAGE EVOLUTION CELEBRATION BANNER ────────────── */}
        {event.crossedStage && (
          <div
            className="rounded-2xl p-3 border text-center space-y-1 animate-slide-up"
            style={{
              backgroundColor: `${event.skillColor}20`,
              borderColor: `${event.skillColor}50`,
              boxShadow: `0 0 22px ${event.skillColor}30`,
            }}
          >
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-black uppercase tracking-widest border border-cyan-400/40">
              <Layers size={12} className="text-cyan-400" />
              <span>Stage Evolution Unlocked</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-white">
              <span className="text-zinc-400">{event.previousStageName}</span>
              <ArrowRight size={12} className="text-cyan-400" />
              <span className="text-cyan-300 text-sm font-black">{event.newStageName}</span>
            </div>
          </div>
        )}

        {/* ── 5. HORIZON CHECKPOINT CROSSED BANNER ─────────────── */}
        {event.crossedHorizon && !event.crossedStage && (
          <div className="rounded-2xl p-2.5 bg-cyan-500/15 border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] text-center space-y-0.5 animate-slide-up">
            <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-cyan-300">
              <Compass size={11} className="text-cyan-400 animate-pulse" />
              <span>Horizon Milestone Crossed</span>
            </div>
            <p className="text-xs font-bold text-white">
              Advanced deeper into {event.newStageName}
            </p>
          </div>
        )}

        {/* ── 6. XP & Horizon Stats Pill ──────────────────────── */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 space-y-2 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Mastery Earned</span>
            <span className="text-lg font-black text-accent tabular-nums tracking-tight drop-shadow-[0_0_12px_rgba(129,140,248,0.6)]">
              +{displayedXP} XP
            </span>
          </div>

          {/* Deliberate Practice Bonus Badges */}
          {Boolean(
            event.intentionBonus ||
              event.reflectionBonus ||
              event.streakBonus ||
              event.bonusXP,
          ) && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {Boolean(event.bonusXP) && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ⚡ Flow +{event.bonusXP}
                </span>
              )}
              {Boolean(event.intentionBonus) && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  🎯 Target +{event.intentionBonus}
                </span>
              )}
              {Boolean(event.reflectionBonus) && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  📝 Insight +{event.reflectionBonus}
                </span>
              )}
              {Boolean(event.streakBonus) && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  🔥 Streak +{event.streakBonus}
                </span>
              )}
            </div>
          )}

          {/* Next Horizon Checkpoint */}
          {event.newHorizonHours ? (
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-300">
              <div className="flex items-center gap-1.5">
                <Compass size={13} className="text-cyan-400 flex-shrink-0" />
                <span className="font-semibold">Next Horizon</span>
              </div>
              <span className="font-bold text-white tabular-nums px-2 py-0.5 rounded bg-white/[0.06] border border-white/10">
                {event.newHorizonHours}h
              </span>
            </div>
          ) : (
            <div className="pt-2 border-t border-white/[0.06] flex items-center gap-1.5 text-[11px] text-amber-300 font-bold">
              <Sparkles size={13} className="text-amber-400" />
              <span>Final Journey Horizon Reached!</span>
            </div>
          )}
        </div>

        {/* ── 7. Continue CTA Button ──────────────────── */}
        <div className="pt-1">
          <Button
            variant="primary"
            size="md"
            onClick={onDismiss}
            className="w-full font-bold gap-2 py-2.5 text-xs shadow-[0_0_20px_rgba(129,140,248,0.45)] hover:shadow-[0_0_30px_rgba(129,140,248,0.7)] cursor-pointer h-10"
          >
            <span>Continue Journey</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </aside>
    </div>
  );
}
