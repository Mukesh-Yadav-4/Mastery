/**
 * Mastery Progression Engine
 *
 * Translates accumulated practice seconds and skill level into
 * bounded visual scale, radiant aura intensity, structural tier,
 * and planning milestone horizons.
 *
 * DATA PRINCIPLE:
 * Hours are an observable deliberate practice investment metric.
 * Stage labels represent approximate practice horizons, not a guarantee
 * that a user has achieved a specific competence level.
 */

export interface ProgressionStage {
  id: string;
  name: string;
  minHours: number;
  maxHours: number;
  minScale: number;
  maxScale: number;
  structureTier: number; // 1 to 6
  description: string;
}

export interface ProgressionProfile {
  id: string;
  skillKey: string;
  title: string;
  sourceNote: string;
  isEvidenceInformed: boolean;
  stages: ProgressionStage[];
  checkpoints: number[];
}

export interface SkillProgressionState {
  skillId: string;
  totalSeconds: number;
  totalHours: number;
  currentStage: ProgressionStage;
  stageProgressRatio: number; // 0 to 1 within the current stage
  boundedVisualScale: number; // Strictly bounded [0.70, 1.48]
  levelAuraIntensity: number; // [1.0, 3.6]
  haloOpacity: number; // [0.18, 0.65]
  structureTier: number; // 1 to 6
  nextVisualMilestoneHours: number | null;
  hoursToNextMilestone: number | null;
  activeCheckpointsCrossed: number[];
  calibrationNote: string;
}

// ── Checkpoints & Horizons ──────────────────────────────────────
export const STANDARD_CHECKPOINTS = [
  25, 50, 75, 100, 150, 200, 300, 500, 600, 1000, 1200,
];

// ── Python Progression Profile (Calibrated to Real Python 2026) ─
export const PYTHON_PROGRESSION_PROFILE: ProgressionProfile = {
  id: 'profile-python',
  skillKey: 'python',
  title: 'Python Development Horizon',
  sourceNote:
    'Calibrated from Real Python (2026) evidence-informed planning guidelines. Practice time is an observable investment metric, not a claim of competence.',
  isEvidenceInformed: true,
  checkpoints: STANDARD_CHECKPOINTS,
  stages: [
    {
      id: 'foundation',
      name: 'Foundation',
      minHours: 0,
      maxHours: 25,
      minScale: 0.70,
      maxScale: 0.85,
      structureTier: 1,
      description: 'Initial fundamentals, syntax exposure, and basic constructs.',
    },
    {
      id: 'basic-comfort',
      name: 'Basic Comfort',
      minHours: 25,
      maxHours: 150,
      minScale: 0.85,
      maxScale: 1.00,
      structureTier: 2,
      description: 'Comfort with core syntax, standard libraries, and script authoring.',
    },
    {
      id: 'solid-ability',
      name: 'Solid Ability',
      minHours: 150,
      maxHours: 300,
      minScale: 1.00,
      maxScale: 1.15,
      structureTier: 3,
      description: 'Independent small projects, tooling, and modular architecture.',
    },
    {
      id: 'advanced-practice',
      name: 'Advanced Practice',
      minHours: 300,
      maxHours: 600,
      minScale: 1.15,
      maxScale: 1.28,
      structureTier: 4,
      description: 'Multi-module codebases, package design, and production patterns.',
    },
    {
      id: 'job-ready-depth',
      name: 'Job-Ready Depth',
      minHours: 600,
      maxHours: 1200,
      minScale: 1.28,
      maxScale: 1.40,
      structureTier: 5,
      description: 'Production portfolio depth, systems integration, and tool chains.',
    },
    {
      id: 'deep-mastery',
      name: 'Deep Mastery',
      minHours: 1200,
      maxHours: 10000,
      minScale: 1.40,
      maxScale: 1.48,
      structureTier: 6,
      description: 'Multi-year domain mastery, performance optimization, and architecture.',
    },
  ],
};

// ── Universal Default Progression Profile ────────────────────────
export const DEFAULT_PROGRESSION_PROFILE: ProgressionProfile = {
  id: 'profile-default',
  skillKey: 'default',
  title: 'Deliberate Practice Horizon',
  sourceNote:
    'Universal practice progression horizon. Practice time is an observable investment metric, not a claim of competence.',
  isEvidenceInformed: false,
  checkpoints: STANDARD_CHECKPOINTS,
  stages: [
    {
      id: 'foundation',
      name: 'Foundation',
      minHours: 0,
      maxHours: 25,
      minScale: 0.70,
      maxScale: 0.85,
      structureTier: 1,
      description: 'Initial fundamentals and orientation.',
    },
    {
      id: 'basic-comfort',
      name: 'Basic Comfort',
      minHours: 25,
      maxHours: 150,
      minScale: 0.85,
      maxScale: 1.00,
      structureTier: 2,
      description: 'Basic fluency and consistent execution of primary techniques.',
    },
    {
      id: 'solid-ability',
      name: 'Solid Ability',
      minHours: 150,
      maxHours: 300,
      minScale: 1.00,
      maxScale: 1.15,
      structureTier: 3,
      description: 'Autonomous problem solving and project building.',
    },
    {
      id: 'advanced-practice',
      name: 'Advanced Practice',
      minHours: 300,
      maxHours: 600,
      minScale: 1.15,
      maxScale: 1.28,
      structureTier: 4,
      description: 'Nuanced execution, deeper principles, and workflow speed.',
    },
    {
      id: 'job-ready-depth',
      name: 'Deep Competence',
      minHours: 600,
      maxHours: 1200,
      minScale: 1.28,
      maxScale: 1.40,
      structureTier: 5,
      description: 'Extensive portfolio experience and reliable applied skill.',
    },
    {
      id: 'deep-mastery',
      name: 'Deep Mastery',
      minHours: 1200,
      maxHours: 10000,
      minScale: 1.40,
      maxScale: 1.48,
      structureTier: 6,
      description: 'Years of dedicated practice, synthesis, and creative mastery.',
    },
  ],
};

/**
 * Retrieve progression profile for a given skill
 */
export function getProgressionProfile(skillName: string): ProgressionProfile {
  const normalized = skillName.trim().toLowerCase();
  if (normalized.includes('python') || normalized.includes('py')) {
    return PYTHON_PROGRESSION_PROFILE;
  }
  return DEFAULT_PROGRESSION_PROFILE;
}

/**
 * Calculate bounded scale within stage min/max
 */
function calculateBoundedScale(hours: number, stage: ProgressionStage): number {
  if (hours <= stage.minHours) return stage.minScale;
  if (hours >= stage.maxHours) return stage.maxScale;

  const span = stage.maxHours - stage.minHours;
  const progress = span > 0 ? (hours - stage.minHours) / span : 0;
  return stage.minScale + progress * (stage.maxScale - stage.minScale);
}

/**
 * Calculate Level -> Aura properties (Level controls aura/radiance, NOT physical bulk)
 */
export function calculateLevelAura(level: number): {
  auraIntensity: number;
  haloOpacity: number;
  emissiveIntensity: number;
} {
  const safeLevel = Math.max(1, level);

  // Aura intensity: 1.2 for Level 1, up to 3.4 for Level 20+
  const auraIntensity = Math.min(3.6, 1.2 + Math.log2(safeLevel) * 0.55);

  // Halo opacity: 0.18 for Level 1, up to 0.65 for Level 20+
  const haloOpacity = Math.min(0.65, 0.18 + (safeLevel - 1) * 0.025);

  // Emissive intensity: 1.5 for Level 1, up to 3.5 for Level 20+
  const emissiveIntensity = Math.min(3.5, 1.5 + (safeLevel - 1) * 0.11);

  return {
    auraIntensity,
    haloOpacity,
    emissiveIntensity,
  };
}

/**
 * Calculate complete skill progression state from raw seconds & level
 */
export function getSkillProgressionState(
  skillId: string,
  skillName: string,
  totalSeconds: number,
  level: number,
): SkillProgressionState {
  const totalHours = totalSeconds / 3600;
  const profile = getProgressionProfile(skillName);

  // 1. Locate current stage
  let currentStage = profile.stages[0];
  for (let i = 0; i < profile.stages.length; i++) {
    const stage = profile.stages[i];
    if (totalHours >= stage.minHours) {
      currentStage = stage;
    }
  }

  // 2. Stage progress ratio (0 to 1)
  const stageSpan = currentStage.maxHours - currentStage.minHours;
  const stageProgressRatio =
    stageSpan > 0
      ? Math.min(1, Math.max(0, (totalHours - currentStage.minHours) / stageSpan))
      : 1;

  // 3. Bounded visual scale
  const boundedVisualScale = calculateBoundedScale(totalHours, currentStage);

  // 4. Level Aura properties
  const { auraIntensity, haloOpacity } = calculateLevelAura(level);

  // 5. Next visual checkpoint milestone
  const crossedCheckpoints = profile.checkpoints.filter((cp) => totalHours >= cp);
  const nextCheckpoint =
    profile.checkpoints.find((cp) => totalHours < cp) ?? null;

  const hoursToNextMilestone =
    nextCheckpoint !== null ? Math.max(0, nextCheckpoint - totalHours) : null;

  return {
    skillId,
    totalSeconds,
    totalHours,
    currentStage,
    stageProgressRatio,
    boundedVisualScale,
    levelAuraIntensity: auraIntensity,
    haloOpacity,
    structureTier: currentStage.structureTier,
    nextVisualMilestoneHours: nextCheckpoint,
    hoursToNextMilestone,
    activeCheckpointsCrossed: crossedCheckpoints,
    calibrationNote: profile.sourceNote,
  };
}
