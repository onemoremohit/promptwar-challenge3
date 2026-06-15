// src/components/ChatBot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { evaluateCarbonFootprint } from '../utils/carbonEngine';
import type { UserContext } from '../utils/carbonEngine';
import { sanitizeString } from '../utils/sanitizer';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  html: string;
  time: string;
}

interface ChatBotProps {
  userData: UserContext;
  userName: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ userData, userName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      html: `<p>Hello, <strong>${userName}</strong>! I am <strong>Eco-Bot</strong>, your dynamic climate advisor. I can parse your footprint and suggest tailored reduction plans.</p>
             <p>Select a quick prompt or type your question below!</p>`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addBotResponse = (html: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          html,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 750);
  };

  const handleSend = (text: string) => {
    const cleanText = sanitizeString(text);
    if (!cleanText) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        html: `<p>${cleanText}</p>`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInputText('');

    // Logic parsing
    const lower = cleanText.toLowerCase();
    let reply = '';

    if (lower.includes('analyze') || lower.includes('footprint') || lower.includes('calculate')) {
      const report = evaluateCarbonFootprint(userData);
      reply = `<p><strong>Analysis Engine Output:</strong> Your annual footprint is estimated at <strong>${report.totalEmissionsTons} tonnes</strong> of CO2e.</p>
               <p>Your sustainability rating matches <strong>${report.tier}</strong>.</p>
               ${
                 report.recommendations.length > 0
                   ? `<p><strong>High Impact Tasks:</strong><br>${report.recommendations.map(r => `• ${r}`).join('<br>')}</p>`
                   : `<p>You are scoring exceptionally well! Keep maintaining these habits to stay below carbon thresholds.</p>`
               }`;
    } else if (lower.includes('offset') || lower.includes('credit') || lower.includes('capture')) {
      reply = `<p><strong>Carbon Offsetting:</strong></p>
               <p>Offsets allow you to compensate for emissions by funding global climate projects (e.g. planting forests, captured methane). One offset equals one metric tonne of CO2e avoided. Reduction should always be prioritized over compensation!</p>`;
    } else if (lower.includes('solar') || lower.includes('wind') || lower.includes('electric') || lower.includes('power')) {
      reply = `<p><strong>Renewables & Grid utilities:</strong></p>
               <p>Switching your electricity grid utility to a renewable plan reduces your electricity emission intensity by up to 90%, yielding high score boosts instantly.</p>`;
    } else if (lower.includes('meat') || lower.includes('beef') || lower.includes('vegan') || lower.includes('plant')) {
      reply = `<p><strong>Food & Nutrition Footprint:</strong></p>
               <p>Standard heavy meat consumption accounts for ~2.19 tonnes CO2e/year per person, while a plant-based day drops it to ~0.55 tonnes. Reducing beef intake is one of the single fastest dietary savings actions.</p>`;
    } else {
      reply = `<p>That is an interesting question about climate action. Remember, our platform targets reduction across three primary sectors:</p>
               <p>• <strong>Transport</strong>: Reducing driving, choosing public transit, or hybrid vehicles.
               <br>• <strong>Utilities</strong>: Insulating rooms and opting for solar energy.
               <br>• <strong>Diet</strong>: Adopting plant-based eating and composting waste.</p>`;
    }

    addBotResponse(reply);
  };

  const handleSuggestion = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="assistant-terminal glass-card" role="region" aria-label="Eco-Bot Chat Window">
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="bot-identity">
          <div className="avatar-holder pulsing-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="avatar-icon text-emerald" aria-hidden="true"><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/><path d="M12 4v4"/></svg>
          </div>
          <div>
            <h3>Eco-Bot Advisor</h3>
            <div className="online-indicator">
              <span className="dot"></span>
              <span>Interactive Decision node</span>
            </div>
          </div>
        </div>
        <div className="bot-capabilities">
          <span className="tag">Context Insights</span>
          <span className="tag">Offset Strategies</span>
        </div>
      </div>

      {/* Messages Viewport */}
      <div className="chat-viewport" ref={viewportRef} aria-live="polite">
        {messages.map((msg) => (
          <div key={msg.id} className={`message message-${msg.sender}`}>
            <div className="message-bubble" dangerouslySetInnerHTML={{ __html: msg.html }}></div>
            <span className="message-time">{msg.time}</span>
          </div>
        ))}

        {isTyping && (
          <div className="message message-bot" id="bot-typing-indicator" aria-label="Eco-Bot is typing response">
            <div className="message-bubble" style={{ padding: '10px 14px', display: 'flex', gap: '4px' }}>
              <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-secondary)', animation: 'bounceTyping 1.2s infinite 0s' }}></span>
              <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-secondary)', animation: 'bounceTyping 1.2s infinite 0.2s' }}></span>
              <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-secondary)', animation: 'bounceTyping 1.2s infinite 0.4s' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions Row */}
      <div className="chat-suggestions">
        <button className="btn btn-secondary btn-sm" onClick={() => handleSuggestion("Analyze my footprint")}>
          Analyze Profile
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => handleSuggestion("How do carbon offsets work?")}>
          Offsets Guide
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => handleSuggestion("Tell me about green energy options")}>
          Green Power info
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => handleSuggestion("What is the footprint of beef?")}>
          Beef footprint
        </button>
      </div>

      {/* Chat Input */}
      <div className="chat-input-area">
        <form
          className="chat-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
        >
          <input
            type="text"
            className="form-control"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask a question about carbon reduction, offset schemes, solar..."
            aria-label="Ask Eco-Bot a question"
          />
          <button type="submit" className="btn btn-primary btn-icon" aria-label="Send message to Eco-Bot">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
};
