import React, { useState, useRef, useEffect } from 'react';
import type { ConsultantMessage } from '../types';
import LoadingSpinner from './LoadingSpinner';
import SendIcon from './icons/SendIcon';
import LightbulbIcon from './icons/LightbulbIcon';

interface AiConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ConsultantMessage[];
  onAsk: (question: string) => void;
  isLoading: boolean;
  error: string | null;
}

const AiConsultantModal: React.FC<AiConsultantModalProps> = ({ isOpen, onClose, messages, onAsk, isLoading, error }) => {
  const [question, setQuestion] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onAsk(question);
      setQuestion('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-slate-900/70 backdrop-blur-lg border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <LightbulbIcon className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-slate-200">AI Recruitment Consultant</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-2xl">&times;</button>
        </header>
        
        <main className="flex-grow p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 p-8">
                <p>Welcome! I'm your AI Recruitment Consultant.</p>
                <p className="text-sm mt-2">Ask me anything about your job description or how to screen candidates!</p>
                <p className="text-sm mt-1">e.g., "How can I improve my job description?"</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-prose p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                  <div className="max-w-prose p-3 rounded-lg bg-slate-700 text-slate-200">
                    <LoadingSpinner />
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
           {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </main>

        <footer className="p-4 border-t border-slate-700">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask for advice..."
              className="w-full p-2 bg-slate-800 text-slate-200 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-300"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="bg-cyan-500 text-white p-2 rounded-lg shadow-glow shadow-cyan-500/50 hover:shadow-glow-lg hover:shadow-cyan-500/50 disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300"
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default AiConsultantModal;