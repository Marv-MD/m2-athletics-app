import React, { useState } from 'react';
import { Exercise, ExerciseType, SetData } from '../types';
import Stopwatch from './Stopwatch';

interface ExerciseCardProps {
  exercise: Exercise;
  isSupersetTop: boolean;
  isSupersetBottom: boolean;
  onUpdateSet: (exerciseId: string, setId: string, field: keyof SetData, value: any) => void;
  onAddSet: (exerciseId: string) => void;
  onDeleteSet: (exerciseId: string, setId: string) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onLinkSuperset: (exerciseId: string) => void;
  onUpdateName: (exerciseId: string, name: string) => void;
  onToggleType: (exerciseId: string) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, 
  isSupersetTop, 
  isSupersetBottom, 
  onUpdateSet,
  onAddSet,
  onDeleteSet,
  onDeleteExercise,
  onLinkSuperset,
  onUpdateName,
  onToggleType
}) => {
  const isTimeBased = exercise.type === ExerciseType.DURATION_WEIGHT;
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <div className={`relative flex ${isSupersetTop ? 'mb-0 pb-4' : 'mb-4'} ${isSupersetBottom ? 'pt-0' : ''}`}>
      
      {/* Superset Connector Line */}
      {(isSupersetTop || isSupersetBottom) && (
        <div className="absolute left-[-12px] top-4 bottom-[-16px] w-1 bg-yellow-500 rounded-full z-0 opacity-80"></div>
      )}

      <div className={`flex-1 bg-zinc-900 rounded-xl p-4 shadow-lg border border-zinc-800 relative z-10 ${
          (isSupersetTop || isSupersetBottom) ? 'border-l-4 border-l-yellow-500/50' : ''
      }`}>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 mr-2">
            {isEditingTitle ? (
              <input 
                className="bg-black text-yellow-400 font-bold text-lg w-full px-2 py-1 rounded border border-zinc-700 focus:outline-none focus:border-yellow-500"
                value={exercise.name}
                onChange={(e) => onUpdateName(exercise.id, e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                autoFocus
              />
            ) : (
              <h3 
                onClick={() => setIsEditingTitle(true)}
                className="text-lg font-bold text-zinc-100 hover:text-yellow-400 cursor-text transition-colors"
              >
                {exercise.name} <i className="fas fa-pen text-xs text-zinc-600 ml-2"></i>
              </h3>
            )}
            <div className="flex gap-2 mt-1">
              <button 
                onClick={() => onToggleType(exercise.id)}
                className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 border border-zinc-700 hover:text-yellow-500 hover:border-yellow-500 transition-colors"
              >
                {isTimeBased ? <><i className="fas fa-clock mr-1"></i> TIME</> : <><i className="fas fa-redo mr-1"></i> REPS</>}
              </button>
              {exercise.supersetId && (
                <span className="text-[10px] bg-yellow-900/30 px-2 py-0.5 rounded text-yellow-500 border border-yellow-500/30">
                  SUPERSET
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
             <button 
              onClick={() => onLinkSuperset(exercise.id)}
              className={`h-8 w-8 rounded flex items-center justify-center transition-colors ${
                exercise.supersetId ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
              title="Link with next exercise (Superset)"
            >
              <i className="fas fa-link text-xs"></i>
            </button>
            <button 
              onClick={() => onDeleteExercise(exercise.id)}
              className="h-8 w-8 rounded bg-zinc-800 text-red-900 hover:text-red-500 flex items-center justify-center transition-colors"
            >
              <i className="fas fa-trash text-xs"></i>
            </button>
          </div>
        </div>

        {/* Header Row */}
        <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-zinc-500 mb-2 px-1 text-center tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-3">kg</div>
          <div className={`${isTimeBased ? 'col-span-4' : 'col-span-5'}`}>
            {isTimeBased ? 'Secs' : 'Reps'}
          </div>
          {isTimeBased && <div className="col-span-2">Timer</div>}
          <div className="col-span-2">Check</div>
          <div className="col-span-1"></div>
        </div>

        <div className="space-y-2">
          {exercise.sets.map((set, index) => (
            <div
              key={set.id}
              className={`grid grid-cols-12 gap-2 items-center p-1 rounded-lg transition-all duration-300 ${
                set.completed 
                ? 'bg-emerald-900/30 border border-emerald-900/50 shadow-inner' 
                : 'bg-transparent border border-transparent'
              }`}
            >
              {/* Set Number */}
              <div className={`col-span-1 text-center font-mono text-sm ${set.completed ? 'text-emerald-500 font-bold' : 'text-zinc-500'}`}>
                {index + 1}
              </div>

              {/* Weight Input */}
              <div className="col-span-3">
                <input
                  type="number"
                  value={set.weight}
                  onChange={(e) => onUpdateSet(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                  className={`w-full bg-black border rounded p-2 text-center text-sm focus:outline-none ${
                    set.completed 
                    ? 'border-emerald-700 text-emerald-400' 
                    : 'border-zinc-700 text-zinc-200 focus:border-yellow-500'
                  }`}
                  placeholder="0"
                />
              </div>

              {/* Reps/Duration Input */}
              <div className={`${isTimeBased ? 'col-span-4' : 'col-span-5'}`}>
                <input
                  type="number"
                  value={set.repsOrDuration}
                  onChange={(e) => onUpdateSet(exercise.id, set.id, 'repsOrDuration', parseFloat(e.target.value) || 0)}
                  className={`w-full bg-black border rounded p-2 text-center text-sm focus:outline-none ${
                    set.completed 
                    ? 'border-emerald-700 text-emerald-400' 
                    : 'border-zinc-700 text-zinc-200 focus:border-yellow-500'
                  }`}
                  placeholder={isTimeBased ? 's' : 'reps'}
                />
              </div>

              {/* Stopwatch (Only for Type B) */}
              {isTimeBased && (
                <div className="col-span-2 flex justify-center">
                  <Stopwatch
                    onStop={(time) => onUpdateSet(exercise.id, set.id, 'repsOrDuration', time)}
                  />
                </div>
              )}

              {/* Completion Checkbox */}
              <div className="col-span-2 flex justify-center">
                <button
                  onClick={() => onUpdateSet(exercise.id, set.id, 'completed', !set.completed)}
                  className={`w-10 h-10 rounded flex items-center justify-center transition-all ${
                    set.completed 
                    ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)] scale-105' 
                    : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'
                  }`}
                >
                  <i className="fas fa-check"></i>
                </button>
              </div>

              {/* Delete Set */}
               <div className="col-span-1 flex justify-center">
                  <button onClick={() => onDeleteSet(exercise.id, set.id)} className="text-zinc-700 hover:text-red-500">
                    <i className="fas fa-times"></i>
                  </button>
               </div>
            </div>
          ))}
        </div>

        {/* Add Set Button */}
        <button 
          onClick={() => onAddSet(exercise.id)}
          className="w-full mt-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg text-xs font-bold text-zinc-400 uppercase tracking-widest transition-colors"
        >
          + Add Set
        </button>
      </div>
    </div>
  );
};

export default ExerciseCard;