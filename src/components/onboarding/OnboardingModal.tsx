import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { STARTER_PACKS, type StarterPack } from '../../utils/starterPacks';
import { Sparkles, ArrowRight, Check, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPack: (pack: StarterPack) => void;
  onCustomStart: () => void;
}

export function OnboardingModal({
  isOpen,
  onClose,
  onSelectPack,
  onCustomStart,
}: OnboardingModalProps) {
  const [selectedPackId, setSelectedPackId] = useState<string>(
    STARTER_PACKS[0].id,
  );

  const selectedPack =
    STARTER_PACKS.find((p) => p.id === selectedPackId) || STARTER_PACKS[0];

  const handleApply = () => {
    onSelectPack(selectedPack);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Choose Your Mastery Universe"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-accent/10 border border-accent/20">
          <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center text-accent flex-shrink-0">
            <Sparkles size={16} />
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Welcome to <span className="text-accent font-bold">Mastery</span>.
            Select a tailored deliberate practice pack to populate your 3D
            Cosmos, or start with your own custom skills.
          </p>
        </div>

        {/* ── Pack Selection Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {STARTER_PACKS.map((pack) => {
            const isSelected = selectedPackId === pack.id;
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => {
                  setSelectedPackId(pack.id);
                }}
                className={cn(
                  'p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group relative',
                  isSelected
                    ? 'bg-surface-elevated/90 border-accent/80 shadow-lg shadow-accent/10 ring-1 ring-accent/50'
                    : 'bg-surface/50 border-edge/40 hover:border-zinc-500 hover:bg-surface-elevated/40',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{pack.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-100 group-hover:text-white">
                        {pack.name}
                      </h4>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                      <Check size={12} />
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2 leading-tight">
                  {pack.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {/* ── Selected Pack Preview ── */}
        <div className="rounded-2xl bg-canvas/80 border border-edge/60 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Included In {selectedPack.name}:
            </span>
            <span className="text-[10px] text-accent font-bold px-2 py-0.5 rounded-lg bg-accent/15 border border-accent/30">
              {selectedPack.skills.reduce((acc, s) => acc + s.targetHours, 0)}h Total Domain Goal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedPack.skills.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-surface/60 border border-edge/40"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-base flex-shrink-0">{skill.icon}</span>
                  <span className="text-xs font-medium text-zinc-200 truncate">
                    {skill.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-accent px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 tabular-nums flex-shrink-0">
                  {skill.targetHours}h
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-between pt-2 border-t border-edge/40">
          <button
            type="button"
            onClick={() => {
              onCustomStart();
              onClose();
            }}
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 cursor-pointer py-2 px-3 rounded-xl hover:bg-white/[0.04] transition-colors"
          >
            <Plus size={13} />
            <span>Start with Blank Canvas</span>
          </button>

          <Button
            variant="primary"
            size="md"
            onClick={handleApply}
            className="flex items-center gap-2 shadow-lg shadow-accent/20"
          >
            <span>Initialize Universe</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
