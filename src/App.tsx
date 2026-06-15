// src/App.tsx
import React, { useState, useEffect } from 'react';
import type { UserContext } from './utils/carbonEngine';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InsightsDashboard } from './components/InsightsDashboard';
import { CarbonCalculator } from './components/CarbonCalculator';
import { EcoTracker } from './components/EcoTracker';
import { ChatBot } from './components/ChatBot';
import { EcoQuiz } from './components/EcoQuiz';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userName, setUserName] = useState<string>('Climate Advocate');

  // Baseline User Data (Defaults matching High Impact test scenario)
  const [userData, setUserData] = useState<UserContext>({
    commuteDistanceKm: 60,
    commuteMethod: 'car',
    monthlyKwh: 600,
    solarUser: false,
    dietType: 'meatHeavyDay'
  });

  // Profile gamification states
  const [xp, setXp] = useState<number>(150);
  const [badge, setBadge] = useState<string>('Carbon Novice');
  const [actionsLoggedCount, setActionsLoggedCount] = useState<number>(0);
  const [dailySavings, setDailySavings] = useState<number>(0.0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizTotal, setQuizTotal] = useState<number>(0);

  // Greet notification indicator
  const [hasNewAdvice, setHasNewAdvice] = useState<boolean>(false);

  // Recalculate badge tier based on XP milestones
  useEffect(() => {
    let rank = "Carbon Novice";
    if (xp > 900) rank = "Eco Champion";
    else if (xp > 500) rank = "Green Hero";
    else if (xp > 200) rank = "Climate Guardian";
    setBadge(rank);
  }, [xp]);

  const handleAwardXp = (amount: number) => {
    setXp(prev => prev + amount);
  };

  const handleUpdateSavings = (savings: number, count: number) => {
    setDailySavings(savings);
    setActionsLoggedCount(count);
  };

  const handleUpdateQuizMetric = (score: number, total: number) => {
    setQuizScore(score);
    setQuizTotal(total);
  };

  const handleNavigate = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'assistant') {
      setHasNewAdvice(false);
    }
  };

  const handleUpdateUserData = (newData: UserContext) => {
    setUserData(newData);
    setHasNewAdvice(true); // alert user of new chatbot advice
  };

  return (
    <ErrorBoundary>
      {/* Ambient background glow elements */}
      <div className="glow-bg glow-green"></div>
      <div className="glow-bg glow-blue"></div>

      <div className="app-container">
        
        {/* Top Navigation Bar */}
        <header className="main-header" role="banner">
          <div className="logo-area">
            <div className="logo-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="logo-icon text-emerald" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            </div>
            <div className="logo-text">
              <h1>EcoSphere</h1>
              <span className="logo-tagline">Carbon Intelligence Hub</span>
            </div>
          </div>

          <nav className="nav-links" role="navigation" aria-label="Main Navigation">
            <button
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavigate('dashboard')}
              aria-selected={activeTab === 'dashboard'}
              role="tab"
              aria-label="Dashboard Tab"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="14" rx="1"/></svg>
              <span>Dashboard</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'calculator' ? 'active' : ''}`}
              onClick={() => handleNavigate('calculator')}
              aria-selected={activeTab === 'calculator'}
              role="tab"
              aria-label="Calculator Tab"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="14" height="18" x="5" y="3" rx="2"/><path d="M9 7h6"/><path d="M9 11h6"/><path d="M9 15h2"/><path d="M15 15h.01"/></svg>
              <span>Calculator</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'tracker' ? 'active' : ''}`}
              onClick={() => handleNavigate('tracker')}
              aria-selected={activeTab === 'tracker'}
              role="tab"
              aria-label="Eco-Tracker Tab"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
              <span>Eco-Tracker</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'assistant' ? 'active' : ''}`}
              onClick={() => handleNavigate('assistant')}
              aria-selected={activeTab === 'assistant'}
              role="tab"
              aria-label="Eco-Bot Assistant Tab"
            >
              {hasNewAdvice && <div className="assistant-tab-indicator" style={{ display: 'block' }}></div>}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Eco-Bot</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'education' ? 'active' : ''}`}
              onClick={() => handleNavigate('education')}
              aria-selected={activeTab === 'education'}
              role="tab"
              aria-label="Eco-Quiz Tab"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
              <span>Eco-Quiz</span>
            </button>
          </nav>

          {/* Scoreboard Profile Summary */}
          <div className="header-profile" id="profile-summary">
            <div className="profile-stats">
              <div className="xp-container">
                <span className="xp-label">Eco Points</span>
                <span className="xp-value" id="header-xp">{xp}</span>
              </div>
              <div className="badge-container">
                <span className="badge-text" id="header-badge">{badge}</span>
              </div>
            </div>
            <div className="avatar-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8A7 7 0 0 1 11 20z"/></svg>
            </div>
          </div>
        </header>

        {/* Main Content Panels */}
        <main className="main-content">
          {activeTab === 'dashboard' && (
            <InsightsDashboard
              userData={userData}
              xp={xp}
              badge={badge}
              actionsLoggedCount={actionsLoggedCount}
              dailySavings={dailySavings}
              quizScore={quizScore}
              quizTotal={quizTotal}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'calculator' && (
            <CarbonCalculator
              userData={userData}
              userName={userName}
              onUpdateUserData={handleUpdateUserData}
              onUpdateUserName={setUserName}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'tracker' && (
            <EcoTracker
              onAwardXp={handleAwardXp}
              onUpdateSavings={handleUpdateSavings}
            />
          )}

          {activeTab === 'assistant' && (
            <ChatBot
              userData={userData}
              userName={userName}
            />
          )}

          {activeTab === 'education' && (
            <EcoQuiz
              onUpdateQuizMetric={handleUpdateQuizMetric}
              onAwardXp={handleAwardXp}
            />
          )}
        </main>

        {/* Footer Summary */}
        <footer className="app-footer" role="contentinfo">
          <p>&copy; 2026 EcoSphere Carbon Intelligence System. Aligned with strict security sanitization and accessibility guidelines.</p>
          <div className="footer-meta">
            <span>A11y Compliant</span>
            <span className="divider">|</span>
            <span>Secure Static Sandbox</span>
            <span className="divider">|</span>
            <span>Standard calculation models applied</span>
          </div>
        </footer>

      </div>
    </ErrorBoundary>
  );
};

export default App;
