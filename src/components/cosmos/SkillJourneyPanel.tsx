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

    // Capture pointer events on document
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

      {/* ── Main Skill Journey Container (Floating Overlay) ───── */}
      <aside
        ref={panelRef}
        onPointerDown={(e) => e.stopPropagation()}
        className={cn(
          // Desktop & Tablet Floating Right-Side Panel
          'md:absolute md:right-4 md:top-4 md:bottom-4 md:w-[350px] lg:w-[380px] md:z-40',
          'md:rounded-3xl md:border md:border-edge/80 md:bg-[#070a16]/95 md:backdrop-blur-xl md:shadow-2xl md:shadow-black/90',
          // Mobile Fixed Bottom Sheet
          'fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] rounded-t-3xl border-t border-edge/80 bg-[#070a16]/98 backdrop-blur-2xl shadow-2xl p-4 sm:p-5 md:p-5',
          'flex flex-col justify-between overflow-y-auto select-none transition-all duration-300 ease-out animate-fade-in',
          className,
        )}
        aria-label={`Skill Journey for ${node.name}`}
      >
        <div className="space-y-4">
          {/* ── 1. Header ──────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-edge/40">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border border-white/20 shadow-lg"
                style={{
                  backgroundColor: `${node.color}25`,
                  boxShadow: `0 0 20px ${node.color}40`,
                }}
              >
                {node.icon}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 truncate">
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100 uppercase tracking-tight truncate">
                    {node.name}
                  </h3>
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-accent px-1.5 py-0.5 rounded-full bg-accent/15 border border-accent/30 flex-shrink-0">
                    <Zap size={10} className="fill-current" />
                    Lv.{node.level}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">
                    {node.formattedDuration} invested
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-[10px] font-medium text-zinc-400">
                    Goal: {node.targetHours}h
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Delete & Close */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="p-1.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-colors cursor-pointer"
                title="Delete Skill"
                aria-label="Delete Skill"
              >
                <Trash2 size={16} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-surface border border-transparent hover:border-edge/60 transition-colors cursor-pointer"
                title="Close Journey Panel (Esc)"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── 2. Category Switcher (Safe In-Place Editing) ───── */}
          <div className="relative" ref={categoryMenuRef}>
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface/60 border border-edge/50 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Journey Category:
                </span>
                <span className="font-semibold text-zinc-200 flex items-center gap-1">
                  <span>{currentCategoryInfo.icon}</span>
                  <span>{currentCategoryInfo.label}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowCategoryMenu((prev) => !prev)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface hover:bg-surface-elevated border border-edge/60 text-[11px] font-medium text-accent hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <span>Change</span>
                <ChevronDown size={12} className={cn('transition-transform', showCategoryMenu && 'rotate-180')} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {showCategoryMenu && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 p-1.5 rounded-2xl bg-[#0b0e22] border border-edge/80 shadow-2xl space-y-1 animate-fade-in">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleCategorySelect(opt.value)}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer',
                      currentCategory === opt.value
                        ? 'bg-accent/20 text-accent border border-accent/40 font-bold'
                        : 'text-zinc-300 hover:bg-surface hover:text-white',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </span>
                    {opt.value === 'generic' ? (
                      <span className="text-[10px] text-zinc-500">4 Stages</span>
                    ) : (
                      <span className="text-[10px] text-zinc-500">Curated</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── 3. Current Stage & Horizon Card ─────────────────── */}
          <div className="rounded-2xl bg-surface/80 border border-edge/70 p-3.5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <Layers size={12} />
                Current Stage
              </span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-canvas/80 border border-edge/60"
                style={{ color: node.color }}
              >
                {currentStage.name}
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {currentStage.description}
            </p>

            {/* Stage Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 tabular-nums">
                <span>
                  {totalHours.toFixed(1)}h / {stageMax >= 10000 ? '1,200h+' : `${stageMax}h`}
                </span>
                <span className="text-zinc-300 font-semibold">
                  {Math.round(stageProgressPercent)}% of stage
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-canvas/90 border border-edge/40 overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${stageProgressPercent}%`,
                    backgroundColor: node.color,
                    boxShadow: `0 0 10px ${node.color}80`,
                  }}
                />
              </div>
            </div>

            {/* Next Horizon Checkpoint */}
            {nextHorizon ? (
              <div className="pt-2 border-t border-edge/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Compass size={13} className="text-cyan-400 flex-shrink-0" />
                  <span className="font-bold">Next Horizon · {nextHorizon}h</span>
                </div>
                {typeof hoursRemaining === 'number' && hoursRemaining > 0 && (
                  <span className="text-[10px] text-zinc-400 tabular-nums">
                    {hoursRemaining.toFixed(1)}h away
                  </span>
                )}
              </div>
            ) : (
              <div className="pt-2 border-t border-edge/30 flex items-center gap-1.5 text-xs text-zinc-300">
                <Sparkles size={13} className="text-amber-400" />
                <span className="font-bold">Journey Milestone Reached</span>
              </div>
            )}
          </div>

          {/* ── 4. Growth Path Visualization ─────────────────────── */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Your Growth Path
              </h4>
              <span className="text-[10px] text-zinc-500 font-medium truncate max-w-[180px]">
                {profile.title}
              </span>
            </div>

            <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-edge/50">
              {profile.stages.map((stg) => {
                const isCompleted = totalHours >= stg.maxHours && stg.maxHours < 10000;
                const isCurrent = currentStage.id === stg.id;

                return (
                  <div key={stg.id} className="relative flex items-start gap-2.5 group">
                    {/* Node Dot on Cosmic Track */}
                    <div
                      className={cn(
                        'absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300',
                        isCompleted
                          ? 'bg-accent/20 border-accent text-accent shadow-[0_0_10px_rgba(129,140,248,0.5)]'
                          : isCurrent
                          ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/40 shadow-[0_0_14px_rgba(34,211,238,0.7)]'
                          : 'bg-canvas/80 border-edge/60 text-zinc-600',
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={12} className="text-accent" />
                      ) : (
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            isCurrent ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600',
                          )}
                        />
                      )}
                    </div>

                    {/* Stage Details */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            'text-xs font-bold transition-colors',
                            isCurrent
                              ? 'text-cyan-300'
                              : isCompleted
                              ? 'text-zinc-200'
                              : 'text-zinc-500',
                          )}
                        >
                          {stg.name}
                        </span>

                        <span className="text-[10px] font-semibold text-zinc-500 tabular-nums">
                          {stg.minHours}–{stg.maxHours >= 10000 ? '1,200h+' : `${stg.maxHours}h`}
                        </span>
                      </div>

                      <p
                        className={cn(
                          'text-[11px] leading-tight',
                          isCurrent
                            ? 'text-zinc-300'
                            : isCompleted
                            ? 'text-zinc-400'
                            : 'text-zinc-600',
                        )}
                      >
                        {stg.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 5. Primary Start Focus CTA ───────────────────────── */}
        <div className="pt-4 mt-2 border-t border-edge/50">
          <Button
            variant="primary"
            size="md"
            onClick={() => onStartFocus(node.id)}
            className="w-full font-bold gap-2 py-2.5 text-sm shadow-[0_0_20px_rgba(129,140,248,0.4)] hover:shadow-[0_0_28px_rgba(129,140,248,0.6)] cursor-pointer"
          >
            <Play size={15} className="fill-current" />
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
