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
  levelAuraIntensity: number; // [1.0, 3.6]
  haloOpacity: number; // [0.18, 0.65]
  structureTier: number; // 1 to 6
  nextVisualMilestoneHours: number | null;
  hoursToNextMilestone: number | null;
  activeCheckpointsCrossed: number[];
  calibrationNote: string;
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
      description: 'Complex systems, performance tuning, and architectural patterns.',
    },
    {
      id: 'job-ready-depth',
      name: 'Job-Ready Depth',
      minHours: 600,
      maxHours: 1200,
      minScale: 1.28,
      maxScale: 1.40,
      structureTier: 5,
      description: 'Production codebases, multi-system integration, and team velocity.',
    },
    {
      id: 'deep-mastery',
      name: 'Deep Mastery',
      minHours: 1200,
      maxHours: 10000,
      minScale: 1.40,
      maxScale: 1.48,
      structureTier: 6,
      description: 'Architectural innovation, deep specialization, and domain mastery.',
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
    'Language acquisition deliberate practice horizon. Hour milestones are approximate guideposts and do not guarantee official certification.',
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
      description: 'Pronunciation, core phonetics, alphabet, and essential greetings.',
    },
    {
      id: 'early-exposure',
      name: 'Early Exposure',
      minHours: 30,
      maxHours: 120,
      minScale: 0.85,
      maxScale: 1.00,
      structureTier: 2,
      description: 'High-frequency vocabulary, basic sentence patterns, and survival phrases.',
    },
    {
      id: 'functional-communication',
      name: 'Functional Communication',
      minHours: 120,
      maxHours: 300,
      minScale: 1.00,
      maxScale: 1.15,
      structureTier: 3,
      description: 'Daily conversations, past/future tenses, and straightforward reading.',
    },
    {
      id: 'independent-communication',
      name: 'Independent Communication',
      minHours: 300,
      maxHours: 700,
      minScale: 1.15,
      maxScale: 1.28,
      structureTier: 4,
      description: 'Complex discourse, spontaneous speaking, idioms, and media comprehension.',
    },
    {
      id: 'advanced-communication',
      name: 'Advanced Communication',
      minHours: 700,
      maxHours: 1400,
      minScale: 1.28,
      maxScale: 1.40,
      structureTier: 5,
      description: 'Professional nuance, cultural idioms, native-speed media, and formal writing.',
    },
    {
      id: 'high-proficiency',
      name: 'High Proficiency',
      minHours: 1400,
      maxHours: 10000,
      minScale: 1.40,
      maxScale: 1.48,
      structureTier: 6,
      description: 'Effortless fluency, deep cultural mastery, and specialized expression.',
    },
  ],
};

// ── 3. Music Progression Profile ─────────────────────────────────
export const MUSIC_PROGRESSION_PROFILE: ProgressionProfile = {
  id: 'profile-music',
  skillKey: 'music',
  title: 'Musical Development Horizon',
  category: 'music',
  sourceNote:
    'Musical instrument and theory deliberate practice horizon. Hour investments reflect accumulated motor and artistic discipline.',
  isEvidenceInformed: true,
  checkpoints: [25, 50, 100, 175, 250, 375, 500, 750, 1000],
  stages: [
    {
      id: 'foundation',
      name: 'Foundation',
      minHours: 0,
      maxHours: 25,
      minScale: 0.70,
      maxScale: 0.85,
      structureTier: 1,
      description: 'Instrument ergonomics, posture, initial scales, and basic rhythm.',
    },
    {
      id: 'technique',
      name: 'Technique',
      minHours: 25,
      maxHours: 100,
      minScale: 0.85,
      maxScale: 1.00,
      structureTier: 2,
      description: 'Hand synchronization, chord transitions, finger agility, and tempo consistency.',
    },
    {
      id: 'repertoire',
      name: 'Repertoire',
      minHours: 100,
      maxHours: 250,
      minScale: 1.00,
      maxScale: 1.15,
      structureTier: 3,
      description: 'Learning full pieces, dynamics, phrase shaping, and ear training.',
    },
    {
      id: 'applied-performance',
      name: 'Applied Performance',
      minHours: 250,
      maxHours: 500,
      minScale: 1.15,
      maxScale: 1.28,
      structureTier: 4,
      description: 'Expressive interpretation, stage confidence, and fluid improvisation.',
    },
    {
      id: 'advanced-development',
      name: 'Advanced Development',
      minHours: 500,
      maxHours: 1000,
      minScale: 1.28,
      maxScale: 1.40,
      structureTier: 5,
      description: 'Complex repertoire, subtle tone control, and personal artistic voice.',
    },
    {
      id: 'deep-practice',
      name: 'Deep Practice',
      minHours: 1000,
      maxHours: 10000,
      minScale: 1.40,
      maxScale: 1.48,
      structureTier: 6,
      description: 'Virtuosity, deep musical synthesis, and effortless artistic expression.',
    },
  ],
};

// ── 4. Creative Arts Progression Profile ─────────────────────────
export const CREATIVE_PROGRESSION_PROFILE: ProgressionProfile = {
  id: 'profile-creative',
  skillKey: 'creative',
  title: 'Creative Arts Horizon',
  category: 'creative',
  sourceNote:
    'Creative visual and written arts practice horizon. Practice time reflects structured exploration and portfolio depth.',
  isEvidenceInformed: true,
  checkpoints: [25, 50, 100, 175, 250, 375, 500, 750, 1000],
  stages: [
    {
      id: 'foundation',
      name: 'Foundation',
      minHours: 0,
      maxHours: 25,
      minScale: 0.70,
      maxScale: 0.85,
      structureTier: 1,
      description: 'Core tools, materials, basic composition, and foundational techniques.',
    },
    {
      id: 'fundamentals',
      name: 'Fundamentals',
      minHours: 25,
      maxHours: 100,
      minScale: 0.85,
      maxScale: 1.00,
      structureTier: 2,
      description: 'Proportion, perspective, color theory, light, and regular sketchbook habits.',
    },
    {
      id: 'applied-practice',
      name: 'Applied Practice',
      minHours: 100,
      maxHours: 250,
      minScale: 1.00,
      maxScale: 1.15,
      structureTier: 3,
      description: 'Completed independent pieces, stylistic exploration, and iterative refinement.',
    },
    {
      id: 'project-depth',
      name: 'Project Depth',
      minHours: 250,
      maxHours: 500,
      minScale: 1.15,
      maxScale: 1.28,
      structureTier: 4,
      description: 'Multi-stage portfolio projects, cohesive series, and technical polish.',
    },
    {
      id: 'advanced-development',
      name: 'Advanced Development',
      minHours: 500,
      maxHours: 1000,
      minScale: 1.28,
      maxScale: 1.40,
      structureTier: 5,
      description: 'Distinct creative voice, sophisticated execution, and professional workflows.',
    },
    {
      id: 'deep-practice',
      name: 'Deep Practice',
      minHours: 1000,
      maxHours: 10000,
      minScale: 1.40,
      maxScale: 1.48,
      structureTier: 6,
      description: 'Visionary synthesis, masterwork creation, and conceptual originality.',
    },
  ],
};

// ── 5. Fitness & Athletic Progression Profile ────────────────────
export const FITNESS_PROGRESSION_PROFILE: ProgressionProfile = {
  id: 'profile-fitness',
  skillKey: 'fitness',
  title: 'Athletic Development Horizon',
  category: 'fitness',
  sourceNote:
    'Athletic conditioning and movement deliberate practice horizon. Hour investments reflect physical adaptation and habit resilience.',
  isEvidenceInformed: true,
  checkpoints: [20, 50, 80, 140, 200, 300, 450, 650, 900],
  stages: [
    {
      id: 'foundation',
      name: 'Foundation',
      minHours: 0,
      maxHours: 20,
      minScale: 0.70,
      maxScale: 0.85,
      structureTier: 1,
      description: 'Safe movement patterns, body awareness, warmup discipline, and routine setup.',
    },
    {
      id: 'consistency',
      name: 'Consistency',
      minHours: 20,
      maxHours: 80,
      minScale: 0.85,
      maxScale: 1.00,
      structureTier: 2,
      description: 'Habit stabilization, baseline endurance, recovery management, and form refinement.',
    },
    {
      id: 'technique',
      name: 'Technique',
      minHours: 80,
      maxHours: 200,
      minScale: 1.00,
      maxScale: 1.15,
      structureTier: 3,
      description: 'Progressive overload, movement efficiency, and measurable physical conditioning.',
    },
    {
      id: 'base-development',
      name: 'Base Development',
      minHours: 200,
      maxHours: 450,
      minScale: 1.15,
      maxScale: 1.28,
      structureTier: 4,
      description: 'Athletic capacity, sport-specific conditioning, and resilient work capacity.',
    },
    {
      id: 'advanced-development',
      name: 'Advanced Development',
      minHours: 450,
      maxHours: 900,
      minScale: 1.28,
      maxScale: 1.40,
      structureTier: 5,
      description: 'Periodization, peak performance training, and fine-tuned biomechanics.',
    },
    {
      id: 'long-term-performance',
      name: 'Long-Term Performance',
      minHours: 900,
      maxHours: 10000,
      minScale: 1.40,
      maxScale: 1.48,
      structureTier: 6,
      description: 'Lifelong mastery, peak physical autonomy, and athletic sustainability.',
    },
  ],
};

// ── 6. Universal Generic Progression Profile ─────────────────────
export const GENERIC_PROGRESSION_PROFILE: ProgressionProfile = {
  id: 'profile-generic',
  skillKey: 'generic',
  title: 'Deliberate Practice Horizon',
  category: 'generic',
  sourceNote:
    'Universal practice progression horizon. Practice time is an observable investment metric, not a guarantee of competence.',
  isEvidenceInformed: false,
  checkpoints: [25, 50, 100, 175, 250, 375, 500, 750, 1000],
  stages: [
    {
      id: 'foundation',
      name: 'Foundation',
      minHours: 0,
      maxHours: 25,
      minScale: 0.70,
      maxScale: 0.85,
      structureTier: 1,
      description: 'Initial fundamentals, orientation, and establishing practice routines.',
    },
    {
      id: 'basic-fluency',
      name: 'Basic Fluency',
      minHours: 25,
      maxHours: 100,
      minScale: 0.85,
      maxScale: 1.00,
      structureTier: 2,
      description: 'Consistent execution of primary techniques and basic problem solving.',
    },
    {
      id: 'applied-practice',
      name: 'Applied Practice',
      minHours: 100,
      maxHours: 250,
      minScale: 1.00,
      maxScale: 1.15,
      structureTier: 3,
      description: 'Independent small projects, contextual application, and error correction.',
    },
    {
      id: 'intermediate-depth',
      name: 'Intermediate Depth',
      minHours: 250,
      maxHours: 500,
      minScale: 1.15,
      maxScale: 1.28,
      structureTier: 4,
      description: 'Nuanced execution, deeper principles, and workflow efficiency.',
    },
    {
      id: 'advanced-competence',
      name: 'Advanced Competence',
      minHours: 500,
      maxHours: 1000,
      minScale: 1.28,
      maxScale: 1.40,
      structureTier: 5,
      description: 'Complex problem solving, high speed, and reliable applied skill.',
    },
    {
      id: 'deep-mastery',
      name: 'Deep Mastery',
      minHours: 1000,
      maxHours: 10000,
      minScale: 1.40,
      maxScale: 1.48,
      structureTier: 6,
      description: 'Years of dedicated practice, synthesis, and deep domain mastery.',
    },
  ],
};

// Aliases for backwards compatibility
export const PYTHON_PROGRESSION_PROFILE = PROGRAMMING_PROGRESSION_PROFILE;
export const DEFAULT_PROGRESSION_PROFILE = GENERIC_PROGRESSION_PROFILE;

/**
 * Retrieve progression profile for a given skill and optional category
 */
export function getProgressionProfile(
  skillName: string,
  category?: string,
): ProgressionProfile {
  // 1. Match by explicit category if provided
  if (category) {
    const cat = category.trim().toLowerCase();
    if (cat === 'programming') return PROGRAMMING_PROGRESSION_PROFILE;
    if (cat === 'language') return LANGUAGE_PROGRESSION_PROFILE;
    if (cat === 'music') return MUSIC_PROGRESSION_PROFILE;
    if (cat === 'creative') return CREATIVE_PROGRESSION_PROFILE;
    if (cat === 'fitness') return FITNESS_PROGRESSION_PROFILE;
    if (cat === 'generic') return GENERIC_PROGRESSION_PROFILE;
  }

  // 2. Intelligent keyword fallback inference
  const name = skillName.trim().toLowerCase();

  if (
    name.includes('python') ||
    name.includes('code') ||
    name.includes('coding') ||
    name.includes('react') ||
    name.includes('typescript') ||
    name.includes('rust') ||
    name.includes('java') ||
    name.includes('program') ||
    name.includes('web')
  ) {
    return PROGRAMMING_PROGRESSION_PROFILE;
  }

  if (
    name.includes('german') ||
    name.includes('spanish') ||
    name.includes('french') ||
    name.includes('japanese') ||
    name.includes('chinese') ||
    name.includes('mandarin') ||
    name.includes('korean') ||
    name.includes('italian') ||
    name.includes('russian') ||
    name.includes('language')
  ) {
    return LANGUAGE_PROGRESSION_PROFILE;
  }

  if (
    name.includes('guitar') ||
    name.includes('piano') ||
    name.includes('violin') ||
    name.includes('drum') ||
    name.includes('sing') ||
    name.includes('music') ||
    name.includes('bass')
  ) {
    return MUSIC_PROGRESSION_PROFILE;
  }

  if (
    name.includes('draw') ||
    name.includes('paint') ||
    name.includes('sketch') ||
    name.includes('art') ||
    name.includes('design') ||
    name.includes('write') ||
    name.includes('writing') ||
    name.includes('novel')
  ) {
    return CREATIVE_PROGRESSION_PROFILE;
  }

  if (
    name.includes('run') ||
    name.includes('running') ||
    name.includes('gym') ||
    name.includes('fitness') ||
    name.includes('workout') ||
    name.includes('swim') ||
    name.includes('calisthenics') ||
    name.includes('yoga')
  ) {
    return FITNESS_PROGRESSION_PROFILE;
  }

  return GENERIC_PROGRESSION_PROFILE;
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
 * Calculate complete skill progression state from raw seconds, level, and optional category
 */
export function getSkillProgressionState(
  skillId: string,
  skillName: string,
  totalSeconds: number,
  level: number,
  category?: string,
): SkillProgressionState {
  const totalHours = totalSeconds / 3600;
  const profile = getProgressionProfile(skillName, category);

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
  };
}
