import React from 'react';

const Placeholder: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="text-lg font-semibold">Awaiting Input</h3>
      <p className="max-w-xs mt-1">Analysis of candidate datapads will appear here.</p>
    </div>
  );
};

export default Placeholder;