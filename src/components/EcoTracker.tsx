// src/components/EcoTracker.tsx
import React, { useState } from 'react';

interface HabitItem {
  id: string;
  title: string;
  category: string;
  points: number;
  savings: number; // in kg CO2e
  checked: boolean;
}

interface TrackerProps {
  onAwardXp: (amount: number) => void;
  onUpdateSavings: (amount: number, count: number) => void;
}

export const EcoTracker: React.FC<TrackerProps> = ({ onAwardXp, onUpdateSavings }) => {
  const [habits, setHabits] = useState<HabitItem[]>([
    { id: 'h-commute', title: 'Carpooled or Used Transit', category: 'Transportation', points: 15, savings: 4.2, checked: false },
    { id: 'h-bike', title: 'Biked, Walked, or Skated instead of driving', category: 'Transportation', points: 25, savings: 6.5, checked: false },
    { id: 'h-thermostat', title: 'Lowered thermostat by 1°C / Adjusted AC', category: 'Energy Utilities', points: 10, savings: 1.8, checked: false },
    { id: 'h-standby', title: 'Switched off standby electronics power', category: 'Energy Utilities', points: 12, savings: 0.9, checked: false },
    { id: 'h-vegan', title: 'Ate fully plant-based / vegan meals today', category: 'Diet & Food', points: 20, savings: 3.8, checked: false },
    { id: 'h-compost', title: 'Zero food waste & composted scraps', category: 'Diet & Food', points: 10, savings: 1.2, checked: false },
    { id: 'h-shopping', title: 'Avoided plastic/single-use shopping bags', category: 'Consumer & Recycling', points: 15, savings: 2.1, checked: false }
  ]);

  const handleToggle = (id: string) => {
    const updated = habits.map(h => {
      if (h.id === id) {
        const nextState = !h.checked;
        // Adjust XP
        onAwardXp(nextState ? h.points : -h.points);
        return { ...h, checked: nextState };
      }
      return h;
    });

    setHabits(updated);

    // Calculate total savings and checked count
    let totalSavings = 0;
    let checkedCount = 0;
    updated.forEach(h => {
      if (h.checked) {
        totalSavings += h.savings;
        checkedCount++;
      }
    });

    onUpdateSavings(totalSavings, checkedCount);
  };

  const handleReset = () => {
    // Deduct points for active items
    let xpToDeduct = 0;
    habits.forEach(h => {
      if (h.checked) xpToDeduct += h.points;
    });
    onAwardXp(-xpToDeduct);

    const cleared = habits.map(h => ({ ...h, checked: false }));
    setHabits(cleared);
    onUpdateSavings(0, 0);
  };

  const totals = habits.reduce(
    (acc, cur) => {
      if (cur.checked) {
        acc.savings += cur.savings;
        acc.xp += cur.points;
      }
      return acc;
    },
    { savings: 0, xp: 0 }
  );

  const maxSavingsTarget = 25;
  const progressPct = Math.min((totals.savings / maxSavingsTarget) * 100, 100);

  // Dynamic Conic Style for the gauge
  const conicStyle = {
    background: `radial-gradient(var(--bg-app) 60%, transparent 61%), conic-gradient(var(--emerald) ${progressPct}%, rgba(255, 255, 255, 0.05) ${progressPct}%)`
  };

  // Group habits by category
  const categories = Array.from(new Set(habits.map(h => h.category)));

  return (
    <div className="grid-layout">
      {/* Checklist (Left) */}
      <div className="col-span-8 glass-card">
        <div className="card-header tracker-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2>Daily Eco-Habits Logger</h2>
            <p className="subtitle text-muted">Complete tasks daily to earn points and offset carbon.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleReset} aria-label="Reset all completed tasks">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: '4px' }}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span>Reset Checklist</span>
          </button>
        </div>

        <div className="habits-checklist">
          {categories.map(cat => (
            <div key={cat} className="habit-category">
              <h4>{cat} Actions</h4>
              {habits.filter(h => h.category === cat).map(h => (
                <label key={h.id} className="habit-item" htmlFor={h.id}>
                  <input
                    type="checkbox"
                    id={h.id}
                    className="habit-checkbox"
                    checked={h.checked}
                    onChange={() => handleToggle(h.id)}
                    aria-label={`Mark task completed: ${h.title}`}
                  />
                  <span className="custom-checkbox"></span>
                  <div className="habit-label-group">
                    <span className="habit-title">{h.title}</span>
                    <span className="habit-meta">Earn +{h.points} XP | Saves ~{h.savings} kg CO2e</span>
                  </div>
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tracker Status (Right) */}
      <div className="col-span-4 tracker-sidebar">
        <div className="glass-card tracker-stats-card text-center">
          <h3>Today's Offset Progress</h3>
          
          <div className="progress-ring-block" style={conicStyle} role="progressbar" aria-valuenow={Math.round(progressPct)} aria-valuemin={0} aria-valuemax={100} aria-label="Offset progress circle">
            <div className="savings-total-display">
              <span id="tracker-savings-value" className="text-emerald">{totals.savings.toFixed(1)}</span>
              <span className="unit">kg CO2e Saved</span>
            </div>
          </div>

          <div className="mini-score-card">
            <span className="mini-lbl">Bonus Points Accumulated Today</span>
            <span className="mini-val text-emerald">+{totals.xp} XP</span>
          </div>
          <p className="tracker-motivation">Continuous log habits generate a healthy multiplier rank status.</p>
        </div>

        <div className="glass-card performance-card" role="region" aria-label="Progress to Target Goals">
          <h3>Carbon Reduction Target</h3>
          <p className="subtitle text-muted">Weekly Goal: Save 25 kg CO2e</p>
          <div className="target-progress-row">
            <span>Total Offset Logged:</span>
            <span>{progressPct.toFixed(0)}%</span>
          </div>
          <div className="xp-bar-outer">
            <div className="xp-bar-inner" style={{ width: `${progressPct}%` }}></div>
          </div>
          <small className="text-muted block mt-2">Log actions consecutively to maintain your daily streak multiplier.</small>
        </div>
      </div>
    </div>
  );
};
