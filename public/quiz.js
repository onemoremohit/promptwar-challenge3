/* EcoSphere Quiz & Climate Literacy Module */

const TRIVIA_QUESTIONS = [
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
    explanation: "Devices with internal clocks, smart receivers, or remote controls draw power even when turned off. Unplugging them or using smart power strips can save up to 10% on electric bills and emissions."
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

let currentQuestionIndex = 0;
let score = 0;
let selectedOptionIndex = null;
let isAnswerSubmitted = false;

// Initialize Trivia Game
function initQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  selectedOptionIndex = null;
  isAnswerSubmitted = false;
  
  const completionState = document.getElementById("quiz-completion");
  const quizBlock = document.getElementById("quiz-block");
  
  if (completionState) completionState.classList.add("hidden");
  if (quizBlock) quizBlock.classList.remove("hidden");
  
  loadQuestion();
}

// Load current question
function loadQuestion() {
  selectedOptionIndex = null;
  isAnswerSubmitted = false;
  
  const qData = TRIVIA_QUESTIONS[currentQuestionIndex];
  
  // Update texts
  document.getElementById("quiz-current-num").innerText = `Question ${currentQuestionIndex + 1} of ${TRIVIA_QUESTIONS.length}`;
  document.getElementById("quiz-points-display").innerText = `Total Correct: ${score}`;
  document.getElementById("quiz-question-text").innerText = qData.question;
  
  // Update progress bar
  const pct = ((currentQuestionIndex) / TRIVIA_QUESTIONS.length) * 100;
  document.getElementById("quiz-progress-bar").style.width = `${pct || 5}%`;
  
  // Render options
  const container = document.getElementById("quiz-options-container");
  container.innerHTML = "";
  
  qData.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option-btn";
    btn.innerText = choice;
    btn.setAttribute("role", "button");
    btn.setAttribute("aria-label", `Option: ${choice}`);
    btn.onclick = () => selectOption(index);
    container.appendChild(btn);
  });
  
  // Hide explanation and disable action button
  document.getElementById("quiz-explanation").classList.add("hidden");
  
  const actionBtn = document.getElementById("btn-quiz-next");
  actionBtn.disabled = true;
  actionBtn.innerHTML = `<span>Submit Answer</span><i data-lucide="arrow-right"></i>`;
  if (window.lucide) window.lucide.createIcons();
}

// Select an option
function selectOption(index) {
  if (isAnswerSubmitted) return;
  
  selectedOptionIndex = index;
  const buttons = document.querySelectorAll("#quiz-options-container .quiz-option-btn");
  buttons.forEach((btn, idx) => {
    if (idx === index) {
      btn.classList.add("selected");
    } else {
      btn.classList.remove("selected");
    }
  });
  
  const actionBtn = document.getElementById("btn-quiz-next");
  actionBtn.disabled = false;
}

// Submit answer or transition to next
function handleQuizAction() {
  if (!isAnswerSubmitted) {
    submitAnswer();
  } else {
    advanceQuiz();
  }
}

// Submit and grade answer
function submitAnswer() {
  if (selectedOptionIndex === null || isAnswerSubmitted) return;
  
  isAnswerSubmitted = true;
  const qData = TRIVIA_QUESTIONS[currentQuestionIndex];
  const buttons = document.querySelectorAll("#quiz-options-container .quiz-option-btn");
  
  buttons.forEach((btn, idx) => {
    btn.disabled = true; // disable all options
    if (idx === qData.correctIndex) {
      btn.classList.remove("selected");
      btn.classList.add("correct");
    } else if (idx === selectedOptionIndex) {
      btn.classList.remove("selected");
      btn.classList.add("incorrect");
    }
  });
  
  const isCorrect = (selectedOptionIndex === qData.correctIndex);
  if (isCorrect) {
    score++;
    document.getElementById("quiz-points-display").innerText = `Total Correct: ${score}`;
    
    // Reward points through global app state
    if (window.addEcoPoints) {
      window.addEcoPoints(20); // +20 XP
    }
  }
  
  // Show explanation
  document.getElementById("quiz-explanation-text").innerText = qData.explanation;
  document.getElementById("quiz-explanation").classList.remove("hidden");
  
  // Update action button text
  const actionBtn = document.getElementById("btn-quiz-next");
  if (currentQuestionIndex === TRIVIA_QUESTIONS.length - 1) {
    actionBtn.innerHTML = `<span>Finish Quiz</span><i data-lucide="check"></i>`;
  } else {
    actionBtn.innerHTML = `<span>Next Question</span><i data-lucide="arrow-right"></i>`;
  }
  if (window.lucide) window.lucide.createIcons();
}

// Move to next question or complete
function advanceQuiz() {
  if (currentQuestionIndex < TRIVIA_QUESTIONS.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  } else {
    showQuizCompletion();
  }
}

// Show completion state
function showQuizCompletion() {
  const quizBlock = document.getElementById("quiz-block");
  const completionState = document.getElementById("quiz-completion");
  
  if (quizBlock) quizBlock.classList.add("hidden");
  if (completionState) completionState.classList.remove("hidden");
  
  document.getElementById("quiz-score-val").innerText = score;
  document.getElementById("quiz-total-val").innerText = TRIVIA_QUESTIONS.length;
  
  // Update global quiz percentage in app state
  if (window.updateQuizMetric) {
    window.updateQuizMetric(score, TRIVIA_QUESTIONS.length);
  }
}

function restartQuiz() {
  initQuiz();
}

// Hook button listener on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const nextBtn = document.getElementById("btn-quiz-next");
  if (nextBtn) {
    nextBtn.onclick = handleQuizAction;
  }
  initQuiz();
});
