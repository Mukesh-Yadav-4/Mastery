/**
 * Mastery Core Color Personalization Engine
 *
 * Defines curated cosmic energy palettes for the central Mastery Core
 * and surrounding cosmic environment.
 */

export interface CorePalette {
  id: string;
  name: string;
  themeName: string;
  description: string;
  previewGradient: string; // Tailwind/CSS preview gradient for UI

  // Three.js Hex Colors
  coreInner: string;
  corePrimary: string;
  coreSecondary: string;
  aura: string;
  accent: string;
  ring1: string;
  ring2: string;
  ring3: string;
  energy: string;
  pulse: string;

  // UI Accents
  hudAccent: string;
  hudBadgeBg: string;
  hudBorder: string;
  milestoneHighlight: string;
}

export const CORE_PALETTES: Record<string, CorePalette> = {
  violet: {
    id: 'violet',
    name: 'Violet',
    themeName: 'Ascension',
    description: 'Focused · aspirational',
    previewGradient: 'from-indigo-500 via-purple-500 to-pink-500',
    coreInner: '#818cf8',
    corePrimary: '#6366f1',
    coreSecondary: '#c7d2fe',
    aura: '#818cf8',
    accent: '#22d3ee',
    ring1: '#818cf8',
    ring2: '#22d3ee',
    ring3: '#f472b6',
    energy: '#818cf8',
    pulse: '#f472b6',
    hudAccent: '#818cf8',
    hudBadgeBg: 'rgba(129, 140, 248, 0.15)',
    hudBorder: 'rgba(129, 140, 248, 0.35)',
    milestoneHighlight: '#f472b6',
  },
  azure: {
    id: 'azure',
    name: 'Azure',
    themeName: 'Clarity',
    description: 'Calm · analytical',
    previewGradient: 'from-cyan-400 via-sky-500 to-blue-600',
    coreInner: '#38bdf8',
    corePrimary: '#0ea5e9',
    coreSecondary: '#bae6fd',
    aura: '#0284c7',
    accent: '#38bdf8',
    ring1: '#38bdf8',
    ring2: '#0ea5e9',
    ring3: '#2563eb',
    energy: '#38bdf8',
    pulse: '#60a5fa',
    hudAccent: '#38bdf8',
    hudBadgeBg: 'rgba(56, 189, 248, 0.15)',
    hudBorder: 'rgba(56, 189, 248, 0.35)',
    milestoneHighlight: '#38bdf8',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    themeName: 'Growth',
    description: 'Organic · evolving',
    previewGradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    coreInner: '#34d399',
    corePrimary: '#10b981',
    coreSecondary: '#a7f3d0',
    aura: '#059669',
    accent: '#06b6d4',
    ring1: '#34d399',
    ring2: '#10b981',
    ring3: '#14b8a6',
    energy: '#34d399',
    pulse: '#2dd4bf',
    hudAccent: '#10b981',
    hudBadgeBg: 'rgba(16, 185, 129, 0.15)',
    hudBorder: 'rgba(16, 185, 129, 0.35)',
    milestoneHighlight: '#34d399',
  },
  solar: {
    id: 'solar',
    name: 'Solar',
    themeName: 'Vitality',
    description: 'Warm · energetic',
    previewGradient: 'from-amber-400 via-orange-500 to-rose-500',
    coreInner: '#fbbf24',
    corePrimary: '#f59e0b',
    coreSecondary: '#fef3c7',
    aura: '#d97706',
    accent: '#f43f5e',
    ring1: '#fbbf24',
    ring2: '#f59e0b',
    ring3: '#f97316',
    energy: '#fbbf24',
    pulse: '#f43f5e',
    hudAccent: '#f59e0b',
    hudBadgeBg: 'rgba(245, 158, 11, 0.15)',
    hudBorder: 'rgba(245, 158, 11, 0.35)',
    milestoneHighlight: '#fbbf24',
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    themeName: 'Iridescent',
    description: 'Rare · luminous',
    previewGradient: 'from-purple-400 via-pink-400 to-cyan-400',
    coreInner: '#c084fc',
    corePrimary: '#a855f7',
    coreSecondary: '#f5d0fe',
    aura: '#9333ea',
    accent: '#06b6d4',
    ring1: '#c084fc',
    ring2: '#22d3ee',
    ring3: '#ec4899',
    energy: '#c084fc',
    pulse: '#ec4899',
    hudAccent: '#c084fc',
    hudBadgeBg: 'rgba(192, 132, 252, 0.15)',
    hudBorder: 'rgba(192, 132, 252, 0.35)',
    milestoneHighlight: '#ec4899',
  },
};

export const DEFAULT_PALETTE_ID = 'violet';

export const CORE_PALETTES_LIST = Object.values(CORE_PALETTES);

export function getCorePalette(paletteId?: string): CorePalette {
  if (!paletteId) return CORE_PALETTES[DEFAULT_PALETTE_ID];
  return CORE_PALETTES[paletteId.toLowerCase()] ?? CORE_PALETTES[DEFAULT_PALETTE_ID];
}
