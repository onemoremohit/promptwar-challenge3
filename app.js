/* EcoSphere Core Application & State Engine */

// Global App State
const state = {
  userProfile: {
    name: "Climate Advocate",
    xp: 150,
    badge: "Carbon Novice",
    actionsLoggedCount: 0,
    dailySavings: 0.0,
    quizScore: 0,
    quizTotal: 0
  },
  calculator: {
    // Inputs (Defaults)
    carDistance: 8000,
    carFuel: "petrol",
    flightsHours: 5,
    transitDistance: 50,
    electricityBill: 100,
    gasBill: 40,
    greenElectricity: false,
    householdMembers: 2,
    diet: "average-meat",
    shopping: "moderate",
    recycling: "partial",
    foodWaste: "low"
  },
  footprint: {
    // Outputs in tonnes CO2e / year
    transport: 0.0,
    energy: 0.0,
    food: 0.0,
    waste: 0.0,
    total: 0.0
  },
  dailyTracker: {
    loggedActions: [],
    accumulatedSavings: 0.0, // in kg CO2e
    xpEarnedToday: 0
  }
};

let chartInstance = null;
let currentCalcStep = 0;

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupSliders();
  setupDietCards();
  setupWasteToggles();
  setupCalculatorWizard();
  setupTrackerChecklist();
  
  // Perform initial calculation based on defaults
  calculateFootprint();
  updateUI();
});

/* -----------------------------------------
   1. Tab Panel Switcher
   ----------------------------------------- */
function setupNavigation() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetTab = tab.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  // Update nav buttons active states
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(t => {
    const isTarget = (t.getAttribute("data-tab") === tabId);
    t.classList.toggle("active", isTarget);
    t.setAttribute("aria-selected", isTarget ? "true" : "false");
  });

  // Update panel display
  const panels = document.querySelectorAll(".tab-panel");
  panels.forEach(p => {
    p.classList.toggle("active", p.id === `panel-${tabId}`);
  });

  // Hide bot tab indicator if switching to assistant
  if (tabId === "assistant") {
    const indicator = document.querySelector(".assistant-tab-indicator");
    if (indicator) indicator.style.display = "none";
  }

  // Refresh data charts if tab is dashboard
  if (tabId === "dashboard") {
    setTimeout(renderFootprintChart, 150);
  }

  // Auto-scroll layout container to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* -----------------------------------------
   2. Slider Listeners
   ----------------------------------------- */
function setupSliders() {
  const sliders = [
    { id: "car-distance", displayId: "car-distance-val", unit: " km" },
    { id: "flights-hours", displayId: "flights-hours-val", unit: " hours" },
    { id: "transit-distance", displayId: "transit-distance-val", unit: " km" },
    { id: "electricity-bill", displayId: "electricity-bill-val", unit: "$", prefix: true },
    { id: "gas-bill", displayId: "gas-bill-val", unit: "$", prefix: true }
  ];

  sliders.forEach(slider => {
    const input = document.getElementById(slider.id);
    const display = document.getElementById(slider.displayId);
    if (input && display) {
      input.addEventListener("input", (e) => {
        const value = parseInt(e.target.value);
        
        // Format numbers with commas where appropriate
        const formattedVal = value.toLocaleString();
        
        if (slider.prefix) {
          display.innerText = `${slider.unit}${formattedVal}`;
        } else {
          display.innerText = `${formattedVal}${slider.unit}`;
        }
        
        // Sync to state
        const camelKey = slider.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        state.calculator[camelKey] = value;
      });
    }
  });

  // Green Energy tariff checkbox
  const greenChk = document.getElementById("green-electricity");
  if (greenChk) {
    greenChk.addEventListener("change", (e) => {
      state.calculator.greenElectricity = e.target.checked;
    });
  }

  // Household members select
  const membersSel = document.getElementById("household-members");
  if (membersSel) {
    membersSel.addEventListener("change", (e) => {
      state.calculator.householdMembers = parseInt(e.target.value);
    });
  }
}

/* -----------------------------------------
   3. Diet Card Selectors
   ----------------------------------------- */
function setupDietCards() {
  const cards = document.querySelectorAll(".diet-card");
  const hiddenInput = document.getElementById("diet-preference");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      // Toggle active states
      cards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      
      const val = card.getAttribute("data-diet");
      if (hiddenInput) hiddenInput.value = val;
      state.calculator.diet = val;
    });
  });
}

/* -----------------------------------------
   4. Waste Option Selectors
   ----------------------------------------- */
function setupWasteToggles() {
  // Shopping habits dropdown
  const shoppingSel = document.getElementById("shopping-frequency");
  if (shoppingSel) {
    shoppingSel.addEventListener("change", (e) => {
      state.calculator.shopping = e.target.value;
    });
  }

  // Recycling level dropdown
  const recyclingSel = document.getElementById("recycling-level");
  if (recyclingSel) {
    recyclingSel.addEventListener("change", (e) => {
      state.calculator.recycling = e.target.value;
    });
  }

  // Food waste level options group
  const options = document.querySelectorAll(".toggle-option");
  const hiddenInput = document.getElementById("food-waste-level");

  options.forEach(opt => {
    opt.addEventListener("click", () => {
      options.forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      
      const val = opt.getAttribute("data-val");
      if (hiddenInput) hiddenInput.value = val;
      state.calculator.foodWaste = val;
    });
  });
}

/* -----------------------------------------
   5. Calculator Wizard Navigation
   ----------------------------------------- */
function setupCalculatorWizard() {
  const nextBtn = document.getElementById("btn-calc-next");
  const backBtn = document.getElementById("btn-calc-back");
  const stepPanels = document.querySelectorAll(".calc-step");
  const dots = document.querySelectorAll(".step-dot");

  const updateWizardUI = () => {
    // Toggle active step panel
    stepPanels.forEach((panel, index) => {
      panel.classList.toggle("active", index === currentCalcStep);
    });

    // Update dots state
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentCalcStep);
      dot.classList.toggle("completed", index < currentCalcStep);
    });

    // Control buttons disabled/text configuration
    backBtn.disabled = (currentCalcStep === 0);
    
    if (currentCalcStep === stepPanels.length - 1) {
      // We are on summary step
      nextBtn.innerHTML = `<span>View Dashboard</span><i data-lucide="check-square"></i>`;
    } else if (currentCalcStep === stepPanels.length - 2) {
      // We are on final entry step
      nextBtn.innerHTML = `<span>Calculate Carbon</span><i data-lucide="calculator"></i>`;
    } else {
      nextBtn.innerHTML = `<span>Next</span><i data-lucide="chevron-right"></i>`;
    }
    if (window.lucide) window.lucide.createIcons();
  };

  nextBtn.addEventListener("click", () => {
    const nameInput = document.getElementById("user-name-input");
    if (currentCalcStep === 0 && nameInput && nameInput.value.trim() !== "") {
      state.userProfile.name = nameInput.value.trim();
    }

    if (currentCalcStep < stepPanels.length - 1) {
      currentCalcStep++;
      
      // Perform calculation once user finishes entries (before final summary tab)
      if (currentCalcStep === stepPanels.length - 1) {
        calculateFootprint();
        updateUI();
        
        // Trigger bot recommendation greet in background
        if (window.triggerAssistantGreeting) {
          window.triggerAssistantGreeting(state.userProfile.name);
        }
      }
      
      updateWizardUI();
    } else {
      // Dashboard redirection from completion screen
      switchTab("dashboard");
      
      // Reset wizard so they can recalculate later
      currentCalcStep = 0;
      updateWizardUI();
    }
  });

  backBtn.addEventListener("click", () => {
    if (currentCalcStep > 0) {
      currentCalcStep--;
      updateWizardUI();
    }
  });
}

/* -----------------------------------------
   6. Footprint Mathematical Calculations
   ----------------------------------------- */
function calculateFootprint() {
  const calc = state.calculator;

  // 1. Transportation Sector (Tonnes CO2e/year)
  // Car Fuel Factors: Petrol ~0.17 kg/km, Diesel ~0.19, Hybrid ~0.10, EV ~0.04 (avg grid)
  let carFactor = 0;
  if (calc.carFuel === "petrol") carFactor = 0.17;
  else if (calc.carFuel === "diesel") carFactor = 0.19;
  else if (calc.carFuel === "hybrid") carFactor = 0.10;
  else if (calc.carFuel === "electric") carFactor = 0.045; // Indirect battery grid intensity
  
  const transportCar = (calc.carDistance * carFactor) / 1000;
  
  // Flights Hours Factors: Average commercial jet ~90 kg CO2e per passenger-hour
  const transportFlights = (calc.flightsHours * 90) / 1000;
  
  // Public transit weekly km factor: ~0.03 kg CO2e per passenger-km * 52 weeks
  const transportTransit = (calc.transitDistance * 52 * 0.03) / 1000;
  
  state.footprint.transport = transportCar + transportFlights + transportTransit;

  // 2. Home Utilities Energy Sector
  // Electricity monthly USD to kWh translation: ~0.15$ per kWh on average grid.
  // Average grid intensity index: ~0.38 kg CO2e per kWh
  const monthlyKwh = calc.electricityBill / 0.15;
  let electricIntensity = 0.38;
  if (calc.greenElectricity) {
    electricIntensity = 0.038; // 90% reduction offset for renewables setup
  }
  const energyElectric = (monthlyKwh * 12 * electricIntensity) / 1000;

  // Gas monthly USD to thermal kWh translation: ~0.06$ per kWh
  // Natural Gas intensity index: ~0.18 kg CO2e per kWh
  const monthlyGasKwh = calc.gasBill / 0.06;
  const energyGas = (monthlyGasKwh * 12 * 0.18) / 1000;

  // Total energy emissions divided by occupants
  state.footprint.energy = (energyElectric + energyGas) / calc.householdMembers;

  // 3. Diet Sector (Tonnes CO2e/year)
  // Standard nutrition calculations based on EPA parameters
  if (calc.diet === "heavy-meat") state.footprint.food = 2.5;
  else if (calc.diet === "average-meat") state.footprint.food = 1.7;
  else if (calc.diet === "vegetarian") state.footprint.food = 0.9;
  else if (calc.diet === "vegan") state.footprint.food = 0.45;

  // 4. Waste & Products Sector
  // Consumer baseline: minimal = 0.25, moderate = 0.75, heavy = 1.4 tonnes/year
  let shoppingBase = 0.75;
  if (calc.shopping === "minimal") shoppingBase = 0.25;
  else if (calc.shopping === "heavy") shoppingBase = 1.40;

  // Recyclables mitigation factor
  let recyclingDiscount = 0.15; // standard
  if (calc.recycling === "none") recyclingDiscount = 0;
  else if (calc.recycling === "strict") recyclingDiscount = 0.35; // reduces waste emissions by 35%
  
  let wasteSubtotal = shoppingBase * (1 - recyclingDiscount);

  // Food Waste Level offset addition
  if (calc.foodWaste === "moderate") wasteSubtotal += 0.2;
  else if (calc.foodWaste === "high") wasteSubtotal += 0.45;

  state.footprint.waste = wasteSubtotal;

  // Accumulate Totals
  state.footprint.total = state.footprint.transport + state.footprint.energy + state.footprint.food + state.footprint.waste;
}

/* -----------------------------------------
   7. Dashboard Graphics (Chart.js & Fallback)
   ----------------------------------------- */
function renderFootprintChart() {
  const f = state.footprint;
  const chartData = [f.transport, f.energy, f.food, f.waste];
  const labels = ['Transportation', 'Home Energy', 'Diet & Food', 'Waste & Shopping'];
  const colors = ['#60A5FA', '#FBBF24', '#34D399', '#F87171'];

  // Check if Chart.js is loaded
  if (typeof Chart !== "undefined") {
    // Hide fallback UI
    document.getElementById("chart-fallback").classList.add("hidden");
    const canvas = document.getElementById("footprintChart");
    canvas.classList.remove("hidden");

    if (chartInstance) {
      chartInstance.data.datasets[0].data = chartData;
      chartInstance.update();
    } else {
      const ctx = canvas.getContext('2d');
      chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: chartData,
            backgroundColor: colors,
            borderColor: '#0B0F19',
            borderWidth: 2,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#9CA3AF',
                font: { family: 'Outfit', size: 12 },
                padding: 15
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return ` ${context.label}: ${context.raw.toFixed(2)} t CO2e/yr`;
                }
              }
            }
          },
          cutout: '70%'
        }
      });
    }
  } else {
    // If Chart.js fails (offline/CDN block), render standard HTML Progress Bars
    const canvas = document.getElementById("footprintChart");
    if (canvas) canvas.classList.add("hidden");
    
    const fallbackBox = document.getElementById("chart-fallback");
    const barsContainer = document.getElementById("fallback-bars");
    
    if (fallbackBox && barsContainer) {
      fallbackBox.classList.remove("hidden");
      barsContainer.innerHTML = "";
      
      const total = f.total || 1; // avoid divide by zero
      
      labels.forEach((label, index) => {
        const val = chartData[index];
        const pct = (val / total) * 100;
        
        const item = document.createElement("div");
        item.className = "fallback-bar-item";
        item.innerHTML = `
          <div class="fallback-bar-info">
            <span>${label}</span>
            <strong>${val.toFixed(2)} t (${pct.toFixed(0)}%)</strong>
          </div>
          <div class="fallback-bar-track">
            <div class="fallback-bar-fill" style="width: ${pct}%; background-color: ${colors[index]};"></div>
          </div>
        `;
        barsContainer.appendChild(item);
      });
    }
  }
}

/* -----------------------------------------
   8. Checklist Habit Tracker & Savings Gauge
   ----------------------------------------- */
function setupTrackerChecklist() {
  const checkboxes = document.querySelectorAll(".habit-checkbox");
  
  checkboxes.forEach(chk => {
    chk.addEventListener("change", () => {
      calculateDailySavings();
    });
  });
}

function calculateDailySavings() {
  const checkboxes = document.querySelectorAll(".habit-checkbox");
  let totalSavings = 0; // in kg
  let totalXp = 0;
  let loggedCount = 0;

  checkboxes.forEach(chk => {
    if (chk.checked) {
      totalSavings += parseFloat(chk.getAttribute("data-savings"));
      totalXp += parseInt(chk.getAttribute("data-points"));
      loggedCount++;
    }
  });

  state.dailyTracker.accumulatedSavings = totalSavings;
  state.dailyTracker.xpEarnedToday = totalXp;
  state.userProfile.actionsLoggedCount = loggedCount;

  // Update Tracker Tab Graphics
  document.getElementById("tracker-savings-value").innerText = totalSavings.toFixed(1);
  document.getElementById("tracker-xp-earned").innerText = `+${totalXp} XP`;

  // Draw circular tracker gauge (conic-gradient style)
  // Max target set to 25 kg
  const maxSavingsTarget = 25;
  const progressPct = Math.min((totalSavings / maxSavingsTarget) * 100, 100);
  
  const ring = document.querySelector(".progress-ring-block");
  if (ring) {
    ring.style.background = `radial-gradient(var(--bg-app) 60%, transparent 61%), 
                             conic-gradient(var(--emerald) ${progressPct}%, rgba(255, 255, 255, 0.05) ${progressPct}%)`;
  }

  // Update Progress values
  document.getElementById("tracker-weekly-progress").innerText = `${progressPct.toFixed(0)}%`;
  document.getElementById("tracker-progress-bar").style.width = `${progressPct}%`;

  // Award XP to user profile dynamically as they check items
  // Since we want dynamic persistence, we add the changes to profile XP
  // To avoid adding points multiple times, we calculate difference
  updateScoreboard();
}

function resetHabits() {
  const checkboxes = document.querySelectorAll(".habit-checkbox");
  checkboxes.forEach(chk => chk.checked = false);
  calculateDailySavings();
}

/* -----------------------------------------
   9. Profile Scoreboard & Badges Progression
   ----------------------------------------- */
function addEcoPoints(amount) {
  state.userProfile.xp += amount;
  updateScoreboard();
}

function updateQuizMetric(correct, total) {
  state.userProfile.quizScore = correct;
  state.userProfile.quizTotal = total;
  
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const display = document.getElementById("dash-quiz-pct");
  if (display) display.innerText = `${pct}%`;
  
  updateScoreboard();
}

function updateScoreboard() {
  const p = state.userProfile;
  const tracker = state.dailyTracker;

  // Accumulate today's logged XP with baseline
  const activeXp = p.xp + tracker.xpEarnedToday;

  // Calculate Rank Badge based on XP threshold milestones
  // 0 - 200: Carbon Novice
  // 201 - 500: Climate Guardian
  // 501 - 900: Green Hero
  // 901+: Eco Champion
  let rank = "Carbon Novice";
  let maxNextLevel = 500;
  let prevLevelThreshold = 0;
  
  if (activeXp > 900) {
    rank = "Eco Champion";
    maxNextLevel = 2000;
    prevLevelThreshold = 900;
  } else if (activeXp > 500) {
    rank = "Green Hero";
    maxNextLevel = 900;
    prevLevelThreshold = 500;
  } else if (activeXp > 200) {
    rank = "Climate Guardian";
    maxNextLevel = 500;
    prevLevelThreshold = 200;
  }

  p.badge = rank;

  // DOM bindings
  document.getElementById("header-xp").innerText = activeXp;
  document.getElementById("header-badge").innerText = rank;

  // Dashboard Tab widgets update
  const dashBadge = document.getElementById("dash-badge-display");
  if (dashBadge) dashBadge.innerText = `${rank}`;
  
  const dashXp = document.getElementById("dash-current-xp");
  if (dashXp) dashXp.innerText = activeXp;

  const xpProgress = document.getElementById("dash-xp-progress");
  if (xpProgress) {
    const range = maxNextLevel - prevLevelThreshold;
    const progressInCurrentLevel = activeXp - prevLevelThreshold;
    const barPct = Math.min((progressInCurrentLevel / range) * 100, 100);
    xpProgress.style.width = `${barPct}%`;
  }

  // Activity numbers
  const dashActions = document.getElementById("dash-actions-logged");
  if (dashActions) dashActions.innerText = p.actionsLoggedCount;

  const dashSavings = document.getElementById("dash-savings-val");
  if (dashSavings) dashSavings.innerText = `${tracker.accumulatedSavings.toFixed(1)} kg`;
}

/* -----------------------------------------
   10. Core Dashboard Data Binding
   ----------------------------------------- */
function updateUI() {
  const f = state.footprint;
  const name = state.userProfile.name;

  // Name fields
  const userDisp = document.getElementById("user-display-name");
  if (userDisp) userDisp.innerText = name;

  // Summary results
  document.getElementById("dash-footprint-value").innerText = f.total.toFixed(2);
  document.getElementById("calc-summary-total").innerText = f.total.toFixed(2);

  // Sector emissions
  document.getElementById("dash-transport-val").innerText = f.transport.toFixed(2);
  document.getElementById("dash-energy-val").innerText = f.energy.toFixed(2);
  document.getElementById("dash-food-val").innerText = f.food.toFixed(2);
  document.getElementById("dash-waste-val").innerText = f.waste.toFixed(2);

  // Sector percentages
  const total = f.total || 1; // avoid divide by zero
  const transportPct = (f.transport / total) * 100;
  const energyPct = (f.energy / total) * 100;
  const foodPct = (f.food / total) * 100;
  const wastePct = (f.waste / total) * 100;

  // Append percentages to global scope to share with assistant.js
  state.footprint.transportPct = transportPct;
  state.footprint.energyPct = energyPct;
  state.footprint.foodPct = foodPct;
  state.footprint.wastePct = wastePct;

  document.getElementById("dash-transport-pct").innerText = `${transportPct.toFixed(0)}%`;
  document.getElementById("dash-energy-pct").innerText = `${energyPct.toFixed(0)}%`;
  document.getElementById("dash-food-pct").innerText = `${foodPct.toFixed(0)}%`;
  document.getElementById("dash-waste-pct").innerText = `${wastePct.toFixed(0)}%`;

  // Comparisons badge in wizard completion
  const comparisonBadge = document.getElementById("calc-summary-compare");
  if (comparisonBadge) {
    if (f.total <= 2.0) {
      comparisonBadge.innerText = "Climate Neutral Ready (Excellent)";
      comparisonBadge.style.background = "var(--emerald-dim)";
      comparisonBadge.style.color = "var(--emerald)";
    } else if (f.total <= 4.5) {
      comparisonBadge.innerText = "Better than Global Average (Good)";
      comparisonBadge.style.background = "var(--emerald-dim)";
      comparisonBadge.style.color = "var(--emerald)";
    } else if (f.total <= 8.5) {
      comparisonBadge.innerText = "Average Carbon Footprint";
      comparisonBadge.style.background = "rgba(255, 255, 255, 0.05)";
      comparisonBadge.style.color = "var(--text-secondary)";
    } else {
      comparisonBadge.innerText = "High Carbon Footprint (Need Action)";
      comparisonBadge.style.background = "var(--coral-dim)";
      comparisonBadge.style.color = "var(--coral)";
    }
  }

  // Update bot prompt recommendations sidebar teaser
  const botTeaser = document.getElementById("dash-assistant-suggestion");
  if (botTeaser) {
    const sectors = [
      { name: 'Transport', val: f.transport },
      { name: 'Home Utilities', val: f.energy },
      { name: 'Diet', val: f.food },
      { name: 'Waste', val: f.waste }
    ];
    sectors.sort((a, b) => b.val - a.val);
    botTeaser.innerText = `Highest impact sector: ${sectors[0].name}. Click here for reduction strategies.`;
  }

  // Redraw dashboard charts
  renderFootprintChart();
}

// Share state wrapper to other scripts
window.getCalculatorState = function() {
  return {
    transport: state.footprint.transport,
    transportPct: state.footprint.transportPct,
    energy: state.footprint.energy,
    energyPct: state.footprint.energyPct,
    food: state.footprint.food,
    foodPct: state.footprint.foodPct,
    waste: state.footprint.waste,
    wastePct: state.footprint.wastePct,
    total: state.footprint.total
  };
};

window.addEcoPoints = addEcoPoints;
window.updateQuizMetric = updateQuizMetric;
window.switchTab = switchTab;
