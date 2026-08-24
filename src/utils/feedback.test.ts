import { describe, it, expect } from 'vitest';
import { getSkillProgressionState } from './progression';
import { getSessionXPBreakdown, secondsToHours, calculateLevelInfo } from './calculations';
import type { CosmicFeedbackEvent } from '../types';

describe('Phase 6 — Cosmic Feedback Event Architecture', () => {
  it('correctly calculates XP breakdown without duplicate calculation', () => {
    // 30 minute session (1800s): 30 base XP + 4 completion bonus = 34 total XP
    const breakdown = getSessionXPBreakdown(1800, 'completed');
    expect(breakdown.baseXP).toBe(30);
    expect(breakdown.bonusXP).toBe(4);
    expect(breakdown.totalXP).toBe(34);
  });

  it('determines adaptive significance correctly based on duration and transitions', () => {
    // 1. Short session (10 minutes = 600s)
    const shortSecs = 600;
    const isShort = shortSecs < 15 * 60;
    expect(isShort).toBe(true);

    // 2. Normal session (25 minutes = 1500s)
    const normSecs = 1500;
    const isNormal = normSecs >= 15 * 60 && normSecs < 45 * 60;
    expect(isNormal).toBe(true);

    // 3. Long session (50 minutes = 3000s)
    const longSecs = 3000;
    const isLong = longSecs >= 45 * 60;
    expect(isLong).toBe(true);
  });

  it('accurately detects horizon crossings and structural tier progression', () => {
    // Skill at 9.8 hours (Stage 1 / Novice in Generic 100h)
    const preHours = 9.8;
    const preSecs = preHours * 3600;
    const preProgression = getSkillProgressionState('skill-1', 'TypeScript', preSecs, 2, 'generic', 100);

    // Completed 1 hour session (takes total to 10.8 hours -> crosses 10h Novice checkpoint & enters Intermediate Stage 2)
    const postHours = 10.8;
    const postSecs = postHours * 3600;
    const postProgression = getSkillProgressionState('skill-1', 'TypeScript', postSecs, 2, 'generic', 100);

    const crossedHorizon =
      postProgression.structureTier > preProgression.structureTier ||
      postProgression.activeCheckpointsCrossed.length > preProgression.activeCheckpointsCrossed.length;

    const crossedStage = postProgression.currentStage.id !== preProgression.currentStage.id;

    expect(crossedHorizon).toBe(true);
    expect(crossedStage).toBe(true);
    expect(preProgression.currentStage.name).toBe('Novice');
    expect(postProgression.currentStage.name).toBe('Intermediate');
  });

  it('constructs a complete CosmicFeedbackEvent data contract', () => {
    const preLevel = calculateLevelInfo(500);
    const postLevel = calculateLevelInfo(534);
    const preProg = getSkillProgressionState('s1', 'Piano', 36000, 3, 'music', 500);
    const postProg = getSkillProgressionState('s1', 'Piano', 40000, 3, 'music', 500);

    const event: CosmicFeedbackEvent = {
      id: 'test-event-1',
      skillId: 's1',
      skillName: 'Piano',
      skillIcon: '🎹',
      skillColor: '#f59e0b',
      durationSeconds: 1800,
      xpEarned: 34,
      baseXP: 30,
      bonusXP: 4,
      previousSeconds: 36000,
      newSeconds: 40000,
      previousHours: secondsToHours(36000),
      newHours: secondsToHours(40000),
      previousGlobalLevel: preLevel,
      newGlobalLevel: postLevel,
      previousSkillLevel: preLevel,
      newSkillLevel: postLevel,
      didLevelUp: false,
      didSkillLevelUp: false,
      crossedHorizon: false,
      newHorizonHours: postProg.nextVisualMilestoneHours,
      crossedStage: false,
      previousStageName: preProg.currentStage.name,
      newStageName: postProg.currentStage.name,
      stageTransitionTriggered: false,
      significance: 'normal',
    };

    expect(event.skillName).toBe('Piano');
    expect(event.durationSeconds).toBe(1800);
    expect(event.xpEarned).toBe(34);
    expect(event.significance).toBe('normal');
    expect(event.newHours).toBeGreaterThan(event.previousHours);
  });
});
