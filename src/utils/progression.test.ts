import { describe, it, expect } from 'vitest';
import {
  getSkillProgressionState,
  getProgressionProfile,
  calculateLevelAura,
  createGenericProgressionProfile,
  createProgrammingProfile,
} from './progression';

describe('Progression Profile Model & Category Mapping', () => {
  it('correctly maps programming skills and explicit category', () => {
    const p1 = getProgressionProfile('Python');
    expect(p1.category).toBe('programming');
    expect(p1.stages[0].name).toBe('Foundation');

    const p2 = getProgressionProfile('Custom Tool', 'programming', 100);
    expect(p2.category).toBe('programming');
    expect(p2.stages[4].name).toBe('Deep Mastery');
  });

  it('correctly maps language skills by name or category', () => {
    const l1 = getProgressionProfile('German');
    expect(l1.category).toBe('language');
    expect(l1.stages[1].name).toBe('Early Exposure');
    expect(l1.stages[4].name).toBe('High Proficiency');

    const l2 = getProgressionProfile('Custom Course', 'language', 100);
    expect(l2.category).toBe('language');
  });

  it('correctly maps music, creative, and fitness profiles', () => {
    const m = getProgressionProfile('Piano');
    expect(m.category).toBe('music');
    expect(m.stages[2].name).toBe('Repertoire');

    const c = getProgressionProfile('Oil Painting', 'creative');
    expect(c.category).toBe('creative');
    expect(c.stages[3].name).toBe('Project Depth');

    const f = getProgressionProfile('Running');
    expect(f.category).toBe('fitness');
    expect(f.stages[1].name).toBe('Consistency');
  });

  it('correctly falls back to generic 4-stage profile when unrecognized', () => {
    const g = getProgressionProfile('Random Hobby', 'generic', 100);
    expect(g.category).toBe('generic');
    expect(g.stages).toHaveLength(4);
    expect(g.stages[0].name).toBe('Novice');
    expect(g.stages[1].name).toBe('Intermediate');
    expect(g.stages[2].name).toBe('Advanced');
    expect(g.stages[3].name).toBe('Mastery');
  });
});

describe('Dynamic Target Scaling Across Horizons', () => {
  it('correctly scales percentage thresholds for Target = 100h in Programming', () => {
    const profile = createProgrammingProfile(100);
    expect(profile.stages[0].name).toBe('Foundation');
    expect(profile.stages[0].minHours).toBe(0);
    expect(profile.stages[0].maxHours).toBe(10); // 10%

    expect(profile.stages[1].name).toBe('Basic Comfort');
    expect(profile.stages[1].minHours).toBe(10);
    expect(profile.stages[1].maxHours).toBe(35); // 35%

    expect(profile.stages[2].name).toBe('Solid Ability');
    expect(profile.stages[2].minHours).toBe(35);
    expect(profile.stages[2].maxHours).toBe(65); // 65%

    expect(profile.stages[3].name).toBe('Advanced Practice');
    expect(profile.stages[3].minHours).toBe(65);
    expect(profile.stages[3].maxHours).toBe(85); // 85%

    expect(profile.stages[4].name).toBe('Deep Mastery');
    expect(profile.stages[4].minHours).toBe(85);
    expect(profile.stages[4].maxHours).toBe(100); // 100%
  });

  it('correctly scales percentage thresholds for Target = 50h (Starter Companion)', () => {
    const profile = createProgrammingProfile(50);
    expect(profile.stages[0].minHours).toBe(0);
    expect(profile.stages[0].maxHours).toBe(5); // 10%

    expect(profile.stages[4].name).toBe('Deep Mastery');
    expect(profile.stages[4].minHours).toBe(43);
    expect(profile.stages[4].maxHours).toBe(50); // 100%
  });

  it('correctly scales generic 4-stage profile for Target = 200h', () => {
    const profile = createGenericProgressionProfile(200);
    expect(profile.stages[0].minHours).toBe(0);
    expect(profile.stages[0].maxHours).toBe(20); // 10%

    expect(profile.stages[1].minHours).toBe(20);
    expect(profile.stages[1].maxHours).toBe(80); // 40%

    expect(profile.stages[2].minHours).toBe(80);
    expect(profile.stages[2].maxHours).toBe(150); // 75%

    expect(profile.stages[3].minHours).toBe(150);
    expect(profile.stages[3].maxHours).toBe(200); // 100%
  });
});

describe('Programming Progression Milestones & Horizon Calculation', () => {
  const evaluateHours = (hours: number, level = 1, target = 100) => {
    return getSkillProgressionState('skill-1', 'Python', hours * 3600, level, 'programming', target);
  };

  it('evaluates 0h as Foundation (Tier 1)', () => {
    const state = evaluateHours(0);
    expect(state.currentStage.name).toBe('Foundation');
    expect(state.structureTier).toBe(1);
    expect(state.boundedVisualScale).toBeCloseTo(0.70, 2);
    expect(state.nextVisualMilestoneHours).toBe(10);
    expect(state.hoursToNextMilestone).toBe(10);
  });

  it('evaluates 20h as Basic Comfort boundary (Tier 2)', () => {
    const state = evaluateHours(20);
    expect(state.currentStage.name).toBe('Basic Comfort');
    expect(state.structureTier).toBe(2);
    expect(state.boundedVisualScale).toBeGreaterThan(0.70);
    expect(state.nextVisualMilestoneHours).toBe(25);
    expect(state.hoursToNextMilestone).toBe(5);
  });

  it('evaluates 50h as Solid Ability (Tier 3)', () => {
    const state = evaluateHours(50);
    expect(state.currentStage.name).toBe('Solid Ability');
    expect(state.structureTier).toBe(3);
    expect(state.nextVisualMilestoneHours).toBe(75);
    expect(state.hoursToNextMilestone).toBe(25);
  });

  it('evaluates 90h as Deep Mastery (Tier 5)', () => {
    const state = evaluateHours(90);
    expect(state.currentStage.name).toBe('Deep Mastery');
    expect(state.structureTier).toBe(5);
    expect(state.nextVisualMilestoneHours).toBe(100);
  });

  it('evaluates 100h+ as reached milestone', () => {
    const state = evaluateHours(100);
    expect(state.currentStage.name).toBe('Deep Mastery');
    expect(state.nextVisualMilestoneHours).toBeNull();
    expect(state.hoursToNextMilestone).toBeNull();
  });
});

describe('Level -> Aura Scaling Verification', () => {
  it('keeps physical scale invariant to level alone', () => {
    const level1State = getSkillProgressionState('s1', 'Python', 20 * 3600, 1, 'programming', 100);
    const level15State = getSkillProgressionState('s1', 'Python', 20 * 3600, 15, 'programming', 100);

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
