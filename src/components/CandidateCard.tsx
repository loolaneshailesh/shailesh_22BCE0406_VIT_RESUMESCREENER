import React, { useState } from 'react';
import type { Candidate } from '../types';
import ScoreDisplay from './ScoreDisplay';
import { askQuestionAboutResume } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import SparklesIcon from './icons/SparklesIcon';

interface CandidateCardProps {
  candidate: Candidate;
  resumeText: string;
  jobDescription: string;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, resumeText, jobDescription }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setIsAsking(true);
    setAnswer(null);
    setAskError(null);

    try {
      const result = await askQuestionAboutResume(resumeText, question, jobDescription);
      setAnswer(result);
    } catch (err: any) {
      setAskError(err.message || 'An error occurred.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-lg border border-slate-700 shadow-sm transition-all hover:shadow-glow hover:shadow-cyan-500/30 hover:border-cyan-500/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-cyan-400">{candidate.name}</h3>
          <p className="text-sm font-medium text-slate-300">Match Score</p>
        </div>
        <ScoreDisplay score={candidate.matchScore} />
      </div>

      <div className="mt-4">
        <h4 className="font-semibold text-slate-200">Justification</h4>
        <p className="text-sm text-slate-400 mt-1">{candidate.justification}</p>
      </div>
      
      <div className="mt-4">
        <h4 className="font-semibold text-slate-200">Experience Summary</h4>
        <p className="text-sm text-slate-400 mt-1">{candidate.extractedExperienceSummary}</p>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold text-slate-200 mb-2">Relevant Skills</h4>
        <div className="flex flex-wrap gap-2">
          {candidate.extractedSkills.map((skill, index) => (
            <span key={index} className="bg-pink-500/20 text-pink-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-pink-500/30 shadow-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      {/* AI Assistant Q&A Section */}
      <div className="mt-5 pt-5 border-t border-slate-700">
        <h4 className="font-semibold text-slate-200 mb-2">Ask AI Assistant</h4>
        <div className="flex flex-col gap-2">
           <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`e.g., "How can I enhance this candidate's profile for this role?"`}
            className="w-full h-20 p-2 bg-slate-800/50 text-slate-200 border border-slate-600 rounded-md focus:ring-2 focus:ring-pink-500 transition-colors duration-300 text-sm"
            disabled={isAsking}
          />
          <button
            onClick={handleAskQuestion}
            disabled={!question.trim() || isAsking}
            className="w-full bg-pink-600 text-white font-bold py-2 px-4 rounded-lg shadow-glow shadow-pink-600/50 hover:shadow-glow-lg hover:shadow-pink-600/50 disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isAsking ? (
              <>
                <LoadingSpinner />
                Querying...
              </>
            ) : (
               <>
                <SparklesIcon className="w-5 h-5" />
                Ask Question
               </>
            )}
          </button>
        </div>
        
        {askError && (
          <p className="mt-3 text-sm text-red-400 bg-red-900/40 p-2 rounded-md">{askError}</p>
        )}

        {answer && (
          <div className="mt-3 p-3 bg-slate-800/70 rounded-lg">
            <h5 className="font-bold text-sm text-cyan-400">Answer:</h5>
            <p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap">{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;