import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { LevelProgress } from '../ui/LevelProgress';
import { formatDuration } from '../../utils/calculations';
import { soundEngine } from '../../utils/audio';
import type { SessionRewardData } from '../../types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SessionCompletionModalProps {
  reward: SessionRewardData | null;
  onDismiss: () => void;
}

export function SessionCompletionModal({
  reward,
  onDismiss,
}: SessionCompletionModalProps) {
  const [displayedXP, setDisplayedXP] = useState(0);
  const [currentDisplayLevel, setCurrentDisplayLevel] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);
  const [showLevelUpAlert, setShowLevelUpAlert] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!reward) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayedXP(reward.earnedXP);
      setCurrentDisplayLevel(reward.newLevelInfo.level);
      setProgressPercent(reward.newLevelInfo.progressPercentage);
      setShowLevelUpAlert(reward.didLevelUp || reward.didSkillLevelUp);
      if (reward.didLevelUp || reward.didSkillLevelUp) {
        soundEngine.playLevelUp();
      } else {
        soundEngine.playChime();
      }
      return;
    }

    // Sound effect
    if (reward.didLevelUp || reward.didSkillLevelUp) {
      soundEngine.playLevelUp();
    } else {
      soundEngine.playChime();
    }

    // Initialize starting state
    setDisplayedXP(0);
    setCurrentDisplayLevel(reward.previousLevelInfo.level);
    setProgressPercent(reward.previousLevelInfo.progressPercentage);
    setShowLevelUpAlert(false);

    // 1. XP Count-up animation (0 to earnedXP over 500ms)
    const startTime = performance.now();
    const duration = 500;

    const animateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(easeOut * reward.earnedXP);
      setDisplayedXP(currentVal);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateCount);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateCount);

    // 2. Progression bar animation
    const timer1 = setTimeout(() => {
      if (reward.didLevelUp) {
        // Step A: fill to 100% of previous level
        setProgressPercent(100);

        // Step B: trigger level-up visual state and transition to new level progress
        const timer2 = setTimeout(() => {
          setShowLevelUpAlert(true);
          setCurrentDisplayLevel(reward.newLevelInfo.level);
          setProgressPercent(reward.newLevelInfo.progressPercentage);
        }, 550);

        return () => clearTimeout(timer2);
      } else {
        // Glide directly to new progress percentage
        setProgressPercent(reward.newLevelInfo.progressPercentage);
      }
    }, 250);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearTimeout(timer1);
    };
  }, [reward]);

  if (!reward) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
    >
      {/* Backdrop with soft blur */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-gradient-to-b from-surface/95 to-surface/85 border border-edge/80 p-6 sm:p-7 shadow-2xl shadow-black/90 animate-scale-in space-y-6">
        {/* Glow ambient highlight based on skill color */}
        <div
          className="pointer-events-none absolute -inset-1 rounded-2xl opacity-20 blur-xl -z-10 transition-opacity duration-700"
          style={{ backgroundColor: reward.skillColor }}
          aria-hidden="true"
        />

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl">{reward.skillIcon}</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {reward.skillName}
            </span>
          </div>

          <h2 id="completion-title" className="text-2xl font-bold text-zinc-50">
            Session Complete
          </h2>

          <p className="text-sm font-medium text-zinc-400">
            <span className="text-zinc-100 font-bold">
              {formatDuration(reward.durationSeconds)}
            </span>{' '}
            of deliberate practice invested
          </p>
        </div>

        {/* Level Up Announcement (if triggered) */}
        {showLevelUpAlert && (
          <div className="rounded-xl border border-accent/50 bg-gradient-to-r from-accent/20 via-accent/15 to-accent/20 p-3.5 text-center space-y-1 animate-slide-up shadow-lg shadow-accent/20">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-accent uppercase tracking-wider">
              <Sparkles size={14} className="animate-pulse" />
              <span>Level Up!</span>
            </div>
            <p className="text-sm font-bold text-zinc-50">
              {reward.didLevelUp
                ? `Mastery Level ${reward.previousLevelInfo.level} → Level ${reward.newLevelInfo.level} ⚡`
                : `${reward.skillName} Level ${reward.previousSkillLevelInfo.level} → Level ${reward.newSkillLevelInfo.level} ⚡`}
            </p>
          </div>
        )}

        {/* XP Earned Card */}
        <div className="rounded-xl bg-canvas/80 border border-edge/60 p-4 space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">XP Earned</span>
            <span className="text-xl font-extrabold text-accent tabular-nums tracking-tight drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]">
              +{displayedXP} XP
            </span>
          </div>

          {reward.bonusXP > 0 && (
            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1.5 border-t border-edge/40">
              <span>Base practice: {reward.baseXP} XP</span>
              <span className="text-emerald-400 font-semibold">
                Completion bonus: +{reward.bonusXP} XP
              </span>
            </div>
          )}

          {/* Global Level Progress Bar */}
          <div className="pt-2 border-t border-edge/40 space-y-1">
            <LevelProgress
              level={currentDisplayLevel}
              totalXP={
                showLevelUpAlert
                  ? reward.newLevelInfo.currentLevelXP + reward.newLevelInfo.xpInCurrentLevel
                  : reward.previousLevelInfo.currentLevelXP + reward.previousLevelInfo.xpInCurrentLevel
              }
              xpToNextLevel={
                showLevelUpAlert
                  ? reward.newLevelInfo.xpToNextLevel
                  : reward.previousLevelInfo.xpToNextLevel
              }
              progressPercentage={progressPercent}
              label="Global Mastery"
              size="sm"
            />
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={onDismiss}
          className="w-full font-semibold gap-2 shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-shadow"
        >
          <span>Continue</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
