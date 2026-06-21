// src/utils/carbonEngine.ts
/**
 * @file carbonEngine.ts
 * @description Core carbon footprint evaluation engine for the EcoSphere Carbon Intelligence Hub.
 * Processes user lifestyle inputs across three primary emission verticals —
 * Transportation, Domestic Energy, and Diet — to produce annual CO2e estimates,
 * tier classifications, and data-driven reduction recommendations.
 *
 * @module carbonEngine
 */

// ─── Type Definitions ─────────────────────────────────────────────────────────

/**
 * Emission factor constants indexed by category and transport/energy/diet type.
 * All transport factors are in kg CO2e per km.
 * All energy factors are in kg CO2e per kWh.
 * All diet factors are in kg CO2e per day.
 */
export interface CarbonFactors {
  /** Transport emission intensities by vehicle mode (kg CO2e/km) */
  readonly transportation: {
    readonly perKmCar: number;
    readonly perKmBus: number;
    readonly perKmTrain: number;
  };
  /** Electricity grid emission intensities by energy source (kg CO2e/kWh) */
  readonly energy: {
    readonly perKwhGrid: number;
    readonly perKwhSolar: number;
  };
  /** Dietary emission intensities by diet type (kg CO2e/day) */
  readonly diet: {
    readonly plantBasedDay: number;
    readonly meatHeavyDay: number;
  };
}

/**
 * Represents the structured lifestyle input context for a single user.
 * All fields are validated and sanitized before being passed to the evaluation engine.
 */
export interface UserContext {
  /** Daily round-trip commute distance in kilometres (0–500) */
  readonly commuteDistanceKm: number;
  /** Primary commute transport mode */
  readonly commuteMethod: 'car' | 'bus' | 'train';
  /** Average monthly household electricity usage in kWh (0–5000) */
  readonly monthlyKwh: number;
  /** Whether the user's electricity provider uses 100% renewable/solar energy */
  readonly solarUser: boolean;
  /** Representative daily diet type for carbon calculation */
  readonly dietType: 'plantBasedDay' | 'meatHeavyDay';
}

/**
 * Represents the full evaluated output of the carbon footprint calculation.
 */
export interface FootprintResult {
  /** Total estimated annual carbon footprint in metric tonnes of CO2e */
  readonly totalEmissionsTons: number;
  /** User's sustainability tier classification based on total emissions */
  readonly tier: 'Carbon Guardian' | 'Eco Champion' | 'Climate Learner';
  /** Array of personalised, data-driven reduction recommendations */
  readonly recommendations: string[];
}

// ─── Emission Factor Constants ────────────────────────────────────────────────

/**
 * Authoritative emission factor lookup table.
 * Sources: IPCC AR6, IEA Grid Emissions 2023, Oxford Food & Agriculture Study.
 */
export const CRITICAL_FACTORS: CarbonFactors = {
  transportation: {
    perKmCar: 0.17,    // Average petrol/gasoline passenger vehicle (kg CO2e/km)
    perKmBus: 0.06,    // Urban transit diesel bus per passenger (kg CO2e/km)
    perKmTrain: 0.03   // Electric metro/commuter rail per passenger (kg CO2e/km)
  },
  energy: {
    perKwhGrid: 0.45,  // Global average electricity grid emission intensity (kg CO2e/kWh)
    perKwhSolar: 0.05  // Lifecycle solar PV emission intensity (kg CO2e/kWh)
  },
  diet: {
    plantBasedDay: 1.5, // Daily plant-based / vegan diet footprint (kg CO2e/day)
    meatHeavyDay: 6.0   // Daily omnivore heavy-meat diet footprint (kg CO2e/day)
  }
} as const;

// ─── Tier Threshold Constants ─────────────────────────────────────────────────

/** Emissions threshold in metric tonnes CO2e below which user is a Carbon Guardian */
const GUARDIAN_THRESHOLD_TONS = 3;

/** Emissions threshold in metric tonnes CO2e above which user is a Climate Learner */
const LEARNER_THRESHOLD_TONS = 8;

/** Operating days per calendar year used for annual projection */
const ANNUAL_DAYS = 365;

/** Conversion factor from kilograms to metric tonnes */
const KG_TO_TONS = 1000;

// ─── Core Engine Function ─────────────────────────────────────────────────────

/**
 * Evaluates a user's annual carbon footprint and generates personalised insights.
 *
 * The calculation aggregates three primary emission verticals:
 * 1. **Transportation**: Daily commute distance × mode factor × 365 days
 * 2. **Domestic Energy**: Monthly kWh × 12 months × grid/solar factor
 * 3. **Diet**: Daily dietary emission factor × 365 days
 *
 * Results are then classified into tiers and enriched with targeted
 * recommendations based on the user's highest-impact behaviours.
 *
 * @param context - Validated and sanitized user lifestyle data
 * @returns A {@link FootprintResult} containing total emissions, tier, and recommendations
 *
 * @example
 * ```ts
 * const result = evaluateCarbonFootprint({
 *   commuteDistanceKm: 20,
 *   commuteMethod: 'car',
 *   monthlyKwh: 300,
 *   solarUser: false,
 *   dietType: 'meatHeavyDay'
 * });
 * console.log(result.totalEmissionsTons); // e.g. 5.42
 * console.log(result.tier);              // "Eco Champion"
 * ```
 */
export function evaluateCarbonFootprint(context: UserContext): FootprintResult {
  // ── 1. Transportation Emissions ──────────────────────────────────────────
  const transportFactorMap: Record<UserContext['commuteMethod'], number> = {
    car: CRITICAL_FACTORS.transportation.perKmCar,
    bus: CRITICAL_FACTORS.transportation.perKmBus,
    train: CRITICAL_FACTORS.transportation.perKmTrain
  };
  const transportFactor = transportFactorMap[context.commuteMethod];
  const transportEmissionsKg = context.commuteDistanceKm * transportFactor * ANNUAL_DAYS;

  // ── 2. Domestic Energy Emissions ─────────────────────────────────────────
  const energyFactor = context.solarUser
    ? CRITICAL_FACTORS.energy.perKwhSolar
    : CRITICAL_FACTORS.energy.perKwhGrid;
  const energyEmissionsKg = context.monthlyKwh * 12 * energyFactor;

  // ── 3. Dietary Emissions ─────────────────────────────────────────────────
  const dietEmissionsKg = CRITICAL_FACTORS.diet[context.dietType] * ANNUAL_DAYS;

  // ── 4. Aggregate and Convert ──────────────────────────────────────────────
  const totalEmissionsKg = transportEmissionsKg + energyEmissionsKg + dietEmissionsKg;
  const totalEmissionsTons = parseFloat((totalEmissionsKg / KG_TO_TONS).toFixed(2));

  // ── 5. Tier Classification and Recommendations ────────────────────────────
  let tier: FootprintResult['tier'] = 'Eco Champion';
  const recommendations: string[] = [];

  if (totalEmissionsTons > LEARNER_THRESHOLD_TONS) {
    tier = 'Climate Learner';
    if (context.commuteMethod === 'car') {
      recommendations.push('Consider transitioning to public transport or pooling to lower vehicle emissions.');
    }
    if (!context.solarUser) {
      recommendations.push('Swapping to partial solar energy can significantly mitigate your home energy footprint.');
    }
  } else if (totalEmissionsTons < GUARDIAN_THRESHOLD_TONS) {
    tier = 'Carbon Guardian';
    recommendations.push('Excellent work! Share your micro-habits with your community to inspire collective action.');
  }

  return { totalEmissionsTons, tier, recommendations };
}
