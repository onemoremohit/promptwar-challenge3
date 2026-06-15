// src/__tests__/carbonEngine.test.ts
import { describe, test, expect } from 'vitest';
import { evaluateCarbonFootprint } from '../utils/carbonEngine';
import type { UserContext } from '../utils/carbonEngine';

describe('EcoSphere Carbon Platform Verification Suite', () => {
  test('High impact scenario should compute correct category and custom mitigation alerts', () => {
    const highImpactUser: UserContext = {
      commuteDistanceKm: 60,
      commuteMethod: 'car',
      monthlyKwh: 600,
      solarUser: false,
      dietType: 'meatHeavyDay'
    };

    const output = evaluateCarbonFootprint(highImpactUser);
    
    expect(output.totalEmissionsTons).toBeGreaterThan(5);
    expect(output.tier).toBe('Climate Learner');
    expect(output.recommendations).toContain("Consider transitioning to public transport or pooling to lower vehicle emissions.");
  });

  test('Eco-conscious profile should result in Carbon Guardian tier with zero recommendations', () => {
    const ecoUser: UserContext = {
      commuteDistanceKm: 5,
      commuteMethod: 'train',
      monthlyKwh: 100,
      solarUser: true,
      dietType: 'plantBasedDay'
    };

    const output = evaluateCarbonFootprint(ecoUser);
    expect(output.totalEmissionsTons).toBeLessThan(3);
    expect(output.tier).toBe('Carbon Guardian');
    expect(output.recommendations).toContain("Excellent work! Share your micro-habits with your community to inspire collective action.");
  });
});
