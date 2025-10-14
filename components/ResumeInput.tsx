import React, { useState } from 'react';
import type { Resume } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ResumeInputProps {
  resumes: Resume[];
  onAddResume: (text: string) => void;
  onRemoveResume: (id: string) => void;
  onFileChange: (files: FileList | null) => void;
  isParsing: boolean;
}

const ResumeInput: React.FC<ResumeInputProps> = ({ resumes, onAddResume, onRemoveResume, onFileChange, isParsing }) => {
  const [pastedText, setPastedText] = useState('');
  
  const handleAddClick = () => {
    onAddResume(pastedText);
    setPastedText('');
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-2 text-slate-200">Candidate Resumes</h2>
      <p className="text-sm text-slate-400 mb-4">Upload text or PDF files, or paste resume content below.</p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <label className={`w-full flex-1 font-bold py-2 px-4 rounded-lg text-center transition-all duration-300 ${isParsing ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-slate-800/50 hover:bg-slate-700 border border-slate-600 text-slate-300 cursor-pointer'}`}>
          {isParsing ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              Parsing Datapads...
            </span>
          ) : (
            'Upload Files (.txt, .pdf)'
          )}
          <input 
            type="file" 
            className="hidden" 
            accept=".txt,.pdf" 
            multiple 
            onChange={(e) => onFileChange(e.target.files)}
            disabled={isParsing}
          />
        </label>
      </div>

      <div className="mb-4">
        <textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Or paste resume text here..."
          className="w-full h-24 p-3 bg-slate-800/50 text-slate-200 border border-slate-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-300"
        />
        <button
          onClick={handleAddClick}
          disabled={!pastedText.trim()}
          className="mt-2 w-full bg-pink-600 text-white font-bold py-2 px-4 rounded-lg shadow-glow shadow-pink-600/50 hover:shadow-glow-lg hover:shadow-pink-600/50 disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300"
        >
          Add Pasted Resume
        </button>
      </div>

      <div className="space-y-2">
        {resumes.map((resume, index) => (
          <div key={resume.id} className="flex items-center justify-between bg-slate-800/60 p-2 rounded-md">
            <span className="text-sm font-medium truncate text-slate-300" title={resume.fileName}>
              {index + 1}. {resume.fileName}
            </span>
            <button
              onClick={() => onRemoveResume(resume.id)}
              className="text-red-400 hover:text-red-300 font-bold text-lg p-1"
              aria-label="Remove resume"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeInput;