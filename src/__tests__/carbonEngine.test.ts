// src/__tests__/carbonEngine.test.ts
/**
 * @file carbonEngine.test.ts
 * @description Comprehensive verification suite for the EcoSphere Carbon Footprint Engine.
 * Covers all commute methods, diet types, energy configurations, tier boundary conditions,
 * edge cases, and return value shape validation.
 */
import { describe, test, expect } from 'vitest';
import {
  evaluateCarbonFootprint,
  CRITICAL_FACTORS,
  type UserContext,
  type CarbonFactors
} from '../utils/carbonEngine';

// ─── Fixture Factory ──────────────────────────────────────────────────────────

/**
 * Creates a baseline UserContext object with optional overrides for testing.
 */
function makeContext(overrides: Partial<UserContext> = {}): UserContext {
  return {
    commuteDistanceKm: 20,
    commuteMethod: 'car',
    monthlyKwh: 300,
    solarUser: false,
    dietType: 'meatHeavyDay',
    ...overrides
  };
}

// ─── Suite 1: Constants Integrity ─────────────────────────────────────────────

describe('CRITICAL_FACTORS constants integrity', () => {
  test('should export a valid CarbonFactors object', () => {
    const factors: CarbonFactors = CRITICAL_FACTORS;
    expect(factors).toBeDefined();
    expect(typeof factors.transportation.perKmCar).toBe('number');
    expect(typeof factors.transportation.perKmBus).toBe('number');
    expect(typeof factors.transportation.perKmTrain).toBe('number');
    expect(typeof factors.energy.perKwhGrid).toBe('number');
    expect(typeof factors.energy.perKwhSolar).toBe('number');
    expect(typeof factors.diet.meatHeavyDay).toBe('number');
    expect(typeof factors.diet.plantBasedDay).toBe('number');
  });

  test('car emission factor should be greater than bus, which is greater than train', () => {
    expect(CRITICAL_FACTORS.transportation.perKmCar).toBeGreaterThan(CRITICAL_FACTORS.transportation.perKmBus);
    expect(CRITICAL_FACTORS.transportation.perKmBus).toBeGreaterThan(CRITICAL_FACTORS.transportation.perKmTrain);
  });

  test('grid emission factor should be greater than solar emission factor', () => {
    expect(CRITICAL_FACTORS.energy.perKwhGrid).toBeGreaterThan(CRITICAL_FACTORS.energy.perKwhSolar);
  });

  test('meat heavy diet should have higher emission factor than plant based diet', () => {
    expect(CRITICAL_FACTORS.diet.meatHeavyDay).toBeGreaterThan(CRITICAL_FACTORS.diet.plantBasedDay);
  });
});

// ─── Suite 2: Return Value Shape ──────────────────────────────────────────────

describe('evaluateCarbonFootprint return value shape', () => {
  test('should return an object with totalEmissionsTons, tier, and recommendations', () => {
    const result = evaluateCarbonFootprint(makeContext());
    expect(result).toHaveProperty('totalEmissionsTons');
    expect(result).toHaveProperty('tier');
    expect(result).toHaveProperty('recommendations');
  });

  test('totalEmissionsTons should be a finite number rounded to 2 decimal places', () => {
    const result = evaluateCarbonFootprint(makeContext());
    expect(typeof result.totalEmissionsTons).toBe('number');
    expect(Number.isFinite(result.totalEmissionsTons)).toBe(true);
    // Rounded to 2 decimals: re-parsing should be equal
    expect(result.totalEmissionsTons).toBe(parseFloat(result.totalEmissionsTons.toFixed(2)));
  });

  test('recommendations should always be an Array', () => {
    const result = evaluateCarbonFootprint(makeContext());
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  test('tier should be one of the three valid string literals', () => {
    const validTiers = ['Carbon Guardian', 'Eco Champion', 'Climate Learner'];
    const result = evaluateCarbonFootprint(makeContext());
    expect(validTiers).toContain(result.tier);
  });
});

// ─── Suite 3: Transportation Method Variations ────────────────────────────────

describe('Transportation method emission calculations', () => {
  const baseCtx = makeContext({ commuteDistanceKm: 30, monthlyKwh: 0, dietType: 'plantBasedDay', solarUser: true });

  test('car commute should produce higher emissions than bus commute for same distance', () => {
    const carResult = evaluateCarbonFootprint({ ...baseCtx, commuteMethod: 'car' });
    const busResult = evaluateCarbonFootprint({ ...baseCtx, commuteMethod: 'bus' });
    expect(carResult.totalEmissionsTons).toBeGreaterThan(busResult.totalEmissionsTons);
  });

  test('bus commute should produce higher emissions than train commute for same distance', () => {
    const busResult = evaluateCarbonFootprint({ ...baseCtx, commuteMethod: 'bus' });
    const trainResult = evaluateCarbonFootprint({ ...baseCtx, commuteMethod: 'train' });
    expect(busResult.totalEmissionsTons).toBeGreaterThan(trainResult.totalEmissionsTons);
  });

  test('car commute manual calculation should match engine output', () => {
    const dist = 25;
    const ctx = makeContext({ commuteDistanceKm: dist, commuteMethod: 'car', monthlyKwh: 0, solarUser: true, dietType: 'plantBasedDay' });
    const expected = parseFloat(((dist * CRITICAL_FACTORS.transportation.perKmCar * 365) / 1000 + (CRITICAL_FACTORS.diet.plantBasedDay * 365) / 1000).toFixed(2));
    const result = evaluateCarbonFootprint(ctx);
    expect(result.totalEmissionsTons).toBeCloseTo(expected, 2);
  });

  test('train commute with zero kwh and plant diet should yield minimal emissions', () => {
    const ctx = makeContext({ commuteDistanceKm: 5, commuteMethod: 'train', monthlyKwh: 0, solarUser: true, dietType: 'plantBasedDay' });
    const result = evaluateCarbonFootprint(ctx);
    expect(result.totalEmissionsTons).toBeLessThan(1.0);
  });
});

// ─── Suite 4: Energy Emission Calculations ────────────────────────────────────

describe('Energy and solar emission calculations', () => {
  test('grid energy should produce higher emissions than solar energy for same kWh', () => {
    const ctx = makeContext({ commuteDistanceKm: 0, commuteMethod: 'train' });
    const gridResult = evaluateCarbonFootprint({ ...ctx, solarUser: false });
    const solarResult = evaluateCarbonFootprint({ ...ctx, solarUser: true });
    expect(gridResult.totalEmissionsTons).toBeGreaterThan(solarResult.totalEmissionsTons);
  });

  test('zero monthlyKwh should contribute zero energy emissions regardless of solar flag', () => {
    const gridCtx = makeContext({ monthlyKwh: 0, solarUser: false, commuteDistanceKm: 0, commuteMethod: 'train' });
    const solarCtx = makeContext({ monthlyKwh: 0, solarUser: true, commuteDistanceKm: 0, commuteMethod: 'train' });
    expect(evaluateCarbonFootprint(gridCtx).totalEmissionsTons).toBe(evaluateCarbonFootprint(solarCtx).totalEmissionsTons);
  });

  test('high kWh grid user should have higher emissions than same user with solar', () => {
    const base = makeContext({ monthlyKwh: 1500, commuteDistanceKm: 0, commuteMethod: 'train', dietType: 'plantBasedDay' });
    const gridResult = evaluateCarbonFootprint({ ...base, solarUser: false });
    const solarResult = evaluateCarbonFootprint({ ...base, solarUser: true });
    expect(gridResult.totalEmissionsTons).toBeGreaterThan(solarResult.totalEmissionsTons);
    // The difference should be significant (grid vs solar factor ratio)
    const ratio = gridResult.totalEmissionsTons / solarResult.totalEmissionsTons;
    expect(ratio).toBeGreaterThan(2);
  });
});

// ─── Suite 5: Diet Emission Calculations ──────────────────────────────────────

describe('Diet emission calculations', () => {
  test('meatHeavyDay diet should produce more emissions than plantBasedDay', () => {
    const ctx = makeContext({ commuteDistanceKm: 0, commuteMethod: 'train', monthlyKwh: 0, solarUser: true });
    const meatResult = evaluateCarbonFootprint({ ...ctx, dietType: 'meatHeavyDay' });
    const plantResult = evaluateCarbonFootprint({ ...ctx, dietType: 'plantBasedDay' });
    expect(meatResult.totalEmissionsTons).toBeGreaterThan(plantResult.totalEmissionsTons);
  });

  test('diet emissions manual calculation for plant-based should match engine', () => {
    const ctx = makeContext({ commuteDistanceKm: 0, commuteMethod: 'train', monthlyKwh: 0, solarUser: true, dietType: 'plantBasedDay' });
    const expected = parseFloat(((CRITICAL_FACTORS.diet.plantBasedDay * 365) / 1000).toFixed(2));
    const result = evaluateCarbonFootprint(ctx);
    expect(result.totalEmissionsTons).toBeCloseTo(expected, 2);
  });

  test('diet emissions manual calculation for meat-heavy should match engine', () => {
    const ctx = makeContext({ commuteDistanceKm: 0, commuteMethod: 'train', monthlyKwh: 0, solarUser: true, dietType: 'meatHeavyDay' });
    const expected = parseFloat(((CRITICAL_FACTORS.diet.meatHeavyDay * 365) / 1000).toFixed(2));
    const result = evaluateCarbonFootprint(ctx);
    expect(result.totalEmissionsTons).toBeCloseTo(expected, 2);
  });
});

// ─── Suite 6: Tier Boundary Conditions ───────────────────────────────────────

describe('Tier classification boundary conditions', () => {
  test('Profile scoring over 8 tonnes should be classified as Climate Learner', () => {
    const highImpactCtx: UserContext = {
      commuteDistanceKm: 60,
      commuteMethod: 'car',
      monthlyKwh: 600,
      solarUser: false,
      dietType: 'meatHeavyDay'
    };
    const result = evaluateCarbonFootprint(highImpactCtx);
    expect(result.totalEmissionsTons).toBeGreaterThan(8);
    expect(result.tier).toBe('Climate Learner');
  });

  test('Profile scoring under 3 tonnes should be classified as Carbon Guardian', () => {
    const ecoCtx: UserContext = {
      commuteDistanceKm: 3,
      commuteMethod: 'train',
      monthlyKwh: 80,
      solarUser: true,
      dietType: 'plantBasedDay'
    };
    const result = evaluateCarbonFootprint(ecoCtx);
    expect(result.totalEmissionsTons).toBeLessThan(3);
    expect(result.tier).toBe('Carbon Guardian');
  });

  test('Profile in the 3-8 tonne range should be classified as Eco Champion', () => {
    // Uses values that produce ~4.5t CO2e: bus 30km/day + grid 400kWh + meat diet
    const midCtx: UserContext = {
      commuteDistanceKm: 30,
      commuteMethod: 'bus',
      monthlyKwh: 400,
      solarUser: false,
      dietType: 'meatHeavyDay'
    };
    const result = evaluateCarbonFootprint(midCtx);
    expect(result.totalEmissionsTons).toBeGreaterThan(3);
    expect(result.totalEmissionsTons).toBeLessThan(8);
    expect(result.tier).toBe('Eco Champion');
  });
});

// ─── Suite 7: Recommendations Logic ──────────────────────────────────────────

describe('Recommendation generation logic', () => {
  test('High impact car user should receive car transition recommendation', () => {
    const ctx: UserContext = {
      commuteDistanceKm: 60,
      commuteMethod: 'car',
      monthlyKwh: 600,
      solarUser: false,
      dietType: 'meatHeavyDay'
    };
    const result = evaluateCarbonFootprint(ctx);
    expect(result.recommendations).toContain('Consider transitioning to public transport or pooling to lower vehicle emissions.');
  });

  test('High impact non-solar user should receive solar energy recommendation', () => {
    const ctx: UserContext = {
      commuteDistanceKm: 60,
      commuteMethod: 'car',
      monthlyKwh: 600,
      solarUser: false,
      dietType: 'meatHeavyDay'
    };
    const result = evaluateCarbonFootprint(ctx);
    expect(result.recommendations).toContain('Swapping to partial solar energy can significantly mitigate your home energy footprint.');
  });

  test('High impact solar user should NOT receive solar energy recommendation', () => {
    const ctx: UserContext = {
      commuteDistanceKm: 100,
      commuteMethod: 'car',
      monthlyKwh: 800,
      solarUser: true,
      dietType: 'meatHeavyDay'
    };
    const result = evaluateCarbonFootprint(ctx);
    expect(result.recommendations).not.toContain('Swapping to partial solar energy can significantly mitigate your home energy footprint.');
  });

  test('Carbon Guardian should receive community sharing recommendation', () => {
    const ecoCtx: UserContext = {
      commuteDistanceKm: 3,
      commuteMethod: 'train',
      monthlyKwh: 80,
      solarUser: true,
      dietType: 'plantBasedDay'
    };
    const result = evaluateCarbonFootprint(ecoCtx);
    expect(result.recommendations).toContain('Excellent work! Share your micro-habits with your community to inspire collective action.');
  });

  test('Eco Champion tier should produce empty recommendations array', () => {
    // Values that produce ~4.5t = bus 30km/day + grid 400kWh + meat diet
    const midCtx: UserContext = {
      commuteDistanceKm: 30,
      commuteMethod: 'bus',
      monthlyKwh: 400,
      solarUser: false,
      dietType: 'meatHeavyDay'
    };
    const result = evaluateCarbonFootprint(midCtx);
    expect(result.tier).toBe('Eco Champion');
    expect(result.recommendations).toHaveLength(0);
  });
});

// ─── Suite 8: Edge Cases ──────────────────────────────────────────────────────

describe('Edge case and boundary input handling', () => {
  test('Zero commute distance should produce no transportation emissions', () => {
    const ctx = makeContext({ commuteDistanceKm: 0, commuteMethod: 'car', monthlyKwh: 0, solarUser: true, dietType: 'plantBasedDay' });
    const result = evaluateCarbonFootprint(ctx);
    // Only diet emissions remain (plant-based, 365 days)
    const expectedDietOnly = parseFloat(((CRITICAL_FACTORS.diet.plantBasedDay * 365) / 1000).toFixed(2));
    expect(result.totalEmissionsTons).toBeCloseTo(expectedDietOnly, 2);
  });

  test('All zero values (zero commute, zero kwh, solar, plant) should yield minimal positive value', () => {
    const ctx = makeContext({ commuteDistanceKm: 0, monthlyKwh: 0, solarUser: true, dietType: 'plantBasedDay', commuteMethod: 'train' });
    const result = evaluateCarbonFootprint(ctx);
    expect(result.totalEmissionsTons).toBeGreaterThan(0); // diet always contributes
    expect(result.totalEmissionsTons).toBeLessThan(1);
  });

  test('Maximum realistic commute car user should still yield finite result', () => {
    const ctx: UserContext = {
      commuteDistanceKm: 500,
      commuteMethod: 'car',
      monthlyKwh: 5000,
      solarUser: false,
      dietType: 'meatHeavyDay'
    };
    const result = evaluateCarbonFootprint(ctx);
    expect(Number.isFinite(result.totalEmissionsTons)).toBe(true);
    expect(result.totalEmissionsTons).toBeGreaterThan(30);
  });

  test('All solar + plant + train scenario should always be Carbon Guardian tier', () => {
    const perfectCtx: UserContext = {
      commuteDistanceKm: 2,
      commuteMethod: 'train',
      monthlyKwh: 50,
      solarUser: true,
      dietType: 'plantBasedDay'
    };
    const result = evaluateCarbonFootprint(perfectCtx);
    expect(result.tier).toBe('Carbon Guardian');
  });

  test('Two calls with identical inputs should yield identical outputs (determinism)', () => {
    const ctx = makeContext({ commuteDistanceKm: 35, commuteMethod: 'bus', monthlyKwh: 450, solarUser: false, dietType: 'meatHeavyDay' });
    const result1 = evaluateCarbonFootprint(ctx);
    const result2 = evaluateCarbonFootprint(ctx);
    expect(result1.totalEmissionsTons).toBe(result2.totalEmissionsTons);
    expect(result1.tier).toBe(result2.tier);
    expect(result1.recommendations).toEqual(result2.recommendations);
  });

  test('Bus commute with high kWh no solar diet meat should correctly classify', () => {
    const ctx: UserContext = {
      commuteDistanceKm: 80,
      commuteMethod: 'bus',
      monthlyKwh: 900,
      solarUser: false,
      dietType: 'meatHeavyDay'
    };
    const result = evaluateCarbonFootprint(ctx);
    expect(result.totalEmissionsTons).toBeGreaterThan(0);
    expect(['Climate Learner', 'Eco Champion']).toContain(result.tier);
  });
});

// ─── Suite 9: Additive Emission Verification ──────────────────────────────────

describe('Additive emission component verification', () => {
  test('Total emissions should equal the sum of transport + energy + food components', () => {
    const ctx: UserContext = {
      commuteDistanceKm: 20,
      commuteMethod: 'car',
      monthlyKwh: 300,
      solarUser: false,
      dietType: 'meatHeavyDay'
    };

    const transportKg = ctx.commuteDistanceKm * CRITICAL_FACTORS.transportation.perKmCar * 365;
    const energyKg = ctx.monthlyKwh * 12 * CRITICAL_FACTORS.energy.perKwhGrid;
    const dietKg = CRITICAL_FACTORS.diet.meatHeavyDay * 365;
    const expectedTotal = parseFloat(((transportKg + energyKg + dietKg) / 1000).toFixed(2));

    const result = evaluateCarbonFootprint(ctx);
    expect(result.totalEmissionsTons).toBeCloseTo(expectedTotal, 2);
  });

  test('Switching commute from car to train should reduce total emissions', () => {
    const base = makeContext({ commuteDistanceKm: 30 });
    const carResult = evaluateCarbonFootprint({ ...base, commuteMethod: 'car' });
    const trainResult = evaluateCarbonFootprint({ ...base, commuteMethod: 'train' });
    expect(carResult.totalEmissionsTons).toBeGreaterThan(trainResult.totalEmissionsTons);
  });

  test('Adding solar should always reduce total emissions for non-zero kWh', () => {
    const base = makeContext({ monthlyKwh: 400 });
    const gridResult = evaluateCarbonFootprint({ ...base, solarUser: false });
    const solarResult = evaluateCarbonFootprint({ ...base, solarUser: true });
    expect(gridResult.totalEmissionsTons).toBeGreaterThan(solarResult.totalEmissionsTons);
  });

  test('Switching diet from meat to plant should always reduce total emissions', () => {
    const base = makeContext();
    const meatResult = evaluateCarbonFootprint({ ...base, dietType: 'meatHeavyDay' });
    const plantResult = evaluateCarbonFootprint({ ...base, dietType: 'plantBasedDay' });
    expect(meatResult.totalEmissionsTons).toBeGreaterThan(plantResult.totalEmissionsTons);
  });
});
