import React, { useState, useEffect } from 'react';
import { loadLogs } from '../services/storageService';
import { WorkoutLog } from '../types';

const ProgressView: React.FC = () => {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [exercises, setExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [metric, setMetric] = useState<'WEIGHT' | 'TIME'>('WEIGHT');

  useEffect(() => {
    const loadedLogs = loadLogs();
    // Sort logs by date ascending for chart
    loadedLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setLogs(loadedLogs);

    // Extract all unique exercise names
    const allNames = new Set<string>();
    loadedLogs.forEach(log => {
      log.exercises.forEach(ex => allNames.add(ex.name));
    });
    const sortedNames = Array.from(allNames).sort();
    setExercises(sortedNames);
    if (sortedNames.length > 0) setSelectedExercise(sortedNames[0]);
  }, []);

  // Calculate Chart Data
  const chartData = logs.map(log => {
      const ex = log.exercises.find(e => e.name === selectedExercise);
      if (!ex) return null;
      
      let val = 0;
      if (metric === 'WEIGHT') {
          // Get max weight for this session
          val = Math.max(...ex.sets.filter(s => s.completed).map(s => Number(s.weight)), 0);
      } else {
          // Get max time (duration/reps)
          val = Math.max(...ex.sets.filter(s => s.completed).map(s => Number(s.repsOrDuration)), 0);
      }
      
      if (val === 0) return null; 

      return {
          date: new Date(log.date).toLocaleDateString(undefined, {month:'short', day:'numeric'}),
          value: val
      };
  }).filter(d => d !== null) as {date: string, value: number}[];

  // Calculate PB
  const calculatePB = (exerciseName: string) => {
      let max = 0;
      logs.forEach(log => {
          const ex = log.exercises.find(e => e.name === exerciseName);
          if (ex) {
              const vals = ex.sets.filter(s => s.completed).map(s => metric === 'WEIGHT' ? Number(s.weight) : Number(s.repsOrDuration));
              const m = Math.max(...vals, 0);
              if (m > max) max = m;
          }
      });
      return max;
  };

  const currentPB = calculatePB(selectedExercise);

  // SVG Chart Helper
  const renderChart = () => {
      if (chartData.length < 2) return <div className="h-40 flex items-center justify-center text-zinc-600 text-sm">Not enough data to chart.</div>;

      const height = 200;
      const width = 300; // viewBox width
      const padding = 20;

      const maxVal = Math.max(...chartData.map(d => d.value)) * 1.1;
      
      const getX = (index: number) => {
          return padding + (index / (chartData.length - 1)) * (width - 2 * padding);
      };
      
      const getY = (val: number) => {
          return height - padding - (val / maxVal) * (height - 2 * padding);
      };

      const points = chartData.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');

      return (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              {/* Axes */}
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#52525b" strokeWidth="1" />
              <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#52525b" strokeWidth="1" />

              {/* Path */}
              <polyline points={points} fill="none" stroke={metric === 'WEIGHT' ? "#eab308" : "#10b981"} strokeWidth="3" />
              
              {/* Dots */}
              {chartData.map((d, i) => (
                  <circle key={i} cx={getX(i)} cy={getY(d.value)} r="4" fill="#000" stroke={metric === 'WEIGHT' ? "#eab308" : "#10b981"} strokeWidth="2" />
              ))}

              {/* Labels (simplified) */}
              {chartData.map((d, i) => (
                   <text key={i} x={getX(i)} y={height} fontSize="8" fill="#71717a" textAnchor="middle">{d.date}</text>
              ))}
          </svg>
      );
  };

  return (
    <div className="pb-24 pt-6 px-4 h-full overflow-y-auto no-scrollbar bg-black text-zinc-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Progress Tracker</h1>
        {/* Metric Toggle */}
        <div className="flex bg-zinc-900 rounded-lg border border-zinc-700 p-1">
            <button 
                onClick={() => setMetric('WEIGHT')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${metric === 'WEIGHT' ? 'bg-yellow-500 text-black' : 'text-zinc-500'}`}
            >
                KG
            </button>
            <button 
                onClick={() => setMetric('TIME')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${metric === 'TIME' ? 'bg-emerald-500 text-black' : 'text-zinc-500'}`}
            >
                TIME
            </button>
        </div>
      </div>

      {/* Select */}
      <div className="mb-8">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Select Exercise</label>
          <select 
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 text-white p-3 rounded-lg focus:outline-none focus:border-yellow-500"
          >
              {exercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
          </select>
      </div>

      {selectedExercise && (
          <>
            {/* Stats Card */}
            <div className={`bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-8 flex justify-between items-center shadow-lg ${metric === 'WEIGHT' ? 'shadow-yellow-900/10' : 'shadow-emerald-900/10'}`}>
                <div>
                    <div className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-1">
                        Personal Best ({metric === 'WEIGHT' ? 'Weight' : 'Time'})
                    </div>
                    <div className="text-4xl font-black text-white italic">
                        {currentPB} 
                        <span className={`text-lg not-italic font-normal ml-1 ${metric === 'WEIGHT' ? 'text-yellow-500' : 'text-emerald-500'}`}>
                            {metric === 'WEIGHT' ? 'kg' : 's/reps'}
                        </span>
                    </div>
                </div>
                <div className="h-12 w-12 bg-black rounded-full flex items-center justify-center border border-zinc-800">
                    <i className={`fas fa-crown ${metric === 'WEIGHT' ? 'text-yellow-500' : 'text-emerald-500'}`}></i>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-8">
                <div className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-4">
                    Max {metric === 'WEIGHT' ? 'Weight' : 'Time/Reps'} History
                </div>
                <div className="h-48 w-full">
                    {renderChart()}
                </div>
            </div>
            
            {/* Recent History Table */}
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Recent Logs</h3>
            <div className="space-y-2">
                {logs.slice().reverse().filter(l => l.exercises.some(e => e.name === selectedExercise)).slice(0, 5).map(log => {
                    const ex = log.exercises.find(e => e.name === selectedExercise);
                    if(!ex) return null;
                    const topSet = ex.sets.reduce((prev, current) => (Number(prev.weight) > Number(current.weight)) ? prev : current);
                    
                    return (
                        <div key={log.id} className="bg-zinc-900 p-3 rounded border border-zinc-800 flex justify-between items-center">
                            <span className="text-sm text-zinc-400">{new Date(log.date).toLocaleDateString()}</span>
                            <span className="font-mono font-bold text-white">{topSet.weight}kg x {topSet.repsOrDuration}</span>
                        </div>
                    );
                })}
            </div>
          </>
      )}
      
      {exercises.length === 0 && (
          <div className="text-center py-10 text-zinc-500">
              No workout data available yet. Go lift something!
          </div>
      )}
    </div>
  );
};

export default ProgressView;