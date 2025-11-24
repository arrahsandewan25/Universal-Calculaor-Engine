import React, { useState, useEffect, useRef } from 'react';
import { Timer, X, Play, Pause, RefreshCw, Bell, Flag } from 'lucide-react';

export const StopwatchTimer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'stopwatch' | 'timer'>('stopwatch');

  // --- Stopwatch State ---
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const swRef = useRef<number | null>(null);

  // --- Timer State ---
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  const [timerInput, setTimerInput] = useState({ 
    y: '', mo: '', d: '', h: '', m: '5', s: '00' 
  });
  
  // We store the target End Time (timestamp) instead of decrementing seconds
  // This prevents drift if the browser tab is inactive/throttled.
  const [timerEndTime, setTimerEndTime] = useState<number | null>(null);
  const [displayTimeLeft, setDisplayTimeLeft] = useState(0);
  const timerRef = useRef<number | null>(null);

  // --- Stopwatch Logic ---
  useEffect(() => {
    if (swRunning) {
      const start = Date.now() - swTime;
      swRef.current = window.setInterval(() => {
        setSwTime(Date.now() - start);
      }, 10);
    } else if (swRef.current) {
      clearInterval(swRef.current);
    }
    return () => { if (swRef.current) clearInterval(swRef.current); };
  }, [swRunning]);

  const handleLap = () => {
    setLaps(prev => [swTime, ...prev]);
  };

  const resetStopwatch = () => {
    setSwRunning(false);
    setSwTime(0);
    setLaps([]);
  };

  const formatTime = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    const centi = Math.floor((ms % 1000) / 10);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${centi.toString().padStart(2, '0')}`;
  };

  // --- Timer Logic ---
  useEffect(() => {
    if (timerRunning && timerEndTime) {
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const left = Math.max(0, timerEndTime - now);
        
        setDisplayTimeLeft(left);

        if (left <= 0) {
          clearInterval(timerRef.current!);
          setTimerRunning(false);
          setTimerFinished(true);
          setTimerEndTime(null);
        }
      }, 100); // Check every 100ms for smoothness, but rely on Date.now()
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning, timerEndTime]);

  const getTimerTotalMs = () => {
    const y = parseInt(timerInput.y) || 0;
    const mo = parseInt(timerInput.mo) || 0;
    const d = parseInt(timerInput.d) || 0;
    const h = parseInt(timerInput.h) || 0;
    const m = parseInt(timerInput.m) || 0;
    const s = parseInt(timerInput.s) || 0;

    // Approximations for generic timer: 1y = 365d, 1mo = 30d
    const totalSeconds = 
      (y * 31536000) + 
      (mo * 2592000) + 
      (d * 86400) + 
      (h * 3600) + 
      (m * 60) + 
      s;
    
    return totalSeconds * 1000;
  };

  const startTimer = () => {
    if (timerFinished) {
        setTimerFinished(false);
    }

    // If resuming (paused)
    if (displayTimeLeft > 0 && !timerRunning && !timerEndTime) {
        setTimerEndTime(Date.now() + displayTimeLeft);
        setTimerRunning(true);
        return;
    }

    // If starting fresh
    if (displayTimeLeft === 0 && !timerRunning) {
        const totalMs = getTimerTotalMs();
        if (totalMs > 0) {
            setDisplayTimeLeft(totalMs);
            setTimerEndTime(Date.now() + totalMs);
            setTimerRunning(true);
            setTimerFinished(false);
        }
    }
  };

  const pauseTimer = () => {
      setTimerRunning(false);
      setTimerEndTime(null); // Clear target, keep displayTimeLeft
  };

  const resetTimer = () => {
      setTimerRunning(false);
      setTimerEndTime(null);
      setDisplayTimeLeft(0);
      setTimerFinished(false);
  }

  const formatTimerDisplay = (ms: number) => {
      const totalSec = Math.ceil(ms / 1000); // Ceiling to show 00:01 until exactly 0
      const d = Math.floor(totalSec / 86400);
      const h = Math.floor((totalSec % 86400) / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;

      if (d > 0) return `${d}d ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimerInputChange = (field: string, val: string) => {
      setTimerInput(prev => ({ ...prev, [field]: val }));
  };

  // --- UI Render ---

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-cyan-600 hover:bg-cyan-500 rounded-full shadow-xl text-white transition-all hover:scale-110"
      >
        <Timer size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700 shrink-0">
        <div className="flex space-x-2">
            <button onClick={() => setMode('stopwatch')} className={`text-xs font-bold px-2 py-1 rounded ${mode === 'stopwatch' ? 'bg-cyan-900 text-cyan-400' : 'text-slate-400 hover:text-white'}`}>Stopwatch</button>
            <button onClick={() => setMode('timer')} className={`text-xs font-bold px-2 py-1 rounded ${mode === 'timer' ? 'bg-cyan-900 text-cyan-400' : 'text-slate-400 hover:text-white'}`}>Timer</button>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col h-full overflow-hidden">
        {mode === 'stopwatch' ? (
            <div className="flex flex-col h-full">
                <div className="text-4xl font-mono font-bold text-white mb-6 text-center tabular-nums tracking-wider shrink-0">
                    {formatTime(swTime)}
                </div>
                
                <div className="flex justify-center gap-3 mb-4 shrink-0">
                    <button 
                        onClick={() => setSwRunning(!swRunning)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${swRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                    >
                        {swRunning ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white ml-1" />}
                    </button>
                    
                    {/* Lap Button */}
                    <button 
                        onClick={handleLap}
                        disabled={!swRunning}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${swRunning ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-700 text-slate-500'}`}
                    >
                        <Flag size={18} />
                    </button>

                    <button 
                        onClick={resetStopwatch}
                        className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-all active:scale-95"
                    >
                        <RefreshCw size={16} className="text-white" />
                    </button>
                </div>

                {/* Laps List */}
                <div className="flex-1 overflow-y-auto min-h-0 bg-slate-800/50 rounded-lg p-2 space-y-1 scrollbar-thin">
                    {laps.length === 0 && <div className="text-center text-xs text-slate-500 mt-2">No laps recorded</div>}
                    {laps.map((lapTime, i) => {
                        // Calculate Split (Delta)
                        const prevLap = laps[i + 1] || 0;
                        const delta = lapTime - prevLap;
                        return (
                            <div key={i} className="flex justify-between text-xs font-mono border-b border-slate-700/50 pb-1 last:border-0">
                                <span className="text-slate-400">Lap {laps.length - i}</span>
                                <span className="text-cyan-300">+{formatTime(delta)}</span>
                                <span className="text-white">{formatTime(lapTime)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        ) : (
            <div className="flex flex-col h-full">
                 {displayTimeLeft > 0 || timerFinished ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className={`text-4xl font-mono font-bold mb-4 tabular-nums tracking-wider text-center break-all ${timerFinished ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {formatTimerDisplay(displayTimeLeft)}
                        </div>
                        {timerFinished && (
                            <div className="flex items-center gap-2 text-red-400 mb-4 text-sm font-bold">
                                <Bell size={16} className="animate-bounce" /> Time's Up!
                            </div>
                        )}
                    </div>
                 ) : (
                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-3 gap-2 mb-4">
                             {/* Inputs */}
                             <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-400 uppercase text-center">Years</label>
                                <input type="number" value={timerInput.y} onChange={e => handleTimerInputChange('y', e.target.value)} className="bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="0" />
                             </div>
                             <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-400 uppercase text-center">Months</label>
                                <input type="number" value={timerInput.mo} onChange={e => handleTimerInputChange('mo', e.target.value)} className="bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="0" />
                             </div>
                             <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-400 uppercase text-center">Days</label>
                                <input type="number" value={timerInput.d} onChange={e => handleTimerInputChange('d', e.target.value)} className="bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="0" />
                             </div>
                             <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-400 uppercase text-center">Hours</label>
                                <input type="number" value={timerInput.h} onChange={e => handleTimerInputChange('h', e.target.value)} className="bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="0" />
                             </div>
                             <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-400 uppercase text-center">Mins</label>
                                <input type="number" value={timerInput.m} onChange={e => handleTimerInputChange('m', e.target.value)} className="bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="0" />
                             </div>
                             <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-400 uppercase text-center">Secs</label>
                                <input type="number" value={timerInput.s} onChange={e => handleTimerInputChange('s', e.target.value)} className="bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="0" />
                             </div>
                        </div>
                    </div>
                 )}

                 <div className="flex justify-center gap-3 shrink-0 mt-4">
                    <button 
                        onClick={timerRunning ? pauseTimer : startTimer}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 ${timerRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                    >
                        {timerRunning ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-1" />}
                    </button>
                    <button 
                        onClick={resetTimer}
                        className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-all active:scale-95"
                    >
                        <RefreshCw size={18} className="text-white" />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};