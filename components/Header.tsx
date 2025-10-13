import React from 'react';

type ActiveView = 'screener' | 'builder';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
  const NavButton: React.FC<{ view: ActiveView; children: React.ReactNode }> = ({ view, children }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`px-4 py-2 rounded-md text-sm font-bold transition-colors duration-300 ${
        activeView === view
          ? 'bg-cyan-500/20 text-cyan-300'
          : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  );

  return (
    <header className="bg-slate-900/50 backdrop-blur-md border-b border-cyan-300/20 sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-300 text-shadow-glow shadow-cyan-300/50">
            Smart Resume Screener
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            Your AI-powered career co-pilot.
          </p>
        </div>
        <nav className="flex items-center gap-2 p-1 bg-slate-800/50 border border-slate-700 rounded-lg">
          <NavButton view="screener">Resume Screener</NavButton>
          <NavButton view="builder">Resume Builder</NavButton>
        </nav>
      </div>
    </header>
  );
};

export default Header;