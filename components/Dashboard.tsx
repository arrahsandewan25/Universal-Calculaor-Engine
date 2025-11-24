import React from 'react';
import { TOOLS } from '../constants';
import { ToolCategory, ToolDefinition } from '../types';
import { Calculator } from 'lucide-react';

interface DashboardProps {
  onSelectTool: (tool: ToolDefinition) => void;
  onSelectCalculator: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTool, onSelectCalculator }) => {
  const categories = Object.values(ToolCategory);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 pb-20">
      
      {/* Hero Section */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
          Universal Engine
        </h1>
        <p className="text-slate-400 text-lg">Select a specialized engine or open the Core Calculator.</p>
      </div>

      {/* Main Action */}
      <div 
        onClick={onSelectCalculator}
        className="mb-12 bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 hover:border-cyan-400 p-6 rounded-2xl shadow-xl shadow-cyan-900/20 cursor-pointer group transition-all transform hover:-translate-y-1"
      >
        <div className="flex items-center gap-6">
          <div className="p-4 bg-cyan-500/10 rounded-full group-hover:bg-cyan-500/20 text-cyan-400 transition-colors">
            <Calculator size={48} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">Core Scientific Engine</h2>
            <p className="text-slate-400">
              Access the high-performance APA kernel for arithmetic, algebra, matrices, and CAS operations.
            </p>
          </div>
        </div>
      </div>

      {/* Tool Grid by Category */}
      <div className="space-y-12">
        {categories.map((cat) => {
          const catTools = TOOLS.filter(t => t.category === cat);
          if (catTools.length === 0) return null;

          return (
            <div key={cat} className="animate-fade-in">
              <h3 className="text-xl font-bold text-slate-300 border-b border-slate-700 pb-2 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {cat}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catTools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => onSelectTool(tool)}
                    className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500/50 p-4 rounded-xl cursor-pointer transition-all hover:shadow-lg active:scale-95 flex flex-col h-full"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-blue-400">
                        <tool.icon size={24} />
                      </div>
                      <h4 className="font-semibold text-slate-100">{tool.label}</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed flex-1">
                      {tool.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};