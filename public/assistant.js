/* EcoSphere Smart Ecological Advisor (Eco-Bot) Logic */

// Predefined conversational trees
const BOT_TEMPLATES = {
  welcome: (name) => {
    return `<p>Hello, <strong>${name}</strong>! I have analyzed your details. Let's look at how we can optimize your footprint.</p>
            <p>Select one of the suggestion tags below or type your own question to explore actions!</p>`;
  },
  
  analyze: (calcData) => {
    if (!calcData || calcData.total === 0) {
      return `<p>I don't have any carbon footprint data to analyze yet!</p>
              <p>Please head over to the <a href="#" onclick="switchTab('calculator'); return false;" class="inline-link">Carbon Calculator</a> first so we can map out your impact.</p>`;
    }
    
    // Determine highest emission sector
    const sectors = [
      { name: 'Transportation', val: calcData.transport, pct: calcData.transportPct, icon: 'car' },
      { name: 'Home Utilities', val: calcData.energy, pct: calcData.energyPct, icon: 'zap' },
      { name: 'Diet & Nutrition', val: calcData.food, pct: calcData.foodPct, icon: 'beef' },
      { name: 'Waste & Products', val: calcData.waste, pct: calcData.wastePct, icon: 'trash-2' }
    ];
    
    sectors.sort((a, b) => b.val - a.val);
    const primary = sectors[0];
    
    let adviceHtml = `<p><strong>Analysis Complete:</strong> Your total estimated carbon footprint is <strong>${calcData.total.toFixed(1)} tonnes</strong> of CO2e per year.</p>`;
    
    if (calcData.total <= 2.0) {
      adviceHtml += `<p>🎉 <strong>Amazing!</strong> You are currently at or below the global sustainability target of <strong>2.0 tonnes/year</strong>. Keep maintaining these excellent habits!</p>`;
    } else {
      adviceHtml += `<p>Your footprint is currently above the 2.0 tonnes target. Your primary emission driver is <strong>${primary.name}</strong>, accounting for <strong>${primary.pct.toFixed(0)}%</strong> (${primary.val.toFixed(1)} tonnes) of your footprint.</p>`;
    }
    
    // Targeted sector suggestions
    if (primary.name === 'Transportation') {
      adviceHtml += `<p>💡 <strong>High Impact Transport Suggestions:</strong>
                     <br>• Reducing driving by 20% by using public transit or carpooling can shave off ~1.0t CO2e annually.
                     <br>• Standard economy flights generate roughly 0.11 kg CO2e per passenger-km. Consider carbon offsets for unavoidable flights or choose direct flights.</p>`;
    } else if (primary.name === 'Home Utilities') {
      adviceHtml += `<p>💡 <strong>High Impact Home Utility Suggestions:</strong>
                     <br>• Switching to a 100% green energy grid tariff reduces home electricity carbon emissions to zero.
                     <br>• Adjusting your thermostat by just 1°C can reduce heating emissions by up to 8%.</p>`;
    } else if (primary.name === 'Diet & Nutrition') {
      adviceHtml += `<p>💡 <strong>High Impact Dietary Suggestions:</strong>
                     <br>• Beef and lamb have a carbon footprint roughly 10x higher than poultry, and 25x higher than beans or lentils.
                     <br>• Trying 'Meatless Mondays' or adopting a plant-forward diet is the single fastest way to drop your diet score.</p>`;
    } else {
      adviceHtml += `<p>💡 <strong>High Impact Waste Suggestions:</strong>
                     <br>• Practicing strict recycling reduces landfill methane emissions by up to 60%.
                     <br>• Avoid buying single-use plastics and support products made from post-consumer recycled content.</p>`;
    }
    
    return adviceHtml;
  },

  travel: () => {
    return `<p>🚘 <strong>Transportation Reductions:</strong></p>
            <p>1. <strong>Carpool & Transit</strong>: Commuting by rail emits 80% less CO2e than driving alone.
            <br>2. <strong>Eco-Driving Techniques</strong>: Maintaining steady speed, proper tire pressure, and turning off standby idle saves up to 15% fuel.
            <br>3. <strong>Electric Transition</strong>: Electric Vehicles (EVs) charged on average grids produce 50-60% less lifetime carbon than combustion engines.</p>
            <p><em>Tip: Check off the 'Carpooled or Used Transit' option in your Eco-Tracker to record your savings!</em></p>`;
  },

  home: () => {
    return `<p>⚡ <strong>Home Utility Optimization:</strong></p>
            <p>1. <strong>Standby Vampire Power</strong>: Household standby power accounts for up to 10% of utility bills. Turn off equipment at plug strips.
            <br>2. <strong>Smart Climate</strong>: Lowering heating or raising AC setting by just 1-2 degrees is one of the highest impact adjustments.
            <br>3. <strong>Insulation</strong>: Draft-proofing doors and windows cuts gas heating emissions immediately by keeping warmth inside.</p>`;
  },

  diet: () => {
    return `<p>🥗 <strong>Food Carbon Intel:</strong></p>
            <p>Food accounts for about 26% of global greenhouse emissions.
            <br>• <strong>Emissions per kg</strong>: Beef (60kg CO2e) | Cheese (21kg) | Poultry (6kg) | Tofu (3kg) | Apples (0.4kg).
            <br>• <strong>Food Waste</strong>: If food waste were a country, it would be the third-largest emitter in the world. Plan meals carefully to avoid waste.</p>`;
  }
};

// Natural language keywords database
const KEYWORD_RESPONSES = [
  {
    keywords: ['offset', 'credit', 'mitigate', 'capture'],
    response: `<p><strong>Carbon Offsetting Explained:</strong></p>
               <p>Carbon offsets allow you to balance out your emissions by funding projects that reduce or absorb carbon elsewhere—such as forest restorations, methane captures, or wind farms.</p>
               <p>⚠️ <em>Crucial Note:</em> Offsetting should only be used for emissions you *cannot* reduce yourself. Reduction always beats compensation!</p>`
  },
  {
    keywords: ['solar', 'panel', 'renewable', 'wind', 'electricity', 'power'],
    response: `<p><strong>Renewable Energy Systems:</strong></p>
               <p>Installing solar panels can offset up to 3-4 tonnes of CO2e per year depending on your location. Many utility companies also allow you to opt-into green tariffs directly, which support regional wind and solar farms at negligible extra cost.</p>`
  },
  {
    keywords: ['electric vehicle', 'ev', 'tesla', 'hybrid', 'battery'],
    response: `<p><strong>Electric Vehicles & Carbon:</strong></p>
               <p>EVs generate zero tailpipe emissions. While manufacturing the battery is carbon-intensive, an EV becomes carbon-cleaner than an average gasoline vehicle within 1 to 2 years of driving, even when charged on grids that use fossil fuels.</p>`
  },
  {
    keywords: ['plastic', 'recycle', 'landfill', 'waste', 'trash'],
    response: `<p><strong>Waste Lifecycle Management:</strong></p>
               <p>Recycling aluminum saves 95% of the energy needed to manufacture it from scratch. For plastics, reduction is key—less than 10% of global plastic is successfully recycled. Focus on reusable items to avoid Scope 3 supply chain impacts.</p>`
  },
  {
    keywords: ['meat', 'beef', 'vegan', 'chicken', 'vegetarian', 'diet'],
    response: `<p><strong>Dietary Impact:</strong></p>
               <p>The carbon footprint of beef is high because cows release methane (a greenhouse gas 28x more potent than CO2) and require extensive pasture land, often created by clearing forests. Replacing beef with chicken or plant proteins reduces food footprint immensely.</p>`
  },
  {
    keywords: ['calculator', 'score', 'footprint', 'total', 'tonnes'],
    response: `<p>I can analyze your footprint anytime! Make sure you complete the survey in the <a href="#" onclick="switchTab('calculator'); return false;" class="inline-link">Calculator tab</a>. I will automatically adapt my suggestions to point out where you can save the most carbon.</p>`
  }
];

// Core function to suggest template prompts
function suggestPrompt(actionType) {
  addMessage(actionType === 'analyze' ? 'Analyze my current footprint' : `Tell me about ${actionType} strategies`, 'user');
  
  // Simulated loading indicator
  showBotTyping(() => {
    let responseText = '';
    const calcState = window.getCalculatorState ? window.getCalculatorState() : null;
    
    if (actionType === 'analyze') {
      responseText = BOT_TEMPLATES.analyze(calcState);
    } else if (BOT_TEMPLATES[actionType]) {
      responseText = BOT_TEMPLATES[actionType]();
    } else {
      responseText = `<p>I'm happy to discuss that strategy. Let's look into how it helps reduce overall emissions.</p>`;
    }
    
    addMessage(responseText, 'bot');
  });
}

// Process user natural language text query
function handleChatInput(userText) {
  if (!userText.trim()) return;
  
  addMessage(userText, 'user');
  
  showBotTyping(() => {
    const textLower = userText.toLowerCase();
    let matchedResponse = null;
    
    // Search keyword database
    for (const item of KEYWORD_RESPONSES) {
      const match = item.keywords.some(kw => textLower.includes(kw));
      if (match) {
        matchedResponse = item.response;
        break;
      }
    }
    
    // Fallback response if no keywords found
    if (!matchedResponse) {
      matchedResponse = `<p>Interesting question about environmental action. While I might not have a specific database entry for that exact phrase, carbon reduction typically comes down to four core pillars:</p>
                         <p>1. <strong>Transportation</strong>: Fly less, transit more, drive efficiently.
                         <br>2. <strong>Household utility</strong>: Turn off standby drawers, insulate, opt for green power.
                         <br>3. <strong>Diet</strong>: Focus on plants, buy local, and reduce food waste.
                         <br>4. <strong>Consumption</strong>: Buy less, buy durable, and recycle strictly.</p>
                         <p>Try completing the <a href="#" onclick="switchTab('calculator'); return false;" class="inline-link">Footprint Assessment</a> to help me give you more precise recommendations!</p>`;
    }
    
    addMessage(matchedResponse, 'bot');
  });
}

// Helper: Show bot typing animation before printing response
function showBotTyping(callback) {
  const chatViewport = document.getElementById("chat-viewport");
  
  const typingDiv = document.createElement("div");
  typingDiv.className = "message message-bot typing-indicator-msg";
  typingDiv.id = "bot-typing-indicator";
  typingDiv.innerHTML = `
    <div class="message-bubble" style="padding: 10px 14px; display: flex; gap: 4px;">
      <span class="typing-dot" style="width: 6px; height: 6px; border-radius:50%; background:var(--text-secondary); animation: bounceTyping 1.2s infinite 0s;"></span>
      <span class="typing-dot" style="width: 6px; height: 6px; border-radius:50%; background:var(--text-secondary); animation: bounceTyping 1.2s infinite 0.2s;"></span>
      <span class="typing-dot" style="width: 6px; height: 6px; border-radius:50%; background:var(--text-secondary); animation: bounceTyping 1.2s infinite 0.4s;"></span>
    </div>
  `;
  
  // Style injection dynamically for typing dots bounce
  if (!document.getElementById("typing-bounce-css")) {
    const style = document.createElement("style");
    style.id = "typing-bounce-css";
    style.innerHTML = `
      @keyframes bounceTyping {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
    `;
    document.head.appendChild(style);
  }
  
  chatViewport.appendChild(typingDiv);
  chatViewport.scrollTop = chatViewport.scrollHeight;
  
  // Simulate delay
  setTimeout(() => {
    const indicator = document.getElementById("bot-typing-indicator");
    if (indicator) indicator.remove();
    callback();
  }, 750);
}

// Helper: Append chat message bubble to viewport
function addMessage(htmlContent, sender) {
  const chatViewport = document.getElementById("chat-viewport");
  if (!chatViewport) return;
  
  const msgDiv = document.createElement("div");
  msgDiv.className = `message message-${sender}`;
  
  // Timestamp
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  msgDiv.innerHTML = `
    <div class="message-bubble">
      ${htmlContent}
    </div>
    <span class="message-time">${timeStr}</span>
  `;
  
  chatViewport.appendChild(msgDiv);
  chatViewport.scrollTop = chatViewport.scrollHeight;
}

// Hook form submit
function handleChatSubmit(event) {
  event.preventDefault();
  const input = document.getElementById("chat-input-field");
  const val = input.value.trim();
  if (val) {
    handleChatInput(val);
    input.value = "";
  }
}

// Trigger welcome message on calculator submit or initial load
function triggerAssistantGreeting(name) {
  const welcomeStr = BOT_TEMPLATES.welcome(name);
  addMessage(welcomeStr, 'bot');
  
  // Activate tab indicator to alert user of new message
  const indicator = document.querySelector(".assistant-tab-indicator");
  if (indicator && !document.getElementById("tab-assistant").classList.contains("active")) {
    indicator.style.display = "block";
  }
}
