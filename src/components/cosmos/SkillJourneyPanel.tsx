import { useState, useEffect, useRef } from 'react';
import type { SceneNodeData } from './Cosmos3DScene';
import { getProgressionProfile } from '../../utils/progression';
import { useApp } from '../../context/AppContext';
import { DeleteSkillModal } from '../skills/DeleteSkillModal';
import { Button } from '../ui/Button';
import type { SkillCategory } from '../../types';
import {
  X,
  Play,
  Compass,
  Zap,
  CheckCircle2,
  Sparkles,
  Layers,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SkillJourneyPanelProps {
  node: SceneNodeData;
  onClose: () => void;
  onStartFocus: (skillId: string) => void;
  className?: string;
}

const CATEGORY_OPTIONS: { value: SkillCategory; label: string; icon: string }[] = [
  { value: 'programming', label: 'Programming', icon: '💻' },
  { value: 'language', label: 'Language', icon: '🗣️' },
  { value: 'music', label: 'Music', icon: '🎵' },
  { value: 'creative', label: 'Creative Arts', icon: '🎨' },
  { value: 'fitness', label: 'Fitness & Athletic', icon: '🏃' },
  { value: 'generic', label: 'General Practice', icon: '🎯' },
];

export function SkillJourneyPanel({
  node,
  onClose,
  onStartFocus,
  className,
}: SkillJourneyPanelProps) {
  const { deleteSkill, updateSkillCategory } = useApp();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const progression = node.progression;
  const currentCategory = (progression?.category as SkillCategory) || 'generic';
  const profile = getProgressionProfile(node.name, currentCategory, node.targetHours || 100);
  const totalHours = progression?.totalHours ?? 0;
  const currentStage = progression?.currentStage ?? profile.stages[0];
  const nextHorizon = progression?.nextVisualMilestoneHours;
  const hoursRemaining = progression?.hoursToNextMilestone;

  // 1. Dismiss on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showDeleteModal) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showDeleteModal]);

  // 2. Dismiss on outside click / tap
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (showDeleteModal) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handlePointerDown);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [onClose, showDeleteModal]);

  // Close category dropdown on click outside
  useEffect(() => {
    function handleClickOutsideCategory(e: MouseEvent) {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(e.target as Node)
      ) {
        setShowCategoryMenu(false);
      }
    }
    if (showCategoryMenu) {
      document.addEventListener('mousedown', handleClickOutsideCategory);
      return () =>
        document.removeEventListener('mousedown', handleClickOutsideCategory);
    }
  }, [showCategoryMenu]);

  // Stage progress calculation within the current stage range
  const stageMin = currentStage.minHours;
  const stageMax = currentStage.maxHours;
  const stageSpan = stageMax - stageMin;
  const stageHoursAccumulated = Math.max(0, totalHours - stageMin);
  const stageProgressPercent =
    stageSpan > 0
      ? Math.min(100, Math.max(0, (stageHoursAccumulated / stageSpan) * 100))
      : 100;

  const handleDeleteConfirmed = () => {
    deleteSkill(node.id);
    onClose();
  };

  const handleCategorySelect = (cat: SkillCategory) => {
    updateSkillCategory(node.id, cat);
    setShowCategoryMenu(false);
  };

  const currentCategoryInfo =
    CATEGORY_OPTIONS.find((c) => c.value === currentCategory) || CATEGORY_OPTIONS[5];

  return (
    <>
      {/* ── Mobile Backdrop (Tapping dismisses sheet) ────────── */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-fade-in"
        aria-hidden="true"
      />

      {/* ── Holographic Contextual Window (Positioned Safely Below YOUR JOURNEY) ───── */}
      <aside
        ref={panelRef}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          background: `radial-gradient(ellipse at 20% 0%, ${node.color}18 0%, transparent 65%), rgba(7, 10, 22, 0.82)`,
          boxShadow: `0 20px 48px -10px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 28px -4px ${node.color}25, inset 0 1px 1px 0 rgba(255, 255, 255, 0.16)`,
        }}
        className={cn(
          // Desktop & Tablet: Floating Holographic Window on the left, below YOUR JOURNEY HUD
          'md:absolute md:left-3 sm:md:left-4 md:top-[128px] md:w-[310px] lg:w-[330px] md:max-h-[min(460px,calc(100dvh-128px-72px))] md:z-40',
          'md:rounded-3xl md:backdrop-blur-2xl',
          // Mobile Fixed Bottom Sheet
          'fixed inset-x-0 bottom-0 z-50 max-h-[82dvh] rounded-t-3xl border-t border-white/10 backdrop-blur-2xl p-4 sm:p-5 md:p-4',
          'flex flex-col justify-between overflow-y-auto select-none transition-all duration-300 ease-out animate-scale-in',
          className,
        )}
        aria-label={`Skill Journey for ${node.name}`}
      >
        <div className="space-y-3">
          {/* ── 1. Holographic Header ───────────────────────────── */}
          <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Luminous Node Icon */}
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border shadow-md transition-transform duration-300"
                style={{
                  backgroundColor: `${node.color}20`,
                  borderColor: `${node.color}50`,
                  boxShadow: `0 0 16px ${node.color}35`,
                }}
              >
                {node.icon}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 truncate">
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate drop-shadow-sm">
                    {node.name}
                  </h3>
                  <span
                    className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full border flex-shrink-0"
                    style={{
                      backgroundColor: `${node.color}18`,
                      borderColor: `${node.color}40`,
                      color: node.color,
                    }}
                  >
                    <Zap size={9} className="fill-current" />
                    Lv.{node.level}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <span className="font-semibold text-zinc-200">
                    {node.formattedDuration}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-[10px] text-zinc-400">
                    Goal: {node.targetHours}h
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Delete & Close */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Delete Skill"
                aria-label="Delete Skill"
              >
                <Trash2 size={14} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close Journey Panel (Esc)"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* ── 2. Compact Category Selector ────────────────────── */}
          <div className="relative" ref={categoryMenuRef}>
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                  Journey:
                </span>
                <span className="font-semibold text-zinc-200 text-[11px] flex items-center gap-1">
                  <span>{currentCategoryInfo.icon}</span>
                  <span>{currentCategoryInfo.label}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowCategoryMenu((prev) => !prev)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[10px] font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <span>Edit</span>
                <ChevronDown size={11} className={cn('transition-transform duration-200', showCategoryMenu && 'rotate-180')} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {showCategoryMenu && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 p-1.5 rounded-xl bg-[#0b0e22]/95 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-0.5 animate-scale-in">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleCategorySelect(opt.value)}
                    className={cn(
                      'w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer',
                      currentCategory === opt.value
                        ? 'bg-accent/20 text-accent border border-accent/40 font-bold'
                        : 'text-zinc-300 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </span>
                    <span className="text-[9px] text-zinc-500">
                      {opt.value === 'generic' ? '4 Stages' : 'Curated'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── 3. Current Stage & Next Horizon ─────────────────── */}
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-3 space-y-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Layers size={11} className="text-accent" />
                Current Stage
              </span>
              <span
                className="px-2 py-0.2 rounded text-[9px] font-black uppercase tracking-wider border shadow-xs"
                style={{
                  backgroundColor: `${node.color}20`,
                  borderColor: `${node.color}50`,
                  color: node.color,
                }}
              >
                {currentStage.name}
              </span>
            </div>

            {/* Description only for current stage */}
            <p className="text-[11px] text-zinc-300 leading-snug">
              {currentStage.description}
            </p>

            {/* Stage Progress Bar */}
            <div className="space-y-1 pt-0.5">
              <div className="flex items-center justify-between text-[9px] text-zinc-400 tabular-nums">
                <span>
                  {totalHours.toFixed(1)}h / {stageMax >= 10000 ? '1,200h+' : `${stageMax}h`}
                </span>
                <span className="text-zinc-200 font-semibold">
                  {Math.round(stageProgressPercent)}%
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-black/40 border border-white/[0.06] overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${stageProgressPercent}%`,
                    backgroundColor: node.color,
                    boxShadow: `0 0 12px ${node.color}90`,
                  }}
                />
              </div>
            </div>

            {/* Next Horizon Checkpoint */}
            {nextHorizon ? (
              <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-zinc-300">
                  <Compass size={12} className="text-cyan-400 flex-shrink-0" />
                  <span className="font-bold">Next: {nextHorizon}h</span>
                </div>
                {typeof hoursRemaining === 'number' && hoursRemaining > 0 && (
                  <span className="text-[10px] text-zinc-400 tabular-nums">
                    {hoursRemaining.toFixed(1)}h away
                  </span>
                )}
              </div>
            ) : (
              <div className="pt-1.5 border-t border-white/[0.06] flex items-center gap-1 text-[11px] text-zinc-300">
                <Sparkles size={12} className="text-amber-400" />
                <span className="font-bold">Journey Milestone Reached</span>
              </div>
            )}
          </div>

          {/* ── 4. Compact Growth Path Track (Internally Scrollable) ─ */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-500">
              <span>Growth Path</span>
              <span className="font-normal text-zinc-500 truncate max-w-[140px]">
                {profile.title}
              </span>
            </div>

            <div className="max-h-[110px] overflow-y-auto pr-1 pl-4 relative space-y-2 before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-white/10">
              {profile.stages.map((stg) => {
                const isCompleted = totalHours >= stg.maxHours && stg.maxHours < 10000;
                const isCurrent = currentStage.id === stg.id;

                return (
                  <div key={stg.id} className="relative flex items-center justify-between text-[11px] gap-2">
                    {/* Node Dot on Cosmic Track */}
                    <div
                      className={cn(
                        'absolute -left-4 w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all duration-300',
                        isCompleted
                          ? 'bg-accent/20 border-accent text-accent'
                          : isCurrent
                          ? 'bg-cyan-400/20 border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_8px_rgba(34,211,238,0.7)]'
                          : 'bg-white/5 border-white/15 text-zinc-600',
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={9} className="text-accent" />
                      ) : (
                        <div
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            isCurrent ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600',
                          )}
                        />
                      )}
                    </div>

                    <span
                      className={cn(
                        'font-medium truncate',
                        isCurrent
                          ? 'text-cyan-300 font-bold'
                          : isCompleted
                          ? 'text-zinc-200'
                          : 'text-zinc-500',
                      )}
                    >
                      {stg.name}
                    </span>

                    <span className="text-[10px] text-zinc-500 font-semibold tabular-nums flex-shrink-0">
                      {stg.minHours}–{stg.maxHours >= 10000 ? '1,200h+' : `${stg.maxHours}h`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 5. Primary Start Focus CTA ───────────────────────── */}
        <div className="pt-2.5 mt-2 border-t border-white/[0.08]">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onStartFocus(node.id)}
            className="w-full font-bold gap-1.5 py-2 text-xs shadow-[0_0_18px_rgba(129,140,248,0.4)] hover:shadow-[0_0_26px_rgba(129,140,248,0.6)] cursor-pointer h-8.5"
          >
            <Play size={13} className="fill-current" />
            <span>Start Focus on {node.name}</span>
          </Button>
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      <DeleteSkillModal
        open={showDeleteModal}
        skillName={node.name}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirmed}
      />
    </>
  );
}
