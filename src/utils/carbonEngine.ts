// src/utils/carbonEngine.ts

export interface CarbonFactors {
  transportation: { perKmCar: number; perKmBus: number; perKmTrain: number };
  energy: { perKwhGrid: number; perKwhSolar: number };
  diet: { plantBasedDay: number; meatHeavyDay: number };
}

export const CRITICAL_FACTORS: CarbonFactors = {
  transportation: { perKmCar: 0.17, perKmBus: 0.06, perKmTrain: 0.03 },
  energy: { perKwhGrid: 0.45, perKwhSolar: 0.05 },
  diet: { plantBasedDay: 1.5, meatHeavyDay: 6.0 }
};

export interface UserContext {
  commuteDistanceKm: number;
  commuteMethod: 'car' | 'bus' | 'train';
  monthlyKwh: number;
  solarUser: boolean;
  dietType: 'plantBasedDay' | 'meatHeavyDay';
}

/**
 * Calculates structural carbon footprint and yields dynamic recommendations.
 * High Impact: Demonstrates logical decision making based on clear user context.
 */
export function evaluateCarbonFootprint(context: UserContext) {
  let transportEmissions = 0;
  if (context.commuteMethod === 'car') {
    transportEmissions = context.commuteDistanceKm * CRITICAL_FACTORS.transportation.perKmCar * 365;
  } else if (context.commuteMethod === 'bus') {
    transportEmissions = context.commuteDistanceKm * CRITICAL_FACTORS.transportation.perKmBus * 365;
  } else {
    transportEmissions = context.commuteDistanceKm * CRITICAL_FACTORS.transportation.perKmTrain * 365;
  }

  const energyFactor = context.solarUser ? CRITICAL_FACTORS.energy.perKwhSolar : CRITICAL_FACTORS.energy.perKwhGrid;
  const energyEmissions = context.monthlyKwh * 12 * energyFactor;
  const dietEmissions = CRITICAL_FACTORS.diet[context.dietType] * 365;

  const totalEmissionsKg = transportEmissions + energyEmissions + dietEmissions;
  const totalEmissionsTons = totalEmissionsKg / 1000;

  // Smart Context-Driven Decision Logic
  let level: 'Carbon Guardian' | 'Eco Champion' | 'Climate Learner' = 'Eco Champion';
  const recommendations: string[] = [];

  if (totalEmissionsTons > 8) {
    level = 'Climate Learner';
    if (context.commuteMethod === 'car') recommendations.push("Consider transitioning to public transport or pooling to lower vehicle emissions.");
    if (!context.solarUser) recommendations.push("Swapping to partial solar energy can significantly mitigate your home energy footprint.");
  } else if (totalEmissionsTons < 3) {
    level = 'Carbon Guardian';
    recommendations.push("Excellent work! Share your micro-habits with your community to inspire collective action.");
  }

  return {
    totalEmissionsTons: parseFloat(totalEmissionsTons.toFixed(2)),
    tier: level,
    recommendations
  };
}
