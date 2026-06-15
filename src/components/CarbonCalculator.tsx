// src/components/CarbonCalculator.tsx
import React, { useState } from 'react';
import { evaluateCarbonFootprint } from '../utils/carbonEngine';
import type { UserContext } from '../utils/carbonEngine';
import { sanitizeNumber, sanitizeString } from '../utils/sanitizer';

interface CalculatorProps {
  userData: UserContext;
  userName: string;
  onUpdateUserData: (data: UserContext) => void;
  onUpdateUserName: (name: string) => void;
  onNavigate: (tabId: string) => void;
}

export const CarbonCalculator: React.FC<CalculatorProps> = ({
  userData,
  userName,
  onUpdateUserData,
  onUpdateUserName,
  onNavigate
}) => {
  const [step, setStep] = useState(0);
  const [nameInput, setNameInput] = useState(userName);
  const [commuteDist, setCommuteDist] = useState(userData.commuteDistanceKm);
  const [commuteMethod, setCommuteMethod] = useState<'car' | 'bus' | 'train'>(userData.commuteMethod);
  const [monthlyKwh, setMonthlyKwh] = useState(userData.monthlyKwh);
  const [solarUser, setSolarUser] = useState(userData.solarUser);
  const [dietType, setDietType] = useState<'plantBasedDay' | 'meatHeavyDay'>(userData.dietType);

  const handleNext = () => {
    if (step === 0) {
      // Sanitize username
      const cleanName = sanitizeString(nameInput) || "Climate Advocate";
      onUpdateUserName(cleanName);
    }
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save data & recalculate on finish
      const finalContext: UserContext = {
        commuteDistanceKm: sanitizeNumber(commuteDist, 0, 500),
        commuteMethod,
        monthlyKwh: sanitizeNumber(monthlyKwh, 0, 5000),
        solarUser,
        dietType
      };
      onUpdateUserData(finalContext);
      onNavigate('dashboard');
      setStep(0);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Perform a live calculation for summary preview step
  const liveResult = () => {
    const context: UserContext = {
      commuteDistanceKm: sanitizeNumber(commuteDist, 0, 500),
      commuteMethod,
      monthlyKwh: sanitizeNumber(monthlyKwh, 0, 5000),
      solarUser,
      dietType
    };
    return evaluateCarbonFootprint(context);
  };

  return (
    <div className="calculator-container glass-card" role="region" aria-label="Carbon Assessment Wizard">
      {/* Calculator Header */}
      <div className="calc-header">
        <div>
          <h2>Carbon Footprint Assessment</h2>
          <p>Estimate your annual footprint by answering these simple questions.</p>
        </div>
        <div className="calc-steps-indicator" aria-label="Progress tracker step indicator">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`step-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
              aria-label={`Step ${i + 1} of 5`}
            ></span>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* STEP 0: NAME GREETING */}
        {step === 0 && (
          <div className="calc-step active">
            <div className="step-intro-layout">
              <div className="intro-graphic">
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="intro-icon text-emerald" aria-hidden="true"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div className="intro-text-wrapper">
                <h3>Let's evaluate your environmental impact</h3>
                <p>
                  In just 2 minutes, our algorithm calculates your carbon score using real-world factors and suggests tailored ways to mitigate it.
                </p>
                <div className="form-group name-group">
                  <label htmlFor="name-input">First, what is your name?</label>
                  <input
                    type="text"
                    id="name-input"
                    className="form-control"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Alex"
                    aria-label="User name input field"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: TRANSPORT COMMUTE */}
        {step === 1 && (
          <div className="calc-step active">
            <div className="step-heading">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="step-title-icon" aria-hidden="true"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
              <h3>Transportation Profile</h3>
            </div>
            <p className="step-desc">Travel emissions are key drivers of individual carbon scores. Share your daily commute habits.</p>

            <div className="form-grid">
              <div className="form-group col-span-6">
                <label htmlFor="commute-method-select">Commute Vehicle Type</label>
                <select
                  id="commute-method-select"
                  className="form-select"
                  value={commuteMethod}
                  onChange={(e) => setCommuteMethod(e.target.value as 'car' | 'bus' | 'train')}
                  aria-label="Commute vehicle type selection"
                >
                  <option value="car">Gasoline / Petrol Car</option>
                  <option value="bus">Standard Transit Bus</option>
                  <option value="train">Electric Rail Metro / Train</option>
                </select>
              </div>

              <div className="form-group col-span-6">
                <label htmlFor="commute-distance-slider">Daily Commute Distance (km/day)</label>
                <div className="slider-container">
                  <input
                    type="range"
                    id="commute-distance-slider"
                    min="0"
                    max="300"
                    step="5"
                    value={commuteDist}
                    onChange={(e) => setCommuteDist(parseInt(e.target.value))}
                    className="input-slider"
                    aria-label="Daily commute distance slider"
                  />
                  <span className="slider-display" id="commute-distance-val">{commuteDist} km</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: HOME ENERGY */}
        {step === 2 && (
          <div className="calc-step active">
            <div className="step-heading">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="step-title-icon" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <h3>Home Energy consumption</h3>
            </div>
            <p className="step-desc">Electrical usage and heating energy outputs vary depending on your grid provider sources.</p>

            <div className="form-grid">
              <div className="form-group col-span-6">
                <label htmlFor="monthly-kwh-slider">Monthly Electricity Consumption (kWh)</label>
                <div className="slider-container">
                  <input
                    type="range"
                    id="monthly-kwh-slider"
                    min="0"
                    max="2000"
                    step="50"
                    value={monthlyKwh}
                    onChange={(e) => setMonthlyKwh(parseInt(e.target.value))}
                    className="input-slider"
                    aria-label="Monthly electricity consumption slider"
                  />
                  <span className="slider-display" id="monthly-kwh-val">{monthlyKwh} kWh</span>
                </div>
              </div>

              <div className="form-group col-span-6">
                <label>Clean Grid energy Option</label>
                <div className="toggle-container">
                  <input
                    type="checkbox"
                    id="solar-checkbox"
                    className="toggle-checkbox"
                    checked={solarUser}
                    onChange={(e) => setSolarUser(e.target.checked)}
                    aria-label="Solar panel user toggle"
                  />
                  <label htmlFor="solar-checkbox" className="toggle-label"></label>
                  <span className="toggle-text">My power provider uses 100% renewable solar / wind</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DIET SELECTION */}
        {step === 3 && (
          <div className="calc-step active">
            <div className="step-heading">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="step-title-icon" aria-hidden="true"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"/><path d="M12 6v6l4 2"/></svg>
              <h3>Diet & Nutrition</h3>
            </div>
            <p className="step-desc">Food production, livestock rearing, and supply-chain logistics generate significant carbon output.</p>

            <div className="diet-selector-container">
              <div
                className={`diet-card ${dietType === 'meatHeavyDay' ? 'active' : ''}`}
                onClick={() => setDietType('meatHeavyDay')}
                role="button"
                aria-label="Select Meat Heavy Diet"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setDietType('meatHeavyDay'); }}
              >
                <div className="diet-icon-holder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                </div>
                <h4>Meat Heavy</h4>
                <p>Standard diet with beef, lamb, and other meats. High carbon footprint.</p>
              </div>

              <div
                className={`diet-card ${dietType === 'plantBasedDay' ? 'active' : ''}`}
                onClick={() => setDietType('plantBasedDay')}
                role="button"
                aria-label="Select Plant-Based Diet"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setDietType('plantBasedDay'); }}
              >
                <div className="diet-icon-holder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8A7 7 0 0 1 11 20z"/></svg>
                </div>
                <h4>Plant-Based</h4>
                <p>Fully vegetarian or vegan diet. Minimal agricultural footprint.</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: RESULT SUMMARY */}
        {step === 4 && (
          <div className="calc-step active">
            <div className="summary-success-card">
              <div className="success-tick-holder">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="success-icon text-emerald" aria-hidden="true"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.74z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3>Assessment Compiled!</h3>
              <p>We've parsed your lifestyle choices securely. You can now browse recommendations on the insights panel.</p>

              <div className="summary-results-preview">
                <div className="preview-metric">
                  <span className="preview-num text-emerald">{liveResult().totalEmissionsTons}</span>
                  <span className="preview-lbl">Tonnes CO2e/year</span>
                </div>
                <div className="preview-comparison">
                  <span className="badge-text" style={{ background: 'var(--emerald-dim)', color: 'var(--emerald)' }}>
                    Category: {liveResult().tier}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard controls */}
        <div className="calculator-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleBack}
            disabled={step === 0}
            aria-label="Navigate to previous step"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
            <span>Previous</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
            aria-label="Navigate to next step"
          >
            <span>{step === 4 ? 'Compute Footprint' : 'Next'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </form>
    </div>
  );
};
