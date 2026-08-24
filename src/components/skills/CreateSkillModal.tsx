import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { SKILL_COLORS, SKILL_ICONS, TARGET_HOUR_PRESETS } from '../../lib/constants';
import type { SkillCategory } from '../../types';

interface CreateSkillModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES: Array<{ id: SkillCategory; label: string; icon: string }> = [
  { id: 'programming', label: 'Programming', icon: '💻' },
  { id: 'language', label: 'Language', icon: '🌐' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'creative', label: 'Creative', icon: '🎨' },
  { id: 'fitness', label: 'Fitness', icon: '⚡' },
  { id: 'generic', label: 'General / Other', icon: '🎯' },
];

export function CreateSkillModal({ open, onClose }: CreateSkillModalProps) {
  const { createSkill } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SkillCategory>('generic');
  const [icon, setIcon] = useState<string>(SKILL_ICONS[0]);
  const [color, setColor] = useState<string>(SKILL_COLORS[0]);
  const [targetHours, setTargetHours] = useState(100);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setName('');
    setDescription('');
    setCategory('generic');
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

    createSkill({ name, description, category, icon, color, targetHours });
    resetForm();
    onClose();
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="New Skill">
      <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="What are you learning? (e.g. Python, German, Piano)"
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                setName(val);
                // Auto-suggest category based on typed name if currently default generic
                if (category === 'generic') {
                  const lower = val.toLowerCase();
                  if (lower.includes('python') || lower.includes('code') || lower.includes('react') || lower.includes('rust')) {
                    setCategory('programming');
                  } else if (lower.includes('german') || lower.includes('spanish') || lower.includes('french') || lower.includes('japanese')) {
                    setCategory('language');
                  } else if (lower.includes('guitar') || lower.includes('piano') || lower.includes('violin') || lower.includes('music')) {
                    setCategory('music');
                  } else if (lower.includes('draw') || lower.includes('paint') || lower.includes('art') || lower.includes('write')) {
                    setCategory('creative');
                  } else if (lower.includes('run') || lower.includes('gym') || lower.includes('fitness') || lower.includes('workout')) {
                    setCategory('fitness');
                  }
                }
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Category Picker */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
            Category & Progression Horizon
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  'px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5',
                  'border transition-all duration-150 cursor-pointer',
                  category === cat.id
                    ? 'bg-accent/20 border-accent text-zinc-100 shadow-[0_0_12px_rgba(129,140,248,0.3)] ring-1 ring-accent/60'
                    : 'bg-surface/60 border-edge/60 text-zinc-400 hover:text-zinc-200 hover:bg-surface',
                )}
              >
                <span>{cat.icon}</span>
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Icon picker */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
            Icon
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SKILL_ICONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm flex items-center justify-center',
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
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {SKILL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'w-6 h-6 rounded-full transition-all duration-150 cursor-pointer',
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
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
            Deliberate Practice Goal (Hours)
          </label>
          <div className="flex gap-2 mb-2">
            {TARGET_HOUR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTargetHours(preset)}
                className={cn(
                  'flex-1 py-1.5 text-xs rounded-button border font-medium cursor-pointer',
                  'transition-all duration-150',
                  targetHours === preset
                    ? 'border-accent bg-accent/15 text-accent font-semibold'
                    : 'border-edge bg-elevated/50 text-zinc-400 hover:text-zinc-200 hover:bg-elevated',
                )}
              >
                {preset}h
              </button>
            ))}
          </div>
          <Input
            type="number"
            min="1"
            max="10000"
            value={targetHours || ''}
            onChange={(e) => setTargetHours(Number(e.target.value))}
            placeholder="Custom hours"
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-danger font-medium animate-fade-in">{error}</p>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-2 border-t border-edge/40">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleClose}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="cursor-pointer font-bold shadow-[0_0_14px_rgba(129,140,248,0.4)]"
          >
            Create Skill
          </Button>
        </div>
      </form>
    </Modal>
  );
}
