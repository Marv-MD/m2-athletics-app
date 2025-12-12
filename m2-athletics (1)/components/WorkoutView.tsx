import React, { useState, useEffect } from 'react';
import { Exercise, SetData, WorkoutTemplate, WorkoutLog, ExerciseType } from '../types';
import ExerciseCard from './ExerciseCard';
import { loadTemplate, saveTemplate, saveLogs, loadLogs, getExerciseLibrary, addToLibrary } from '../services/storageService';

interface WorkoutViewProps {
  onFinish: () => void;
  initialTemplate?: WorkoutTemplate | null;
}

const WorkoutView: React.FC<WorkoutViewProps> = ({ onFinish, initialTemplate }) => {
  const [workout, setWorkout] = useState<WorkoutTemplate | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [library, setLibrary] = useState<string[]>([]);
  const [summaryStats, setSummaryStats] = useState<{name: string, diff: string}[]>([]);
  
  // New state to track if workout has officially started
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    // Load Library
    setLibrary(getExerciseLibrary());

    let loadedWorkout: WorkoutTemplate;
    if (initialTemplate) {
      loadedWorkout = JSON.parse(JSON.stringify(initialTemplate));
      loadedWorkout.id = 'current_active';
      // Reset completions and ensure startTime is undefined for fresh start
      loadedWorkout.exercises.forEach((ex: Exercise) => ex.sets.forEach((s: SetData) => s.completed = false));
      loadedWorkout.startTime = undefined;
      
      saveTemplate(loadedWorkout);
      setWorkout(loadedWorkout);
      setIsStarted(false);
    } else {
      loadedWorkout = loadTemplate();
      if (loadedWorkout.startTime) {
          setIsStarted(true);
      } else {
          setIsStarted(false);
      }
      setWorkout(JSON.parse(JSON.stringify(loadedWorkout)));
    }
  }, [initialTemplate]);

  // Timer Effect
  useEffect(() => {
    if (!workout || !isStarted || !workout.startTime) {
        if (!isStarted) setElapsedTime(0);
        return;
    }
    
    // Calculate initial elapsed time
    const initialDiff = Math.floor((Date.now() - workout.startTime) / 1000);
    setElapsedTime(initialDiff);

    const interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - (workout.startTime || now)) / 1000);
        setElapsedTime(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [isStarted, workout?.startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const saveWorkoutState = (updatedWorkout: WorkoutTemplate) => {
    setWorkout(updatedWorkout);
    saveTemplate(updatedWorkout);
  };

  const handleStartWorkout = () => {
      if (!workout) return;
      const now = Date.now();
      const updatedWorkout = { ...workout, startTime: now };
      setWorkout(updatedWorkout);
      saveTemplate(updatedWorkout);
      setIsStarted(true);
  };

  const handleUpdateSet = (exerciseId: string, setId: string, field: keyof SetData, value: any) => {
    if (!workout) return;
    const updatedExercises = workout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
        };
      }
      return ex;
    });
    saveWorkoutState({ ...workout, exercises: updatedExercises });
  };

  const handleAddSet = (exerciseId: string) => {
    if (!workout) return;
    const updatedExercises = workout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: SetData = {
            id: Date.now().toString(),
            weight: lastSet ? lastSet.weight : 0,
            repsOrDuration: lastSet ? lastSet.repsOrDuration : 0,
            completed: false
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      }
      return ex;
    });
    saveWorkoutState({ ...workout, exercises: updatedExercises });
  };

  const handleDeleteSet = (exerciseId: string, setId: string) => {
    if (!workout) return;
    const updatedExercises = workout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
      }
      return ex;
    });
    saveWorkoutState({ ...workout, exercises: updatedExercises });
  };

  const handleDeleteExercise = (exerciseId: string) => {
     if (!workout) return;
     const updatedExercises = workout.exercises.filter(ex => ex.id !== exerciseId);
     saveWorkoutState({ ...workout, exercises: updatedExercises });
  };

  const handleUpdateExerciseName = (exerciseId: string, name: string) => {
    if (!workout) return;
    const updatedExercises = workout.exercises.map(ex => 
        ex.id === exerciseId ? { ...ex, name } : ex
    );
    saveWorkoutState({ ...workout, exercises: updatedExercises });
  };

  const handleToggleType = (exerciseId: string) => {
    if (!workout) return;
    const updatedExercises = workout.exercises.map(ex => {
        if (ex.id === exerciseId) {
            return {
                ...ex,
                type: ex.type === ExerciseType.REPS_WEIGHT ? ExerciseType.DURATION_WEIGHT : ExerciseType.REPS_WEIGHT
            }
        }
        return ex;
    });
    saveWorkoutState({ ...workout, exercises: updatedExercises });
  }

  const handleAddExerciseFromLibrary = (name: string) => {
    if (!workout) return;
    const newExercise: Exercise = {
        id: Date.now().toString(),
        name: name,
        type: ExerciseType.REPS_WEIGHT,
        sets: [
            { id: Date.now().toString() + '-1', weight: 0, repsOrDuration: 10, completed: false }
        ]
    };
    saveWorkoutState({ ...workout, exercises: [...workout.exercises, newExercise] });
    setShowAddModal(false);
  };

  const handleLinkSuperset = (exerciseId: string) => {
      if (!workout) return;
      const index = workout.exercises.findIndex(e => e.id === exerciseId);
      if (index === -1 || index === workout.exercises.length - 1) return; 

      const current = workout.exercises[index];
      const next = workout.exercises[index + 1];

      let newSupersetId = current.supersetId;
      if (current.supersetId && next.supersetId === current.supersetId) {
          const updatedExercises = [...workout.exercises];
          updatedExercises[index] = { ...current, supersetId: undefined };
          saveWorkoutState({ ...workout, exercises: updatedExercises });
      } else {
          if (!newSupersetId) newSupersetId = Date.now().toString();
          const updatedExercises = [...workout.exercises];
          updatedExercises[index] = { ...current, supersetId: newSupersetId };
          updatedExercises[index + 1] = { ...next, supersetId: newSupersetId };
          saveWorkoutState({ ...workout, exercises: updatedExercises });
      }
  };

  const generateStatistics = (currentExercises: Exercise[]) => {
      const allLogs = loadLogs();
      const stats: {name: string, diff: string}[] = [];

      currentExercises.forEach(currEx => {
          // Find most recent log with this exercise
          const prevLog = allLogs.find(log => log.exercises.some(e => e.name === currEx.name));
          if (prevLog) {
              const prevEx = prevLog.exercises.find(e => e.name === currEx.name);
              if (prevEx) {
                  // Compare max weight
                  const currMax = Math.max(...currEx.sets.filter(s=>s.completed).map(s => Number(s.weight)), 0);
                  const prevMax = Math.max(...prevEx.sets.filter(s=>s.completed).map(s => Number(s.weight)), 0);
                  
                  // Compare total reps/seconds
                  const currVol = currEx.sets.filter(s=>s.completed).reduce((a, b) => a + Number(b.repsOrDuration), 0);
                  const prevVol = prevEx.sets.filter(s=>s.completed).reduce((a, b) => a + Number(b.repsOrDuration), 0);

                  let diffString = "";
                  if (currMax > prevMax) diffString = `Max Weight: +${(currMax - prevMax).toFixed(1)}kg 🚀`;
                  else if (currMax < prevMax) diffString = `Max Weight: ${currMax - prevMax}kg`;
                  else if (currVol > prevVol) diffString = `Volume: +${currVol - prevVol} reps/s 🔥`;
                  else diffString = "Maintained performance";

                  stats.push({ name: currEx.name, diff: diffString });
              }
          } else {
              stats.push({ name: currEx.name, diff: "New Exercise Logged! 🎉" });
          }
      });
      setSummaryStats(stats);
  };

  const finishWorkout = () => {
    if (!workout) return;

    // Generate stats before saving
    generateStatistics(workout.exercises);

    const logs = loadLogs();
    const newLog: WorkoutLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      durationSeconds: elapsedTime,
      templateName: workout.name,
      exercises: workout.exercises,
      totalVolume: workout.exercises.reduce((acc, ex) => {
        return (
          acc +
          ex.sets
            .filter((s) => s.completed)
            .reduce((sAcc, s) => sAcc + Number(s.weight) * Number(s.repsOrDuration), 0)
        );
      }, 0),
    };

    saveLogs([newLog, ...logs]);
    
    // Add new names to library
    const names = workout.exercises.map(e => e.name);
    addToLibrary(names);

    // Prepare next state (reset) but don't save yet to allow viewing stats
    const resetExercises = workout.exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((s) => ({ ...s, completed: false })),
    }));
    
    // Clear start time for next run
    saveTemplate({ ...workout, startTime: undefined, exercises: resetExercises });
    
    setShowSummaryModal(true);
  };

  if (!workout) return <div className="p-4 text-center text-zinc-500">Initializing...</div>;

  return (
    <div className={`pb-24 pt-4 px-4 h-full overflow-y-auto no-scrollbar bg-black ${!isStarted ? 'opacity-90' : ''}`}>
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-black/90 backdrop-blur-sm py-3 z-20 border-b border-zinc-800">
        <div className="flex-1 mr-4">
           {isEditingName ? (
               <input 
                 value={workout.name}
                 onChange={(e) => saveWorkoutState({ ...workout, name: e.target.value })}
                 onBlur={() => setIsEditingName(false)}
                 autoFocus
                 className="bg-black text-2xl font-bold text-yellow-400 border border-zinc-700 w-full px-2 py-1 rounded focus:outline-none"
               />
           ) : (
                <div onClick={() => setIsEditingName(true)} className="group cursor-pointer">
                    <h1 className="text-xl font-bold text-zinc-100 group-hover:text-yellow-400 transition-colors truncate max-w-[200px]">
                        {workout.name} <i className="fas fa-pen text-[10px] text-zinc-700 group-hover:text-yellow-600 align-top"></i>
                    </h1>
                    <div className="flex items-center gap-2 text-yellow-500 font-mono text-sm">
                        <i className={`fas fa-stopwatch ${isStarted ? 'animate-pulse' : ''}`}></i>
                        <span>{formatTime(elapsedTime)}</span>
                    </div>
                </div>
           )}
        </div>
        
        {!isStarted ? (
            <button
                onClick={handleStartWorkout}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 px-6 rounded shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all text-sm uppercase tracking-wider"
            >
                Start
            </button>
        ) : (
            <button
                onClick={finishWorkout}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-3 rounded shadow-[0_0_15px_rgba(234,179,8,0.3)] active:scale-95 transition-all text-xs uppercase tracking-wider"
            >
                Finish
            </button>
        )}
      </div>

      <div className={`space-y-1 transition-opacity duration-500 ${!isStarted ? 'opacity-50 pointer-events-none grayscale-[50%]' : ''}`}>
        {workout.exercises.map((exercise, index) => {
            const nextEx = workout.exercises[index + 1];
            const isSupersetTop = !!(exercise.supersetId && nextEx && nextEx.supersetId === exercise.supersetId);
            const isSupersetBottom = !!(exercise.supersetId && workout.exercises[index-1] && workout.exercises[index-1].supersetId === exercise.supersetId);

            return (
                <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isSupersetTop={isSupersetTop}
                isSupersetBottom={isSupersetBottom}
                onUpdateSet={handleUpdateSet}
                onAddSet={handleAddSet}
                onDeleteSet={handleDeleteSet}
                onDeleteExercise={handleDeleteExercise}
                onLinkSuperset={handleLinkSuperset}
                onUpdateName={handleUpdateExerciseName}
                onToggleType={handleToggleType}
                />
            );
        })}
      
        <button 
            onClick={() => setShowAddModal(true)}
            className="w-full py-4 mt-6 border-2 border-dashed border-zinc-800 text-zinc-600 rounded-xl hover:border-yellow-500/50 hover:text-yellow-500 transition-all font-bold uppercase tracking-widest text-sm"
        >
            + Add Exercise
        </button>
      </div>

      {!isStarted && (
          <div className="fixed inset-0 top-32 z-10 flex items-center justify-center pointer-events-none">
              <div className="bg-black/80 px-6 py-4 rounded-xl border border-zinc-800 backdrop-blur-md">
                  <p className="text-zinc-400 font-bold uppercase tracking-widest">Tap Start to Begin</p>
              </div>
          </div>
      )}

      {/* Add Exercise Modal */}
      {showAddModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-zinc-900 w-full max-w-sm rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-white">Add Exercise</h3>
                      <button onClick={() => setShowAddModal(false)}><i className="fas fa-times text-zinc-500"></i></button>
                  </div>
                  <div className="p-2 border-b border-zinc-800">
                    <button onClick={() => handleAddExerciseFromLibrary("New Exercise")} className="w-full py-3 bg-yellow-600/20 text-yellow-500 border border-yellow-600/50 rounded-lg font-bold">
                        + Create Custom
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                      <p className="text-xs text-zinc-600 uppercase font-bold px-2 mb-2">From Library</p>
                      {library.map((name, i) => (
                          <button 
                            key={i}
                            onClick={() => handleAddExerciseFromLibrary(name)}
                            className="w-full text-left p-3 bg-black hover:bg-zinc-800 rounded border border-zinc-800 text-zinc-300"
                          >
                              {name}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Summary Stats Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
             <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 rounded-full bg-yellow-500 mb-4 shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                        <i className="fas fa-trophy text-4xl text-black"></i>
                    </div>
                    <h2 className="text-3xl font-black italic text-white mb-1">WORKOUT COMPLETE</h2>
                    <p className="text-zinc-500 font-mono">{formatTime(elapsedTime)} duration</p>
                </div>

                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 mb-6 max-h-[40vh] overflow-y-auto">
                    <h3 className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Session Progress</h3>
                    <div className="space-y-3">
                        {summaryStats.map((stat, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <span className="font-bold text-zinc-300">{stat.name}</span>
                                <span className="text-zinc-500 text-xs">{stat.diff}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={() => {
                        setShowSummaryModal(false);
                        onFinish();
                    }}
                    className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest hover:scale-105 transition-transform"
                >
                    Back to Home
                </button>
             </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutView;