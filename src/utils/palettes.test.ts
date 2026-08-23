import { describe, it, expect } from 'vitest';
import {
  getCorePalette,
  CORE_PALETTES,
  DEFAULT_PALETTE_ID,
  CORE_PALETTES_LIST,
} from './palettes';

describe('Core Color Palettes', () => {
  it('contains exactly 5 curated premium cosmic palettes', () => {
    expect(CORE_PALETTES_LIST).toHaveLength(5);
    expect(Object.keys(CORE_PALETTES)).toEqual([
      'violet',
      'azure',
      'emerald',
      'solar',
      'aurora',
    ]);
  });

  it('returns Violet Ascension as the default palette', () => {
    const defaultPalette = getCorePalette();
    expect(defaultPalette.id).toBe(DEFAULT_PALETTE_ID);
    expect(defaultPalette.name).toBe('Violet');
    expect(defaultPalette.themeName).toBe('Ascension');
    expect(defaultPalette.corePrimary).toBe('#6366f1');
  });

  it('correctly retrieves all 5 palettes by ID', () => {
    expect(getCorePalette('azure').name).toBe('Azure');
    expect(getCorePalette('azure').themeName).toBe('Clarity');

    expect(getCorePalette('emerald').name).toBe('Emerald');
    expect(getCorePalette('emerald').themeName).toBe('Growth');

    expect(getCorePalette('solar').name).toBe('Solar');
    expect(getCorePalette('solar').themeName).toBe('Vitality');

    expect(getCorePalette('aurora').name).toBe('Aurora');
    expect(getCorePalette('aurora').themeName).toBe('Iridescent');
  });

  it('gracefully falls back to default for invalid palette IDs', () => {
    expect(getCorePalette('neon-pink').id).toBe(DEFAULT_PALETTE_ID);
    expect(getCorePalette('').id).toBe(DEFAULT_PALETTE_ID);
    expect(getCorePalette(undefined).id).toBe(DEFAULT_PALETTE_ID);
  });

  it('ensures all palettes have valid color hex values', () => {
    const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

    CORE_PALETTES_LIST.forEach((palette) => {
      expect(palette.coreInner).toMatch(hexRegex);
      expect(palette.corePrimary).toMatch(hexRegex);
      expect(palette.coreSecondary).toMatch(hexRegex);
      expect(palette.aura).toMatch(hexRegex);
      expect(palette.accent).toMatch(hexRegex);
      expect(palette.ring1).toMatch(hexRegex);
      expect(palette.ring2).toMatch(hexRegex);
      expect(palette.ring3).toMatch(hexRegex);
      expect(palette.energy).toMatch(hexRegex);
      expect(palette.pulse).toMatch(hexRegex);
      expect(palette.hudAccent).toMatch(hexRegex);
      expect(palette.milestoneHighlight).toMatch(hexRegex);
    });
  });
});
