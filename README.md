# EcoSphere - Carbon Footprint Awareness Platform

🚀 **Live Deployed Application Link**: [https://ecosphere-carbon-hub-54.web.app](https://ecosphere-carbon-hub-54.web.app)

EcoSphere is a premium, interactive Single Page Application (SPA) designed to help individuals understand, track, and reduce their carbon footprint through simple actions, data visualizations, and personalized insights.

Built with pure Vanilla HTML5, CSS3, and JavaScript, EcoSphere ensures a lightning-fast load time, high accessibility, absolute security, and a physical size well under the 10 MB limit, satisfying all requirements of the Google Hack2Skill Promptwar challenge.

## 🌟 Core Features

1. **Precision Carbon Calculator**: A multi-step questionnaire that guides the user through Transportation, Energy, Food, and Waste. Calculations are done in real time, updating the dashboard instantly.
2. **Dynamic Ecological Advisor (Eco-Bot)**: A simulated interactive chatbot. Eco-Bot parses the user's calculation inputs, identifies their highest carbon sector, and offers context-sensitive conversations, prompts, and actions.
3. **Daily Action Tracker (Eco-Habits)**: An interactive habit log where users can log daily green choices (e.g., carpooling, turning off standby power, eating a plant-based meal). Real-time charts show their accumulated CO2e savings.
4. **Gamification & Rewards**: Track your overall "Eco-Grade", "Eco Points", and level up your status from "Carbon Novice" to "Eco Champion".
5. **Educational Hub & Quiz**: Flip cards to learn key ecological terms (e.g., CO2e, Carbon Neutral, Scope 3) and test your knowledge with a responsive trivia game.

---

## 📊 Scientific Calculation Model

EcoSphere uses standardized carbon emission factors modeled from carbon accounting databases (such as UK DEFRA and US EPA averages):

### 1. Transportation
- **Driving (Gasoline/Petrol Car)**: ~0.17 kg CO2e per km.
- **Flying (Short/Long-haul flights)**: ~0.11 kg CO2e per passenger-km.
- **Public Transit (Bus/Train)**: ~0.03 kg CO2e per passenger-km.

### 2. Home Energy
- **Electricity Consumption**: ~0.38 kg CO2e per kWh (grid average).
- **Natural Gas / Heating**: ~0.18 kg CO2e per kWh.
- **Renewable Energy offsets**: Reduces home energy footprint by up to 100%.

### 3. Food Consumption
- **Meat-heavy Diet**: ~2.5 tons CO2e per year.
- **Average / Balanced Diet**: ~1.7 tons CO2e per year.
- **Vegetarian / Plant-based Diet**: ~0.9 tons CO2e per year.

### 4. Waste & Shopping
- **Standard Waste production**: ~450 kg of waste per year generating ~0.45 tons CO2e.
- **Recycling rate**: Up to 60% reduction in waste emissions based on active recycling habits.

---

## 🎨 Design System & Accessibility

EcoSphere is styled using modern **Vanilla CSS** following professional design principles:
- **Palette**: A dark, eco-futuristic color palette featuring deep slate (`#0B0F19`), mint green (`#10B981`), emerald forest green (`#047857`), and a light neon accent (`#34D399`) for micro-interactions.
- **Typography**: Uses the Google Font *Outfit* for a premium, geometric sans-serif aesthetic.
- **Glassmorphism**: Backdrop blur filter with high-contrast borders creates a luxurious layout that feels alive.
- **Accessibility (A11y)**:
  - Interactive elements have clear `:focus-visible` outlines.
  - Semantic HTML tags (`<nav>`, `<main>`, `<section>`, `<article>`) are used throughout.
  - High color contrast ratios (exceeding WCAG AAA rules).
  - ARIA attributes describe functional tab switching and slide states.

---

## 🧠 Smart Assistant Logic (Eco-Bot)

Eco-Bot's decision-making is context-dependent and operates on the client side:
- **Calculation Analysis**: On questionnaire completion, Eco-Bot evaluates the footprint scores. It proactively highlights the user's primary emission driver (e.g., "I noticed that 52% of your footprint comes from flights...").
- **Smart Recommendations**: It suggests tailored, high-impact tasks (e.g., suggesting a smart thermostat if Energy is high, or carpooling if Transportation is high).
- **Interactive Prompts**: Users can click quick-reply bubbles to ask follow-up questions, change targets, or log custom offsets.

---

## ⚙️ How to Run & Verify

Since EcoSphere requires **no compilation or npm build setup**, it can be opened instantly in any browser:

### Option A: Direct Launch
1. Double-click the `index.html` file in your system's file manager to run it locally in any modern web browser.

### Option B: Local Web Server (Recommended)
1. Navigate to the root directory in your command line:
   ```bash
   python -m http.server 8000
   ```
   *or*
   ```bash
   npx -y live-server
   ```
2. Open `http://localhost:8000` (or the port specified) in your browser.

### Running Validation Tests
To verify the calculator engine, run the console-based test suite using Node.js:
```bash
node tests/test_calculator.js
```
The output will display test results for edge cases, average inputs, and calculations.

---

## 📌 Assumptions Made
- Calculations represent annualized estimates of an individual's carbon footprint.
- Daily action tracker savings represent standard daily offset approximations (e.g., taking a bus saves ~5 kg CO2e compared to driving 25 km alone).
- Clean grid energy assumptions vary based on the user's selected region or option.
