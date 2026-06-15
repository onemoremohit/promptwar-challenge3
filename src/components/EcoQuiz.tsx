// src/components/EcoQuiz.tsx
import React, { useState } from 'react';

interface Question {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface Term {
  title: string;
  subtitle: string;
  description: string;
  iconSvg: React.ReactNode;
}

interface QuizProps {
  onUpdateQuizMetric: (correct: number, total: number) => void;
  onAwardXp: (amount: number) => void;
}

const TRIVIA_QUESTIONS: Question[] = [
  {
    question: "Which of the following transport methods produces the highest carbon emissions per passenger-kilometer?",
    choices: [
      "Domestic Flights (Short-Haul Jet)",
      "Electric Train (Metro)",
      "Standard Passenger Bus",
      "Carpooling in a Hybrid Electric Vehicle"
    ],
    correctIndex: 0,
    explanation: "Short-haul domestic flights are the most carbon-intensive transport mode, emitting roughly 0.25 kg of CO2e per passenger-km, due to massive energy requirements during take-off and landing."
  },
  {
    question: "What does the term 'Scope 3 Emissions' refer to in greenhouse gas accounting?",
    choices: [
      "Direct emissions from burning fuel in owned boilers or vehicles.",
      "Indirect emissions from purchased electricity, steam, heating, or cooling.",
      "All other indirect emissions in a company or person's value chain, such as product shipping, food growth, and waste.",
      "Carbon offsets bought from forest restoration programs."
    ],
    correctIndex: 2,
    explanation: "Scope 3 covers supply-chain emissions. For individuals, this is embedded in the food we purchase, the clothes we buy, and the lifecycle of our consumer goods."
  },
  {
    question: "How does eating a plant-based (vegan) diet compare to a heavy meat-eating diet in terms of carbon footprint?",
    choices: [
      "It makes no significant difference.",
      "A vegan diet reduces food-related emissions by up to 60-70%.",
      "A vegan diet is slightly worse due to crop transportation.",
      "It reduces emissions by exactly 10%."
    ],
    correctIndex: 1,
    explanation: "Livestock agriculture requires immense land, generates high methane emissions (from cattle digestions), and requires intensive feed production, making meat diets roughly 2.5x more carbon heavy."
  },
  {
    question: "Which type of home appliance typically draws 'vampire power' (standby electricity consumption) when turned off but left plugged in?",
    choices: [
      "LED Light Bulbs",
      "Microwave ovens, TVs, and game consoles with standby displays",
      "Manual induction cooktops",
      "Standard insulated electric water heaters"
    ],
    correctIndex: 1,
    explanation: "Devices with standby indicators or internal clocks draw power even when turned off. Unplugging them or using smart power strips can save up to 10% on electric bills and emissions."
  },
  {
    question: "What is the primary difference between 'carbon neutral' and 'net zero'?",
    choices: [
      "They mean exactly the same thing.",
      "Carbon neutrality allows offsetting emissions without necessarily reducing them, whereas net zero requires reducing emissions as close to zero as possible before offsetting.",
      "Net zero only applies to methane gas offsets.",
      "Carbon neutrality is only for individuals, and net zero is only for companies."
    ],
    correctIndex: 1,
    explanation: "Net Zero is a more stringent standard. It mandates that organizations or individuals actively minimize their carbon generation to the absolute minimum, offsetting only the unavoidable residual."
  }
];

const GLOSSARY_TERMS: Term[] = [
  {
    title: "CO2e",
    subtitle: "Carbon Dioxide Equivalent",
    description: "A standard unit for measuring carbon footprints. It expresses the impact of different greenhouse gases (methane, nitrous oxide) in terms of the amount of CO2 that would create the same amount of warming.",
    iconSvg: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="card-concept-icon text-emerald"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  },
  {
    title: "Carbon Neutrality",
    subtitle: "Zero Net Emissions",
    description: "Achieved when a person or company calculates their total carbon footprint, reduces it where possible, and offsets the remainder by investing in projects that capture carbon (e.g. planting forests, clean energy grids).",
    iconSvg: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="card-concept-icon text-emerald"><line x1="12" y1="3" x2="12" y2="21"/><rect x="2" y="7" width="20" height="10" rx="2"/></svg>
  },
  {
    title: "Scope 1, 2 & 3",
    subtitle: "Emission Classifications",
    description: "Scope 1: Direct emissions (burning car fuel). Scope 2: Indirect electricity emissions. Scope 3: Supply chain product fabrication emissions.",
    iconSvg: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="card-concept-icon text-emerald"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"/><path d="M12 6v6l4 2"/></svg>
  },
  {
    title: "Offsets",
    subtitle: "Mitigation Credits",
    description: "A mechanism where individuals fund certified carbon-reduction projects worldwide. One offset represents the reduction or avoidance of one metric tonne of carbon dioxide equivalent (CO2e).",
    iconSvg: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="card-concept-icon text-emerald"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
  }
];

export const EcoQuiz: React.FC<QuizProps> = ({ onUpdateQuizMetric, onAwardXp }) => {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
  };

  const handleSubmit = () => {
    if (selectedIdx === null || isAnswered) return;
    setIsAnswered(true);

    const q = TRIVIA_QUESTIONS[qIndex];
    const isCorrect = (selectedIdx === q.correctIndex);
    if (isCorrect) {
      setScore(s => s + 1);
      onAwardXp(20);
    }
  };

  const handleNext = () => {
    if (qIndex < TRIVIA_QUESTIONS.length - 1) {
      setQIndex(qIndex + 1);
      setSelectedIdx(null);
      setIsAnswered(false);
    } else {
      setQuizComplete(true);
      onUpdateQuizMetric(score + (selectedIdx === TRIVIA_QUESTIONS[qIndex].correctIndex ? 1 : 0), TRIVIA_QUESTIONS.length);
    }
  };

  const handleRestart = () => {
    setQIndex(0);
    setScore(0);
    setSelectedIdx(null);
    setIsAnswered(false);
    setQuizComplete(false);
  };

  const currentQ = TRIVIA_QUESTIONS[qIndex];
  const progressPct = ((qIndex) / TRIVIA_QUESTIONS.length) * 100;

  return (
    <div className="grid-layout">
      {/* Glossary Flip Cards Deck (Left) */}
      <div className="col-span-6 glass-card education-deck">
        <div className="card-header">
          <h2>Ecological Terms Decoder</h2>
          <p className="subtitle text-muted">Hover or focus the cards below to flip and learn key climate concepts.</p>
        </div>

        <div className="deck-grid">
          {GLOSSARY_TERMS.map((term, index) => (
            <div key={index} className="flip-card" tabIndex={0} aria-label={`Concept term card: ${term.title}`}>
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  {term.iconSvg}
                  <h3>{term.title}</h3>
                  <span className="hint">Hover to flip</span>
                </div>
                <div className="flip-card-back">
                  <h4>{term.subtitle}</h4>
                  <p>{term.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trivia Game (Right) */}
      <div className="col-span-6 glass-card trivia-quiz" role="region" aria-label="Climate Literacy Quiz Panel">
        <div className="card-header">
          <h2>Carbon Trivia Challenge</h2>
          <p className="subtitle text-muted">Test your climate awareness and earn +20 XP for correct responses!</p>
        </div>

        {!quizComplete ? (
          <div className="quiz-body-wrapper">
            <div className="quiz-progress-row">
              <span className="q-index">Question {qIndex + 1} of {TRIVIA_QUESTIONS.length}</span>
              <span className="q-score">Total Correct: {score}</span>
            </div>
            <div className="xp-bar-outer">
              <div className="xp-bar-inner" style={{ width: `${progressPct}%` }}></div>
            </div>

            <div className="quiz-question-box">{currentQ.question}</div>

            <div className="quiz-options-list">
              {currentQ.choices.map((choice, idx) => {
                let btnClass = "quiz-option-btn";
                if (selectedIdx === idx) btnClass += " selected";
                if (isAnswered) {
                  if (idx === currentQ.correctIndex) btnClass += " correct";
                  else if (selectedIdx === idx) btnClass += " incorrect";
                }

                return (
                  <button
                    key={idx}
                    className={btnClass}
                    onClick={() => handleSelect(idx)}
                    disabled={isAnswered}
                    aria-label={`Option ${idx + 1}: ${choice}`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="quiz-explanation-box">
                <div className="exp-icon-box" style={{ color: 'var(--emerald)', display: 'flex' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </div>
                <div className="exp-text">
                  <strong>Explanation:</strong> <span id="quiz-explanation-text">{currentQ.explanation}</span>
                </div>
              </div>
            )}

            <div className="quiz-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              {!isAnswered ? (
                <button className="btn btn-primary" onClick={handleSubmit} disabled={selectedIdx === null} aria-label="Submit answer">
                  <span>Submit Answer</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginLeft: '4px' }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleNext} aria-label="Advance to next question">
                  <span>{qIndex === TRIVIA_QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginLeft: '4px' }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="quiz-completion-state text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="award-icon text-emerald pulsing-glow" aria-hidden="true" style={{ margin: '0 auto 16px auto' }}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/><path d="M12 2a4 4 0 0 1 4 4v5a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z"/></svg>
            <h3>Trivia Completed!</h3>
            <p>Excellent effort! You scored <strong className="text-emerald">{score}</strong> out of <strong className="text-emerald">{TRIVIA_QUESTIONS.length}</strong>. Your literacy index is logged.</p>
            <button className="btn btn-primary" onClick={handleRestart} aria-label="Restart climate trivia quiz">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: '6px' }}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              <span>Restart Trivia</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
