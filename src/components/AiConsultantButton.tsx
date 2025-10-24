import React from 'react';
import LightbulbIcon from './icons/LightbulbIcon';

interface AiConsultantButtonProps {
  onClick: () => void;
}

const AiConsultantButton: React.FC<AiConsultantButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-cyan-500 text-white w-20 h-20 rounded-full shadow-glow shadow-cyan-500/50 hover:shadow-glow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400 transition-all duration-300 flex items-center justify-center z-50 animate-pulse-glow"
      aria-label="Ask AI Recruitment Consultant"
    >
        <div className="flex items-center justify-center flex-col text-xs font-bold">
            <LightbulbIcon className="w-8 h-8" />
            <span>Ask AI</span>
        </div>
    </button>
  );
};

export default AiConsultantButton;