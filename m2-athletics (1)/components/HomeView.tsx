import React, { useEffect, useState, useRef } from 'react';
import { WorkoutLog, WorkoutTemplate } from '../types';
import { loadLogs, loadTemplate, loadGoal, saveGoal, loadProfileImage, saveProfileImage } from '../services/storageService';
import { INITIAL_WORKOUT } from '../constants';

interface HomeViewProps {
  onStartWorkout: (template?: WorkoutTemplate) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onStartWorkout }) => {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedHistoryLog, setSelectedHistoryLog] = useState<WorkoutLog | null>(null);
  const [currentGoal, setCurrentGoal] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLogs(loadLogs());
    setCurrentGoal(loadGoal());
    setProfileImage(loadProfileImage());
  }, []);

  const handleGoalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCurrentGoal(e.target.value);
      saveGoal(e.target.value);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        saveProfileImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const totalSessions = logs.length;

  const handleStartClick = () => {
      setShowSelector(true);
  };

  const handleSelectTemplate = (source: 'CURRENT' | 'DEFAULT' | WorkoutLog) => {
      setShowSelector(false);
      if (source === 'CURRENT') {
          onStartWorkout(); 
      } else if (source === 'DEFAULT') {
          onStartWorkout(INITIAL_WORKOUT);
      } else {
          const template: WorkoutTemplate = {
              id: Date.now().toString(),
              name: source.templateName,
              exercises: source.exercises,
              startTime: undefined // Reset time for new workout
          };
          onStartWorkout(template);
      }
  };

  const formatDuration = (seconds: number) => {
      if (!seconds) return "0m";
      const m = Math.floor(seconds / 60);
      return `${m}m`;
  }

  return (
    <div className="pb-24 pt-8 px-4 h-full overflow-y-auto no-scrollbar flex flex-col bg-black text-zinc-200">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          {/* Metal text applied to spans separately to allow sup to have distinct color */}
          <h1 className="text-4xl font-black italic tracking-tighter">
            <span className="metal-text">M</span>
            <sup className="text-2xl text-yellow-400" style={{ WebkitTextFillColor: '#facc15' }}>2</sup>
            <span className="metal-text">-ATHLETICS</span>
          </h1>
        </div>
        
        {/* Profile Picture / Upload */}
        <div 
          onClick={triggerFileInput}
          className="h-12 w-12 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shadow-inner overflow-hidden cursor-pointer relative group"
        >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <i className="fas fa-user text-zinc-600 group-hover:text-yellow-500 transition-colors"></i>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
        </div>
      </div>

      {/* Stats/Goal Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-lg">
            <div className="text-zinc-500 text-[10px] uppercase font-bold mb-1 tracking-widest">Sessions</div>
            <div className="text-3xl font-mono font-bold text-white">{totalSessions}</div>
        </div>
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-lg flex flex-col">
            <div className="text-zinc-500 text-[10px] uppercase font-bold mb-1 tracking-widest text-yellow-500">Current Goal</div>
            <textarea 
                value={currentGoal}
                onChange={handleGoalChange}
                placeholder="Enter goal..."
                className="bg-transparent text-sm text-zinc-200 w-full h-full resize-none focus:outline-none placeholder-zinc-700"
            />
        </div>
      </div>

      {/* Quick Start */}
      <button 
        onClick={handleStartClick}
        className="w-full bg-yellow-500 hover:bg-yellow-400 py-5 rounded-xl font-black text-black text-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] mb-10 active:scale-[0.98] transition-transform flex items-center justify-center gap-3 uppercase tracking-wider skew-x-[-2deg]"
      >
        <i className="fas fa-play text-sm"></i>
        Start Session
      </button>

      {/* History Feed */}
      <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Log History</h2>
      
      {logs.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
            <p className="text-zinc-600 font-mono">No data found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.slice(0, 10).map((log) => (
            <div 
                key={log.id} 
                onClick={() => setSelectedHistoryLog(log)}
                className="bg-zinc-900 p-4 rounded-lg border-l-4 border-l-zinc-700 hover:border-l-yellow-500 hover:bg-zinc-800 transition-all cursor-pointer flex justify-between items-center group"
            >
                <div>
                    <h3 className="font-bold text-zinc-200 group-hover:text-white">{log.templateName}</h3>
                    <p className="text-xs text-zinc-500 font-mono mt-1">
                        {new Date(log.date).toLocaleDateString()} • <span className="text-zinc-600">{formatDuration(log.durationSeconds)}</span>
                    </p>
                </div>
                <div className="text-right">
                    <span className="block text-yellow-600 font-bold text-sm">{log.exercises.length} Exercises</span>
                </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Start Workout Selection */}
      {showSelector && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-zinc-900 w-full max-w-sm rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-white">Select Template</h3>
                      <button onClick={() => setShowSelector(false)}><i className="fas fa-times text-zinc-500"></i></button>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                      <button 
                        onClick={() => handleSelectTemplate('CURRENT')}
                        className="w-full text-left p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 group"
                      >
                          <div className="font-bold text-yellow-500">Resume Last Session</div>
                          <div className="text-xs text-zinc-500">Continue where you left off</div>
                      </button>

                      <button 
                        onClick={() => handleSelectTemplate('DEFAULT')}
                        className="w-full text-left p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700"
                      >
                          <div className="font-bold text-white">Default Push Day</div>
                          <div className="text-xs text-zinc-500">Standard template</div>
                      </button>

                      <div className="text-xs font-bold text-zinc-600 uppercase mt-4 px-2">Copy from History</div>
                      {logs.slice(0, 5).map(log => (
                          <button 
                            key={log.id}
                            onClick={() => handleSelectTemplate(log)}
                            className="w-full text-left p-3 bg-black hover:bg-zinc-800 rounded border border-zinc-800 flex justify-between"
                          >
                              <span className="text-zinc-300 text-sm font-bold">{log.templateName}</span>
                              <span className="text-zinc-600 text-xs">{new Date(log.date).toLocaleDateString()}</span>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Modal: History Details */}
      {selectedHistoryLog && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col p-6 animate-fade-in">
             <div className="flex justify-between items-start mb-6 border-b border-zinc-800 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">{selectedHistoryLog.templateName}</h2>
                    <p className="text-yellow-500 text-sm font-mono">
                        {new Date(selectedHistoryLog.date).toLocaleString()}
                        <span className="ml-3 text-zinc-500"><i className="fas fa-clock mr-1"></i>{formatDuration(selectedHistoryLog.durationSeconds)}</span>
                    </p>
                </div>
                <button 
                    onClick={() => setSelectedHistoryLog(null)}
                    className="h-8 w-8 bg-zinc-800 rounded-full flex items-center justify-center"
                >
                    <i className="fas fa-times text-zinc-400"></i>
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                 {selectedHistoryLog.exercises.map((ex, i) => (
                     <div key={i} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                         <h4 className="font-bold text-zinc-300 mb-2">{ex.name}</h4>
                         <div className="space-y-1">
                             {ex.sets.map((s, j) => (
                                 <div key={j} className={`flex justify-between text-xs font-mono border-b border-zinc-800/50 pb-1 last:border-0 ${s.completed ? 'text-zinc-400' : 'text-zinc-700'}`}>
                                     <span>Set {j+1}</span>
                                     <span>
                                        {s.weight}kg x {s.repsOrDuration}{ex.type === 'DURATION_WEIGHT' ? 's' : ''}
                                        {s.completed && <i className="fas fa-check ml-2 text-yellow-600"></i>}
                                     </span>
                                 </div>
                             ))}
                         </div>
                     </div>
                 ))}
             </div>
             
             <button 
                onClick={() => {
                    handleSelectTemplate(selectedHistoryLog);
                    setSelectedHistoryLog(null);
                }}
                className="mt-4 w-full bg-zinc-800 border border-yellow-600/30 text-yellow-500 py-3 rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-zinc-700"
            >
                Copy This Workout
             </button>
        </div>
      )}
    </div>
  );
};

export default HomeView;