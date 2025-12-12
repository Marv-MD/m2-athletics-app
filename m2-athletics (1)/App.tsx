import React, { useState } from 'react';
import { AppTab, WorkoutTemplate } from './types';
import HomeView from './components/HomeView';
import WorkoutView from './components/WorkoutView';
import SkillTreeView from './components/SkillTreeView';
import ProgressView from './components/ProgressView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [pendingTemplate, setPendingTemplate] = useState<WorkoutTemplate | null>(null);

  const handleStartWorkout = (template?: WorkoutTemplate) => {
      if (template) {
          setPendingTemplate(template);
      } else {
          setPendingTemplate(null);
      }
      setActiveTab(AppTab.WORKOUT);
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.HOME:
        return <HomeView onStartWorkout={handleStartWorkout} />;
      case AppTab.WORKOUT:
        return <WorkoutView onFinish={() => setActiveTab(AppTab.HOME)} initialTemplate={pendingTemplate} />;
      case AppTab.SKILLS:
        return <SkillTreeView />;
      case AppTab.PROGRESS:
        return <ProgressView />;
      default:
        return <HomeView onStartWorkout={handleStartWorkout} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-black max-w-md mx-auto relative shadow-2xl border-x border-zinc-800">
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {renderContent()}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="absolute bottom-0 w-full bg-zinc-900 border-t border-zinc-800 h-20 pb-4 z-50">
        <div className="grid grid-cols-4 h-full">
          <button
            onClick={() => setActiveTab(AppTab.HOME)}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === AppTab.HOME ? 'text-yellow-500' : 'text-zinc-600'
            }`}
          >
            <i className="fas fa-home text-lg"></i>
            <span className="text-[9px] font-bold tracking-wide">HOME</span>
          </button>
          
          <button
            onClick={() => setActiveTab(AppTab.WORKOUT)}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === AppTab.WORKOUT ? 'text-yellow-500' : 'text-zinc-600'
            }`}
          >
            <div className={`p-1.5 rounded-full transition-all ${activeTab === AppTab.WORKOUT ? 'bg-yellow-500/10 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : ''}`}>
                <i className="fas fa-dumbbell text-lg"></i>
            </div>
            <span className="text-[9px] font-bold tracking-wide">WORKOUT</span>
          </button>

          <button
            onClick={() => setActiveTab(AppTab.SKILLS)}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === AppTab.SKILLS ? 'text-yellow-500' : 'text-zinc-600'
            }`}
          >
            <i className="fas fa-layer-group text-lg"></i>
            <span className="text-[9px] font-bold tracking-wide">SKILLS</span>
          </button>

          <button
            onClick={() => setActiveTab(AppTab.PROGRESS)}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === AppTab.PROGRESS ? 'text-yellow-500' : 'text-zinc-600'
            }`}
          >
            <i className="fas fa-chart-line text-lg"></i>
            <span className="text-[9px] font-bold tracking-wide">PROGRESS</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;