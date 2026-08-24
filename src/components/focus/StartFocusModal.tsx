import { useState, useEffect, useRef } from 'react';
import type { Skill } from '../../types';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { X, Target, Clock, Play, Sparkles } from 'lucide-react';

interface StartFocusModalProps {
  open: boolean;
  skill: Skill | null;
  onClose: () => void;
  onStart: (
    skillId: string,
    intention?: string,
    targetDurationSeconds?: number | null,
  ) => void;
}

const DURATION_PRESETS = [
  { label: '25m', sublabel: 'Pomodoro', seconds: 25 * 60 },
  { label: '50m', sublabel: 'Deep Focus', seconds: 50 * 60 },
  { label: '90m', sublabel: 'Mastery Block', seconds: 90 * 60 },
  { label: '∞', sublabel: 'Open Flow', seconds: null },
];

const SUGGESTED_INTENTIONS: Record<string, string[]> = {
  music: [
    'Master difficult transition bars at half-tempo',
    'Metronome speed ramp: +5 bpm each clean run',
    'Sight reading new repertoire segment',
    'Clean dynamic control and phrasing polish',
  ],
  programming: [
    'Refactor core module with zero lints',
    'Solve algorithmic edge cases with unit tests',
    'Deep architectural design with no distractions',
    'Debug memory leak / performance bottleneck',
  ],
  language: [
    'Vocabulary drill: 30 active recall cards',
    'Read aloud 2 chapters for accent & cadence',
    'Grammar sentence synthesis with zero lookups',
    'Freeform conversational recording practice',
  ],
  creative: [
    'Generate 10 raw concept sketches without judging',
    'Refine color palette and focal lighting pass',
    'Write uninterrupted 750-word scene draft',
    'Detailed anatomical / perspective study',
  ],
  fitness: [
    'Strict form focus on compound lifts',
    'Zone 2 steady aerobic endurance block',
    'Mobility & active flexibility progression',
    'High intensity interval threshold intervals',
  ],
  generic: [
    'Single micro-target with zero task switching',
    'Deliberate error correction on weak areas',
    'Deep unbroken study of complex material',
    'Active retrieval practice & self-testing',
  ],
};

export function StartFocusModal({
  open,
  skill,
  onClose,
  onStart,
}: StartFocusModalProps) {
  const [intention, setIntention] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number | null>(
    25 * 60,
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setIntention('');
      setSelectedDuration(25 * 60);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  if (!open || !skill) return null;

  const category = skill.category || 'generic';
  const suggestions =
    SUGGESTED_INTENTIONS[category] || SUGGESTED_INTENTIONS.generic;

  const handleStart = () => {
    onStart(skill.id, intention.trim() || undefined, selectedDuration);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleStart();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
      />

      {/* Holographic Focus Launcher Card */}
      <div
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-lg rounded-3xl bg-[#090d1f]/95 border border-white/15 p-6 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(129,140,248,0.15)] backdrop-blur-2xl z-10 space-y-6 animate-scale-in"
      >
        {/* Subtle Ambient Skill Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ backgroundColor: skill.color }}
        />

        {/* ── 1. Header ────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-lg"
              style={{
                backgroundColor: `${skill.color}20`,
                borderColor: `${skill.color}50`,
                boxShadow: `0 0 20px ${skill.color}30`,
              }}
            >
              {skill.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Deliberate Practice
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {skill.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── 2. Deliberate Intention Input ────────────────────── */}
        <div className="space-y-2.5">
          <label
            htmlFor="focus-intention-input"
            className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-300"
          >
            <span className="flex items-center gap-1.5">
              <Target size={14} className="text-accent" />
              Session Micro-Target / Intention
            </span>
            <span className="text-[10px] font-normal text-zinc-500 lowercase">
              (optional)
            </span>
          </label>

          <div className="relative">
            <input
              id="focus-intention-input"
              ref={inputRef}
              type="text"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="e.g. Master bars 1–8 with zero mistakes at 60 bpm"
              maxLength={120}
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/15 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition-all shadow-inner"
            />
          </div>

          {/* Quick Intention Suggestions */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" />
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.slice(0, 3).map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setIntention(sug)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-[11px] font-medium border text-left transition-all cursor-pointer',
                    intention === sug
                      ? 'bg-accent/20 border-accent text-accent font-semibold'
                      : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08]',
                  )}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. Target Duration Matrix ────────────────────────── */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-300">
            <Clock size={14} className="text-cyan-400" />
            Target Duration
          </label>

          <div className="grid grid-cols-4 gap-2">
            {DURATION_PRESETS.map((preset) => {
              const isSelected = selectedDuration === preset.seconds;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setSelectedDuration(preset.seconds)}
                  className={cn(
                    'flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl border transition-all cursor-pointer',
                    isSelected
                      ? 'bg-accent/20 border-accent text-white ring-1 ring-accent/60 shadow-[0_0_16px_rgba(129,140,248,0.4)]'
                      : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200',
                  )}
                >
                  <span className="text-sm font-extrabold tracking-tight">
                    {preset.label}
                  </span>
                  <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">
                    {preset.sublabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 4. Action CTA ────────────────────────────────────── */}
        <div className="pt-2 flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            className="flex-1 font-semibold cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleStart}
            className="flex-[2] font-bold gap-2 py-3 shadow-[0_0_24px_rgba(129,140,248,0.5)] hover:shadow-[0_0_36px_rgba(129,140,248,0.8)] cursor-pointer"
          >
            <Play size={16} className="fill-current" />
            <span>Ignite Focus Chamber</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
