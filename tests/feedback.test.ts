import { describe, it, expect } from 'vitest';
import { ruleBasedFeedback } from '@/lib/feedback';

describe('ruleBasedFeedback', () => {
  it('gives higher score when expected words present', () => {
    const res = ruleBasedFeedback('La vitesse est la distance parcourue par unité de temps', { topic: 'MOTION', expected: 'vitesse distance temps' } as any);
    expect(res.score).toBeDefined();
    expect((res.score ?? 0)).toBeGreaterThanOrEqual(60);
  });
  it('falls back with generic hint when answer is off-topic', () => {
    const res = ruleBasedFeedback('bonjour', { topic: 'ENERGY', expected: 'rendement énergie' } as any);
    expect((res.score ?? 0)).toBeLessThan(60);
    expect(res.feedback.length).toBeGreaterThan(10);
  });
  it('accepts numeric tolerance for simple fraction answers', () => {
    const expected = 'La vitesse attendue est 18 km/h';
    const res = ruleBasedFeedback('Il trouve 18/1 = 18,00 km/h', { topic: 'MOTION', expected } as any);
    expect((res.score ?? 0)).toBeGreaterThanOrEqual(80);
  });
  it('parses LaTeX fractions and accepts approximate decimal answers', () => {
    const expected = 'Le résultat attendu est \\frac{2}{3}';
    const res = ruleBasedFeedback('Je calcule et j’obtiens 0,67 environ', { topic: 'MATTER', expected } as any);
    expect((res.score ?? 0)).toBeGreaterThanOrEqual(80);
  });
});
