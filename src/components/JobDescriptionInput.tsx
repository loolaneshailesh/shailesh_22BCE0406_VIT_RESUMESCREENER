import React from 'react';
import PresetRolesSelector from './PresetRolesSelector';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({ value, onChange }) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 p-6 rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
        <label htmlFor="job-description" className="block text-xl font-bold text-slate-200">
          Job Description
        </label>
        <PresetRolesSelector onSelect={onChange} />
      </div>
      <p className="text-sm text-slate-400 mb-4">Select a preset role or paste the mission parameters below.</p>
      <textarea
        id="job-description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Senior React Developer with experience in TypeScript and Next.js..."
        className="w-full h-48 p-3 bg-slate-800/50 text-slate-200 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-300"
      />
    </div>
  );
};

export default JobDescriptionInput;