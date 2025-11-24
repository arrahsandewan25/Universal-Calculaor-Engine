import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface DisplayProps {
  input: string;
  result: string;
  mode: string;
}

export const Display: React.FC<DisplayProps> = ({ input, result, mode }) => {
  const inputRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Helper to approximate LaTeX from mathjs syntax for preview
  const toLatex = (str: string) => {
    if (!str) return '';
    // Basic replacements for preview - robust sol requires a parser
    return str
      .replace(/\*/g, '\\times ')
      .replace(/\//g, '\\div ')
      .replace(/pi/g, '\\pi ')
      .replace(/sqrt\(/g, '\\sqrt{')
      .replace(/\^/g, '^')
      .replace(/sin\(/g, '\\sin(')
      .replace(/cos\(/g, '\\cos(')
      .replace(/tan\(/g, '\\tan(')
      .replace(/\(/g, '{(') // Help formatting
      .replace(/\)/g, ')}');
  };

  useEffect(() => {
    if (inputRef.current) {
        // If input looks like raw latex (starts with $ or contains slash commands), render as is
        // Otherwise convert basic math string
        const latexStr = input.includes('\\') || input.includes('$') ? input.replace(/\$/g, '') : toLatex(input);
        
        try {
            katex.render(latexStr || '\\text{Ready}', inputRef.current, {
                throwOnError: false,
                displayMode: false
            });
        } catch (e) {
            inputRef.current.innerText = input;
        }
    }
  }, [input]);

  useEffect(() => {
    if (resultRef.current) {
        const latexStr = result.includes('\\') || result.includes('$') ? result.replace(/\$/g, '') : result;
        try {
            katex.render(latexStr, resultRef.current, {
                throwOnError: false,
                displayMode: true
            });
        } catch(e) {
            resultRef.current.innerText = result;
        }
    }
  }, [result]);

  return (
    <div className="w-full h-48 bg-slate-800 rounded-xl mb-6 p-6 flex flex-col justify-between shadow-inner border border-slate-700 relative overflow-hidden">
      {/* Mode Indicator */}
      <div className="absolute top-2 left-4 text-xs font-mono text-cyan-400 opacity-70 tracking-widest uppercase">
        {mode} KERNEL ACTIVE
      </div>

      {/* Input Area */}
      <div className="flex-1 flex items-center justify-end overflow-x-auto overflow-y-hidden text-right">
        <div ref={inputRef} className="text-slate-300 text-2xl font-light tracking-wide min-h-[2rem]" />
      </div>

      {/* Result Area */}
      <div className="h-16 flex items-end justify-end border-t border-slate-700/50 pt-2">
         <div ref={resultRef} className="text-emerald-400 text-4xl font-bold tracking-tight" />
      </div>
    </div>
  );
};