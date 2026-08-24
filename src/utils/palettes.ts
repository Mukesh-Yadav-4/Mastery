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

// ── Skill Color Progression Engine ────────────────────────────

export interface EvolvedSkillPalette {
  stage: 'foundation' | 'intermediate' | 'advanced' | 'mastery';
  coreColor: string; // Base sphere body color
  emissiveColor: string; // Restrained gentle self-illumination tone
  secondaryAccent: string; // Harmonious accent for secondary orbital rings & lattice
  rimHighlight: string; // Outer rim / specular shimmer highlight
  haloColor: string; // Concentric halo disc tint
  haloOpacity: number; // Controlled halo opacity [0.20, 0.40]
  structureTier: number; // 1 to 6
}

function hexToHsl(hex: string): [number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Calculates evolved skill color palette as practice hours progress.
 * Preserves the recognizable base color identity while evolving chromatic depth,
 * secondary orbital harmonies, and iridescent spectral highlights.
 */
export function getEvolvedSkillPalette(
  baseColorHex: string,
  totalHours: number,
  tier: number = 1,
): EvolvedSkillPalette {
  const [h, s, l] = hexToHsl(baseColorHex || '#818cf8');

  // Stage 1: Foundation / Novice (< 10h, Tier 1)
  if (totalHours < 10 && tier <= 1) {
    return {
      stage: 'foundation',
      coreColor: baseColorHex,
      emissiveColor: baseColorHex,
      secondaryAccent: hslToHex(h, Math.max(50, s - 10), Math.min(85, l + 12)),
      rimHighlight: hslToHex(h, Math.max(40, s - 15), Math.min(90, l + 20)),
      haloColor: baseColorHex,
      haloOpacity: 0.22,
      structureTier: 1,
    };
  }

  // Stage 2: Intermediate (10h - 30h, Tier 2-3)
  if (totalHours < 30 && tier <= 3) {
    const richCore = hslToHex(h, Math.min(95, s + 8), Math.max(45, l - 2));
    const secondaryHue = h + 18;
    return {
      stage: 'intermediate',
      coreColor: richCore,
      emissiveColor: richCore,
      secondaryAccent: hslToHex(secondaryHue, Math.min(90, s + 5), Math.min(80, l + 10)),
      rimHighlight: hslToHex(h - 10, Math.min(85, s), Math.min(88, l + 18)),
      haloColor: richCore,
      haloOpacity: 0.28,
      structureTier: Math.max(2, tier),
    };
  }

  // Stage 3: Advanced (30h - 100h, Tier 4-5)
  if (totalHours < 100 && tier <= 5) {
    const dualCore = hslToHex(h + 6, Math.min(98, s + 12), Math.max(48, l - 3));
    const spectralAccent = hslToHex(h + 35, Math.min(95, s + 10), Math.min(78, l + 14));
    return {
      stage: 'advanced',
      coreColor: dualCore,
      emissiveColor: dualCore,
      secondaryAccent: spectralAccent,
      rimHighlight: hslToHex(h - 20, 75, 92),
      haloColor: spectralAccent,
      haloOpacity: 0.34,
      structureTier: Math.max(4, tier),
    };
  }

  // Stage 4: Deep Mastery (100h+, Tier 6)
  const jewelCore = hslToHex(h + 10, 100, Math.max(50, l - 2));
  // Iridescent gold/platinum celestial accent
  const celestialAccent = hslToHex(45, 90, 75); // Radiant gold shimmer
  const spectralRim = hslToHex(h - 25, 80, 94); // Iridescent platinum

  return {
    stage: 'mastery',
    coreColor: jewelCore,
    emissiveColor: jewelCore,
    secondaryAccent: celestialAccent,
    rimHighlight: spectralRim,
    haloColor: jewelCore,
    haloOpacity: 0.38,
    structureTier: Math.max(5, tier),
  };
}
