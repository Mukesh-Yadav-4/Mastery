import type { SkillCategory } from '../types';

export interface StarterSkillItem {
  name: string;
  description: string;
  icon: string;
  color: string;
  category: SkillCategory;
  targetHours: number;
}

export interface StarterPack {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  accentColor: string;
  skills: StarterSkillItem[];
}

/**
 * Curated domain starter universes using the T-Shaped Deliberate Practice Model:
 * - 1 Primary Anchor Skill (80-100h deep craft)
 * - 3 Focused Companion Skills (30-60h targeted competencies)
 * Total domain scope is a realistic, inspiring ~220-250 hours.
 */
export const STARTER_PACKS: StarterPack[] = [
  {
    id: 'software-engineering',
    name: 'Software Engineering',
    tagline: 'Modern frontend, algorithms, systems design & backend craft',
    icon: '💻',
    accentColor: '#6366f1',
    skills: [
      {
        name: 'TypeScript & Architecture',
        description: 'Advanced types, robust component design, scalable systems',
        icon: '💻',
        color: '#6366f1',
        category: 'programming',
        targetHours: 100,
      },
      {
        name: 'Algorithms & Data Structures',
        description: 'Problem-solving speed, dynamic programming, tree traversals',
        icon: '⚡',
        color: '#3b82f6',
        category: 'programming',
        targetHours: 50,
      },
      {
        name: 'System Design & APIs',
        description: 'Distributed systems, database indexing, caching strategies',
        icon: '🏛️',
        color: '#06b6d4',
        category: 'programming',
        targetHours: 50,
      },
      {
        name: 'Python & AI Foundations',
        description: 'Modern Python scripting, data processing, model integrations',
        icon: '🐍',
        color: '#10b981',
        category: 'programming',
        targetHours: 30,
      },
    ],
  },
  {
    id: 'music-production',
    name: 'Music & Audio Craft',
    tagline: 'Synthesis, keyboard mastery, mixing precision & music theory',
    icon: '🎵',
    accentColor: '#ec4899',
    skills: [
      {
        name: 'Sound Synthesis & Sound Design',
        description: 'Subtractive, FM synthesis, modular signal chains, patch creation',
        icon: '🎛️',
        color: '#ec4899',
        category: 'music',
        targetHours: 80,
      },
      {
        name: 'Keyboard & Piano Fluency',
        description: 'Scales, voicings, arpeggios, two-hand coordination',
        icon: '🎹',
        color: '#a855f7',
        category: 'music',
        targetHours: 60,
      },
      {
        name: 'Mixing & Mastering Precision',
        description: 'Dynamic range, parametric EQ, spatial balance, loudness',
        icon: '🎧',
        color: '#3b82f6',
        category: 'music',
        targetHours: 50,
      },
      {
        name: 'Music Theory & Harmony',
        description: 'Modal progressions, chord extensions, counterpoint',
        icon: '🎼',
        color: '#f59e0b',
        category: 'music',
        targetHours: 40,
      },
    ],
  },
  {
    id: 'writing-narrative',
    name: 'Writing & Narrative Craft',
    tagline: 'Longform clarity, fiction mechanics, prose editing & daily flow',
    icon: '✍️',
    accentColor: '#f59e0b',
    skills: [
      {
        name: 'Longform Essays & Argument',
        description: 'Compelling thesis building, deep research synthesis, rhetorical flow',
        icon: '✍️',
        color: '#f59e0b',
        category: 'creative',
        targetHours: 80,
      },
      {
        name: 'Fiction & Worldbuilding Mechanics',
        description: 'Character tension, scene pacing, subtext, narrative arcs',
        icon: '📖',
        color: '#ec4899',
        category: 'creative',
        targetHours: 60,
      },
      {
        name: 'Prose Editing & Style Polish',
        description: 'Rhythm, active voice, word economy, structural pruning',
        icon: '✒️',
        color: '#8b5cf6',
        category: 'creative',
        targetHours: 40,
      },
      {
        name: 'Daily Free Flow & Journaling',
        description: 'Unfiltered thought capture, emotional clarity, cognitive debriefs',
        icon: '📓',
        color: '#10b981',
        category: 'creative',
        targetHours: 30,
      },
    ],
  },
  {
    id: 'deep-research',
    name: 'Deep Research & AI Science',
    tagline: 'Paper synthesis, mathematical proofs, machine learning & statistics',
    icon: '🔬',
    accentColor: '#06b6d4',
    skills: [
      {
        name: 'Paper Synthesis & Literature',
        description: 'Critical paper deconstruction, citation mapping, meta-analysis',
        icon: '🔬',
        color: '#06b6d4',
        category: 'generic',
        targetHours: 80,
      },
      {
        name: 'Mathematical Proofs & Calculus',
        description: 'Linear algebra, vector spaces, optimization manifolds',
        icon: '📐',
        color: '#6366f1',
        category: 'generic',
        targetHours: 60,
      },
      {
        name: 'Applied Machine Learning',
        description: 'Transformer architectures, PyTorch pipelines, hyperparameter tuning',
        icon: '🧠',
        color: '#a855f7',
        category: 'programming',
        targetHours: 50,
      },
      {
        name: 'Statistical Modeling & Inference',
        description: 'Bayesian inference, hypothesis validation, causal modeling',
        icon: '📊',
        color: '#34d399',
        category: 'generic',
        targetHours: 30,
      },
    ],
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX & Visual Architecture',
    tagline: 'Design systems, color theory, 3D spatial UI & typography mastery',
    icon: '🎨',
    accentColor: '#a855f7',
    skills: [
      {
        name: 'Design Systems & Component Specs',
        description: 'Atomic tokens, accessible variants, layout grids, auto-layout',
        icon: '🎨',
        color: '#a855f7',
        category: 'creative',
        targetHours: 80,
      },
      {
        name: 'Color Theory & Visual Lighting',
        description: 'Chromatic palettes, dark-mode luminosity, contrast hierarchy',
        icon: '🌈',
        color: '#ec4899',
        category: 'creative',
        targetHours: 50,
      },
      {
        name: '3D Spatial & Motion Prototyping',
        description: 'Three.js choreography, micro-interactions, spring physics',
        icon: '🪐',
        color: '#3b82f6',
        category: 'creative',
        targetHours: 50,
      },
      {
        name: 'Typography & Layout Hierarchy',
        description: 'Type scaling, optical kerning, vertical rhythm, readability',
        icon: '🔤',
        color: '#10b981',
        category: 'creative',
        targetHours: 40,
      },
    ],
  },
];
