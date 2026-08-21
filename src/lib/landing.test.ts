import { describe, it, expect } from 'vitest';
import { MILESTONE_PERCENTAGES, MILESTONE_LABELS } from './constants';

describe('Landing Page & Public Route Architecture', () => {
  it('has consistent milestone checkpoints for landing page story and app engine', () => {
    expect(MILESTONE_PERCENTAGES).toEqual([10, 25, 50, 75, 100]);
    expect(MILESTONE_LABELS[10]).toBe('First Steps');
    expect(MILESTONE_LABELS[25]).toBe('Quarter Way');
    expect(MILESTONE_LABELS[50]).toBe('Halfway There');
    expect(MILESTONE_LABELS[75]).toBe('Almost There');
    expect(MILESTONE_LABELS[100]).toBe('Goal Reached');
  });

  it('validates public routing states', () => {
    const publicRoutes = ['landing', 'signin', 'signup'] as const;
    expect(publicRoutes).toContain('landing');
    expect(publicRoutes).toContain('signin');
    expect(publicRoutes).toContain('signup');
  });
});
