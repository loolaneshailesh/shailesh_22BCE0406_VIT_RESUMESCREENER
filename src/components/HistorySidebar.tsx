import React from 'react';
import type { HistoryEntry } from '../types';
import HistoryIcon from './icons/HistoryIcon';
import TrashIcon from './icons/TrashIcon';
import ClockIcon from './icons/ClockIcon';

interface HistorySidebarProps {
  history: HistoryEntry[];
  onLoadEntry: (entry: HistoryEntry) => void;
  onDeleteEntry: (id: string) => void;
  onClearHistory: () => void;
  currentJobDescription: string; // To highlight the active item
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  history,
  onLoadEntry,
  onDeleteEntry,
  onClearHistory,
  currentJobDescription,
}) => {
  return (
    <aside className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-lg p-4 flex flex-col h-full max-h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <HistoryIcon className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-200">Session Archives</h2>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-sm text-red-400 hover:text-red-300 font-semibold"
            aria-label="Clear all history"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        {history.length === 0 ? (
          <div className="text-center text-slate-400 pt-10">
            <p>No archives found.</p>
            <p className="text-sm mt-1">Completed scans will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {history.map(entry => {
              const isActive = entry.jobDescription === currentJobDescription && 
                               entry.analysisResults?.length > 0;
              return (
                <li key={entry.id} className="group">
                  <div
                    onClick={() => onLoadEntry(entry)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                      isActive
                        ? 'bg-cyan-500/10 border border-cyan-500'
                        : 'bg-slate-800/50 hover:bg-slate-700/70'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className={`font-semibold text-sm truncate pr-2 ${isActive ? 'text-cyan-300' : 'text-slate-200'}`} title={entry.title}>
                        {entry.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEntry(entry.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-opacity"
                        aria-label="Delete this entry"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
                      <ClockIcon className="w-3 h-3" />
                      <span>{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default HistorySidebar;