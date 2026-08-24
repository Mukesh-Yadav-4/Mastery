import { useState } from 'react';
import type { Skill, SessionReflection } from '../../types';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { formatDuration, getSessionXPBreakdown } from '../../utils/calculations';
import {
  Star,
  Target,
  Sparkles,
  Zap,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface SessionReflectionModalProps {
  open: boolean;
  skill: Skill | null;
  durationSeconds: number;
  initialIntention?: string;
  onComplete: (reflection: SessionReflection) => void;
  onSkip: () => void;
}

const FLOW_RATINGS = [
  { stars: 1, label: 'Distracted', emoji: '🌪️', desc: 'Frequent interruptions' },
  { stars: 2, label: 'Fragmented', emoji: '⚡', desc: 'Struggled to lock in' },
  { stars: 3, label: 'Steady', emoji: '🌊', desc: 'Solid, consistent focus' },
  { stars: 4, label: 'Deep Focus', emoji: '🪐', desc: 'High concentration' },
  { stars: 5, label: 'Pure Flow', emoji: '🌌', desc: 'Effortless absorption' },
];

const REFLECTION_TAGS = [
  'Effortless Flow',
  'Technical Breakthrough',
  'Overcame Friction',
  'Needs More Repetition',
  'Physical Fatigue',
  'Clear Next Target',
];

export function SessionReflectionModal({
  open,
  skill,
  durationSeconds,
  initialIntention,
  onComplete,
  onSkip,
}: SessionReflectionModalProps) {
  const [rating, setRating] = useState<number>(4);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (!open || !skill) return null;

  const xpBreakdown = getSessionXPBreakdown(durationSeconds, 'completed');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleCommit = () => {
    const combinedNotes = [
      ...selectedTags,
      notes.trim(),
    ]
      .filter(Boolean)
      .join(' • ');

    onComplete({
      qualityRating: rating,
      notes: combinedNotes || undefined,
      friction: selectedTags.includes('Overcame Friction') || selectedTags.includes('Needs More Repetition')
        ? notes.trim() || undefined
        : undefined,
    });
  };

  const currentRatingInfo = FLOW_RATINGS.find((r) => r.stars === rating) || FLOW_RATINGS[3];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md animate-fade-in" />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl bg-[#090d1f]/95 border border-white/15 p-6 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(129,140,248,0.2)] backdrop-blur-2xl z-10 space-y-5 animate-scale-in">
        {/* Subtle Ambient Skill Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ backgroundColor: skill.color }}
        />

        {/* ── 1. Header & Summary ──────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl border shadow-lg"
              style={{
                backgroundColor: `${skill.color}20`,
                borderColor: `${skill.color}50`,
                boxShadow: `0 0 16px ${skill.color}30`,
              }}
            >
              {skill.icon}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Practice Reflection
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {skill.name}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-black uppercase tracking-wider text-accent flex items-center gap-1 justify-end">
              <Sparkles size={13} />
              +{xpBreakdown.totalXP} XP
            </span>
            <span className="text-xs text-zinc-400 tabular-nums">
              {formatDuration(durationSeconds)}
            </span>
          </div>
        </div>

        {/* ── 2. Display Initial Intention if recorded ─────────── */}
        {initialIntention && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <Target size={14} className="text-accent flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                Session Target:
              </span>
              <p className="text-xs text-zinc-200 font-medium italic">
                "{initialIntention}"
              </p>
            </div>
          </div>
        )}

        {/* ── 3. Flow Depth / Focus Rating (1–5) ─────────────────── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Flame size={14} className="text-amber-400" />
              Focus & Flow Depth
            </label>
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
              <span>{currentRatingInfo.emoji}</span>
              <span>{currentRatingInfo.label}</span>
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {FLOW_RATINGS.map((r) => {
              const isSelected = rating >= r.stars;
              const isCurrent = rating === r.stars;
              return (
                <button
                  key={r.stars}
                  type="button"
                  onClick={() => setRating(r.stars)}
                  className={cn(
                    'flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border transition-all cursor-pointer group',
                    isCurrent
                      ? 'bg-accent/20 border-accent text-white shadow-[0_0_14px_rgba(129,140,248,0.4)]'
                      : isSelected
                      ? 'bg-white/[0.06] border-white/20 text-zinc-200'
                      : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]',
                  )}
                >
                  <Star
                    size={18}
                    className={cn(
                      'transition-transform group-hover:scale-110',
                      isSelected
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-600',
                    )}
                  />
                  <span className="text-[10px] font-bold mt-1">
                    {r.stars}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 4. Quick Reflection Insights & Tags ───────────────── */}
        <div className="space-y-2">
          <label
            htmlFor="reflection-notes-input"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5"
          >
            <Zap size={14} className="text-cyan-400" />
            Quick Insight / What Clicked?
          </label>

          <div className="flex flex-wrap gap-1.5">
            {REFLECTION_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-[10px] font-medium border transition-all cursor-pointer',
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08]',
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <input
            id="reflection-notes-input"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Mastered the left hand leap, next: bring up tempo"
            maxLength={140}
            className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/15 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition-all"
          />
        </div>

        {/* ── 5. Action Buttons ────────────────────────────────── */}
        <div className="pt-2 flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={onSkip}
            className="flex-1 font-semibold text-xs cursor-pointer"
          >
            Skip
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleCommit}
            className="flex-[2] font-bold gap-2 py-3 text-xs shadow-[0_0_24px_rgba(129,140,248,0.5)] hover:shadow-[0_0_36px_rgba(129,140,248,0.8)] cursor-pointer"
          >
            <span>Commit & Ignite Cosmos</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
