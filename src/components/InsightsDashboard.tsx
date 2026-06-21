// src/components/InsightsDashboard.tsx
import React, { useMemo, useEffect, useRef } from 'react';
import { evaluateCarbonFootprint } from '../utils/carbonEngine';
import type { UserContext } from '../utils/carbonEngine';
import { Chart, registerables } from 'chart.js';

// Register Chart.js modules
Chart.register(...registerables);

interface DashboardProps {
  userData: UserContext;
  xp: number;
  badge: string;
  actionsLoggedCount: number;
  dailySavings: number;
  quizScore: number;
  quizTotal: number;
  onNavigate: (tabId: string) => void;
}

export const InsightsDashboard: React.FC<DashboardProps> = ({
  userData,
  xp,
  badge,
  actionsLoggedCount,
  dailySavings,
  quizScore,
  quizTotal,
  onNavigate
}) => {
  // Efficiency Parameter: Prevents heavy computational recalculation on minor state changes
  const footprintAnalysis = useMemo(() => {
    return evaluateCarbonFootprint(userData);
  }, [userData]);

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Compute breakdown segments for display card highlights
  const sectors = useMemo(() => {
    let carEmissions = 0;
    let busEmissions = 0;
    let trainEmissions = 0;
    if (userData.commuteMethod === 'car') carEmissions = userData.commuteDistanceKm * 0.17 * 365;
    else if (userData.commuteMethod === 'bus') busEmissions = userData.commuteDistanceKm * 0.06 * 365;
    else trainEmissions = userData.commuteDistanceKm * 0.03 * 365;

    const transport = (carEmissions + busEmissions + trainEmissions) / 1000;
    const energyFactor = userData.solarUser ? 0.05 : 0.45;
    const energy = (userData.monthlyKwh * 12 * energyFactor) / 1000;
    const food = (userData.dietType === 'plantBasedDay' ? 1.5 : 6.0) * 365 / 1000;
    const total = transport + energy + food;

    return {
      transport: parseFloat(transport.toFixed(2)),
      energy: parseFloat(energy.toFixed(2)),
      food: parseFloat(food.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      transportPct: total > 0 ? (transport / total) * 100 : 0,
      energyPct: total > 0 ? (energy / total) * 100 : 0,
      foodPct: total > 0 ? (food / total) * 100 : 0
    };
  }, [userData]);

  // Re-draw chart on sectors modification
  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        chartInstanceRef.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Transportation', 'Utilities & Energy', 'Diet & Nutrition'],
            datasets: [{
              data: [sectors.transport, sectors.energy, sectors.food],
              backgroundColor: ['#60A5FA', '#FBBF24', '#34D399'],
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
              }
            },
            cutout: '70%'
          }
        });
      }
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [sectors]);

  // Compute quiz accuracy display value
  const quizAccuracy = useMemo(() => {
    return quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0;
  }, [quizScore, quizTotal]);

  // Next level threshold progression
  const levelProgress = useMemo(() => {
    let nextThreshold = 500;
    let prevThreshold = 0;
    if (xp > 900) {
      nextThreshold = 2000;
      prevThreshold = 900;
    } else if (xp > 500) {
      nextThreshold = 900;
      prevThreshold = 500;
    } else if (xp > 200) {
      nextThreshold = 500;
      prevThreshold = 200;
    }
    const range = nextThreshold - prevThreshold;
    const current = xp - prevThreshold;
    return Math.min(Math.max((current / range) * 100, 0), 100);
  }, [xp]);

  return (
    <div className="grid-layout">
      {/* Welcome Banner */}
      <div className="col-span-12 welcome-banner glass-card" role="region" aria-label="Welcome Status Header">
        <div className="banner-content">
          <h2>Welcome to your Green Hub, <span id="user-display-name">Climate Advocate</span>!</h2>
          <p>
            Your current estimated carbon footprint is{' '}
            <strong className="highlight-text text-emerald">{footprintAnalysis.totalEmissionsTons} tonnes</strong> of CO2e per year. Let's work together to reduce this below the global target of <strong>2.0 tonnes</strong>.
          </p>
        </div>
        <div className="banner-action">
          <button className="btn btn-primary" onClick={() => onNavigate('calculator')} aria-label="Recalculate Carbon Footprint">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: '6px' }}><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            <span>Update Footprint</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="col-span-4 metric-card glass-card card-transport" role="article" aria-label="Transportation Impact Summary">
        <div className="metric-header">
          <div className="icon-holder">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          </div>
          <span className="metric-label">Transportation</span>
        </div>
        <div className="metric-body">
          <span className="metric-value">{sectors.transport}</span>
          <span className="metric-unit">t CO2e/yr</span>
        </div>
        <div className="metric-footer">
          <span className="metric-percentage">{sectors.transportPct.toFixed(0)}%</span> of footprint
        </div>
      </div>

      <div className="col-span-4 metric-card glass-card card-energy" role="article" aria-label="Energy Utilities Summary">
        <div className="metric-header">
          <div className="icon-holder">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <span className="metric-label">Home Utilities</span>
        </div>
        <div className="metric-body">
          <span className="metric-value">{sectors.energy}</span>
          <span className="metric-unit">t CO2e/yr</span>
        </div>
        <div className="metric-footer">
          <span className="metric-percentage">{sectors.energyPct.toFixed(0)}%</span> of footprint
        </div>
      </div>

      <div className="col-span-4 metric-card glass-card card-food" role="article" aria-label="Food Consumption Summary">
        <div className="metric-header">
          <div className="icon-holder">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <span className="metric-label">Diet & Nutrition</span>
        </div>
        <div className="metric-body">
          <span className="metric-value">{sectors.food}</span>
          <span className="metric-unit">t CO2e/yr</span>
        </div>
        <div className="metric-footer">
          <span className="metric-percentage">{sectors.foodPct.toFixed(0)}%</span> of footprint
        </div>
      </div>

      {/* Carbon Chart */}
      <div className="col-span-8 glass-card chart-container">
        <div className="card-header">
          <h3>Carbon Emission Sources Breakdown</h3>
          <p className="subtitle text-muted">A deep dive into your calculated annual carbon output</p>
        </div>
        <div className="chart-wrapper">
          <canvas ref={chartRef} id="footprintChart"></canvas>
        </div>
      </div>

      {/* Gamification Sidebar */}
      <div className="col-span-4 glass-card stats-sidebar" role="region" aria-label="Eco Score Summary Dashboard">
        <div className="card-header">
          <h3>Eco Score Summary</h3>
        </div>

        <div className="xp-progress-block">
          <div className="xp-labels-row">
            <span className="xp-level-badge">{badge}</span>
            <span className="xp-numerical-display">{xp} XP</span>
          </div>
          <div className="xp-bar-outer">
            <div className="xp-bar-inner" style={{ width: `${levelProgress}%` }}></div>
          </div>
        </div>

        <div className="stats-list">
          <div className="stats-item">
            <span className="stat-icon" style={{ color: 'var(--emerald)', display: 'flex' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </span>
            <span className="stat-desc">Daily Actions Tracked</span>
            <span className="stat-num">{actionsLoggedCount}</span>
          </div>
          <div className="stats-item">
            <span className="stat-icon" style={{ color: 'var(--emerald)', display: 'flex' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 3-1.912 5.886H3.82l4.897 3.56L6.805 18.33 12 14.77l5.195 3.56-1.912-5.885 4.897-3.56h-6.268L12 3Z"/></svg>
            </span>
            <span className="stat-desc">Daily Savings Generated</span>
            <span className="stat-num">{dailySavings.toFixed(1)} kg</span>
          </div>
          <div className="stats-item">
            <span className="stat-icon" style={{ color: 'var(--emerald)', display: 'flex' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
            </span>
            <span className="stat-desc">Quiz Score Accuracy</span>
            <span className="stat-num">{quizAccuracy}%</span>
          </div>
        </div>

        <div className="assistant-teaser" onClick={() => onNavigate('assistant')} style={{ padding: '16px' }} role="button" aria-label="Ask Eco-Bot recommendations" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('assistant'); } }}>
          <div className="teaser-avatar" style={{ background: 'var(--emerald-dim)', color: 'var(--emerald)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pulsing-icon" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
          </div>
          <div className="teaser-body">
            <strong>Eco-Bot is ready to analyze</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Status: {footprintAnalysis.tier}. Click here for customized offsets strategies.
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--text-muted)' }}><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>

      {/* World Comparison Benchmark Widget */}
      <div className="col-span-12 glass-card world-compare-card" role="region" aria-label="Global Carbon Benchmark Comparison">
        <div className="card-header" style={{ marginBottom: '20px' }}>
          <h3>🌍 How You Compare to the World</h3>
          <p className="subtitle text-muted">Your annual footprint vs. global benchmarks (tonnes CO2e/year)</p>
        </div>
        <div className="benchmark-grid">
          {[
            { label: 'Your Footprint', value: sectors.total, color: footprintAnalysis.tier === 'Carbon Guardian' ? 'var(--emerald)' : footprintAnalysis.tier === 'Climate Learner' ? 'var(--coral)' : 'var(--amber)', ariaLabel: `Your footprint: ${sectors.total} tonnes CO2e per year` },
            { label: 'World Average', value: 4.7, color: '#60A5FA', ariaLabel: 'World average: 4.7 tonnes CO2e per year' },
            { label: 'Paris Target 2030', value: 2.0, color: '#34D399', ariaLabel: 'Paris climate target: 2.0 tonnes CO2e per year' },
            { label: 'India Average', value: 1.9, color: '#FBBF24', ariaLabel: 'India national average: 1.9 tonnes CO2e per year' }
          ].map((bench) => {
            const maxRef = Math.max(sectors.total, 4.7, 2.0, 1.9, 0.1);
            const pct = Math.min((bench.value / maxRef) * 100, 100);
            return (
              <div key={bench.label} className="benchmark-row" aria-label={bench.ariaLabel}>
                <div className="benchmark-label-row">
                  <span className="benchmark-name">{bench.label}</span>
                  <span className="benchmark-value" style={{ color: bench.color }}>{bench.value.toFixed(1)}t</span>
                </div>
                <div className="benchmark-bar-track" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={`${bench.label} bar at ${pct.toFixed(0)}%`}>
                  <div className="benchmark-bar-fill" style={{ width: `${pct}%`, background: bench.color }}></div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="benchmark-footnote" aria-label="Data source attribution">
          Source: IEA World Energy Outlook 2023 · IPCC AR6 · Paris Agreement (1.5°C pathway)
        </p>
      </div>

    </div>
  );
};

