import React, { useState } from 'react';
import { HourlyForecastItem } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { Clock, Droplets, Wind, Gauge, Sparkles } from 'lucide-react';

interface HourlyTimelineScrubberProps {
  hourly: HourlyForecastItem[];
  tempUnit: 'C' | 'F';
}

export const HourlyTimelineScrubber: React.FC<HourlyTimelineScrubberProps> = ({ hourly, tempUnit }) => {
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(0);

  const display24 = hourly.slice(0, 24);
  const activeHour = display24[selectedHourIndex] || display24[0];

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') return `${Math.round(celsius * 1.8 + 32)}°F`;
    return `${celsius}°C`;
  };

  return (
    <div className="glass-card rounded-2xl p-4 md:p-5 border border-slate-800 shadow-xl overflow-hidden relative">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            24-Hour Synoptic Time Horizon
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Interactive Scrubber
            </span>
          </h4>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
          <span>Active Forecast:</span>
          <strong className="text-cyan-300 font-bold">{activeHour?.hour}</strong>
          <span>•</span>
          <span className="text-slate-300">{activeHour?.condition.label}</span>
        </div>
      </div>

      {/* Selected Hour Detailed Snapshot Banner */}
      {activeHour && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Temp:</span>
            <span className="font-bold text-white font-mono">{formatTemp(activeHour.temperature)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Feels:</span>
            <span className="font-bold text-slate-200 font-mono">{formatTemp(activeHour.feelsLike)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Rain Prob:</span>
            <span className="font-bold text-cyan-400 font-mono">{activeHour.precipitationProbability}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Wind:</span>
            <span className="font-bold text-slate-200 font-mono">{activeHour.windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
            <span className="text-slate-400">Pressure:</span>
            <span className="font-bold text-slate-200 font-mono">{activeHour.pressure} hPa</span>
          </div>
        </div>
      )}

      {/* Horizontal Scrollable Hour Carousel */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
        {display24.map((item, idx) => {
          const isSelected = idx === selectedHourIndex;
          return (
            <button
              key={item.time}
              onClick={() => setSelectedHourIndex(idx)}
              className={`shrink-0 w-20 py-2.5 px-1.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-400/80 shadow-lg shadow-cyan-500/20 scale-105'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
              }`}
            >
              <span className={`text-[11px] font-mono font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`}>
                {idx === 0 ? 'Now' : item.hour}
              </span>

              <WeatherIcon iconName={item.condition.icon} size={22} className={isSelected ? 'text-cyan-300' : 'text-slate-300'} />

              <span className="text-xs font-bold text-white font-mono">
                {formatTemp(item.temperature)}
              </span>

              <div className="w-full px-1">
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{ width: `${item.precipitationProbability}%` }}
                  ></div>
                </div>
                <span className="text-[9px] text-blue-300 font-mono text-center block mt-0.5">
                  {item.precipitationProbability}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
