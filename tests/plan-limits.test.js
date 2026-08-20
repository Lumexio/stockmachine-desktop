import { describe, it, expect } from 'vitest';
import { getPlanLimits, isPlanLimitReached } from '../src/utils/plan-limits';

describe('Plan Limits Utility', () => {
  it('should return correct limits for free plan', () => {
    const limits = getPlanLimits('free');
    expect(limits.products).toBe(50);
  });

  it('should return correct limits for pro plan', () => {
    const limits = getPlanLimits('pro');
    expect(limits.products).toBe(150);
  });

  it('should return correct limits for max plan', () => {
    const limits = getPlanLimits('max');
    expect(limits.products).toBe(500);
  });

  it('should default to free plan limits if unknown', () => {
    const limits = getPlanLimits('unknown');
    expect(limits.products).toBe(50);
  });

  it('should correctly block when product limit is reached', () => {
    expect(isPlanLimitReached('free', 49)).toBe(false);
    expect(isPlanLimitReached('free', 50)).toBe(true);
    expect(isPlanLimitReached('free', 51)).toBe(true);

    expect(isPlanLimitReached('pro', 149)).toBe(false);
    expect(isPlanLimitReached('pro', 150)).toBe(true);

    expect(isPlanLimitReached('max', 499)).toBe(false);
    expect(isPlanLimitReached('max', 500)).toBe(true);
  });

  it('should never block non-products entities', () => {
    expect(isPlanLimitReached('free', 9999, 'categories')).toBe(false);
    expect(isPlanLimitReached('pro', 9999, 'racks')).toBe(false);
  });
});
