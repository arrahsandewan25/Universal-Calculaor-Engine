import React from 'react';
import { CalcMode, HistoryItem } from '../types';
import { Calculator, Beaker, Landmark, Cpu, BrainCircuit, History, X, LayoutGrid, ChevronRight, Trash2 } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: CalcMode;
  onSelectMode: (m: CalcMode) => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onNavigateHome: () => void;
  onClearHistory?: () => void; // Optional prop for future extension, or implemented locally if passed
}

// Updating props definition to include setHistory or a clear function
// But since the parent holds state, we might need to update the interface or just render the list.
// For this implementation, I'll assume the parent might pass a clear handler, or I'll modify parent.
// Since I can only edit Sidebar.tsx here, I will add the UI element. 
// WAIT - To make it functional I need to update App.tsx too. 
// Given constraints, I will add the UI and if no handler is passed, it just won't click.
// Actually, to be "Perfect", I should update App.tsx to pass the handler.
// Let's check App.tsx... it doesn't pass onClearHistory.
// I will update App.tsx as well in the next block.

// Revised Interface
interface SidebarPropsExtended extends SidebarProps {
    onClearHistory: () => void;
}

export const Sidebar: React.FC<SidebarPropsExtended> = ({ 
  isOpen, 
  onClose, 
  currentMode, 
  onSelectMode, 
  history, 
  onSelectHistory, 
  onNavigateHome,
  onClearHistory
}) => {
  
  const modes = [
    { id: CalcMode.BASIC, label: 'Basic Calculator', icon: <Calculator size={18} /> },
    { id: CalcMode.SCIENTIFIC, label: 'Scientific', icon: <Cpu size={18} /> },
    { id: CalcMode.FINANCIAL, label: 'Financial', icon: <Landmark size={18} /> },
    { id: CalcMode.ENGINEERING, label: 'Engineering', icon: <Cpu size={18} /> },
    { id: CalcMode.CHEMISTRY, label: 'Chemistry', icon: <Beaker size={18} /> },
    { id: CalcMode.AI_CAS, label: 'AI Solver (CAS)', icon: <BrainCircuit size={18} /> },
  ];

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <div className={`
        fixed inset-y-0 left-0 z-[60] w-80 bg-slate-900 border-r border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white tracking-wider flex items-center gap-3">
            <div className="w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></div>
            UCE CORE
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin">
          
          {/* Main Navigation */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Navigation</div>
            <button 
              onClick={() => { onNavigateHome(); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-slate-800 to-slate-800/50 text-cyan-400 border border-slate-700/50 hover:border-cyan-500/50 hover:text-cyan-300 transition-all shadow-lg shadow-black/20 group"
            >
              <LayoutGrid size={20} className="group-hover:scale-110 transition-transform" />
              Dashboard
            </button>
          </div>

          {/* Calculator Modes */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Kernels</div>
            <div className="space-y-1">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { onSelectMode(m.id); onClose(); }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all border border-transparent
                    ${currentMode === m.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-700'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {m.icon}
                    {m.label}
                  </div>
                  {currentMode === m.id && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* History Section */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><History size={14} /> Recent</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{history.length}</span>
                {history.length > 0 && (
                    <button onClick={onClearHistory} className="text-slate-500 hover:text-red-400 transition-colors" title="Clear History">
                        <Trash2 size={12} />
                    </button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              {history.length === 0 && (
                <div className="px-4 py-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                  <p className="text-slate-600 text-sm italic">Memory Empty</p>
                </div>
              )}
              {history.slice(0, 5).map((item) => (
                <button
                  key={item.id} 
                  onClick={() => { onSelectHistory(item); onClose(); }}
                  className="w-full text-left bg-slate-800/30 hover:bg-slate-800 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-all group"
                >
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{item.mode}</span>
                      {item.isAi && <span className="text-[10px] text-purple-400 font-bold px-1 rounded bg-purple-900/20">AI</span>}
                   </div>
                   <div className="text-slate-300 font-mono text-sm truncate mb-1 opacity-80 group-hover:opacity-100">{item.expression}</div>
                   <div className="text-emerald-400 font-bold text-sm text-right">= {item.result}</div>
                </button>
              ))}
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-center">
          <p className="text-[10px] text-slate-600">Universal Computational Engine v2.1</p>
        </div>
      </div>
    </>
  );
};