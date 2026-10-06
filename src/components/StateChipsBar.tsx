import React from 'react';
import { INDIAN_STATES } from '../data/stateData';
import { StateInfo } from '../types/weather';
import { ChevronRight } from 'lucide-react';

interface StateChipsBarProps {
  selectedState: StateInfo;
  onSelectState: (state: StateInfo) => void;
}

export const StateChipsBar: React.FC<StateChipsBarProps> = ({ selectedState, onSelectState }) => {
  return (
    <div className="w-full overflow-x-auto py-2.5 scrollbar-thin flex items-center gap-1.5 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-900/60">
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap mr-1.5 flex items-center gap-1">
        <span>Regions:</span>
      </span>

      {INDIAN_STATES.map((state) => {
        const isSelected = selectedState.id === state.id;
        return (
          <button
            key={state.id}
            onClick={() => onSelectState(state)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              isSelected
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>{state.name}</span>
            <span
              className={`text-[10px] font-mono px-1 rounded ${
                isSelected ? 'bg-slate-900/40 text-slate-950' : 'text-slate-500'
              }`}
            >
              {state.code}
            </span>
          </button>
        );
      })}
    </div>
  );
};
