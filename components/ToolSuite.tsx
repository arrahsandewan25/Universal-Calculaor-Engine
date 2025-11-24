import React, { useState, useEffect, useRef } from 'react';
import { ToolDefinition } from '../types';
import { LAND_UNITS, CURRENCIES } from '../constants';
import { ArrowRightLeft, Calendar, Calculator, Ruler, Activity, DollarSign, Compass, RotateCcw, Copy, Dices, List as ListIcon, Lock, X, Plus, Check, Palette, Camera, Upload, Zap, Loader2 } from 'lucide-react';
import { solveImageWithGemini } from '../services/geminiService';
import * as math from 'mathjs';

interface ToolSuiteProps {
  tool: ToolDefinition;
}

// --- Specific Calculator Components ---

const AgeCalculator = () => {
  const [dob, setDob] = useState('');
  const [manualDate, setManualDate] = useState({ d: '', m: '', y: '' });
  const [result, setResult] = useState<{y: number, m: number, d: number} | null>(null);

  useEffect(() => {
    const { d, m, y } = manualDate;
    if (d && m && y && y.length === 4) {
       const day = parseInt(d);
       const month = parseInt(m);
       if(day > 0 && day <= 31 && month > 0 && month <= 12) {
           // Format for the date picker
           const formatted = `${y}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
           if(formatted !== dob) setDob(formatted);
       }
    }
  }, [manualDate]);

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setDob(val);
      if(val) {
          const [y, m, d] = val.split('-');
          setManualDate({ y, m: parseInt(m).toString(), d: parseInt(d).toString() });
      } else {
          setManualDate({ d: '', m: '', y: '' });
      }
  };

  const calculate = () => {
    if (!dob) return;
    // Fix: Use explicit local date construction to avoid UTC timezone "off-by-one" errors
    const [yStr, mStr, dStr] = dob.split('-');
    const birth = new Date(parseInt(yStr), parseInt(mStr) - 1, parseInt(dStr));
    const now = new Date();
    
    if (isNaN(birth.getTime())) return;

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      // Get days in previous month
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    setResult({ y: years, m: months, d: days });
  };

  const reset = () => {
      setDob('');
      setManualDate({ d: '', m: '', y: '' });
      setResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-400 text-sm mb-2">Date of Birth</label>
        <input 
          type="date" 
          value={dob} 
          onChange={handlePickerChange}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none mb-3"
        />

        <div className="flex items-center gap-2 mb-2">
            <div className="h-px bg-slate-700 flex-1"></div>
            <span className="text-xs text-slate-500 uppercase font-bold">Or Manual Input</span>
            <div className="h-px bg-slate-700 flex-1"></div>
        </div>

        <div className="grid grid-cols-3 gap-2">
            <div>
                <input type="number" placeholder="DD" value={manualDate.d} onChange={(e) => setManualDate({...manualDate, d: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-center focus:border-cyan-500 outline-none placeholder:text-slate-600" maxLength={2} />
                <span className="block text-center text-[10px] text-slate-500 mt-1">Day</span>
            </div>
            <div>
                <input type="number" placeholder="MM" value={manualDate.m} onChange={(e) => setManualDate({...manualDate, m: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-center focus:border-cyan-500 outline-none placeholder:text-slate-600" maxLength={2} />
                <span className="block text-center text-[10px] text-slate-500 mt-1">Month</span>
            </div>
            <div>
                <input type="number" placeholder="YYYY" value={manualDate.y} onChange={(e) => setManualDate({...manualDate, y: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-center focus:border-cyan-500 outline-none placeholder:text-slate-600" maxLength={4} />
                <span className="block text-center text-[10px] text-slate-500 mt-1">Year</span>
            </div>
        </div>
      </div>
      
      <div className="flex gap-3">
          <button onClick={calculate} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-cyan-900/50 active:scale-95">Calculate Age</button>
          <button onClick={reset} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-3 rounded-lg transition-colors active:scale-95" title="Reset"><RotateCcw size={20} /></button>
      </div>

      {result && (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-center animate-fade-in">
          <div className="text-3xl font-bold text-emerald-400 mb-1">{result.y} <span className="text-sm text-slate-400 font-normal">Years</span></div>
          <div className="flex justify-center gap-4 text-slate-300"><span>{result.m} Months</span><span>{result.d} Days</span></div>
        </div>
      )}
    </div>
  );
};

const DateDifferenceCalculator = () => {
    const [date1, setDate1] = useState('');
    const [date2, setDate2] = useState('');
    const [manual1, setManual1] = useState({ d: '', m: '', y: '' });
    const [manual2, setManual2] = useState({ d: '', m: '', y: '' });
    const [result, setResult] = useState<{ totalDays: number, y: number, m: number, d: number } | null>(null);

    // Sync hooks for Manual <-> Date inputs
    const useDateSync = (dateStr: string, setDateStr: Function, manualObj: any, setManualObj: Function) => {
        useEffect(() => {
            const { d, m, y } = manualObj;
            if (d && m && y && y.length === 4) {
                const day = parseInt(d);
                const month = parseInt(m);
                if(day > 0 && day <= 31 && month > 0 && month <= 12) {
                    const formatted = `${y}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    if(formatted !== dateStr) setDateStr(formatted);
                }
            }
        }, [manualObj]);
    };

    useDateSync(date1, setDate1, manual1, setManual1);
    useDateSync(date2, setDate2, manual2, setManual2);

    const handlePicker = (setter: Function, manualSetter: Function, e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setter(val);
        if(val) {
            const [y, m, d] = val.split('-');
            manualSetter({ y, m: parseInt(m).toString(), d: parseInt(d).toString() });
        }
    };

    const calculate = () => {
        if (!date1 || !date2) return;
        
        const [y1, m1, d1] = date1.split('-').map(Number);
        const [y2, m2, d2] = date2.split('-').map(Number);
        
        const dObj1 = new Date(y1, m1 - 1, d1);
        const dObj2 = new Date(y2, m2 - 1, d2);

        if (isNaN(dObj1.getTime()) || isNaN(dObj2.getTime())) return;

        const diffTime = Math.abs(dObj2.getTime() - dObj1.getTime());
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // YMD Breakdown
        let start = dObj1 < dObj2 ? dObj1 : dObj2;
        let end = dObj1 < dObj2 ? dObj2 : dObj1;
        
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) {
            months--;
            days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        setResult({ totalDays, y: years, m: months, d: days });
    };

    const reset = () => {
        setDate1(''); setDate2('');
        setManual1({d:'', m:'', y:''}); setManual2({d:'', m:'', y:''});
        setResult(null);
    };

    const DateInputGroup = ({ label, date, setDate, manual, setManual }: any) => (
        <div className="mb-4 p-3 bg-slate-800/30 rounded-xl border border-slate-800">
            <label className="block text-cyan-400 text-xs font-bold mb-2 uppercase">{label}</label>
            <input type="date" value={date} onChange={(e) => handlePicker(setDate, setManual, e)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none mb-2 text-sm" />
            <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="DD" value={manual.d} onChange={(e) => setManual({...manual, d: e.target.value})} className="bg-slate-900 border border-slate-700 rounded p-2 text-center text-white text-xs" />
                <input type="number" placeholder="MM" value={manual.m} onChange={(e) => setManual({...manual, m: e.target.value})} className="bg-slate-900 border border-slate-700 rounded p-2 text-center text-white text-xs" />
                <input type="number" placeholder="YYYY" value={manual.y} onChange={(e) => setManual({...manual, y: e.target.value})} className="bg-slate-900 border border-slate-700 rounded p-2 text-center text-white text-xs" />
            </div>
        </div>
    );

    return (
        <div>
            <DateInputGroup label="Start Date" date={date1} setDate={setDate1} manual={manual1} setManual={setManual1} />
            <DateInputGroup label="End Date" date={date2} setDate={setDate2} manual={manual2} setManual={setManual2} />
            
            <div className="flex gap-3 mb-4">
                <button onClick={calculate} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg active:scale-95">Calculate Difference</button>
                <button onClick={reset} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-3 rounded-lg transition-colors active:scale-95" title="Reset"><RotateCcw size={20} /></button>
            </div>

            {result && (
                <div className="p-4 bg-slate-800 rounded-xl text-center border border-blue-500/30">
                    <div className="text-sm text-slate-400 mb-1">Total Duration</div>
                    <div className="text-3xl font-bold text-white mb-2">{result.totalDays} <span className="text-base text-slate-500">Days</span></div>
                    <div className="text-xs text-cyan-300 font-mono bg-slate-900/50 p-2 rounded">
                        {result.y}y {result.m}m {result.d}d
                    </div>
                </div>
            )}
        </div>
    );
};

const BmiCalculator = () => {
    const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [heightFt, setHeightFt] = useState('');
    const [heightIn, setHeightIn] = useState('');
    const [bmi, setBmi] = useState<number | null>(null);

    const calculate = () => {
        let w = parseFloat(weight);
        let h = 0;

        if (unit === 'metric') {
            h = parseFloat(height) / 100; // cm to m
            if (w > 0 && h > 0) setBmi(w / (h * h));
        } else {
            // Imperial: lbs and inches. Formula: 703 x weight (lbs) / [height (in)]^2
            const ft = parseFloat(heightFt) || 0;
            const inch = parseFloat(heightIn) || 0;
            h = (ft * 12) + inch;
            if (w > 0 && h > 0) setBmi((703 * w) / (h * h));
        }
    };

    const reset = () => {
        setWeight(''); setHeight(''); setHeightFt(''); setHeightIn('');
        setBmi(null);
    };

    const getStatus = (b: number) => {
        if (b < 18.5) return { t: 'Underweight', c: 'text-yellow-400' };
        if (b < 25) return { t: 'Normal', c: 'text-emerald-400' };
        if (b < 30) return { t: 'Overweight', c: 'text-orange-400' };
        return { t: 'Obese', c: 'text-red-500' };
    };

    return (
        <div className="space-y-4">
            <div className="flex bg-slate-800 rounded-lg p-1 mb-4">
                <button onClick={() => setUnit('metric')} className={`flex-1 py-1 text-xs font-bold rounded ${unit === 'metric' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>Metric (kg/cm)</button>
                <button onClick={() => setUnit('imperial')} className={`flex-1 py-1 text-xs font-bold rounded ${unit === 'imperial' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>Standard (lbs/ft)</button>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-slate-400 text-sm mb-1">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
                    <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
                </div>
                
                {unit === 'metric' ? (
                     <div>
                        <label className="block text-slate-400 text-sm mb-1">Height (cm)</label>
                        <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Height (ft)</label>
                            <input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Height (in)</label>
                            <input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
                        </div>
                    </div>
                )}
            </div>

             <div className="flex gap-3">
                <button onClick={calculate} className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-lg">Calculate BMI</button>
                <button onClick={reset} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-3 rounded-lg" title="Reset"><RotateCcw size={20} /></button>
             </div>
             
             {bmi && (
                 <div className="p-4 bg-slate-800 rounded-xl text-center border border-slate-700">
                     <div className="text-4xl font-bold text-white mb-2">{bmi.toFixed(1)}</div>
                     <div className={`text-lg font-medium ${getStatus(bmi).c}`}>{getStatus(bmi).t}</div>
                 </div>
             )}
        </div>
    );
};

const UnitConverter = () => {
    const CATEGORIES = {
        Length: {
            'meter': 1, 'kilometer': 1000, 'centimeter': 0.01, 'millimeter': 0.001,
            'mile': 1609.34, 'yard': 0.9144, 'foot': 0.3048, 'inch': 0.0254
        },
        Mass: {
            'kilogram': 1, 'gram': 0.001, 'milligram': 0.000001, 'tonne': 1000,
            'pound': 0.453592, 'ounce': 0.0283495
        },
        Temp: { // Special handling required
            'celsius': 'c', 'fahrenheit': 'f', 'kelvin': 'k'
        },
        Time: {
            'second': 1, 'minute': 60, 'hour': 3600, 'day': 86400, 'week': 604800
        },
        Digital: {
            'byte': 1, 'kb': 1024, 'mb': 1048576, 'gb': 1073741824, 'tb': 1099511627776
        }
    };

    const [cat, setCat] = useState('Length');
    const [val, setVal] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [res, setRes] = useState<string | null>(null);

    // Update units when category changes
    useEffect(() => {
        const units = Object.keys(CATEGORIES[cat as keyof typeof CATEGORIES]);
        setFrom(units[0]);
        setTo(units[1] || units[0]);
        setVal('');
        setRes(null);
    }, [cat]);

    const convert = () => {
        const v = parseFloat(val);
        if (isNaN(v)) return;

        let result = 0;

        if (cat === 'Temp') {
            if (from === to) result = v;
            else if (from === 'celsius' && to === 'fahrenheit') result = (v * 9/5) + 32;
            else if (from === 'celsius' && to === 'kelvin') result = v + 273.15;
            else if (from === 'fahrenheit' && to === 'celsius') result = (v - 32) * 5/9;
            else if (from === 'fahrenheit' && to === 'kelvin') result = (v - 32) * 5/9 + 273.15;
            else if (from === 'kelvin' && to === 'celsius') result = v - 273.15;
            else if (from === 'kelvin' && to === 'fahrenheit') result = (v - 273.15) * 9/5 + 32;
        } else {
            // Standard multiplier logic
            const map = CATEGORIES[cat as keyof typeof CATEGORIES] as Record<string, number>;
            if(map[from] && map[to]) {
                const baseVal = v * map[from];
                result = baseVal / map[to];
            }
        }

        setRes(result.toLocaleString(undefined, { maximumFractionDigits: 6 }));
    };

    const reset = () => {
        setVal('');
        setRes(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin">
                {Object.keys(CATEGORIES).map(c => (
                    <button key={c} onClick={() => setCat(c)} className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${cat === c ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {c}
                    </button>
                ))}
            </div>

            <div>
                <input type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="Enter value..." className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <select value={from} onChange={e => setFrom(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white capitalize">{Object.keys(CATEGORIES[cat as keyof typeof CATEGORIES]).map(u => <option key={u} value={u}>{u}</option>)}</select>
                <select value={to} onChange={e => setTo(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white capitalize">{Object.keys(CATEGORIES[cat as keyof typeof CATEGORIES]).map(u => <option key={u} value={u}>{u}</option>)}</select>
            </div>

            <div className="flex gap-3">
                <button onClick={convert} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2"><ArrowRightLeft size={16} /> Convert</button>
                <button onClick={reset} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-3 rounded-lg" title="Reset"><RotateCcw size={20} /></button>
            </div>
            
            {res && (
                <div className="p-4 bg-slate-800 rounded-xl text-center border border-slate-700">
                    <div className="text-3xl font-bold text-white">{res}</div>
                    <div className="text-sm text-cyan-400 capitalize">{to}</div>
                </div>
            )}
        </div>
    );
};

const StatsCalculator = () => {
    const [input, setInput] = useState('');
    const [stats, setStats] = useState<any>(null);

    const calc = () => {
        // Parse numbers: split by comma or space
        const nums = input.split(/[\s,]+/).map(n => parseFloat(n)).filter(n => !isNaN(n));
        if (nums.length === 0) return;

        const mean = math.mean(nums);
        const median = math.median(nums);
        const mode = math.mode(nums);
        const std = math.std(nums);
        const variance = math.variance(nums);
        const min = math.min(nums);
        const max = math.max(nums);
        const sum = math.sum(nums);

        setStats({ count: nums.length, mean, median, mode, std, variance, min, max, sum });
    };

    const reset = () => {
        setInput('');
        setStats(null);
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-slate-400 text-sm mb-2">Dataset (comma or space separated)</label>
                <textarea 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    placeholder="e.g. 10 20 5 40 10..." 
                    className="w-full h-24 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-mono text-sm"
                />
            </div>
            <div className="flex gap-3">
                <button onClick={calc} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg">Calculate Statistics</button>
                <button onClick={reset} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-3 rounded-lg" title="Reset"><RotateCcw size={20} /></button>
            </div>

            {stats && (
                <div className="grid grid-cols-2 gap-3 animate-fade-in">
                    {[
                        ['Mean', stats.mean.toFixed(4)],
                        ['Median', stats.median],
                        ['Mode', Array.isArray(stats.mode) ? stats.mode.join(', ') : stats.mode],
                        ['Std Dev', stats.std.toFixed(4)],
                        ['Variance', stats.variance.toFixed(4)],
                        ['Sum', stats.sum],
                        ['Range', `${stats.min} - ${stats.max}`],
                        ['Count', stats.count]
                    ].map(([l, v]) => (
                        <div key={l as string} className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <div className="text-[10px] text-slate-500 uppercase font-bold">{l}</div>
                            <div className="text-white font-mono text-sm truncate" title={String(v)}>{String(v)}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CompassTool = () => {
    const [heading, setHeading] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [needsPermission, setNeedsPermission] = useState(false);

    // Fix: Handle iOS Permission requirement
    const requestAccess = async () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const response = await (DeviceOrientationEvent as any).requestPermission();
                if (response === 'granted') {
                    setNeedsPermission(false);
                    startSensor();
                } else {
                    setError("Permission denied for compass.");
                }
            } catch (e) {
                setError("Error requesting compass permission.");
            }
        } else {
             setNeedsPermission(false);
             startSensor();
        }
    };

    const startSensor = () => {
        const handleOrientation = (event: DeviceOrientationEvent) => {
            if (event.alpha !== null) {
                let h = event.alpha;
                // iOS webkitCompassHeading is direct magnetic north
                if ((event as any).webkitCompassHeading) {
                    h = (event as any).webkitCompassHeading;
                } else {
                    // Android: alpha is counter-clockwise. 360 - alpha.
                    h = 360 - h;
                }
                setHeading(h);
                setError(null);
            } else {
                setError("Device orientation sensor not available.");
            }
        };

        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
            setError("Compass not supported on this device.");
        }
        return () => window.removeEventListener('deviceorientation', handleOrientation, true);
    };

    useEffect(() => {
        // Check if we likely need permission (iOS 13+)
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            setNeedsPermission(true);
        } else {
            startSensor();
        }
    }, []);

    const getDirection = (d: number) => {
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const idx = Math.round(d / 45) % 8;
        return dirs[idx];
    };

    if (needsPermission) {
         return (
             <div className="flex flex-col items-center justify-center py-12 text-center">
                 <Compass size={48} className="text-cyan-500 mb-4" />
                 <h3 className="text-white font-bold text-lg mb-2">Permission Required</h3>
                 <p className="text-slate-400 text-sm mb-6">Tap below to allow access to your device's compass.</p>
                 <button onClick={requestAccess} className="bg-cyan-600 text-white font-bold py-3 px-6 rounded-full shadow-lg active:scale-95">
                     Start Compass
                 </button>
             </div>
         )
    }

    return (
        <div className="flex flex-col items-center justify-center py-8">
            {error ? (
                <div className="text-center p-6 bg-red-900/20 text-red-400 rounded-xl border border-red-900/50">
                    <Compass size={48} className="mx-auto mb-2 opacity-50" />
                    <p>{error}</p>
                    <p className="text-xs mt-2 text-slate-500">Ensure you are on a mobile device.</p>
                </div>
            ) : (
                <>
                    <div className="relative w-64 h-64 rounded-full border-4 border-slate-700 bg-slate-900 shadow-2xl flex items-center justify-center mb-8">
                        {/* Dial Markings */}
                        <div className="absolute inset-0 rounded-full border border-slate-600 opacity-30"></div>
                        <div className="absolute top-2 text-red-500 font-bold text-xl">N</div>
                        <div className="absolute bottom-2 text-slate-400 font-bold text-xl">S</div>
                        <div className="absolute left-2 text-slate-400 font-bold text-xl">W</div>
                        <div className="absolute right-2 text-slate-400 font-bold text-xl">E</div>

                        {/* Rotating Needle */}
                        <div 
                            className="w-1 h-32 bg-gradient-to-t from-slate-600 to-red-500 rounded-full origin-bottom absolute top-0 left-1/2 -ml-0.5 transition-transform duration-200 ease-out z-10 shadow-lg shadow-red-500/50"
                            style={{ transform: `rotate(${heading || 0}deg) translateY(50%)`, transformOrigin: 'center' }}
                        ></div>
                         {/* Center Cap */}
                        <div className="w-4 h-4 bg-slate-200 rounded-full z-20 shadow-md"></div>
                    </div>

                    <div className="text-center">
                        <div className="text-6xl font-bold text-white tabular-nums tracking-tighter">
                            {heading ? Math.round(heading) : '--'}°
                        </div>
                        <div className="text-2xl font-bold text-cyan-400 mt-2">
                            {heading ? getDirection(heading) : '--'}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const LandConverter = () => {
  const [val, setVal] = useState<string>('');
  const [from, setFrom] = useState('decimal');
  const [to, setTo] = useState('sq_ft');
  const [res, setRes] = useState<string | null>(null);
  const units = Object.keys(LAND_UNITS);
  const convert = () => {
    const v = parseFloat(val);
    if (isNaN(v)) return;
    const baseVal = v * LAND_UNITS[from];
    const finalVal = baseVal / LAND_UNITS[to];
    setRes(finalVal.toLocaleString(undefined, { maximumFractionDigits: 4 }));
  };
  const reset = () => {
      setVal('');
      setRes(null);
  };
  return (
    <div className="space-y-4">
      <div><label className="block text-slate-400 text-sm mb-2">Value</label><input type="number" value={val} onChange={(e) => setVal(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-slate-400 text-xs mb-1">From</label><select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white capitalize">{units.map(u => <option key={u} value={u}>{u.replace('_', ' ')}</option>)}</select></div>
        <div><label className="block text-slate-400 text-xs mb-1">To</label><select value={to} onChange={(e) => setTo(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white capitalize">{units.map(u => <option key={u} value={u}>{u.replace('_', ' ')}</option>)}</select></div>
      </div>
      <div className="flex gap-3">
          <button onClick={convert} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"><ArrowRightLeft size={18} /> Convert</button>
          <button onClick={reset} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-3 rounded-lg" title="Reset"><RotateCcw size={20} /></button>
      </div>
      {res && (<div className="mt-4 p-4 bg-slate-800 rounded-xl text-center border border-blue-500/30"><div className="text-slate-400 text-xs uppercase tracking-wide">Result</div><div className="text-2xl font-bold text-white">{res} <span className="text-sm font-normal text-blue-300 capitalize">{to.replace('_', ' ')}</span></div></div>)}
    </div>
  );
};

const LoanCalculator = () => {
    const [amount, setAmount] = useState('');
    const [rate, setRate] = useState('');
    const [years, setYears] = useState('');
    const [currency, setCurrency] = useState(CURRENCIES[0]); // Default USD
    const [payment, setPayment] = useState<string | null>(null);
    const calc = () => {
        const p = parseFloat(amount);
        const r = parseFloat(rate) / 100 / 12;
        const n = parseFloat(years) * 12;
        if (!p || !r || !n) return;
        const m = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        setPayment(m.toFixed(2));
    };
    const reset = () => {
        setAmount(''); setRate(''); setYears(''); setPayment(null);
    };
    return (
        <div className="space-y-4">
             <div><label className="block text-slate-400 text-sm mb-1">Currency</label><div className="relative"><select value={currency.code} onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value) || CURRENCIES[0])} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 pl-10 text-white appearance-none cursor-pointer hover:border-cyan-500 transition-colors">{CURRENCIES.map(c => (<option key={c.code} value={c.code}>{c.code} - {c.name}</option>))}</select><DollarSign className="absolute left-3 top-3.5 text-slate-500" size={16} /></div></div>
            <div><label className="block text-slate-400 text-sm mb-1">Loan Amount</label><div className="relative"><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 pl-8 text-white" /><span className="absolute left-3 top-3 text-slate-500">{currency.symbol}</span></div></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-slate-400 text-sm mb-1">Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" /></div>
                <div><label className="block text-slate-400 text-sm mb-1">Term (Years)</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" /></div>
            </div>
            <div className="flex gap-3">
                <button onClick={calc} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-900/50 transition-all active:scale-95">Calculate Payment</button>
                <button onClick={reset} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-3 rounded-lg" title="Reset"><RotateCcw size={20} /></button>
            </div>
            {payment && (<div className="p-4 bg-slate-800 rounded-xl text-center border border-emerald-500/30 shadow-inner"><div className="text-slate-400 text-xs uppercase tracking-wide">Monthly Payment</div><div className="text-3xl font-bold text-emerald-400 flex items-center justify-center gap-1"><span>{currency.symbol}</span>{payment}</div><div className="text-xs text-slate-500 mt-1">{currency.code}</div></div>)}
        </div>
    );
}

const RandomGenerator = () => {
    const [mode, setMode] = useState<'number' | 'list' | 'password'>('number');
    const [res, setRes] = useState<string | null>(null);

    // Number
    const [min, setMin] = useState('1');
    const [max, setMax] = useState('100');
    const [count, setCount] = useState('1');
    const [noDupes, setNoDupes] = useState(false);

    // List
    const [listInput, setListInput] = useState('');

    // Password
    const [pwdLen, setPwdLen] = useState(12);
    const [useUpper, setUseUpper] = useState(true);
    const [useLower, setUseLower] = useState(true);
    const [useNum, setUseNum] = useState(true);
    const [useSym, setUseSym] = useState(true);

    const generate = () => {
        if (mode === 'number') {
            const mn = parseInt(min);
            const mx = parseInt(max);
            const c = parseInt(count);
            if (isNaN(mn) || isNaN(mx) || isNaN(c) || c < 1) return;
            
            const results = [];
            if (noDupes && (mx - mn + 1) < c) {
                setRes("Range too small for unique numbers.");
                return;
            }

            if (noDupes) {
                const pool = [];
                for (let i = mn; i <= mx; i++) pool.push(i);
                for (let i = 0; i < c; i++) {
                    const idx = Math.floor(Math.random() * pool.length);
                    results.push(pool[idx]);
                    pool.splice(idx, 1);
                }
            } else {
                for (let i = 0; i < c; i++) {
                    results.push(Math.floor(Math.random() * (mx - mn + 1)) + mn);
                }
            }
            setRes(results.join(', '));
        } else if (mode === 'list') {
            const items = listInput.split('\n').map(s => s.trim()).filter(s => s);
            if (items.length === 0) return;
            const winner = items[Math.floor(Math.random() * items.length)];
            setRes(winner);
        } else {
            const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const lower = 'abcdefghijklmnopqrstuvwxyz';
            const num = '0123456789';
            const sym = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
            
            let charset = '';
            if (useUpper) charset += upper;
            if (useLower) charset += lower;
            if (useNum) charset += num;
            if (useSym) charset += sym;
            
            if (!charset) { setRes("Select at least one option."); return; }

            let pwd = '';
            for (let i = 0; i < pwdLen; i++) {
                pwd += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            setRes(pwd);
        }
    };

    const reset = () => {
        setRes(null);
        if(mode === 'number') { setMin('1'); setMax('100'); setCount('1'); setNoDupes(false); }
        if(mode === 'list') { setListInput(''); }
        if(mode === 'password') { setPwdLen(12); setUseUpper(true); setUseLower(true); setUseNum(true); setUseSym(true); }
    };

    const copyToClipboard = () => {
        if(res) {
            navigator.clipboard.writeText(res);
            // Could add toast here
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex bg-slate-800 rounded-lg p-1">
                <button onClick={() => { setMode('number'); setRes(null); }} className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-1 ${mode === 'number' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}><Dices size={14}/> Number</button>
                <button onClick={() => { setMode('list'); setRes(null); }} className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-1 ${mode === 'list' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}><ListIcon size={14}/> List</button>
                <button onClick={() => { setMode('password'); setRes(null); }} className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-1 ${mode === 'password' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}><Lock size={14}/> Pass</button>
            </div>

            {mode === 'number' && (
                <div className="space-y-3 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-slate-400 text-xs mb-1">Min</label><input type="number" value={min} onChange={e => setMin(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" /></div>
                        <div><label className="block text-slate-400 text-xs mb-1">Max</label><input type="number" value={max} onChange={e => setMax(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" /></div>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="flex-1"><label className="block text-slate-400 text-xs mb-1">Count</label><input type="number" value={count} onChange={e => setCount(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" /></div>
                         <div className="flex items-center gap-2 pt-4">
                            <input type="checkbox" checked={noDupes} onChange={e => setNoDupes(e.target.checked)} id="dupe" className="w-4 h-4 rounded accent-cyan-600" />
                            <label htmlFor="dupe" className="text-sm text-slate-300">Unique?</label>
                         </div>
                    </div>
                </div>
            )}

            {mode === 'list' && (
                <div className="animate-fade-in">
                    <label className="block text-slate-400 text-sm mb-2">Items (one per line)</label>
                    <textarea 
                        value={listInput} 
                        onChange={e => setListInput(e.target.value)} 
                        placeholder="Alice&#10;Bob&#10;Charlie" 
                        className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-mono text-sm whitespace-pre"
                    />
                </div>
            )}

            {mode === 'password' && (
                <div className="space-y-4 animate-fade-in">
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-slate-400 text-xs">Length: {pwdLen}</label>
                        </div>
                        <input type="range" min="4" max="64" value={pwdLen} onChange={e => setPwdLen(parseInt(e.target.value))} className="w-full accent-cyan-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                        <label className="flex items-center gap-2 bg-slate-800 p-2 rounded cursor-pointer"><input type="checkbox" checked={useUpper} onChange={e => setUseUpper(e.target.checked)} className="accent-cyan-600"/> ABC</label>
                        <label className="flex items-center gap-2 bg-slate-800 p-2 rounded cursor-pointer"><input type="checkbox" checked={useLower} onChange={e => setUseLower(e.target.checked)} className="accent-cyan-600"/> abc</label>
                        <label className="flex items-center gap-2 bg-slate-800 p-2 rounded cursor-pointer"><input type="checkbox" checked={useNum} onChange={e => setUseNum(e.target.checked)} className="accent-cyan-600"/> 123</label>
                        <label className="flex items-center gap-2 bg-slate-800 p-2 rounded cursor-pointer"><input type="checkbox" checked={useSym} onChange={e => setUseSym(e.target.checked)} className="accent-cyan-600"/> #@!</label>
                    </div>
                </div>
            )}

            <div className="flex gap-3">
                <button onClick={generate} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg active:scale-95 transition-all">
                    Generate {mode === 'list' ? 'Pick' : ''}
                </button>
                <button onClick={reset} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-3 rounded-lg" title="Reset"><RotateCcw size={20} /></button>
            </div>

            {res && (
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 relative group animate-fade-in break-words">
                    <button onClick={copyToClipboard} className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-white bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity" title="Copy"><Copy size={14}/></button>
                    <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Result</div>
                    <div className="text-xl font-mono text-white leading-relaxed">{res}</div>
                </div>
            )}
        </div>
    );
};

const GpaCalculator = () => {
  const GRADES: Record<string, number> = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  const [courses, setCourses] = useState([{ id: 1, grade: 'A', credits: '' }]);
  const [gpa, setGpa] = useState<string | null>(null);

  const addCourse = () => {
    setCourses([...courses, { id: Date.now(), grade: 'A', credits: '' }]);
  };

  const removeCourse = (id: number) => {
    if (courses.length > 1) {
        setCourses(courses.filter(c => c.id !== id));
    }
  };

  const updateCourse = (id: number, field: string, val: string) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: val } : c));
  };

  const reset = () => {
    setCourses([{ id: Date.now(), grade: 'A', credits: '' }]);
    setGpa(null);
  };

  const calculate = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    courses.forEach(c => {
      const cred = parseFloat(c.credits);
      if (!isNaN(cred) && cred > 0) {
        totalPoints += GRADES[c.grade] * cred;
        totalCredits += cred;
      }
    });
    if (totalCredits > 0) {
      setGpa((totalPoints / totalCredits).toFixed(2));
    } else {
      setGpa(null);
    }
  };

  return (
    <div className="space-y-6">
        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
            {courses.map((course, idx) => (
                <div key={course.id} className="flex gap-2 items-center animate-fade-in">
                    <div className="w-8 text-center text-slate-500 text-sm font-bold">{idx + 1}</div>
                    <div className="flex-1">
                        <select 
                            value={course.grade} 
                            onChange={(e) => updateCourse(course.id, 'grade', e.target.value)} 
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white appearance-none"
                        >
                            {Object.keys(GRADES).map(g => (
                                <option key={g} value={g}>{g} ({GRADES[g]})</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-24">
                        <input 
                            type="number" 
                            placeholder="Credits" 
                            value={course.credits} 
                            onChange={(e) => updateCourse(course.id, 'credits', e.target.value)} 
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-center placeholder:text-slate-600"
                        />
                    </div>
                    <button 
                        onClick={() => removeCourse(course.id)} 
                        className={`p-3 rounded-lg transition-colors ${courses.length > 1 ? 'text-red-400 hover:bg-red-900/30' : 'text-slate-600 cursor-not-allowed'}`}
                    >
                        <X size={18} />
                    </button>
                </div>
            ))}
        </div>

        <button onClick={addCourse} className="w-full py-2 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 rounded-xl transition-all flex items-center justify-center gap-2">
            <Plus size={18} /> Add Course
        </button>

        <div className="flex gap-3">
            <button onClick={calculate} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg shadow-lg active:scale-95 transition-all">Calculate GPA</button>
            <button onClick={reset} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-3 rounded-lg" title="Reset"><RotateCcw size={20} /></button>
        </div>

        {gpa && (
            <div className="p-6 bg-slate-800 rounded-2xl text-center border border-purple-500/30 shadow-xl shadow-purple-900/20 animate-scale-in">
                <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Cumulative GPA</div>
                <div className="text-5xl font-bold text-white mb-2 tracking-tighter">{gpa}</div>
                <div className="text-sm text-purple-400 font-medium">Out of 4.00 Scale</div>
            </div>
        )}
    </div>
  );
};

const SkinToneCalculator = () => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({ veins: '', sun: '', jewelry: '' });
    const [result, setResult] = useState<'Cool' | 'Warm' | 'Neutral' | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // File input ref to allow resetting
    const fileInputRef = useRef<HTMLInputElement>(null);
    const camInputRef = useRef<HTMLInputElement>(null);

    const questions = [
        {
            key: 'veins',
            text: 'Look at the veins on your wrist. What color are they?',
            options: [
                { val: 'Cool', label: 'Blue or Purple' },
                { val: 'Warm', label: 'Green or Olive' },
                { val: 'Neutral', label: 'Mixed / Hard to tell' }
            ]
        },
        {
            key: 'sun',
            text: 'How does your skin react to the sun without sunscreen?',
            options: [
                { val: 'Cool', label: 'Burns easily, rarely tans' },
                { val: 'Warm', label: 'Tans easily, rarely burns' },
                { val: 'Neutral', label: 'Burns first, then tans' }
            ]
        },
        {
            key: 'jewelry',
            text: 'Which jewelry metal looks best on your skin?',
            options: [
                { val: 'Cool', label: 'Silver / Platinum' },
                { val: 'Warm', label: 'Gold' },
                { val: 'Neutral', label: 'Both look good' }
            ]
        }
    ];

    const handleSelect = (val: string) => {
        const key = questions[step].key;
        const newAnswers = { ...answers, [key]: val };
        setAnswers(newAnswers);

        if (step < 2) {
            setStep(step + 1);
        } else {
            calculate(newAnswers);
        }
    };

    const calculate = (finalAnswers: typeof answers) => {
        let cool = 0, warm = 0, neutral = 0;
        Object.values(finalAnswers).forEach(v => {
            if (v === 'Cool') cool++;
            else if (v === 'Warm') warm++;
            else neutral++;
        });

        if (cool > warm && cool > neutral) setResult('Cool');
        else if (warm > cool && warm > neutral) setResult('Warm');
        else setResult('Neutral');
    };

    const reset = () => {
        setStep(0);
        setAnswers({ veins: '', sun: '', jewelry: '' });
        setResult(null);
        setIsAnalyzing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (camInputRef.current) camInputRef.current.value = '';
    };

    const handleImageAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const base64 = (reader.result as string).split(',')[1];
                const prompt = `Analyze this image of skin/veins. Determine the skin undertone (Cool, Warm, or Neutral). 
                Rules:
                1. Look at vein color (Blue/Purple = Cool, Green/Olive = Warm, Mixed = Neutral).
                2. Look at overall complexion.
                Return JSON format: { "text": "Cool" (or Warm or Neutral), "explanation": "Reasoning..." }`;
                
                const res = await solveImageWithGemini(base64, prompt);
                
                if (res.text && ['Cool', 'Warm', 'Neutral'].includes(res.text.trim())) {
                    setResult(res.text.trim() as any);
                } else {
                     alert("Could not determine undertone from image. Please try the quiz.");
                }
            } catch (error) {
                alert("Image analysis failed.");
            } finally {
                setIsAnalyzing(false);
            }
        };
    };

    const PALETTES = {
        Cool: {
            colors: ['#1e3a8a', '#047857', '#86198f', '#2e2e2e', '#ffffff', '#7c3aed'],
            avoid: 'Orange, Tomato Red, Strong Yellows',
            match: 'Royal Blue & Emerald'
        },
        Warm: {
            colors: ['#ca8a04', '#4d7c0f', '#f97316', '#78350f', '#fef3c7', '#dc2626'],
            avoid: 'Icy Blues, Jewel Tones',
            match: 'Mustard & Olive'
        },
        Neutral: {
            colors: ['#fce7f3', '#ccfbf1', '#e5e7eb', '#a8a29e', '#fca5a5', '#99f6e4'],
            avoid: 'Neon colors, Bright Yellow',
            match: 'Dusty Pink & Soft Teal'
        }
    };

    if (result) {
        const p = PALETTES[result];
        return (
            <div className="space-y-6 animate-fade-in text-center">
                <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl">
                    <h3 className="text-slate-400 text-sm uppercase font-bold mb-2">Your Undertone</h3>
                    <div className="text-4xl font-bold text-white mb-2">{result}</div>
                    <p className="text-slate-500 text-xs">Based on your veins, sun reaction, and contrast.</p>
                </div>

                <div>
                    <h4 className="text-left text-white font-bold mb-3 flex items-center gap-2"><Palette size={18} className="text-cyan-400"/> Best Clothing Colors</h4>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {p.colors.map((c, i) => (
                            <div key={i} className="h-12 rounded-lg shadow-md border border-white/10" style={{ backgroundColor: c }}></div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-red-500/20">
                        <div className="text-red-400 text-xs font-bold uppercase mb-1">Avoid</div>
                        <div className="text-slate-300 text-sm">{p.avoid}</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-emerald-500/20">
                        <div className="text-emerald-400 text-xs font-bold uppercase mb-1">Perfect Match</div>
                        <div className="text-slate-300 text-sm">{p.match}</div>
                    </div>
                </div>

                <button onClick={reset} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                    <RotateCcw size={18} /> Test Again
                </button>
            </div>
        );
    }

    const q = questions[step];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step {step + 1} of 3</span>
                <div className="flex gap-1">
                    {[0,1,2].map(i => <div key={i} className={`h-1.5 w-6 rounded-full ${i <= step ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>)}
                </div>
            </div>

            {step === 0 && (
                <div className="mb-8 p-4 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl border border-indigo-500/30">
                    <h4 className="text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2">
                        <Zap size={16} /> AI Vein Analysis
                    </h4>
                    <div className="flex gap-3">
                        <label className={`flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg relative overflow-hidden group ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}>
                            {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                            <span className="text-sm font-bold">{isAnalyzing ? 'Scanning...' : 'Camera Scan'}</span>
                            <input ref={camInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageAnalysis} disabled={isAnalyzing} />
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </label>
                        <label className={`flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95 ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Upload size={18} />
                            <span className="text-sm font-bold">Upload</span>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageAnalysis} disabled={isAnalyzing} />
                        </label>
                    </div>
                    <div className="mt-2 text-[10px] text-indigo-400 text-center">
                        Take a photo of your wrist veins in natural light.
                    </div>
                </div>
            )}

            <h3 className="text-xl font-bold text-white mb-6 leading-relaxed">{q.text}</h3>

            <div className="space-y-3">
                {q.options.map((opt) => (
                    <button
                        key={opt.val}
                        onClick={() => handleSelect(opt.val)}
                        className="w-full text-left p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500 hover:bg-slate-750 transition-all group flex justify-between items-center"
                    >
                        <span className="text-slate-200 font-medium">{opt.label}</span>
                        <div className="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-cyan-500 flex items-center justify-center">
                            {answers[q.key as keyof typeof answers] === opt.val && <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full"></div>}
                        </div>
                    </button>
                ))}
            </div>
            
            {step > 0 && (
                 <button onClick={reset} className="mt-4 text-slate-500 text-xs hover:text-white underline">Restart Quiz</button>
            )}
        </div>
    );
};

// --- Main Wrapper ---

export const ToolSuite: React.FC<ToolSuiteProps> = ({ tool }) => {
  const renderTool = () => {
    switch (tool.component) {
      case 'AGE_CALC': return <AgeCalculator />;
      case 'DATE_DIFF': return <DateDifferenceCalculator />;
      case 'LAND_CONV': return <LandConverter />;
      case 'BMI_CALC': return <BmiCalculator />;
      case 'LOAN_CALC': return <LoanCalculator />;
      case 'STATS_CALC': return <StatsCalculator />;
      case 'UNIT_CONV': return <UnitConverter />;
      case 'COMPASS': return <CompassTool />;
      case 'RANDOM_GEN': return <RandomGenerator />;
      case 'GPA_CALC': return <GpaCalculator />;
      case 'SKIN_TONE': return <SkinToneCalculator />;
      default: return <div className="text-center text-slate-500 p-8">Tool Interface Under Construction</div>;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex items-center gap-3">
        <div className="text-cyan-400"><tool.icon /></div>
        <h2 className="text-lg font-bold text-white">{tool.label}</h2>
      </div>
      <div className="p-4 sm:p-6">
        {renderTool()}
      </div>
    </div>
  );
};