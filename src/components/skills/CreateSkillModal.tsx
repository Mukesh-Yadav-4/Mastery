import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { SKILL_COLORS, SKILL_ICONS, TARGET_HOUR_PRESETS } from '../../lib/constants';

interface CreateSkillModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateSkillModal({ open, onClose }: CreateSkillModalProps) {
  const { createSkill } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<string>(SKILL_ICONS[0]);
  const [color, setColor] = useState<string>(SKILL_COLORS[0]);
  const [targetHours, setTargetHours] = useState(100);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setName('');
    setDescription('');
    setIcon(SKILL_ICONS[0]);
    setColor(SKILL_COLORS[0]);
    setTargetHours(100);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Give your skill a name');
      return;
    }

    if (targetHours <= 0) {
      setError('Target must be greater than 0');
      return;
    }

    createSkill({ name, description, icon, color, targetHours });
    resetForm();
    onClose();
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="New Skill">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Icon + Name row */}
        <div className="flex gap-3 items-start">
          {/* Selected icon preview */}
          <div
            className="flex-shrink-0 w-10 h-10 rounded-button flex items-center justify-center text-xl"
            style={{ backgroundColor: color + '20' }}
          >
            {icon}
          </div>
          <div className="flex-1">
            <Input
              placeholder="What are you learning?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Icon picker */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">
            Icon
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SKILL_ICONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={cn(
                  'w-9 h-9 rounded-lg text-base flex items-center justify-center',
                  'transition-all duration-150 cursor-pointer',
                  icon === emoji
                    ? 'bg-elevated ring-2 ring-accent scale-110'
                    : 'hover:bg-elevated/60',
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {SKILL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'w-7 h-7 rounded-full transition-all duration-150 cursor-pointer',
                  color === c
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110'
                    : 'hover:scale-110',
                )}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Target Hours */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">
            Target hours
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {TARGET_HOUR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTargetHours(preset)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer',
                  targetHours === preset
                    ? 'bg-accent text-white'
                    : 'bg-elevated text-zinc-400 hover:text-zinc-200',
                )}
              >
                {preset}h
              </button>
            ))}
          </div>
          <Input
            type="number"
            min={1}
            max={10000}
            value={targetHours}
            onChange={(e) => setTargetHours(Number(e.target.value))}
            hint="Hours of deliberate practice you're committing to"
          />
        </div>

        {/* Description (optional) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400">
            Description <span className="text-zinc-600">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does deliberate practice look like for this skill?"
            rows={2}
            className="w-full rounded-input bg-elevated px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 border border-edge transition-colors duration-150 hover:border-zinc-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 resize-none"
          />
        </div>

        {/* Error */}
        {error ? (
          <p className="text-sm text-danger text-center animate-fade-in">
            {error}
          </p>
        ) : null}

        {/* Submit */}
        <Button type="submit" variant="primary" size="lg" className="w-full">
          Create skill
        </Button>
      </form>
    </Modal>
  );
}
