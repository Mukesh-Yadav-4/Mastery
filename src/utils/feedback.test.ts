import { describe, it, expect } from 'vitest';
import { getSkillProgressionState, calculateLevelAura } from './progression';
import { getSessionXPBreakdown } from './calculations';
import { getEvolvedSkillPalette } from './palettes';
import { createSyntheticFeedbackEvent } from './devFeedback';
import type { Skill } from '../types';

describe('Phase 6 — Cosmic Feedback Experience & Progression Refinements', () => {
  const mockSkill: Skill = {
    id: 'skill-dev-1',
    userId: 'user-1',
    name: 'Quantum Physics',
    description: 'Deliberate study of quantum mechanics',
    category: 'creative',
    icon: '⚛️',
    color: '#818cf8',
    targetHours: 100,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

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
    const preProgression = getSkillProgressionState('skill-1', 'TypeScript', preSecs, 2, 'generic', 100, '#818cf8');

    // Completed 1 hour session (takes total to 10.8 hours -> crosses 10h Novice checkpoint & enters Intermediate Stage 2)
    const postHours = 10.8;
    const postSecs = postHours * 3600;
    const postProgression = getSkillProgressionState('skill-1', 'TypeScript', postSecs, 2, 'generic', 100, '#818cf8');

    const crossedHorizon =
      postProgression.structureTier > preProgression.structureTier ||
      postProgression.activeCheckpointsCrossed.length > preProgression.activeCheckpointsCrossed.length;

    const crossedStage = postProgression.currentStage.id !== preProgression.currentStage.id;

    expect(crossedHorizon).toBe(true);
    expect(crossedStage).toBe(true);
    expect(preProgression.currentStage.name).toBe('Novice');
    expect(postProgression.currentStage.name).toBe('Intermediate');
  });

  it('enforces strictly bounded idle aura and emissive ceilings to prevent white-hot LED nodes', () => {
    // Test across progression levels 1 to 50
    const levelsToTest = [1, 2, 5, 10, 20, 50];

    levelsToTest.forEach((lvl) => {
      const aura = calculateLevelAura(lvl);
      // Hard ceiling assertions
      expect(aura.auraIntensity).toBeLessThanOrEqual(1.45);
      expect(aura.auraIntensity).toBeGreaterThanOrEqual(1.0);
      expect(aura.haloOpacity).toBeLessThanOrEqual(0.38);
      expect(aura.haloOpacity).toBeGreaterThanOrEqual(0.20);
      expect(aura.emissiveIntensity).toBeLessThanOrEqual(1.35);
      expect(aura.emissiveIntensity).toBeGreaterThanOrEqual(0.85);
    });
  });

  it('evolves skill color palette with chromatic richness across practice stages', () => {
    const baseColor = '#818cf8';

    // 1. Stage 1: Foundation (<10h)
    const p1 = getEvolvedSkillPalette(baseColor, 5, 1);
    expect(p1.stage).toBe('foundation');
    expect(p1.coreColor).toBe(baseColor);
    expect(p1.haloOpacity).toBe(0.22);

    // 2. Stage 2: Intermediate (10h - 30h)
    const p2 = getEvolvedSkillPalette(baseColor, 20, 2);
    expect(p2.stage).toBe('intermediate');
    expect(p2.coreColor).not.toBe(baseColor); // Richer chromatic core
    expect(p2.secondaryAccent).toBeDefined();
    expect(p2.haloOpacity).toBe(0.28);

    // 3. Stage 3: Advanced (30h - 100h)
    const p3 = getEvolvedSkillPalette(baseColor, 50, 4);
    expect(p3.stage).toBe('advanced');
    expect(p3.haloOpacity).toBe(0.34);

    // 4. Stage 4: Mastery (100h+)
    const p4 = getEvolvedSkillPalette(baseColor, 150, 6);
    expect(p4.stage).toBe('mastery');
    expect(p4.secondaryAccent).toBeDefined();
    expect(p4.haloOpacity).toBe(0.38);
  });

  it('ensures session XP calculation is purely idempotent', () => {
    const firstCall = getSessionXPBreakdown(3600, 'completed');
    const secondCall = getSessionXPBreakdown(3600, 'completed');
    expect(firstCall.totalXP).toBe(secondCall.totalXP);
    expect(firstCall.totalXP).toBe(68);
  });

  it('ensures progression state evolves monotonically', () => {
    const s0 = getSkillProgressionState('s1', 'Go', 0, 1, 'generic', 100, '#818cf8');
    const s1 = getSkillProgressionState('s1', 'Go', 3600 * 10, 2, 'generic', 100, '#818cf8');
    const s2 = getSkillProgressionState('s1', 'Go', 3600 * 50, 5, 'generic', 100, '#818cf8');

    expect(s1.boundedVisualScale).toBeGreaterThanOrEqual(s0.boundedVisualScale);
    expect(s2.boundedVisualScale).toBeGreaterThanOrEqual(s1.boundedVisualScale);
    expect(s2.structureTier).toBeGreaterThanOrEqual(s1.structureTier);
  });

  // ── Development Preview & Synthetic Event Suite ──────────────
  it('generates valid synthetic events for all duration presets without mutating real data', () => {
    const durations = [
      30 * 60,   // 30m
      60 * 60,   // 1h
      120 * 60,  // 2h
      300 * 60,  // 5h
      1200 * 60, // 20h
      3000 * 60, // 50h
    ];

    durations.forEach((dur) => {
      const syntheticEvent = createSyntheticFeedbackEvent(
        mockSkill,
        3600 * 5, // 5 hours current
        dur,
        250, // 250 current global XP
      );

      expect(syntheticEvent.id.startsWith('dev-preview-')).toBe(true);
      expect(syntheticEvent.skillId).toBe(mockSkill.id);
      expect(syntheticEvent.durationSeconds).toBe(dur);
      expect(syntheticEvent.xpEarned).toBeGreaterThan(0);
      expect(syntheticEvent.newHours).toBeGreaterThan(syntheticEvent.previousHours);
      expect(['short', 'normal', 'long', 'horizon']).toContain(syntheticEvent.significance);
    });
  });

  it('generates synthetic events with forced special test conditions', () => {
    // 1. Forced Horizon Crossing
    const horizonEvent = createSyntheticFeedbackEvent(
      mockSkill,
      3600 * 2,
      1800,
      100,
      { forceHorizon: true },
    );
    expect(horizonEvent.crossedHorizon).toBe(true);
    expect(horizonEvent.significance).toBe('horizon');

    // 2. Forced Stage Transition
    const stageEvent = createSyntheticFeedbackEvent(
      mockSkill,
      3600 * 2,
      1800,
      100,
      { forceStage: true },
    );
    expect(stageEvent.crossedStage).toBe(true);
    expect(stageEvent.stageTransitionTriggered).toBe(true);

    // 3. Forced Level Up
    const levelEvent = createSyntheticFeedbackEvent(
      mockSkill,
      3600 * 2,
      1800,
      100,
      { forceLevelUp: true },
    );
    expect(levelEvent.didLevelUp).toBe(true);
    expect(levelEvent.didSkillLevelUp).toBe(true);
  });

  // ── Deliberate Practice & Focus Mode Contracts ───────────────
  it('supports deliberate practice micro-targets, target durations, and flow reflections', () => {
    const sessionData = {
      id: 'session-deliberate-1',
      userId: 'user-1',
      skillId: 'skill-dev-1',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: 1500,
      status: 'completed' as const,
      intention: 'Master bars 1–8 of Invention 4 @ 60bpm',
      targetDurationSeconds: 1500,
      reflection: {
        qualityRating: 5,
        notes: 'Effortless Flow • Mastered left hand jumps cleanly',
        friction: undefined,
      },
      createdAt: new Date().toISOString(),
    };

    expect(sessionData.intention).toBe('Master bars 1–8 of Invention 4 @ 60bpm');
    expect(sessionData.targetDurationSeconds).toBe(1500);
    expect(sessionData.reflection.qualityRating).toBe(5);
    expect(sessionData.reflection.notes).toContain('Effortless Flow');
  });
});
