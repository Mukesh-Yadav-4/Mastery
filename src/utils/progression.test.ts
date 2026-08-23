import { describe, it, expect } from 'vitest';
import {
  getSkillProgressionState,
  getProgressionProfile,
  calculateLevelAura,
  PYTHON_PROGRESSION_PROFILE,
  DEFAULT_PROGRESSION_PROFILE,
} from './progression';

describe('Progression Profile Model', () => {
  it('correctly maps Python skills to the evidence-informed Python profile', () => {
    const profile = getProgressionProfile('Python');
    expect(profile.id).toBe(PYTHON_PROGRESSION_PROFILE.id);
    expect(profile.isEvidenceInformed).toBe(true);
    expect(profile.sourceNote).toContain('Real Python');
  });

  it('correctly falls back to default profile for general skills', () => {
    const profile = getProgressionProfile('German Language');
    expect(profile.id).toBe(DEFAULT_PROGRESSION_PROFILE.id);
  });
});

describe('Python Progression Milestones & Horizonal Stages', () => {
  const evaluateHours = (hours: number, level = 1) => {
    return getSkillProgressionState('skill-1', 'Python', hours * 3600, level);
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

  it('evaluates 75h checkpoint', () => {
    const state = evaluateHours(75);
    expect(state.currentStage.name).toBe('Basic Comfort');
    expect(state.nextVisualMilestoneHours).toBe(100);
  });

  it('evaluates 100h checkpoint', () => {
    const state = evaluateHours(100);
    expect(state.currentStage.name).toBe('Basic Comfort');
    expect(state.nextVisualMilestoneHours).toBe(150);
    expect(state.hoursToNextMilestone).toBe(50);
  });

  it('evaluates 150h as Solid Ability boundary (Tier 3)', () => {
    const state = evaluateHours(150);
    expect(state.currentStage.name).toBe('Solid Ability');
    expect(state.structureTier).toBe(3);
    expect(state.boundedVisualScale).toBeCloseTo(1.00, 2);
    expect(state.nextVisualMilestoneHours).toBe(200);
  });

  it('evaluates 200h checkpoint inside Solid Ability', () => {
    const state = evaluateHours(200);
    expect(state.currentStage.name).toBe('Solid Ability');
    expect(state.nextVisualMilestoneHours).toBe(300);
    expect(state.hoursToNextMilestone).toBe(100);
  });

  it('evaluates 300h as Advanced Practice boundary (Tier 4)', () => {
    const state = evaluateHours(300);
    expect(state.currentStage.name).toBe('Advanced Practice');
    expect(state.structureTier).toBe(4);
    expect(state.boundedVisualScale).toBeCloseTo(1.15, 2);
    expect(state.nextVisualMilestoneHours).toBe(500);
  });

  it('evaluates 500h checkpoint inside Advanced Practice', () => {
    const state = evaluateHours(500);
    expect(state.currentStage.name).toBe('Advanced Practice');
    expect(state.nextVisualMilestoneHours).toBe(600);
    expect(state.hoursToNextMilestone).toBe(100);
  });

  it('evaluates 600h as Job-Ready Depth boundary (Tier 5)', () => {
    const state = evaluateHours(600);
    expect(state.currentStage.name).toBe('Job-Ready Depth');
    expect(state.structureTier).toBe(5);
    expect(state.boundedVisualScale).toBeCloseTo(1.28, 2);
    expect(state.nextVisualMilestoneHours).toBe(1000);
  });

  it('evaluates 1000h checkpoint inside Job-Ready Depth', () => {
    const state = evaluateHours(1000);
    expect(state.currentStage.name).toBe('Job-Ready Depth');
    expect(state.nextVisualMilestoneHours).toBe(1200);
    expect(state.hoursToNextMilestone).toBe(200);
  });

  it('evaluates 1200h as Deep Mastery boundary (Tier 6)', () => {
    const state = evaluateHours(1200);
    expect(state.currentStage.name).toBe('Deep Mastery');
    expect(state.structureTier).toBe(6);
    expect(state.boundedVisualScale).toBeCloseTo(1.40, 2);
    expect(state.nextVisualMilestoneHours).toBeNull();
    expect(state.hoursToNextMilestone).toBeNull();
  });

  it('evaluates 1500h beyond with strictly bounded visual scale', () => {
    const state = evaluateHours(1500);
    expect(state.currentStage.name).toBe('Deep Mastery');
    expect(state.structureTier).toBe(6);
    expect(state.boundedVisualScale).toBeLessThanOrEqual(1.48);
    expect(state.boundedVisualScale).toBeGreaterThan(1.40);
  });
});

describe('Level -> Aura Independence', () => {
  it('increases aura and emissive intensity with level without altering physical scale bounds', () => {
    const auraLvl1 = calculateLevelAura(1);
    const auraLvl5 = calculateLevelAura(5);
    const auraLvl15 = calculateLevelAura(15);

    expect(auraLvl1.auraIntensity).toBeLessThan(auraLvl5.auraIntensity);
    expect(auraLvl5.auraIntensity).toBeLessThan(auraLvl15.auraIntensity);

    expect(auraLvl1.haloOpacity).toBeLessThan(auraLvl5.haloOpacity);
    expect(auraLvl5.haloOpacity).toBeLessThan(auraLvl15.haloOpacity);

    // Verify scale is strictly determined by hours, not level
    const stateLvl1 = getSkillProgressionState('s1', 'Python', 100 * 3600, 1);
    const stateLvl10 = getSkillProgressionState('s1', 'Python', 100 * 3600, 10);
    expect(stateLvl1.boundedVisualScale).toBe(stateLvl10.boundedVisualScale);
  });
});
