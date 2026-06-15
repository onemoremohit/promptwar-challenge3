/* EcoSphere Calculation Engine Unit Tests */

// Copy of calculation formulas to run in a standalone Node environment
function calculateCarbonTest(inputs) {
  // 1. Transportation
  let carFactor = 0;
  if (inputs.carFuel === "petrol") carFactor = 0.17;
  else if (inputs.carFuel === "diesel") carFactor = 0.19;
  else if (inputs.carFuel === "hybrid") carFactor = 0.10;
  else if (inputs.carFuel === "electric") carFactor = 0.045;
  
  const transportCar = (inputs.carDistance * carFactor) / 1000;
  const transportFlights = (inputs.flightsHours * 90) / 1000;
  const transportTransit = (inputs.transitDistance * 52 * 0.03) / 1000;
  
  const transport = transportCar + transportFlights + transportTransit;

  // 2. Home Energy
  const monthlyKwh = inputs.electricityBill / 0.15;
  const electricIntensity = inputs.greenElectricity ? 0.038 : 0.38;
  const energyElectric = (monthlyKwh * 12 * electricIntensity) / 1000;

  const monthlyGasKwh = inputs.gasBill / 0.06;
  const energyGas = (monthlyGasKwh * 12 * 0.18) / 1000;

  const energy = (energyElectric + energyGas) / inputs.householdMembers;

  // 3. Diet
  let food = 0.0;
  if (inputs.diet === "heavy-meat") food = 2.5;
  else if (inputs.diet === "average-meat") food = 1.7;
  else if (inputs.diet === "vegetarian") food = 0.9;
  else if (inputs.diet === "vegan") food = 0.45;

  // 4. Waste
  let shoppingBase = 0.75;
  if (inputs.shopping === "minimal") shoppingBase = 0.25;
  else if (inputs.shopping === "heavy") shoppingBase = 1.40;

  let recyclingDiscount = 0.15;
  if (inputs.recycling === "none") recyclingDiscount = 0;
  else if (inputs.recycling === "strict") recyclingDiscount = 0.35;
  
  let waste = shoppingBase * (1 - recyclingDiscount);

  if (inputs.foodWaste === "moderate") waste += 0.2;
  else if (inputs.foodWaste === "high") waste += 0.45;

  return {
    transport: parseFloat(transport.toFixed(3)),
    energy: parseFloat(energy.toFixed(3)),
    food: parseFloat(food.toFixed(3)),
    waste: parseFloat(waste.toFixed(3)),
    total: parseFloat((transport + energy + food + waste).toFixed(3))
  };
}

// Simple assertion helper
function assertEqual(actual, expected, message) {
  if (Math.abs(actual - expected) < 0.005) {
    console.log(`\x1b[32m[PASS]\x1b[0m ${message} (Value: ${actual})`);
  } else {
    console.error(`\x1b[31m[FAIL]\x1b[0m ${message} | Expected: ${expected}, Got: ${actual}`);
    process.exit(1);
  }
}

// Run Test Scenarios
console.log("=== Starting EcoSphere Calculation Validation Tests ===\n");

// Scenario 1: Climate Conscious Vegan (EV car, vegan diet, renewable grid, low bills, strict recycler)
const veganUser = {
  carDistance: 5000,
  carFuel: "electric",
  flightsHours: 0,
  transitDistance: 100,
  electricityBill: 50,
  gasBill: 0,
  greenElectricity: true,
  householdMembers: 1,
  diet: "vegan",
  shopping: "minimal",
  recycling: "strict",
  foodWaste: "low"
};

const res1 = calculateCarbonTest(veganUser);
console.log("Test Case 1 (Eco-Conscious Profile):");
assertEqual(res1.transport, 0.381, "Transport emissions calculation (EV + Transit)");
assertEqual(res1.energy, 0.152, "Home energy emissions (Renewable power, no gas)");
assertEqual(res1.food, 0.450, "Diet emissions (Vegan)");
assertEqual(res1.waste, 0.163, "Waste emissions (Minimalist + Strict recycle)");
assertEqual(res1.total, 1.146, "Total carbon footprint tally");

console.log("\n---------------------------------------------------\n");

// Scenario 2: Average Consumer (Medium Petrol Car, Balanced Diet, Average Utilities, shared household)
const averageUser = {
  carDistance: 10000,
  carFuel: "petrol",
  flightsHours: 10,
  transitDistance: 30,
  electricityBill: 120,
  gasBill: 50,
  greenElectricity: false,
  householdMembers: 2,
  diet: "average-meat",
  shopping: "moderate",
  recycling: "partial",
  foodWaste: "moderate"
};

const res2 = calculateCarbonTest(averageUser);
console.log("Test Case 2 (Average Consumer Profile):");
assertEqual(res2.transport, 2.647, "Transport emissions calculation (Petrol + flights)");
assertEqual(res2.energy, 2.724, "Home energy emissions (2 Members shared grid utility)");
assertEqual(res2.food, 1.700, "Diet emissions (Balanced)");
assertEqual(res2.waste, 0.838, "Waste emissions (Moderate + Partial recycling + food waste)");
assertEqual(res2.total, 7.909, "Total carbon footprint tally");

console.log("\n---------------------------------------------------\n");

// Scenario 3: High Carbon Consumer (Gasoline SUV, frequent flights, large house, meat-heavy, no recycling)
const highCarbonUser = {
  carDistance: 25000,
  carFuel: "diesel",
  flightsHours: 35,
  transitDistance: 0,
  electricityBill: 250,
  gasBill: 150,
  greenElectricity: false,
  householdMembers: 1,
  diet: "heavy-meat",
  shopping: "heavy",
  recycling: "none",
  foodWaste: "high"
};

const res3 = calculateCarbonTest(highCarbonUser);
console.log("Test Case 3 (High Carbon Profile):");
assertEqual(res3.transport, 7.900, "Transport emissions calculation (Diesel + extensive flights)");
assertEqual(res3.energy, 13.000, "Home energy emissions (Single occupant, heavy consumption)");
assertEqual(res3.food, 2.500, "Diet emissions (Heavy meat)");
assertEqual(res3.waste, 1.850, "Waste emissions (Heavy consumer + no recycle + high waste)");
assertEqual(res3.total, 25.250, "Total carbon footprint tally");

console.log("\n=== All calculation validation tests completed successfully! ===");
