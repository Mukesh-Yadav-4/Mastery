/**
 * Mastery Progression Engine
 *
 * Translates accumulated practice seconds, skill level, and user target
 * into bounded visual scale, radiant aura intensity, structural tier,
 * and planning milestone horizons.
 *
 * ARCHITECTURAL PRINCIPLE (Phase 5.1):
 * - MODE A (Curated): Evidence-informed domain-specific profiles for
 *   explicit categories (Programming, Language, Music, Creative, Fitness).
 * - MODE B (Generic): Universal 4-stage journey (Novice, Intermediate, Advanced, Mastery)
 *   scaled dynamically to the user's chosen target hours.
 */

import { getEvolvedSkillPalette, type EvolvedSkillPalette } from './palettes';

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
  category: string;
  sourceNote: string;
  isEvidenceInformed: boolean;
  stages: ProgressionStage[];
  checkpoints: number[];
}

export interface SkillProgressionState {
  skillId: string;
  totalSeconds: number;
  totalHours: number;
  category: string;
  currentStage: ProgressionStage;
  stageProgressRatio: number; // 0 to 1 within the current stage
  boundedVisualScale: number; // Strictly bounded [0.70, 1.48]
  levelAuraIntensity: number; // Bounded [1.0, 1.45]
  haloOpacity: number; // Bounded [0.20, 0.38]
  structureTier: number; // 1 to 6
  nextVisualMilestoneHours: number | null;
  hoursToNextMilestone: number | null;
  activeCheckpointsCrossed: number[];
  calibrationNote: string;
  evolvedPalette?: EvolvedSkillPalette;
}

// ── Checkpoints ──────────────────────────────────────────────────
export const STANDARD_CHECKPOINTS = [
  25, 50, 75, 100, 150, 200, 300, 500, 600, 1000, 1200,
];

// ── 1. Programming Progression Profile ───────────────────────────
export const PROGRAMMING_PROGRESSION_PROFILE: ProgressionProfile = {
  id: 'profile-programming',
  skillKey: 'programming',
  title: 'Programming Development Horizon',
  category: 'programming',
  sourceNote:
    'Calibrated from evidence-informed deliberate practice planning guidelines. Practice time is an observable investment metric, not a claim of competence.',
  isEvidenceInformed: true,
  checkpoints: [25, 50, 75, 100, 150, 200, 300, 500, 600, 1000, 1200],
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
      description: 'Complex architecture, performance optimization, and robust debugging.',
    },
    {
      id: 'job-ready-depth',
      name: 'Job-Ready Depth',
      minHours: 600,
      maxHours: 1200,
      minScale: 1.28,
      maxScale: 1.40,
      structureTier: 5,
      description: 'Deep system intuition, production-level engineering, and technical leadership.',
    },
    {
      id: 'deep-mastery',
      name: 'Deep Mastery',
      minHours: 1200,
      maxHours: 10000,
      minScale: 1.40,
      maxScale: 1.48,
      structureTier: 6,
      description: 'Rare synthesis of paradigm design, profound intuition, and master-level execution.',
    },
  ],
};

// ── 2. Language Progression Profile ──────────────────────────────
export const LANGUAGE_PROGRESSION_PROFILE: ProgressionProfile = {
  id: 'profile-language',
  skillKey: 'language',
  title: 'Language Acquisition Horizon',
  category: 'language',
  sourceNote:
    'Calibrated from CEFR and FSI language acquisition deliberate practice research. Practice time reflects active communicative practice.',
  isEvidenceInformed: true,
  checkpoints: [30, 60, 120, 200, 300, 500, 700, 1000, 1400],
  stages: [
    {
      id: 'foundation',
      name: 'Foundation',
      minHours: 0,
      maxHours: 30,
      minScale: 0.70,
      maxScale: 0.85,
      structureTier: 1,
      description: 'Pronunciation, basic alphabet, essential greetings, and core phonetics.',
    },
    {
      id: 'early-exposure',
      name: 'Early Exposure',
      minHours: 30,
      maxHours: 120,
      minScale: 0.85,
      maxScale: 1.00,
      structureTier: 2,
      description: 'Survival vocabulary, simple dialogues, routine phrases (A1/A2 range).',
    },
    {
      id: 'functional-communication',
      name: 'Functional Communication',
      minHours: 120,
      maxHours: 300,
      minScale: 1.00,
      maxScale: 1.15,
      structureTier: 3,
      description: 'Everyday conversations, expressing personal thoughts, handling travel (B1 range).',
    },
    {
      id: 'independent-communication',
      name: 'Independent Communication',
      minHours: 300,
      maxHours: 700,
      minScale: 1.15,
      maxScale: 1.28,
      structureTier: 4,
      description: 'Spontaneous fluency, reading complex texts, discussing abstract topics (B2 range).',
    },
    {
      id: 'advanced-communication',
      name: 'Advanced Communication',
      minHours: 700,
      maxHours: 1400,
      minScale: 1.28,
      maxScale: 1.40,
      structureTier: 5,
      description: 'Professional fluency, cultural nuance, idioms, and effortless discourse (C1 range).',
    },
    {
      id: 'high-proficiency',
      name: 'High Proficiency',
      minHours: 1400,
      maxHours: 10000,
      minScale: 1.40,
      maxScale: 1.48,
      structureTier: 6,
      description: 'Near-native expression, literary appreciation, and complete precision (C2 range).',
    },
  ],
};

// ── 3. Music Progression Profile ─────────────────────────────────
export const MUSIC_PROGRESSION_PROFILE: ProgressionProfile = {
  id: 'profile-music',
  skillKey: 'music',
  title: 'Musical Instrument Development',
  category: 'music',
  sourceNote:
    'Calibrated from conservatory deliberate practice literature and motor-cognitive acquisition research.',
  isEvidenceInformed: true,
  checkpoints: [25, 50, 100, 150, 250, 400, 500, 750, 1000],
  stages: [
    {
      id: 'foundation',
      name: 'Foundation',
      minHours: 0,
      maxHours: 25,
      minScale: 0.70,
      maxScale: 0.85,
      structureTier: 1,
      description: 'Posture, basic hand position, reading notation/tabs, and first single-line melodies.',
    },
    {
      id: 'technique',
      name: 'Technique',
      minHours: 25,
      maxHours: 100,
      minScale: 0.85,
      maxScale: 1.00,
      structureTier: 2,
      description: 'Scales, basic chord transitions, rhythmic consistency, and simple songs.',
    },
    {
      id: 'repertoire',
      name: 'Repertoire',
      minHours: 100,
      maxHours: 250,
      minScale: 1.00,
      maxScale: 1.15,
      structureTier: 3,
      description: 'Intermediate song catalog, dynamic expression, hand independence, and ear training.',
    },
    {
      id: 'applied-performance',
      name: 'Applied Performance',
      minHours: 250,
      maxHours: 500,
      minScale: 1.15,
      maxScale: 1.28,
      structureTier: 4,
      description: 'Advanced pieces, improvisation, groove mastery, and ensemble collaboration.',
    },
    {
      id: 'advanced-development',
      name: 'Advanced Development',
      minHours: 500,
      maxHours: 1000,
      minScale: 1.28,
      maxScale: 1.40,
      structureTier: 5,
      description: 'Concert-level repertoire, personal interpretation, and technical fluidity.',
    },
    {
      id: 'deep-practice',
      name: 'Deep Practice',
      minHours: 1000,
      maxHours: 10000,
      minScale: 1.40,
      maxScale: 1.48,
      structureTier: 6,
      description: 'Artistic voice, composition, flawless muscle memory, and effortless mastery.',
    },
  ],
};

// ── 4. Creative Arts Progression Profile ─────────────────────────
export const CREATIVE_PROGRESSION_PROFILE: ProgressionProfile = {
  id: 'profile-creative',
  skillKey: 'creative',
  title: 'Creative Arts & Design Horizon',
  category: 'creative',
  sourceNote:
    'Calibrated from atelier and studio practice frameworks. Visual skills compound through deliberate iterations.',
  isEvidenceInformed: true,
  checkpoints: [25, 50, 100, 150, 250, 400, 500, 750, 1000],
  stages: [
    {
      id: 'foundation',
      name: 'Foundation',
      minHours: 0,
      maxHours: 25,
      minScale: 0.70,
      maxScale: 0.85,
      structureTier: 1,
      description: 'Medium exploration, line quality, basic shapes, and tool familiarity.',
    },
    {
      id: 'fundamentals',
      name: 'Fundamentals',
      minHours: 25,
      maxHours: 100,
      minScale: 0.85,
      maxScale: 1.00,
      structureTier: 2,
      description: 'Perspective, lighting, color theory, anatomy/proportions, and study copies.',
    },
    {
      id: 'applied-practice',
      name: 'Applied Practice',
      minHours: 100,
      maxHours: 250,
      minScale: 1.00,
      maxScale: 1.15,
      structureTier: 3,
      description: 'Original compositions, storytelling, workflow consistency, and medium control.',
    },
    {
      id: 'project-depth',
      name: 'Project Depth',
      minHours: 250,
      maxHours: 500,
      minScale: 1.15,
      maxScale: 1.28,
      structureTier: 4,
      description: 'Complex multi-stage projects, stylistic refinement, and aesthetic coherence.',
    },
    {
      id: 'advanced-development',
      name: 'Advanced Development',
      minHours: 500,
      maxHours: 1000,
      minScale: 1.28,
      maxScale: 1.40,
      structureTier: 5,
      description: 'Recognizable artistic signature, advanced lighting/rendering, and portfolio depth.',
    },
    {
      id: 'deep-practice',
      name: 'Deep Practice',
      minHours: 1000,
      maxHours: 10000,
      minScale: 1.40,
      maxScale: 1.48,
      structureTier: 6,
      description: 'Original creative vision, master craftsmanship, and transcendent execution.',
    },
  ],
};

// ── 5. Fitness & Athletics Progression Profile ───────────────────
export const FITNESS_PROGRESSION_PROFILE: ProgressionProfile = {
  id: 'profile-fitness',
  skillKey: 'fitness',
  title: 'Athletic & Physical Training Horizon',
  category: 'fitness',
  sourceNote:
    'Calibrated from exercise physiology and progressive overload adaptation research.',
  isEvidenceInformed: true,
  checkpoints: [20, 50, 80, 150, 200, 300, 450, 600, 900],
  stages: [
    {
      id: 'foundation',
      name: 'Foundation',
      minHours: 0,
      maxHours: 20,
      minScale: 0.70,
      maxScale: 0.85,
      structureTier: 1,
      description: 'Movement mechanics, initial conditioning, and establishing exercise safety.',
    },
    {
      id: 'consistency',
      name: 'Consistency',
      minHours: 20,
      maxHours: 80,
      minScale: 0.85,
      maxScale: 1.00,
      structureTier: 2,
      description: 'Habit formation, baseline endurance, neuromuscular coordination, and recovery rhythms.',
    },
    {
      id: 'technique',
      name: 'Technique',
      minHours: 80,
      maxHours: 200,
      minScale: 1.00,
      maxScale: 1.15,
      structureTier: 3,
      description: 'Strict form under resistance, aerobic base expansion, and structured training cycles.',
    },
    {
      id: 'base-development',
      name: 'Base Development',
      minHours: 200,
      maxHours: 450,
      minScale: 1.15,
      maxScale: 1.28,
      structureTier: 4,
      description: 'Substantial strength/capacity gains, periodization, and resilience against fatigue.',
    },
    {
      id: 'advanced-development',
      name: 'Advanced Development',
      minHours: 450,
      maxHours: 900,
      minScale: 1.28,
      maxScale: 1.40,
      structureTier: 5,
      description: 'Peak physical conditioning, sport-specific skill mastery, and sustained athletic output.',
    },
    {
      id: 'long-term-performance',
      name: 'Long-Term Performance',
      minHours: 900,
      maxHours: 10000,
      minScale: 1.40,
      maxScale: 1.48,
      structureTier: 6,
      description: 'Decade-scale physiological adaptation, biomechanical efficiency, and elite performance.',
    },
  ],
};

// ── 6. Generic 4-Stage Progression Profile (Target-Scaled) ───────
/**
 * Generates a dynamic 4-stage generic practice journey scaled
 * directly to the user's selected target hours:
 * - NOVICE: 0% – 10% of target
 * - INTERMEDIATE: 10% – 40% of target
 * - ADVANCED: 40% – 75% of target
 * - MASTERY: 75% – 100%+ of target
 */
export function createGenericProgressionProfile(targetHours: number = 100): ProgressionProfile {
  const safeTarget = Math.max(5, targetHours);

  const noviceMax = Math.max(1, Math.round(safeTarget * 0.10));
  const intermediateMax = Math.max(noviceMax + 1, Math.round(safeTarget * 0.40));
  const advancedMax = Math.max(intermediateMax + 1, Math.round(safeTarget * 0.75));
  const masteryMax = safeTarget;

  // Percentage checkpoints: 10%, 25%, 50%, 75%, 100% of target
  const checkpoints = [
    Math.round(safeTarget * 0.10),
    Math.round(safeTarget * 0.25),
    Math.round(safeTarget * 0.50),
    Math.round(safeTarget * 0.75),
    safeTarget,
  ].filter((v, i, a) => v > 0 && a.indexOf(v) === i);

  return {
    id: `profile-generic-${safeTarget}`,
    skillKey: 'generic',
    title: 'General Practice Journey',
    category: 'generic',
    sourceNote: `Progress through your chosen practice journey target (${safeTarget}h goal). Stage labels reflect progression through your self-selected practice horizons.`,
    isEvidenceInformed: false,
    checkpoints,
    stages: [
      {
        id: 'novice',
        name: 'Novice',
        minHours: 0,
        maxHours: noviceMax,
        minScale: 0.70,
        maxScale: 0.90,
        structureTier: 1,
        description: 'Early practice phase, establishing baseline routines and fundamental exposure.',
      },
      {
        id: 'intermediate',
        name: 'Intermediate',
        minHours: noviceMax,
        maxHours: intermediateMax,
        minScale: 0.90,
        maxScale: 1.15,
        structureTier: 2,
        description: 'Developing rhythm, consistent execution, and practical problem-solving in practice.',
      },
      {
        id: 'advanced',
        name: 'Advanced',
        minHours: intermediateMax,
        maxHours: advancedMax,
        minScale: 1.15,
        maxScale: 1.35,
        structureTier: 3,
        description: 'Deepening capability, handling complexity, and refining technique across projects.',
      },
      {
        id: 'mastery',
        name: 'Mastery',
        minHours: advancedMax,
        maxHours: masteryMax,
        minScale: 1.35,
        maxScale: 1.48,
        structureTier: 4,
        description: 'Substantial dedicated practice and personalized mastery in your chosen journey.',
      },
    ],
  };
}

export const GENERIC_PROGRESSION_PROFILE = createGenericProgressionProfile(100);
export const DEFAULT_PROGRESSION_PROFILE = GENERIC_PROGRESSION_PROFILE;
export const PYTHON_PROGRESSION_PROFILE = PROGRAMMING_PROGRESSION_PROFILE;

/**
 * Retrieve progression profile for a given skill, category, and target hours.
 * Follows the decision flow:
 * 1. Explicit curated category (Programming, Language, Music, Creative, Fitness) -> Curated profile
 * 2. Explicit 'generic' category -> Target-scaled generic profile
 * 3. Conservative keyword inference if category is omitted
 * 4. Fallback -> Target-scaled generic profile
 */
export function getProgressionProfile(
  skillName: string,
  category?: string,
  targetHours: number = 100,
): ProgressionProfile {
  // 1. Explicit Category Selection (primary source of truth)
  if (category) {
    const cat = category.trim().toLowerCase();
    if (cat === 'programming') return PROGRAMMING_PROGRESSION_PROFILE;
    if (cat === 'language') return LANGUAGE_PROGRESSION_PROFILE;
    if (cat === 'music') return MUSIC_PROGRESSION_PROFILE;
    if (cat === 'creative') return CREATIVE_PROGRESSION_PROFILE;
    if (cat === 'fitness') return FITNESS_PROGRESSION_PROFILE;
    if (cat === 'generic') return createGenericProgressionProfile(targetHours);
  }

  // 2. Conservative Keyword Inference (Only for obvious, unambiguous cases when category is omitted)
  const name = skillName.trim().toLowerCase();

  if (
    name === 'python' ||
    name === 'javascript' ||
    name === 'typescript' ||
    name === 'java' ||
    name === 'c++' ||
    name === 'rust' ||
    name === 'golang' ||
    name === 'coding' ||
    name === 'programming'
  ) {
    return PROGRAMMING_PROGRESSION_PROFILE;
  }

  if (
    name === 'german' ||
    name === 'spanish' ||
    name === 'french' ||
    name === 'japanese' ||
    name === 'chinese' ||
    name === 'mandarin' ||
    name === 'italian' ||
    name === 'russian' ||
    name === 'language'
  ) {
    return LANGUAGE_PROGRESSION_PROFILE;
  }

  if (
    name === 'piano' ||
    name === 'guitar' ||
    name === 'violin' ||
    name === 'drums' ||
    name === 'music'
  ) {
    return MUSIC_PROGRESSION_PROFILE;
  }

  if (
    name === 'drawing' ||
    name === 'painting' ||
    name === 'sketching' ||
    name === 'illustration'
  ) {
    return CREATIVE_PROGRESSION_PROFILE;
  }

  if (
    name === 'running' ||
    name === 'swimming' ||
    name === 'calisthenics' ||
    name === 'weightlifting' ||
    name === 'workout'
  ) {
    return FITNESS_PROGRESSION_PROFILE;
  }

  // 3. Universal Fallback: Dynamic 4-stage target-scaled generic journey
  return createGenericProgressionProfile(targetHours);
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
 * Strictly bounded to prevent nodes from becoming blinding white suns.
 */
export function calculateLevelAura(level: number): {
  auraIntensity: number;
  haloOpacity: number;
  emissiveIntensity: number;
} {
  const safeLevel = Math.max(1, level);

  // Aura intensity: Bounded strictly to [1.0, 1.45]
  const auraIntensity = Math.min(1.45, 1.0 + Math.log2(safeLevel) * 0.10);

  // Halo opacity: Bounded strictly to [0.20, 0.38]
  const haloOpacity = Math.min(0.38, 0.20 + (safeLevel - 1) * 0.008);

  // Emissive intensity: Bounded strictly to [0.85, 1.35]
  const emissiveIntensity = Math.min(1.35, 0.85 + (safeLevel - 1) * 0.025);

  return {
    auraIntensity,
    haloOpacity,
    emissiveIntensity,
  };
}

/**
 * Calculate complete skill progression state from raw seconds, level, optional category, and targetHours
 */
export function getSkillProgressionState(
  skillId: string,
  skillName: string,
  totalSeconds: number,
  level: number,
  category?: string,
  targetHours: number = 100,
  baseColor?: string,
): SkillProgressionState {
  const totalHours = totalSeconds / 3600;
  const profile = getProgressionProfile(skillName, category, targetHours);

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

  // 4. Level Aura properties (Strictly bounded)
  const { auraIntensity, haloOpacity } = calculateLevelAura(level);

  // 5. Next visual checkpoint milestone
  const crossedCheckpoints = profile.checkpoints.filter((cp) => totalHours >= cp);
  const nextCheckpoint =
    profile.checkpoints.find((cp) => totalHours < cp) ?? null;

  const hoursToNextMilestone =
    nextCheckpoint !== null ? Math.max(0, nextCheckpoint - totalHours) : null;

  // 6. Evolved Skill Palette (Stage-informed chromatic depth and harmonies)
  const evolvedPalette = getEvolvedSkillPalette(
    baseColor || '#818cf8',
    totalHours,
    currentStage.structureTier,
  );

  return {
    skillId,
    totalSeconds,
    totalHours,
    category: profile.category,
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
    evolvedPalette,
  };
}
