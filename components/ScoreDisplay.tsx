import React from 'react';

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  const getScoreColor = (s: number): string => {
    if (s >= 8) return 'from-green-400 to-cyan-400 shadow-green-400/50';
    if (s >= 5) return 'from-yellow-400 to-orange-400 shadow-yellow-400/50';
    return 'from-red-500 to-pink-500 shadow-red-500/50';
  };
  
  const scoreColorClasses = getScoreColor(score);

  return (
    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg bg-gradient-to-br text-white ${scoreColorClasses}`}>
      {score}
    </div>
  );
};

export default ScoreDisplay;