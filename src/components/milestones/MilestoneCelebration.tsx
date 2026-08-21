import { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { ProgressRing } from '../ui/ProgressRing';
import { MILESTONE_LABELS, MILESTONE_ICONS } from '../../lib/constants';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';

export function MilestoneCelebration() {
  const { celebration, dismissCelebration } = useApp();
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (!celebration || hasPlayedRef.current) return;
    hasPlayedRef.current = true;

    // Play fanfare sound
    soundEngine.playFanfare();

    const skillColor = celebration.skillColor;

    // Fire confetti
    const duration = 2000;
    const end = Date.now() + duration;

    function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: [skillColor, '#818cf8', '#fbbf24'],
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: [skillColor, '#818cf8', '#34d399'],
        disableForReducedMotion: true,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }

    // Small delay so the overlay is visible first
    const timeout = setTimeout(frame, 300);
    return () => clearTimeout(timeout);
  }, [celebration]);

  // Reset the ref when celebration changes
  useEffect(() => {
    if (!celebration) {
      hasPlayedRef.current = false;
    }
  }, [celebration]);

  if (!celebration) return null;

  const icon =
    MILESTONE_ICONS[celebration.percentage] ?? '🏆';
  const label =
    MILESTONE_LABELS[celebration.percentage] ?? 'Milestone reached';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-sm animate-scale-in">
        {/* Milestone icon */}
        <div className="text-6xl mb-4">{icon}</div>

        {/* Ring */}
        <div className="flex justify-center mb-6">
          <ProgressRing
            percentage={celebration.percentage}
            size={140}
            strokeWidth={6}
            color={celebration.skillColor}
          >
            <span className="text-2xl font-bold text-zinc-100">
              {celebration.percentage}%
            </span>
          </ProgressRing>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-zinc-50 mb-1">
          {label}
        </h2>
        <p className="text-sm text-zinc-400 mb-1">
          {celebration.skillIcon} {celebration.skillName}
        </p>
        <p className="text-xs text-zinc-500 mb-8">
          {celebration.totalHours}h of {celebration.targetHours}h
        </p>

        {/* Dismiss */}
        <Button
          variant="primary"
          size="lg"
          onClick={dismissCelebration}
          className="px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
