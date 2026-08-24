import type { Skill, CosmicFeedbackEvent } from '../types';
import { getSkillProgressionState } from './progression';
import {
  getSessionXPBreakdown,
  secondsToHours,
  calculateLevelInfo,
} from './calculations';

export interface SyntheticEventOptions {
  forceHorizon?: boolean;
  forceStage?: boolean;
  forceLevelUp?: boolean;
}

/**
 * Creates a purely synthetic CosmicFeedbackEvent for development preview.
 * This guarantees zero mutation of persistent user state or database records.
 */
export function createSyntheticFeedbackEvent(
  skill: Skill,
  currentSkillSeconds: number,
  durationSeconds: number,
  globalXP: number,
  options: SyntheticEventOptions = {},
): CosmicFeedbackEvent {
  const preHours = secondsToHours(currentSkillSeconds);
  const preLevel = calculateLevelInfo(globalXP);
  const preSkillLevel = calculateLevelInfo(Math.floor(currentSkillSeconds / 60));

  const preProgression = getSkillProgressionState(
    skill.id,
    skill.name,
    currentSkillSeconds,
    preSkillLevel.level,
    skill.category,
    skill.targetHours,
    skill.color,
  );

  const xpBreakdown = getSessionXPBreakdown(durationSeconds, 'completed');
  const simulatedPostSeconds = currentSkillSeconds + durationSeconds;
  const postHours = secondsToHours(simulatedPostSeconds);
  const simulatedGlobalXP = globalXP + xpBreakdown.totalXP;
  const postGlobalLevel = calculateLevelInfo(simulatedGlobalXP);
  const postSkillLevel = calculateLevelInfo(
    Math.floor(simulatedPostSeconds / 60),
  );

  let postProgression = getSkillProgressionState(
    skill.id,
    skill.name,
    simulatedPostSeconds,
    postSkillLevel.level,
    skill.category,
    skill.targetHours,
    skill.color,
  );

  let crossedHorizon =
    postProgression.structureTier > preProgression.structureTier ||
    postProgression.activeCheckpointsCrossed.length >
      preProgression.activeCheckpointsCrossed.length;

  let crossedStage =
    postProgression.currentStage.id !== preProgression.currentStage.id;

  let didLevelUp = postGlobalLevel.level > preLevel.level;
  let didSkillLevelUp = postSkillLevel.level > preSkillLevel.level;

  // Handle explicit test case overrides
  if (options.forceHorizon) {
    crossedHorizon = true;
    postProgression = {
      ...postProgression,
      structureTier: Math.min(6, preProgression.structureTier + 1),
    };
  }

  if (options.forceStage) {
    crossedStage = true;
    crossedHorizon = true;
  }

  if (options.forceLevelUp) {
    didLevelUp = true;
    didSkillLevelUp = true;
  }

  let significance: 'short' | 'normal' | 'long' | 'horizon' = 'normal';
  if (crossedHorizon || crossedStage) {
    significance = 'horizon';
  } else if (durationSeconds >= 45 * 60) {
    significance = 'long';
  } else if (durationSeconds >= 15 * 60) {
    significance = 'normal';
  } else {
    significance = 'short';
  }

  return {
    id: `dev-preview-${crypto.randomUUID()}`,
    skillId: skill.id,
    skillName: skill.name,
    skillIcon: skill.icon,
    skillColor: skill.color,
    durationSeconds,
    xpEarned: xpBreakdown.totalXP,
    baseXP: xpBreakdown.baseXP,
    bonusXP: xpBreakdown.bonusXP,
    previousSeconds: currentSkillSeconds,
    newSeconds: simulatedPostSeconds,
    previousHours: preHours,
    newHours: postHours,
    previousGlobalLevel: preLevel,
    newGlobalLevel: options.forceLevelUp
      ? { ...postGlobalLevel, level: preLevel.level + 1 }
      : postGlobalLevel,
    previousSkillLevel: preSkillLevel,
    newSkillLevel: options.forceLevelUp
      ? { ...postSkillLevel, level: preSkillLevel.level + 1 }
      : postSkillLevel,
    didLevelUp,
    didSkillLevelUp,
    crossedHorizon,
    newHorizonHours: postProgression.nextVisualMilestoneHours,
    crossedStage,
    previousStageName: preProgression.currentStage.name,
    newStageName: options.forceStage
      ? getNextStageName(preProgression.currentStage.name)
      : postProgression.currentStage.name,
    stageTransitionTriggered: crossedStage,
    significance,
  };
}

function getNextStageName(currentName: string): string {
  if (currentName.includes('Novice')) return 'Intermediate Practice';
  if (currentName.includes('Intermediate')) return 'Advanced Practice';
  if (currentName.includes('Advanced')) return 'Deep Mastery';
  return 'Cosmic Horizon';
}
