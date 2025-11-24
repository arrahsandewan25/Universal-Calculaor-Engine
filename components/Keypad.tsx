import React from 'react';
import { ButtonConfig, CalcMode } from '../types';
import { BASIC_KEYS, SCIENTIFIC_KEYS, FINANCIAL_KEYS, ENGINEERING_KEYS, CHEMISTRY_KEYS } from '../constants';

interface KeypadProps {
  mode: CalcMode;
  onPress: (btn: ButtonConfig) => void;
}

export const Keypad: React.FC<KeypadProps> = ({ mode, onPress }) => {
  
  const getExtraKeys = () => {
    switch (mode) {
      case CalcMode.SCIENTIFIC: return SCIENTIFIC_KEYS;
      case CalcMode.FINANCIAL: return FINANCIAL_KEYS;
      case CalcMode.ENGINEERING: return ENGINEERING_KEYS;
      case CalcMode.CHEMISTRY: return CHEMISTRY_KEYS;
      default: return []; // Basic only has basic keys
    }
  };

  const extraKeys = getExtraKeys();

  return (
    <div className="flex flex-col gap-4">
      {/* Function Row (Contextual) */}
      {mode !== CalcMode.BASIC && (
         <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
            {extraKeys.map((btn, idx) => (
              <button
                key={`extra-${idx}`}
                onClick={() => onPress(btn)}
                className="h-10 text-xs sm:text-sm font-medium text-cyan-200 bg-slate-700 hover:bg-slate-600 rounded shadow transition-all active:scale-95"
                title={btn.tooltip}
              >
                {btn.label}
              </button>
            ))}
         </div>
      )}

      {/* Main NumPad */}
      <div className="grid grid-cols-4 gap-3">
        {BASIC_KEYS.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => onPress(btn)}
            className={`
              h-14 sm:h-16 text-lg sm:text-xl font-semibold rounded-2xl shadow-lg transition-all active:scale-95
              flex items-center justify-center
              ${btn.className || 'bg-slate-700 text-slate-100 hover:bg-slate-600'}
            `}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};