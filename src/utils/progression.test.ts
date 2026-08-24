import { describe, it, expect } from 'vitest';
import {
  getSkillProgressionState,
  getProgressionProfile,
  calculateLevelAura,
  PROGRAMMING_PROGRESSION_PROFILE,
  LANGUAGE_PROGRESSION_PROFILE,
  MUSIC_PROGRESSION_PROFILE,
  CREATIVE_PROGRESSION_PROFILE,
  FITNESS_PROGRESSION_PROFILE,
  GENERIC_PROGRESSION_PROFILE,
} from './progression';

describe('Progression Profile Model & Category Mapping', () => {
  it('correctly maps programming skills and explicit category', () => {
    const p1 = getProgressionProfile('Python');
    expect(p1.id).toBe(PROGRAMMING_PROGRESSION_PROFILE.id);
    expect(p1.category).toBe('programming');

    const p2 = getProgressionProfile('Custom Tool', 'programming');
    expect(p2.id).toBe(PROGRAMMING_PROGRESSION_PROFILE.id);
  });

  it('correctly maps language skills by name or category', () => {
    const l1 = getProgressionProfile('German');
    expect(l1.id).toBe(LANGUAGE_PROGRESSION_PROFILE.id);
    expect(l1.category).toBe('language');
    expect(l1.stages[1].name).toBe('Early Exposure');
    expect(l1.stages[5].name).toBe('High Proficiency');

    const l2 = getProgressionProfile('Custom Course', 'language');
    expect(l2.id).toBe(LANGUAGE_PROGRESSION_PROFILE.id);
  });

  it('correctly maps music, creative, and fitness profiles', () => {
    const m = getProgressionProfile('Piano Practice');
    expect(m.id).toBe(MUSIC_PROGRESSION_PROFILE.id);
    expect(m.stages[2].name).toBe('Repertoire');

    const c = getProgressionProfile('Oil Painting');
    expect(c.id).toBe(CREATIVE_PROGRESSION_PROFILE.id);
    expect(c.stages[3].name).toBe('Project Depth');

    const f = getProgressionProfile('Morning Running');
    expect(f.id).toBe(FITNESS_PROGRESSION_PROFILE.id);
    expect(f.stages[1].name).toBe('Consistency');
  });

  it('correctly falls back to generic profile when unrecognized', () => {
    const g = getProgressionProfile('Random Hobby');
    expect(g.id).toBe(GENERIC_PROGRESSION_PROFILE.id);
    expect(g.category).toBe('generic');
  });
});

describe('Programming Progression Milestones & Horizonal Stages', () => {
  const evaluateHours = (hours: number, level = 1) => {
    return getSkillProgressionState('skill-1', 'Python', hours * 3600, level, 'programming');
  };

  it('evaluates 0h as Foundation (Tier 1)', () => {
    const state = evaluateHours(0);
    expect(state.currentStage.name).toBe('Foundation');
    expect(state.structureTier).toBe(1);
    expect(state.boundedVisualScale).toBeCloseTo(0.70, 2);
    expect(state.nextVisualMilestoneHours).toBe(25);
    expect(state.hoursToNextMilestone).toBe(25);
  });

  it('evaluates 25h as Basic Comfort boundary (Tier 2)', () => {
    const state = evaluateHours(25);
    expect(state.currentStage.name).toBe('Basic Comfort');
    expect(state.structureTier).toBe(2);
    expect(state.boundedVisualScale).toBeCloseTo(0.85, 2);
    expect(state.nextVisualMilestoneHours).toBe(50);
    expect(state.hoursToNextMilestone).toBe(25);
  });

  it('evaluates 50h inside Basic Comfort', () => {
    const state = evaluateHours(50);
    expect(state.currentStage.name).toBe('Basic Comfort');
    expect(state.structureTier).toBe(2);
    expect(state.boundedVisualScale).toBeGreaterThan(0.85);
    expect(state.boundedVisualScale).toBeLessThan(1.00);
    expect(state.nextVisualMilestoneHours).toBe(75);
    expect(state.hoursToNextMilestone).toBe(25);
  });

  it('evaluates 150h as Solid Ability boundary (Tier 3)', () => {
    const state = evaluateHours(150);
    expect(state.currentStage.name).toBe('Solid Ability');
    expect(state.structureTier).toBe(3);
    expect(state.boundedVisualScale).toBeCloseTo(1.00, 2);
    expect(state.nextVisualMilestoneHours).toBe(200);
  });

  it('evaluates 300h as Advanced Practice boundary (Tier 4)', () => {
    const state = evaluateHours(300);
    expect(state.currentStage.name).toBe('Advanced Practice');
    expect(state.structureTier).toBe(4);
    expect(state.boundedVisualScale).toBeCloseTo(1.15, 2);
    expect(state.nextVisualMilestoneHours).toBe(500);
  });

  it('evaluates 600h as Job-Ready Depth boundary (Tier 5)', () => {
    const state = evaluateHours(600);
    expect(state.currentStage.name).toBe('Job-Ready Depth');
    expect(state.structureTier).toBe(5);
    expect(state.boundedVisualScale).toBeCloseTo(1.28, 2);
    expect(state.nextVisualMilestoneHours).toBe(1000);
  });

  it('evaluates 1200h as Deep Mastery boundary (Tier 6)', () => {
    const state = evaluateHours(1200);
    expect(state.currentStage.name).toBe('Deep Mastery');
    expect(state.structureTier).toBe(6);
    expect(state.boundedVisualScale).toBeCloseTo(1.40, 2);
    expect(state.nextVisualMilestoneHours).toBeNull();
    expect(state.hoursToNextMilestone).toBeNull();
  });
});

describe('Level -> Aura Scaling Verification', () => {
  it('keeps physical scale invariant to level alone', () => {
    const level1State = getSkillProgressionState('s1', 'Python', 20 * 3600, 1);
    const level15State = getSkillProgressionState('s1', 'Python', 20 * 3600, 15);

    expect(level1State.boundedVisualScale).toBe(level15State.boundedVisualScale);
    expect(level15State.levelAuraIntensity).toBeGreaterThan(level1State.levelAuraIntensity);
    expect(level15State.haloOpacity).toBeGreaterThan(level1State.haloOpacity);
  });

  it('computes aura intensity within valid mathematical bounds', () => {
    const aura1 = calculateLevelAura(1);
    const aura10 = calculateLevelAura(10);
    const aura50 = calculateLevelAura(50);

    expect(aura1.auraIntensity).toBeGreaterThanOrEqual(1.0);
    expect(aura50.auraIntensity).toBeLessThanOrEqual(3.6);
    expect(aura10.emissiveIntensity).toBeGreaterThan(aura1.emissiveIntensity);
  });
});
