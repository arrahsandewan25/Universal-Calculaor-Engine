import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Camera, Zap, LayoutGrid, ArrowLeft } from 'lucide-react';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ToolSuite } from './components/ToolSuite';
import { StopwatchTimer } from './components/StopwatchTimer';
import { ButtonConfig, CalcMode, HistoryItem, AppView, ToolDefinition } from './types';
import { evaluateLocalExpression, isSimpleCalculation } from './services/mathService';
import { solveWithGemini, solveImageWithGemini } from './services/geminiService';

const App: React.FC = () => {
  // Navigation State
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);

  // Calculator State
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [mode, setMode] = useState<CalcMode>(CalcMode.SCIENTIFIC);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const navigateToCalculator = () => {
    setView(AppView.CALCULATOR);
    setMode(CalcMode.SCIENTIFIC);
    setActiveTool(null);
  };

  const navigateToTool = (tool: ToolDefinition) => {
    if (tool.aiPrompt) {
      // If tool is AI-powered (like Laplace), go to Calculator in AI mode with context
      setView(AppView.CALCULATOR);
      setMode(CalcMode.AI_CAS);
      setExplanation(`AI Context Active: ${tool.description}`);
      setInput(''); // Clear input
      setActiveTool(tool); 
    } else {
      // If it's a form-based tool (Age, BMI)
      setActiveTool(tool);
      setView(AppView.TOOL);
    }
  };

  // Handle Input Changes
  const handleButtonPress = useCallback(async (btn: ButtonConfig) => {
    if (btn.action === 'clear') {
      setInput('');
      setResult('');
      setExplanation(null);
    } else if (btn.action === 'delete') {
      setInput(prev => prev.slice(0, -1));
    } else if (btn.action === 'evaluate') {
      await performCalculation();
    } else {
      setInput(prev => prev + btn.value);
    }
  }, [input, mode]);

  const performCalculation = async () => {
    if (!input) return;

    setIsThinking(true);
    let calcResult = '';
    let calcExplanation = undefined;
    let usedAi = false;

    try {
      // Decision Matrix: Local vs AI
      // If Mode is AI_CAS or logic is not simple -> Use Gemini
      if (mode === CalcMode.AI_CAS || !isSimpleCalculation(input)) {
        usedAi = true;
        // Pass active tool prompt if exists (e.g. "Solve Differential Eq")
        const context = activeTool?.aiPrompt;
        const response = await solveWithGemini(input, mode, context);
        
        if (response.isError) {
             calcResult = "Error";
             calcExplanation = response.text;
        } else {
            // Prefer latex result for display if available
            calcResult = response.latex || response.text;
            if (response.explanation) calcExplanation = response.explanation;
        }

      } else {
        // Local Kernel
        try {
          calcResult = evaluateLocalExpression(input);
        } catch (e) {
          // Fallback to AI if local fails
          usedAi = true;
          const response = await solveWithGemini(input, mode);
          calcResult = response.latex || response.text;
        }
      }

      setResult(calcResult);
      if (calcExplanation) setExplanation(calcExplanation);
      else if (activeTool?.aiPrompt) setExplanation(null); // Clear context msg on success

      // Add to History
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        expression: input,
        result: calcResult,
        timestamp: Date.now(),
        mode: mode,
        isAi: usedAi
      };
      setHistory(prev => [newItem, ...prev]);

    } catch (error) {
      setResult("Error");
    } finally {
      setIsThinking(false);
    }
  };

  const handleCameraInput = () => {
     const input = document.createElement('input');
     input.type = 'file';
     input.accept = 'image/*';
     input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            setIsThinking(true);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = reader.result as string;
                const data = base64.split(',')[1];
                const res = await solveImageWithGemini(data);
                if (res.latex) {
                    setInput(res.latex);
                    setResult(res.text);
                } else {
                    setResult(res.text);
                }
                setIsThinking(false);
            }
        }
     }
     input.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center overflow-x-hidden font-sans selection:bg-cyan-500/30">
      
      {/* Sidebar Overlay */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        currentMode={mode}
        onSelectMode={(m) => {
            setMode(m);
            setView(AppView.CALCULATOR);
            setActiveTool(null);
            setSidebarOpen(false);
        }}
        history={history}
        onSelectHistory={(item) => {
            setView(AppView.CALCULATOR);
            setInput(item.expression);
            setResult(item.result);
            setMode(item.mode as CalcMode);
            setActiveTool(null);
            setSidebarOpen(false);
        }}
        onNavigateHome={() => {
          setView(AppView.DASHBOARD);
          setSidebarOpen(false);
          setActiveTool(null);
        }}
        onClearHistory={() => setHistory([])}
      />

      {/* Main Container */}
      <main className="w-full max-w-4xl p-3 sm:p-4 flex-1 flex flex-col relative z-0">
        
        {/* Top Bar - Simplified Navigation */}
        <div className="h-16 mb-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 flex items-center justify-between px-3 sm:px-4 rounded-2xl sticky top-2 z-40 shadow-lg shadow-black/20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-all active:scale-95"
              aria-label="Open Menu"
            >
              <Menu size={24} strokeWidth={2.5} />
            </button>

            {view !== AppView.DASHBOARD && (
               <button 
               onClick={() => { setView(AppView.DASHBOARD); setActiveTool(null); }}
               className="p-2 text-cyan-400 hover:text-cyan-300 rounded-full hover:bg-slate-800 transition-colors"
               title="Back to Dashboard"
             >
               <ArrowLeft size={24} strokeWidth={2.5} />
             </button>
            )}
          </div>
          
          <div className="text-sm sm:text-base font-semibold tracking-wider text-slate-300">
             {view === AppView.DASHBOARD ? (
               <span className="flex items-center gap-2">
                 UCE <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-900 text-cyan-300 border border-cyan-800">PRO</span>
               </span>
             ) : (
                <span className="truncate max-w-[150px] inline-block align-bottom text-cyan-100">
                  {activeTool ? activeTool.label : mode.charAt(0) + mode.slice(1).toLowerCase() + ' Kernel'}
                </span>
             )}
          </div>

          <div className="flex gap-2 w-10 justify-end">
            {view === AppView.CALCULATOR && (
              <button 
                  onClick={handleCameraInput}
                  className="p-2 text-slate-400 hover:text-cyan-400 rounded-full hover:bg-slate-800 transition-colors"
                  title="Vision Input"
              >
                  <Camera size={22} />
              </button>
            )}
          </div>
        </div>

        {/* View Router */}
        {view === AppView.DASHBOARD && (
          <Dashboard 
            onSelectTool={navigateToTool}
            onSelectCalculator={navigateToCalculator}
          />
        )}

        {view === AppView.TOOL && activeTool && (
          <div className="flex-1 flex flex-col items-center pt-2 sm:pt-6 animate-fade-in w-full">
             <ToolSuite tool={activeTool} />
          </div>
        )}

        {view === AppView.CALCULATOR && (
          <div className="max-w-lg mx-auto w-full bg-slate-900/50 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-800 p-4 sm:p-6 animate-fade-in relative">
            {/* Output Display */}
            <Display input={input} result={isThinking ? 'Calculating...' : result} mode={activeTool?.label ? `AI: ${activeTool.label}` : mode} />

            {/* AI Explanation Panel */}
            {explanation && (
              <div className="mb-6 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                      <Zap size={12} /> AI Insight
                  </div>
                  <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                      {explanation}
                  </p>
              </div>
            )}

            {/* Input Method */}
            {mode === CalcMode.AI_CAS ? (
              <div className="mb-6">
                  <textarea 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={activeTool?.aiPrompt ? "Enter equation (e.g. y'' + 2y = 0)..." : "Ask UCE complex math questions..."}
                      className="w-full h-32 bg-slate-800/50 rounded-xl border border-slate-700 p-4 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors resize-none font-mono"
                  />
                  <button 
                      onClick={performCalculation}
                      className="mt-4 w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-bold text-white shadow-lg shadow-cyan-900/50 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                      {isThinking ? 'Processing...' : <><Zap size={18} /> Solve with AI</>}
                  </button>
              </div>
            ) : (
              <Keypad mode={mode} onPress={handleButtonPress} />
            )}
          </div>
        )}

      </main>
      
      {/* Global Stopwatch/Timer Widget */}
      <StopwatchTimer />
    </div>
  );
};

export default App;