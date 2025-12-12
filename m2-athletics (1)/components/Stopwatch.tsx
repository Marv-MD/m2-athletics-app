import React, { useState, useEffect, useRef } from 'react';

interface StopwatchProps {
  onStop: (seconds: number) => void;
  initialValue?: number;
}

const Stopwatch: React.FC<StopwatchProps> = ({ onStop, initialValue = 0 }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const toggleTimer = () => {
    if (isRunning) {
      // Stop
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      setIsRunning(false);
      onStop(time);
      setTime(0); // Reset after populating
    } else {
      // Start
      setTime(0);
      setIsRunning(true);
      intervalRef.current = window.setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
  };

  return (
    <button
      onClick={toggleTimer}
      type="button" // Prevent form submission
      className={`relative flex items-center justify-center w-12 h-12 rounded-lg transition-all active:scale-95 border ${
        isRunning
          ? 'bg-yellow-500 border-yellow-400 text-black animate-pulse-ring'
          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
      }`}
    >
      <i className={`fas ${isRunning ? 'fa-stop' : 'fa-stopwatch'} text-lg`}></i>
      {isRunning && (
        <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-yellow-500 bg-black border border-yellow-500/30 px-1 rounded">
          {time}s
        </span>
      )}
    </button>
  );
};

export default Stopwatch;