import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createSyntheticFeedbackEvent } from '../../utils/devFeedback';
import { formatDuration } from '../../utils/calculations';
import { Button } from '../ui/Button';
import {
  Sparkles,
  Zap,
  Flame,
  Crown,
  Play,
  Database,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function CosmicDevTools() {
  // Strict development environment guard: never renders in production
  if (!import.meta.env.DEV) {
    return null;
  }

  return <CosmicDevToolsContent />;
}

function CosmicDevToolsContent() {
  const {
    skills,
    skillProgress,
    totalXP,
    triggerDevPreview,
    triggerDevSimulate,
    isDevPreview,
    activeFeedbackEvent,
    dismissFeedback,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string>(
    skills[0]?.id ?? '',
  );
  const [showSimulateSection, setShowSimulateSection] = useState(false);

  const activeSkill =
    skills.find((s) => s.id === selectedSkillId) || skills[0] || null;

  const currentSkillSeconds =
    skillProgress.find((sp) => sp.skill.id === activeSkill?.id)?.totalSeconds ??
    0;

  const handlePreviewDuration = (minutes: number) => {
    if (!activeSkill || !triggerDevPreview) return;
    const durationSeconds = minutes * 60;
    const event = createSyntheticFeedbackEvent(
      activeSkill,
      currentSkillSeconds,
      durationSeconds,
      totalXP,
    );
    triggerDevPreview(event);
    setIsOpen(false);
  };

  const handlePreviewSpecial = (
    type: 'normal' | 'horizon' | 'stage' | 'levelup',
  ) => {
    if (!activeSkill || !triggerDevPreview) return;
    const durationSeconds = 30 * 60;
    const event = createSyntheticFeedbackEvent(
      activeSkill,
      currentSkillSeconds,
      durationSeconds,
      totalXP,
      {
        forceHorizon: type === 'horizon' || type === 'stage',
        forceStage: type === 'stage',
        forceLevelUp: type === 'levelup',
      },
    );
    triggerDevPreview(event);
    setIsOpen(false);
  };

  const handleSimulateSave = (minutes: number) => {
    if (!activeSkill || !triggerDevSimulate) return;
    triggerDevSimulate(minutes * 60, activeSkill.id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Active Preview Banner (Development only) */}
      {isDevPreview && activeFeedbackEvent && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs font-semibold backdrop-blur-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>
              DEV PREVIEW · {formatDuration(activeFeedbackEvent.durationSeconds)}
            </span>
            <button
              type="button"
              onClick={dismissFeedback}
              className="ml-1 hover:text-white cursor-pointer"
              title="Stop Preview"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button (Bottom-Right corner) */}
      <div className="fixed bottom-4 right-4 z-40 select-none">
        {!isOpen ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/90 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-surface hover:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] backdrop-blur-xl transition-all cursor-pointer"
          >
            <Zap size={14} className="fill-current text-amber-400" />
            <span>Preview Feedback</span>
          </button>
        ) : (
          <aside
            className={cn(
              'w-[330px] rounded-3xl p-4 bg-[#070a16]/95 border border-amber-500/35 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_-5px_rgba(245,158,11,0.25)]',
              'flex flex-col space-y-3.5 text-zinc-200 animate-scale-in',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Zap size={13} className="fill-current" />
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Cinematic Dev Tools
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    Development preview & simulation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 p-1 rounded-full hover:bg-white/[0.06] cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Target Skill Picker */}
            {skills.length > 0 && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                  Target Skill
                </label>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.12] rounded-xl px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {skills.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#0b0f1e]">
                      {s.icon} {s.name} ({formatDuration(currentSkillSeconds)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* SECTION 1: PREVIEW ONLY (Zero Data Mutation) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                  <Play size={11} className="fill-current" />
                  <span>Preview Mode (No Save)</span>
                </span>
                <span className="text-[9px] text-zinc-400">Synthetic</span>
              </div>

              {/* Duration Presets */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: '30m', min: 30 },
                  { label: '1h', min: 60 },
                  { label: '2h', min: 120 },
                  { label: '5h', min: 300 },
                  { label: '20h', min: 1200 },
                  { label: '50h', min: 3000 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePreviewDuration(preset.min)}
                    className="py-1.5 px-2 rounded-xl bg-white/[0.05] hover:bg-emerald-500/20 border border-white/[0.08] hover:border-emerald-500/40 text-xs font-bold text-zinc-200 hover:text-emerald-300 transition-all cursor-pointer text-center"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Special Test Cases */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handlePreviewSpecial('horizon')}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-[11px] font-bold text-amber-300 transition-all cursor-pointer"
                >
                  <Sparkles size={12} />
                  <span>Horizon Cross</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePreviewSpecial('stage')}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/30 text-[11px] font-bold text-indigo-300 transition-all cursor-pointer"
                >
                  <Flame size={12} />
                  <span>Stage Transition</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePreviewSpecial('levelup')}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-[11px] font-bold text-cyan-300 transition-all cursor-pointer col-span-2"
                >
                  <Crown size={12} />
                  <span>Global & Skill Level Up</span>
                </button>
              </div>
            </div>

            {/* SECTION 2: SIMULATE + SAVE (Mutates DB) */}
            <div className="pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowSimulateSection(!showSimulateSection)}
                className="w-full flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                <span className="flex items-center gap-1">
                  <Database size={11} />
                  <span>Simulate + Save (Mutates DB)</span>
                </span>
                {showSimulateSection ? (
                  <ChevronUp size={13} />
                ) : (
                  <ChevronDown size={13} />
                )}
              </button>

              {showSimulateSection && (
                <div className="mt-2 p-2.5 rounded-2xl bg-rose-950/30 border border-rose-500/25 space-y-2 animate-slide-up">
                  <p className="text-[10px] text-rose-300/90 leading-tight">
                    Creates an actual focus session record in local database.
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: '15m', min: 15 },
                      { label: '30m', min: 30 },
                      { label: '1h', min: 60 },
                    ].map((preset) => (
                      <Button
                        key={preset.label}
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSimulateSave(preset.min)}
                        className="py-1 text-[11px] font-bold text-rose-200 border-rose-500/30 hover:bg-rose-500/20 cursor-pointer h-7"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
