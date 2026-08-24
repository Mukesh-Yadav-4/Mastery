// ── Domain Types ──────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

export type SkillCategory =
  | 'programming'
  | 'language'
  | 'music'
  | 'creative'
  | 'fitness'
  | 'generic';

export interface Skill {
  id: string;
  userId: string;
  name: string;
  description: string;
  category?: SkillCategory;
  icon: string;
  color: string;
  targetHours: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionReflection {
  qualityRating?: number; // 1 to 5 stars (Flow / Focus depth)
  friction?: string; // what was hard / what to focus on next
  notes?: string; // key insight / takeaways
}

export interface FocusSession {
  id: string;
  userId: string;
  skillId: string;
  startedAt: string; // ISO timestamp
  endedAt: string; // ISO timestamp
  durationSeconds: number;
  status: 'completed' | 'cancelled';
  intention?: string; // Deliberate micro-goal / target
  targetDurationSeconds?: number | null; // Configured target or null for open flow
  reflection?: SessionReflection;
  createdAt: string;
}

export interface MilestoneRecord {
  id: string;
  userId: string;
  skillId: string;
  percentage: number; // 10, 25, 50, 75, 100
  unlockedAt: string;
}

// ── Computed Progression Types ────────────────────────────────

export interface LevelInfo {
  level: number;
  currentLevelXP: number; // Cumulative threshold for current level
  nextLevelXP: number; // Cumulative threshold for next level
  xpInCurrentLevel: number; // XP earned into current level
  xpRequiredForNextLevel: number; // Total XP needed between current and next level
  xpToNextLevel: number; // Remaining XP to level up
  progressPercentage: number; // 0 to 100
}

export interface SkillProgress {
  skill: Skill;
  totalSeconds: number;
  totalHours: number;
  percentage: number;
  currentMilestone: number; // Last reached: 0, 10, 25, 50, 75, 100
  nextMilestone: number | null; // Next target or null if 100% reached
  unlockedMilestones: number[];
  skillXP: number;
  skillLevel: LevelInfo;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
  todayCompleted: boolean;
}

// ── Timer State ───────────────────────────────────────────────

export interface TimerState {
  skillId: string;
  startedAt: number; // Unix ms when timer first started
  pausedAt: number | null; // Unix ms when paused, null if running
  totalPausedMs: number; // Accumulated pause duration in ms
  status: 'running' | 'paused';
  intention?: string; // Deliberate practice intention
  targetDurationSeconds?: number | null; // Target focus duration in seconds
}

// ── UI State ──────────────────────────────────────────────────

export type ActiveView = 'dashboard' | 'timer' | 'history' | 'analytics' | 'settings';

export interface NewSkillData {
  name: string;
  description: string;
  category?: SkillCategory;
  icon: string;
  color: string;
  targetHours: number;
}

// ── Celebration & Reward State ────────────────────────────────

export interface CelebrationData {
  skillName: string;
  skillIcon: string;
  skillColor: string;
  percentage: number;
  totalHours: number;
  targetHours: number;
}

export interface SessionRewardData {
  skillName: string;
  skillIcon: string;
  skillColor: string;
  durationSeconds: number;
  earnedXP: number;
  baseXP: number;
  bonusXP: number;
  intentionBonus?: number;
  reflectionBonus?: number;
  streakBonus?: number;
  previousLevelInfo: LevelInfo;
  newLevelInfo: LevelInfo;
  didLevelUp: boolean;
  previousSkillLevelInfo: LevelInfo;
  newSkillLevelInfo: LevelInfo;
  didSkillLevelUp: boolean;
}

export interface CosmicFeedbackEvent {
  id: string;
  skillId: string;
  skillName: string;
  skillIcon: string;
  skillColor: string;
  durationSeconds: number;
  xpEarned: number;
  baseXP: number;
  bonusXP: number;
  intentionBonus?: number;
  reflectionBonus?: number;
  streakBonus?: number;
  previousSeconds: number;
  newSeconds: number;
  previousHours: number;
  newHours: number;
  previousGlobalLevel: LevelInfo;
  newGlobalLevel: LevelInfo;
  previousSkillLevel: LevelInfo;
  newSkillLevel: LevelInfo;
  didLevelUp: boolean;
  didSkillLevelUp: boolean;
  crossedHorizon: boolean;
  newHorizonHours: number | null;
  crossedStage: boolean;
  previousStageName: string;
  newStageName: string;
  stageTransitionTriggered: boolean;
  significance: 'short' | 'normal' | 'long' | 'horizon';
}

