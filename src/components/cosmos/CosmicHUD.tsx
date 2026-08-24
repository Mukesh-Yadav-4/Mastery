import type { LevelInfo } from '../../types';
import type { CosmicNodeData } from './CosmicNode';
import { Button } from '../ui/Button';
import { Zap, Clock, Flame, Sparkles, Play, Target, Compass } from 'lucide-react';

import type { CorePalette } from '../../utils/palettes';
import { cn } from '../../lib/utils';

interface CosmicHUDProps {
  levelInfo: LevelInfo;
  totalXP: number;
  totalDurationFormatted: string;
  streakDays: number;
  selectedNode: CosmicNodeData | null;
  palette?: CorePalette;
  onStartFocus: (skillId: string) => void;
  onOpenCreateSkill: () => void;
  onOpenJourney?: () => void;
}

export function CosmicHUD({
  levelInfo,
  totalXP,
  totalDurationFormatted,
  streakDays,
  selectedNode,
  palette,
  onStartFocus,
  onOpenCreateSkill,
  onOpenJourney,
}: CosmicHUDProps) {
  const {
    level,
    xpInCurrentLevel,
    xpRequiredForNextLevel,
    xpToNextLevel,
    progressPercentage,
  } = levelInfo;

  const clampedProgress = Math.min(100, Math.max(0, progressPercentage));

  const getCosmicTitle = (lvl: number) => {
    if (lvl >= 20) return 'Universal Architect';
    if (lvl >= 15) return 'Cosmic Master';
    if (lvl >= 12) return 'Ascendant';
    if (lvl >= 8) return 'The Builder';
    if (lvl >= 5) return 'Pioneer';
    if (lvl >= 3) return 'Practitioner';
    return 'Initiate';
  };

  const progression = selectedNode?.progression;
  const accentColor = palette?.hudAccent ?? '#818cf8';
  const badgeBg = palette?.hudBadgeBg ?? 'rgba(129,140,248,0.15)';
  const badgeBorder = palette?.hudBorder ?? 'rgba(129,140,248,0.3)';

  return (
    <>
      {/* ── Top Left Floating HUD: Journey & Level ──────────── */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-40 max-w-[240px] sm:max-w-[280px] w-full pointer-events-auto">
        <div className="rounded-2xl bg-surface/85 border border-edge/60 p-3 sm:p-3.5 backdrop-blur-md shadow-xl shadow-black/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-xl border text-xs shadow-[0_0_10px_rgba(129,140,248,0.4)]"
                style={{
                  backgroundColor: badgeBg,
                  borderColor: badgeBorder,
                  color: accentColor,
                }}
              >
                <Zap size={13} className="fill-current opacity-80" />
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Your Journey
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  <span>Level {level}</span>
                  <span
                    className="text-[10px] sm:text-[11px] font-medium"
                    style={{ color: accentColor }}
                  >
                    • {getCosmicTitle(level)}
                  </span>
                </h3>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-400 tabular-nums">
              <span>
                {xpInCurrentLevel.toLocaleString()} / {xpRequiredForNextLevel.toLocaleString()} XP
              </span>
              <span className="text-accent font-semibold">
                {xpToNextLevel} XP to Lvl {level + 1}
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-canvas/80 border border-edge/40 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent via-cyan-400 to-accent-light transition-all duration-700"
                style={{
                  width: `${clampedProgress}%`,
                  boxShadow: '0 0 10px rgba(34,211,238,0.5)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Right Floating HUD: Mastery Stats ───────────── */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40 hidden sm:flex items-center gap-2 pointer-events-auto">
        {/* Practice Hours */}
        <div className="rounded-xl bg-surface/85 border border-edge/60 px-3 py-1.5 backdrop-blur-md shadow-lg shadow-black/30 flex items-center gap-2">
          <Clock size={14} className="text-accent" />
          <div className="text-right">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
              Total Practice
            </span>
            <span className="text-xs font-bold text-zinc-100 tabular-nums">
              {totalDurationFormatted}
            </span>
          </div>
        </div>

        {/* Lifetime XP -> MASTERY XP */}
        <div className="rounded-xl bg-surface/85 border border-edge/60 px-3 py-1.5 backdrop-blur-md shadow-lg shadow-black/30 flex items-center gap-2">
          <Sparkles size={14} className="text-cyan-400" />
          <div className="text-right">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
              Mastery XP
            </span>
            <span className="text-xs font-bold text-zinc-100 tabular-nums">
              {totalXP.toLocaleString()} XP
            </span>
          </div>
        </div>

        {/* Streak */}
        <div className="rounded-xl bg-surface/85 border border-edge/60 px-3 py-1.5 backdrop-blur-md shadow-lg shadow-black/30 flex items-center gap-2">
          <Flame size={14} className="text-orange-400" />
          <div className="text-right">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
              Streak
            </span>
            <span className="text-xs font-bold text-zinc-100 tabular-nums">
              {streakDays > 0 ? `${streakDays}d` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom Floating Dock: Compact Active Capability HUD ── */}
      <div className="absolute bottom-2.5 sm:bottom-3 inset-x-3 sm:inset-x-4 z-40 max-w-lg mx-auto pointer-events-auto">
        <div className="rounded-2xl bg-surface/90 border border-edge/80 px-3 py-2 sm:px-3.5 sm:py-2.5 backdrop-blur-md shadow-2xl shadow-black/70 flex items-center justify-between gap-2.5 transition-all">
          {/* Selected Focus Skill Summary */}
          <div
            onClick={selectedNode ? onOpenJourney : undefined}
            className={cn(
              'flex items-center gap-2.5 min-w-0 flex-1',
              selectedNode ? 'cursor-pointer group hover:opacity-90 transition-opacity' : '',
            )}
            title={selectedNode ? `Open ${selectedNode.name} Journey` : undefined}
            role={selectedNode ? 'button' : undefined}
            tabIndex={selectedNode ? 0 : undefined}
            onKeyDown={(e) => {
              if (selectedNode && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onOpenJourney?.();
              }
            }}
          >
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border border-white/10 shadow-inner group-hover:scale-105 transition-transform"
              style={{
                backgroundColor: selectedNode ? `${selectedNode.color}25` : 'rgba(129,140,248,0.2)',
              }}
            >
              {selectedNode ? selectedNode.icon : '🎯'}
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 truncate">
                <h4 className="text-xs sm:text-sm font-bold text-zinc-100 truncate group-hover:text-accent transition-colors">
                  {selectedNode ? selectedNode.name : 'Cosmos Core'}
                </h4>
                {progression && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-accent/15 border border-accent/30 text-accent flex-shrink-0">
                    {progression.currentStage.name}
                  </span>
                )}
              </div>

              {selectedNode ? (
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-zinc-400 truncate">
                  <span className="font-semibold text-zinc-300">
                    {selectedNode.formattedDuration}
                  </span>
                  {progression?.nextVisualMilestoneHours ? (
                    <span className="text-zinc-500 flex items-center gap-0.5">
                      • <Compass size={10} className="text-cyan-400" />
                      Next: {progression.nextVisualMilestoneHours}h
                    </span>
                  ) : (
                    <span className="text-zinc-500">• Deep Mastery</span>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-zinc-400 truncate">
                  Your cosmos begins with a skill
                </p>
              )}
            </div>
          </div>

          {/* Compact CTA Button */}
          <div className="flex items-center flex-shrink-0">
            {selectedNode ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onStartFocus(selectedNode.id)}
                className="font-bold gap-1.5 px-3.5 py-1.5 h-8 text-xs shadow-[0_0_14px_rgba(129,140,248,0.4)] hover:shadow-[0_0_20px_rgba(129,140,248,0.6)] cursor-pointer transition-shadow"
              >
                <Play size={13} className="fill-current" />
                <span>Start Focus</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenCreateSkill}
                className="font-semibold gap-1 px-3 py-1.5 h-8 text-xs shadow-[0_0_14px_rgba(129,140,248,0.4)]"
              >
                <Target size={13} />
                <span>Add Skill</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
