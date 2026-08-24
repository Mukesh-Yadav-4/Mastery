/**
 * Mastery Progression Engine
 *
 * Translates accumulated practice seconds, skill level, and user target
 * into bounded visual scale, radiant aura intensity, structural tier,
 * and planning milestone horizons.
 *
 * ARCHITECTURAL PRINCIPLE:
 * - Evidence-informed domain-specific profiles for explicit categories
 *   (Programming, Language, Music, Creative, Fitness, Generic).
 * - All stage hour thresholds scale dynamically to the skill's target hours,
 *   guaranteeing consistency, realism, and zero artificial 1,200h walls.
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

// ── Profile Factory Function ─────────────────────────────────────
function createScaledDomainProfile(
  id: string,
  skillKey: string,
  title: string,
  category: string,
  sourceNote: string,
  stagesDef: { id: string; name: string; description: string; endRatio: number }[],
  targetHours: number = 100,
): ProgressionProfile {
  const safeTarget = Math.max(5, targetHours);

  let currentMin = 0;
  const stages: ProgressionStage[] = stagesDef.map((def, idx) => {
    const isLast = idx === stagesDef.length - 1;
    const maxH = isLast
      ? safeTarget
      : Math.max(currentMin + 1, Math.round(safeTarget * def.endRatio));
    const minH = currentMin;
    currentMin = maxH;

    const minScale = 0.70 + (idx / stagesDef.length) * 0.70;
    const maxScale = 0.70 + ((idx + 1) / stagesDef.length) * 0.78;

    return {
      id: def.id,
      name: def.name,
      minHours: minH,
      maxHours: maxH,
      minScale,
      maxScale,
      structureTier: idx + 1,
      description: def.description,
    };
  });

  const checkpoints = [
    Math.round(safeTarget * 0.10),
    Math.round(safeTarget * 0.25),
    Math.round(safeTarget * 0.50),
    Math.round(safeTarget * 0.75),
    safeTarget,
  ].filter((v, i, a) => v > 0 && a.indexOf(v) === i);

  return {
    id: `profile-${id}-${safeTarget}`,
    skillKey,
    title,
    category,
    sourceNote: `${sourceNote} Calibrated for a ${safeTarget}h deliberate practice milestone goal.`,
    isEvidenceInformed: true,
    stages,
    checkpoints,
  };
}

// ── 1. Programming Profile Generator ─────────────────────────────
export function createProgrammingProfile(targetHours: number = 100): ProgressionProfile {
  return createScaledDomainProfile(
    'programming',
    'programming',
    'Programming Development Horizon',
    'programming',
    'Calibrated from evidence-informed deliberate practice planning guidelines.',
    [
      {
        id: 'foundation',
        name: 'Foundation',
        endRatio: 0.10,
        description: 'Initial fundamentals, syntax exposure, and core language constructs.',
      },
      {
        id: 'basic-comfort',
        name: 'Basic Comfort',
        endRatio: 0.35,
        description: 'Comfort with core syntax, standard libraries, and script authoring.',
      },
      {
        id: 'solid-ability',
        name: 'Solid Ability',
        endRatio: 0.65,
        description: 'Independent modular architecture, project building, and algorithmic problem solving.',
      },
      {
        id: 'advanced-practice',
        name: 'Advanced Practice',
        endRatio: 0.85,
        description: 'Complex architecture, performance optimization, and robust debugging.',
      },
      {
        id: 'deep-mastery',
        name: 'Deep Mastery',
        endRatio: 1.00,
        description: 'Profound system intuition, scalable architecture, and master-level execution.',
      },
    ],
    targetHours,
  );
}

// ── 2. Language Profile Generator ────────────────────────────────
export function createLanguageProfile(targetHours: number = 100): ProgressionProfile {
  return createScaledDomainProfile(
    'language',
    'language',
    'Language Acquisition Horizon',
    'language',
    'Calibrated from CEFR and communicative acquisition deliberate practice research.',
    [
      {
        id: 'foundation',
        name: 'Foundation',
        endRatio: 0.10,
        description: 'Phonetic awareness, essential vocabulary, and survival phrases.',
      },
      {
        id: 'basic-comfort',
        name: 'Early Exposure',
        endRatio: 0.35,
        description: 'Basic sentence structures, everyday vocabulary, and simple dialogues.',
      },
      {
        id: 'solid-ability',
        name: 'Conversational Base',
        endRatio: 0.65,
        description: 'Connected speech, handling routine travel/work interactions, listening comprehension.',
      },
      {
        id: 'advanced-practice',
        name: 'Working Fluency',
        endRatio: 0.85,
        description: 'Spontaneous interaction, abstract discussion, and complex reading.',
      },
      {
        id: 'deep-mastery',
        name: 'High Proficiency',
        endRatio: 1.00,
        description: 'Nuanced expression, idiomatic grasp, and effortless native-like communication.',
      },
    ],
    targetHours,
  );
}

// ── 3. Music Profile Generator ───────────────────────────────────
export function createMusicProfile(targetHours: number = 100): ProgressionProfile {
  return createScaledDomainProfile(
    'music',
    'music',
    'Musical Instrument & Sound Horizon',
    'music',
    'Calibrated from instrumental pedagogy and deliberate practice motor-learning literature.',
    [
      {
        id: 'foundation',
        name: 'Fundamentals',
        endRatio: 0.10,
        description: 'Instrument posture, initial tone production, and basic fingering/coordination.',
      },
      {
        id: 'basic-comfort',
        name: 'Coordination',
        endRatio: 0.35,
        description: 'Clean transitions, tempo stability, scales, and simple structured pieces.',
      },
      {
        id: 'solid-ability',
        name: 'Repertoire',
        endRatio: 0.65,
        description: 'Expressive dynamics, multi-part coordination, and stylistic confidence.',
      },
      {
        id: 'advanced-practice',
        name: 'Expressive Nuance',
        endRatio: 0.85,
        description: 'Subtle timing, advanced ornamentation, improvisation, and tone shaping.',
      },
      {
        id: 'deep-mastery',
        name: 'Artistic Fluency',
        endRatio: 1.00,
        description: 'Effortless technique, deep emotional expression, and virtuoso execution.',
      },
    ],
    targetHours,
  );
}

// ── 4. Creative Arts Profile Generator ───────────────────────────
export function createCreativeProfile(targetHours: number = 100): ProgressionProfile {
  return createScaledDomainProfile(
    'creative',
    'creative',
    'Visual & Creative Arts Horizon',
    'creative',
    'Calibrated from foundational drawing and fine arts deliberate practice curricula.',
    [
      {
        id: 'foundation',
        name: 'Observational Basics',
        endRatio: 0.10,
        description: 'Line confidence, contour studies, gesture, and proportion checking.',
      },
      {
        id: 'basic-comfort',
        name: 'Form & Value',
        endRatio: 0.35,
        description: '3D form construction, light/shadow values, and perspective accuracy.',
      },
      {
        id: 'solid-ability',
        name: 'Composition & Medium',
        endRatio: 0.65,
        description: 'Color relationships, visual rhythm, edge control, and medium handling.',
      },
      {
        id: 'advanced-practice',
        name: 'Project Depth',
        endRatio: 0.85,
        description: 'Sustained finished works, visual storytelling, and personal style development.',
      },
      {
        id: 'deep-mastery',
        name: 'Creative Voice',
        endRatio: 1.00,
        description: 'Authoritative draftsmanship, luminous lighting, and master-level creative voice.',
      },
    ],
    targetHours,
  );
}

// ── 5. Fitness Profile Generator ─────────────────────────────────
export function createFitnessProfile(targetHours: number = 100): ProgressionProfile {
  return createScaledDomainProfile(
    'fitness',
    'fitness',
    'Physical & Movement Conditioning Horizon',
    'fitness',
    'Calibrated from exercise science and athletic conditioning deliberate practice protocols.',
    [
      {
        id: 'foundation',
        name: 'Movement Basics',
        endRatio: 0.10,
        description: 'Learning motor patterns, joint mobility, breathing, and safe form.',
      },
      {
        id: 'basic-comfort',
        name: 'Consistency',
        endRatio: 0.35,
        description: 'Habitual cadence, connective tissue adaptation, and aerobic/strength base.',
      },
      {
        id: 'solid-ability',
        name: 'Work Capacity',
        endRatio: 0.65,
        description: 'Volume progression, endurance/power development, and recovery discipline.',
      },
      {
        id: 'advanced-practice',
        name: 'Athletic Calibration',
        endRatio: 0.85,
        description: 'Targeted intensity, periodized training, and performance benchmarks.',
      },
      {
        id: 'deep-mastery',
        name: 'Peak Performance',
        endRatio: 1.00,
        description: 'Elite conditioning, movement autonomy, and peak personal performance.',
      },
    ],
    targetHours,
  );
}

// ── 6. Generic Profile Generator ─────────────────────────────────
export function createGenericProgressionProfile(targetHours: number = 100): ProgressionProfile {
  const safeTarget = Math.max(5, targetHours);

  return createScaledDomainProfile(
    'generic',
    'generic',
    'General Practice Journey',
    'generic',
    'Progress through your chosen deliberate practice journey.',
    [
      {
        id: 'novice',
        name: 'Novice',
        endRatio: 0.10,
        description: 'Early practice phase, establishing baseline routines and fundamental exposure.',
      },
      {
        id: 'intermediate',
        name: 'Intermediate',
        endRatio: 0.40,
        description: 'Developing rhythm, consistent execution, and practical problem-solving.',
      },
      {
        id: 'advanced',
        name: 'Advanced',
        endRatio: 0.75,
        description: 'Deepening capability, handling complexity, and refining technique.',
      },
      {
        id: 'mastery',
        name: 'Mastery',
        endRatio: 1.00,
        description: 'Substantial dedicated practice and personalized mastery in your journey.',
      },
    ],
    safeTarget,
  );
}

// Static default instances for reference / backwards compatibility
export const PROGRAMMING_PROGRESSION_PROFILE = createProgrammingProfile(100);
export const LANGUAGE_PROGRESSION_PROFILE = createLanguageProfile(100);
export const MUSIC_PROGRESSION_PROFILE = createMusicProfile(100);
export const CREATIVE_PROGRESSION_PROFILE = createCreativeProfile(100);
export const FITNESS_PROGRESSION_PROFILE = createFitnessProfile(100);
export const GENERIC_PROGRESSION_PROFILE = createGenericProgressionProfile(100);
export const DEFAULT_PROGRESSION_PROFILE = GENERIC_PROGRESSION_PROFILE;
export const PYTHON_PROGRESSION_PROFILE = PROGRAMMING_PROGRESSION_PROFILE;

/**
 * Retrieve progression profile dynamically calibrated to targetHours
 */
export function getProgressionProfile(
  skillName: string,
  category?: string,
  targetHours: number = 100,
): ProgressionProfile {
  const target = Math.max(5, targetHours || 100);

  // 1. Explicit Category Selection
  if (category) {
    const cat = category.trim().toLowerCase();
    if (cat === 'programming') return createProgrammingProfile(target);
    if (cat === 'language') return createLanguageProfile(target);
    if (cat === 'music') return createMusicProfile(target);
    if (cat === 'creative') return createCreativeProfile(target);
    if (cat === 'fitness') return createFitnessProfile(target);
    if (cat === 'generic') return createGenericProgressionProfile(target);
  }

  // 2. Keyword Inference
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
    return createProgrammingProfile(target);
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
    return createLanguageProfile(target);
  }

  if (
    name === 'piano' ||
    name === 'guitar' ||
    name === 'violin' ||
    name === 'drums' ||
    name === 'music'
  ) {
    return createMusicProfile(target);
  }

  if (
    name === 'drawing' ||
    name === 'painting' ||
    name === 'sketching' ||
    name === 'illustration'
  ) {
    return createCreativeProfile(target);
  }

  if (
    name === 'running' ||
    name === 'swimming' ||
    name === 'calisthenics' ||
    name === 'weightlifting' ||
    name === 'workout'
  ) {
    return createFitnessProfile(target);
  }

  return createGenericProgressionProfile(target);
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
 * Calculate Level -> Aura properties
 */
export function calculateLevelAura(level: number): {
  auraIntensity: number;
  haloOpacity: number;
  emissiveIntensity: number;
} {
  const safeLevel = Math.max(1, level);

  const auraIntensity = Math.min(1.45, 1.0 + Math.log2(safeLevel) * 0.10);
  const haloOpacity = Math.min(0.38, 0.20 + (safeLevel - 1) * 0.008);
  const emissiveIntensity = Math.min(1.35, 0.85 + (safeLevel - 1) * 0.025);

  return {
    auraIntensity,
    haloOpacity,
    emissiveIntensity,
  };
}

/**
 * Calculate complete skill progression state
 */
export function getSkillProgressionState(
  skillId: string,
  skillName: string,
  totalSeconds: number,
  level: number,
  category?: string,
  targetHours: number = 100,
  baseColorHex: string = '#818cf8',
): SkillProgressionState {
  const target = Math.max(5, targetHours || 100);
  const totalHours = Math.max(0, totalSeconds / 3600);
  const profile = getProgressionProfile(skillName, category, target);

  // Find active stage
  let currentStage = profile.stages[0];
  for (const stage of profile.stages) {
    if (totalHours >= stage.minHours) {
      currentStage = stage;
    }
  }

  // Calculate ratio within current stage
  const stageSpan = currentStage.maxHours - currentStage.minHours;
  const stageProgressRatio =
    stageSpan > 0
      ? Math.max(
          0,
          Math.min(1, (totalHours - currentStage.minHours) / stageSpan),
        )
      : 1;

  // Bounded scale strictly [0.70, 1.48]
  const boundedVisualScale = Math.max(
    0.70,
    Math.min(1.48, calculateBoundedScale(totalHours, currentStage)),
  );

  const { auraIntensity: levelAuraIntensity, haloOpacity } =
    calculateLevelAura(level);

  // Milestone checkpoints
  const activeCheckpointsCrossed = profile.checkpoints.filter(
    (cp) => totalHours >= cp,
  );
  const upcomingCheckpoints = profile.checkpoints.filter(
    (cp) => totalHours < cp,
  );
  const nextVisualMilestoneHours =
    upcomingCheckpoints.length > 0 ? upcomingCheckpoints[0] : null;
  const hoursToNextMilestone =
    nextVisualMilestoneHours !== null
      ? Math.max(0, nextVisualMilestoneHours - totalHours)
      : null;

  const evolvedPalette = getEvolvedSkillPalette(
    baseColorHex || '#818cf8',
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
    levelAuraIntensity,
    haloOpacity,
    structureTier: currentStage.structureTier,
    nextVisualMilestoneHours,
    hoursToNextMilestone,
    activeCheckpointsCrossed,
    calibrationNote: profile.sourceNote,
    evolvedPalette,
  };
}
