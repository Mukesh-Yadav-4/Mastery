import { describe, it, expect } from 'vitest';
import {
  getSkillProgressionState,
  getProgressionProfile,
} from '../../utils/progression';

describe('Skill Journey Progression Profiles by Category', () => {
  it('correctly maps 0 hours to Foundation stage in Programming profile', () => {
    const state = getSkillProgressionState('skill-1', 'Python', 0, 1, 'programming', 100);
    expect(state.category).toBe('programming');
    expect(state.currentStage.id).toBe('foundation');
    expect(state.currentStage.name).toBe('Foundation');
    expect(state.nextVisualMilestoneHours).toBe(10);
    expect(state.hoursToNextMilestone).toBe(10);
  });

  it('correctly produces distinct stage timelines for Python (Programming) vs German (Language)', () => {
    const pythonProfile = getProgressionProfile('Python', 'programming', 100);
    const germanProfile = getProgressionProfile('German', 'language', 100);

    // Distinct titles & categories
    expect(pythonProfile.category).toBe('programming');
    expect(germanProfile.category).toBe('language');
    expect(pythonProfile.title).not.toBe(germanProfile.title);

    // Python stages vs Language stages
    expect(pythonProfile.stages[1].name).toBe('Basic Comfort');
    expect(germanProfile.stages[1].name).toBe('Early Exposure');

    expect(pythonProfile.stages[3].name).toBe('Advanced Practice');
    expect(germanProfile.stages[3].name).toBe('Working Fluency');

    expect(pythonProfile.stages[4].name).toBe('Deep Mastery');
    expect(germanProfile.stages[4].name).toBe('High Proficiency');
  });

  it('correctly evaluates Music, Creative, and Fitness profiles', () => {
    const musicProfile = getProgressionProfile('Piano', 'music', 100);
    expect(musicProfile.stages[2].name).toBe('Repertoire');

    const creativeProfile = getProgressionProfile('Drawing', 'creative', 100);
    expect(creativeProfile.stages[3].name).toBe('Project Depth');

    const fitnessProfile = getProgressionProfile('Running', 'fitness', 100);
    expect(fitnessProfile.stages[1].name).toBe('Consistency');
    expect(fitnessProfile.stages[4].name).toBe('Peak Performance');
  });

  it('correctly provides universal 4-stage generic journey for arbitrary skills', () => {
    const arbitraryProfile = getProgressionProfile('dfd', 'generic', 100);
    expect(arbitraryProfile.category).toBe('generic');
    expect(arbitraryProfile.stages).toHaveLength(4);
    expect(arbitraryProfile.stages[0].name).toBe('Novice');
    expect(arbitraryProfile.stages[1].name).toBe('Intermediate');
    expect(arbitraryProfile.stages[2].name).toBe('Advanced');
    expect(arbitraryProfile.stages[3].name).toBe('Mastery');
  });

  it('identifies Deep Mastery beyond maximum stage boundaries for curated profiles', () => {
    const state = getSkillProgressionState('skill-1', 'Python', 150 * 3600, 15, 'programming', 100);
    expect(state.currentStage.id).toBe('deep-mastery');
    expect(state.nextVisualMilestoneHours).toBeNull();
    expect(state.hoursToNextMilestone).toBeNull();
  });

  it('calculates checkpoints crossed in progression state for Language', () => {
    // 50 hours in language with target 100 crosses [10, 25, 50]
    const state = getSkillProgressionState('skill-2', 'German', 50 * 3600, 4, 'language', 100);
    expect(state.activeCheckpointsCrossed).toEqual([10, 25, 50]);
    expect(state.nextVisualMilestoneHours).toBe(75);
    expect(state.hoursToNextMilestone).toBe(25);
  });
});
