import React, { useState, useEffect } from 'react';
import { analyzeResumes, askConsultant, verifyApiKey } from './services/geminiService';
import { parseFile } from './services/fileParsers';
import type { Candidate, Resume, HistoryEntry, ConsultantMessage } from './types';
import { useHistory } from './hooks/useHistory';

import Header from './components/Header';
import JobDescriptionInput from './components/JobDescriptionInput';
import ResumeInput from './components/ResumeInput';
import CandidateCard from './components/CandidateCard';
import LoadingSpinner from './components/LoadingSpinner';
import Placeholder from './components/Placeholder';
import ErrorDisplay from './components/ErrorDisplay';
import HistorySidebar from './components/HistorySidebar';
import AiConsultantButton from './components/AiConsultantButton';
import AiConsultantModal from './components/AiConsultantModal';
import FallingStarsBackground from './components/FallingStarsBackground';
import ResumeBuilder from './components/ResumeBuilder';

type ActiveView = 'screener' | 'builder';
type ApiKeyStatus = 'verifying' | 'valid' | 'invalid' | 'hidden';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('screener');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [analysisResults, setAnalysisResults] = useState<Candidate[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // API Key Status State
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>('verifying');
  const [maskedApiKey, setMaskedApiKey] = useState<string | null>(null);

  // AI Consultant State
  const [isConsultantModalOpen, setIsConsultantModalOpen] = useState(false);
  const [consultantMessages, setConsultantMessages] = useState<ConsultantMessage[]>([]);
  const [isConsultantLoading, setIsConsultantLoading] = useState(false);
  const [consultantError, setConsultantError] = useState<string | null>(null);

  const { history, addHistoryEntry, removeHistoryEntry, clearHistory } = useHistory();

  useEffect(() => {
    // Vite exposes env variables to the client with the `VITE_` prefix
    const key = import.meta.env.VITE_API_KEY as string;
    if (key) {
      // Create a masked version for safe display
      const masked = `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
      setMaskedApiKey(masked);
    }

    const checkApiKey = async () => {
      try {
        await verifyApiKey();
        setApiKeyStatus('valid');
        setTimeout(() => setApiKeyStatus('hidden'), 4000); // Hide after 4 seconds
      } catch (err: any) {
        setApiKeyStatus('invalid');
      }
    };
    checkApiKey();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleAddResume = (text: string) => {
    if (text.trim()) {
      const newResume: Resume = {
        id: `resume_${Date.now()}_${resumes.length + 1}`,
        text,
        fileName: `Pasted Resume ${resumes.length + 1}`,
      };
      setResumes(prev => [...prev, newResume]);
      setAnalysisResults(null); // Clear results when resumes change
    }
  };
  
  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsParsing(true);
    setError(null);
    setAnalysisResults(null);

    try {
      const parsedResumesPromises = Array.from(files).map(async (file) => {
        const text = await parseFile(file);
        return {
          id: `resume_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          text,
          fileName: file.name,
        };
      });

      const newResumes = await Promise.all(parsedResumesPromises);
      setResumes(prev => [...prev, ...newResumes.filter(r => r.text.trim())]);
    } catch (err: any) {
      setError(err.message || 'An error occurred while parsing the files.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleRemoveResume = (id: string) => {
    setResumes(prev => prev.filter(r => r.id !== id));
    setAnalysisResults(null); // Clear results when resumes change
  };
  
  const handleJobDescriptionChange = (value: string) => {
    setJobDescription(value);
    setAnalysisResults(null); // Clear results when JD changes
  };

  const handleScreenResumes = async () => {
    if (!jobDescription.trim() || resumes.length === 0) {
      setError('Please provide a job description and at least one resume.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setAnalysisResults(null);

    try {
      const results = await analyzeResumes(jobDescription, resumes);
      results.sort((a, b) => b.matchScore - a.matchScore);
      setAnalysisResults(results);
      // Save to history on success
      addHistoryEntry({ jobDescription, resumes, analysisResults: results });
    } catch (err: any)      {
      console.error("Screening Error:", err);
      // Use a more specific error message from the service if available
      setError(err.message || 'An error occurred during analysis. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadHistoryEntry = (entry: HistoryEntry) => {
    setJobDescription(entry.jobDescription);
    setResumes(entry.resumes);
    setAnalysisResults(entry.analysisResults);
    setError(null);
    setIsLoading(false);
    setActiveView('screener'); // Switch back to screener view when loading history
  };

  const handleAskConsultant = async (question: string) => {
    const newMessages: ConsultantMessage[] = [...consultantMessages, { role: 'user', content: question }];
    setConsultantMessages(newMessages);
    setIsConsultantLoading(true);
    setConsultantError(null);

    try {
      const response = await askConsultant(jobDescription, resumes, newMessages);
      setConsultantMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err: any) {
      setConsultantError(err.message || "An error occurred while talking to the consultant.");
    } finally {
      setIsConsultantLoading(false);
    }
  };

  const canScreen = jobDescription.trim().length > 0 && resumes.length > 0 && !isLoading && !isParsing;

  return (
    <div className="min-h-screen text-slate-100 font-sans">
      {apiKeyStatus === 'verifying' && (
        <div className="bg-yellow-600/80 text-center p-2 text-sm font-semibold animate-pulse sticky top-0 z-50">
          Verifying API Key connection...
        </div>
      )}
      {apiKeyStatus === 'valid' && (
        <div className="bg-green-600/80 text-center p-2 text-sm font-semibold sticky top-0 z-50">
          ✅ API Key connection successful!
        </div>
      )}
      {apiKeyStatus === 'invalid' && (
        <div className="bg-red-700/80 text-white p-4 text-center sticky top-0 z-50 space-y-2">
          <h3 className="font-bold text-lg">API Key Connection Failed</h3>
          
          {maskedApiKey ? (
            <p className="text-sm font-mono bg-red-900/50 py-1 px-2 rounded-md inline-block">
              Attempted to use key: <strong>{maskedApiKey}</strong>
            </p>
          ) : (
            <p className="text-sm font-mono bg-red-900/50 py-1 px-2 rounded-md inline-block">
              VITE_API_KEY not found in .env file.
            </p>
          )}

          <p className="text-sm">
            This confirms your <strong>.env file is being read correctly</strong>. The issue is with the key itself or your Google Cloud project.
          </p>
          <p className="text-xs">
            Please <strong><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-bold">create a new API key</a></strong> and check your <strong><a href="https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">Google Cloud project settings</a></strong> (API enabled & billing active). Remember to restart the server after changing the .env file.
          </p>
        </div>
      )}
      <FallingStarsBackground />
      <Header activeView={activeView} setActiveView={setActiveView} />
      <div className="container mx-auto p-4 md:p-8 relative">
        {activeView === 'screener' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: History */}
            <div className="lg:col-span-3">
               <HistorySidebar 
                  history={history}
                  onLoadEntry={handleLoadHistoryEntry}
                  onDeleteEntry={removeHistoryEntry}
                  onClearHistory={clearHistory}
                  currentJobDescription={jobDescription}
               />
            </div>
            
            {/* Main Content */}
            <main className="lg:col-span-9 grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Inputs Column */}
              <div className="flex flex-col gap-6">
                <JobDescriptionInput value={jobDescription} onChange={handleJobDescriptionChange} />
                <ResumeInput 
                  resumes={resumes} 
                  onAddResume={handleAddResume} 
                  onRemoveResume={handleRemoveResume}
                  onFileChange={handleFileChange}
                  isParsing={isParsing}
                />
                <button
                  onClick={handleScreenResumes}
                  disabled={!canScreen}
                  className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg shadow-glow shadow-cyan-500/50 hover:shadow-glow-lg hover:shadow-cyan-500/50 disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      Scanning Sector...
                    </>
                  ) : (
                    'Engage Hyperdrive'
                  )}
                </button>
              </div>
              
              {/* Results Column */}
              <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 p-6 rounded-lg min-h-[600px] flex flex-col">
                <h2 className="text-2xl font-bold mb-4 text-slate-200">Analysis Results</h2>
                <div className="flex-grow relative">
                  {isLoading && (
                     <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-lg z-10">
                        <div className="text-center">
                            <LoadingSpinner />
                            <p className="mt-2 text-lg font-semibold text-cyan-400">Analyzing candidates...</p>
                        </div>
                     </div>
                  )}
                  {error && <ErrorDisplay message={error} />}
                  {!isLoading && !error && analysisResults && (
                    <div className="space-y-4 overflow-y-auto max-h-[70vh] p-1">
                      {analysisResults.map((candidate) => {
                         const originalResume = resumes.find(r => r.id === candidate.id);
                         if (!originalResume) return null;
                         return (
                           <CandidateCard 
                             key={candidate.id} 
                             candidate={candidate} 
                             resumeText={originalResume.text}
                             jobDescription={jobDescription}
                           />
                         )
                      })}
                    </div>
                  )}
                  {!isLoading && !error && !analysisResults && (
                    <Placeholder />
                  )}
                </div>
              </div>
            </main>
          </div>
        )}

        {activeView === 'builder' && <ResumeBuilder />}
      </div>

      {activeView === 'screener' && <AiConsultantButton onClick={() => setIsConsultantModalOpen(true)} />}
      <AiConsultantModal
        isOpen={isConsultantModalOpen}
        onClose={() => setIsConsultantModalOpen(false)}
        messages={consultantMessages}
        onAsk={handleAskConsultant}
        isLoading={isConsultantLoading}
        error={consultantError}
      />
    </div>
  );
};

export default App;