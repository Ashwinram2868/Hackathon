import React, { useState, useEffect } from 'react';
import { INDIAN_STATES } from '../data/stateData';
import { StateInfo, RiskLevel, StateComparisonItem } from '../types/weather';
import { RiskBadge } from './RiskBadge';
import { WeatherIcon } from './WeatherIcon';
import { fetchWeatherData } from '../services/weatherService';
import {
  Scale,
  Plus,
  X,
  Droplets,
  CloudRain,
  Thermometer,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

interface StateComparisonSectionProps {
  onSelectState: (state: StateInfo) => void;
}

export const StateComparisonSection: React.FC<StateComparisonSectionProps> = ({ onSelectState }) => {
  // Initial states to compare: Tamil Nadu, Kerala, Maharashtra, Delhi
  const [selectedStateCodes, setSelectedStateCodes] = useState<string[]>(['TN', 'KL', 'MH', 'DL', 'KA']);
  const [comparisonItems, setComparisonItems] = useState<StateComparisonItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedToAdd, setSelectedToAdd] = useState<string>('');
  const [sortBy, setSortBy] = useState<'risk' | 'temp' | 'rain' | 'aqi'>('risk');

  const loadComparisonData = async (codes: string[]) => {
    setIsLoading(true);
    const promises = codes.map(async (code) => {
      const state = INDIAN_STATES.find((s) => s.code === code);
      if (!state) return null;

      try {
        const payload = await fetchWeatherData(state.lat, state.lon, state.capital, state.name);
        return {
          state,
          currentTemp: payload.current.temperature,
          avgTemp: payload.prediction.metricsSummary.avgTemp24h,
          humidity: payload.current.humidity,
          precipitation24h: payload.prediction.rainfallOutlook.next24HoursAccumulation,
          rainProbability: payload.prediction.rainfallOutlook.peakProbability,
          windSpeed: payload.current.windSpeed,
          riskScore: payload.prediction.riskScore,
          riskLevel: payload.prediction.riskLevel,
          condition: payload.current.condition,
          aqi: payload.airQuality?.aqi ?? 75,
        } as StateComparisonItem;
      } catch (e: any) {
        return {
          state,
          currentTemp: 28,
          avgTemp: 28,
          humidity: 60,
          precipitation24h: 0,
          rainProbability: 0,
          windSpeed: 10,
          riskScore: 20,
          riskLevel: 'Low Risk' as RiskLevel,
          condition: { code: 0, label: 'Clear Sky', description: 'Sunny', icon: 'Sun', category: 'clear' as const },
          aqi: 60,
          error: 'Weather data unavailable',
        } as StateComparisonItem;
      }
    });

    const results = await Promise.all(promises);
    setComparisonItems(results.filter(Boolean) as StateComparisonItem[]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadComparisonData(selectedStateCodes);
  }, [selectedStateCodes]);


  const handleAddState = (code: string) => {
    if (!code || selectedStateCodes.includes(code)) return;
    if (selectedStateCodes.length >= 6) {
      alert('You can compare up to 6 states at a time.');
      return;
    }
    setSelectedStateCodes([...selectedStateCodes, code]);
    setSelectedToAdd('');
  };

  const handleRemoveState = (code: string) => {
    if (selectedStateCodes.length <= 2) {
      alert('Keep at least 2 states for comparative analysis.');
      return;
    }
    setSelectedStateCodes(selectedStateCodes.filter((c) => c !== code));
  };

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Cross-State Meteorological Comparison
            </h3>
            <p className="text-xs text-slate-400">
              Benchmark temperature, rainfall accumulation, humidity, and weather risk across Indian regions
            </p>
          </div>
        </div>

        {/* Add State dropdown, sort & reload */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="risk">Risk Score (Highest First)</option>
              <option value="temp">Temperature</option>
              <option value="rain">24h Rainfall</option>
              <option value="aqi">Air Quality (AQI)</option>
            </select>
          </div>

          <select
            value={selectedToAdd}
            onChange={(e) => handleAddState(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">+ Add State to Compare...</option>
            {INDIAN_STATES.filter((s) => !selectedStateCodes.includes(s.code)).map((s) => (
              <option key={s.code} value={s.code}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>

          <button
            onClick={() => loadComparisonData(selectedStateCodes)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Reload comparison data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      {isLoading && comparisonItems.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Synthesizing real-time comparison matrix...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...comparisonItems]
            .sort((a, b) => {
              if (sortBy === 'risk') return b.riskScore - a.riskScore;
              if (sortBy === 'temp') return b.currentTemp - a.currentTemp;
              if (sortBy === 'rain') return b.precipitation24h - a.precipitation24h;
              if (sortBy === 'aqi') return (b.aqi ?? 0) - (a.aqi ?? 0);
              return 0;
            })
            .map((item) => (
            <div
              key={item.state.code}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all relative flex flex-col justify-between group"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-white text-base leading-tight">
                        {item.state.name}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.state.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.state.capital}</p>
                  </div>

                  <button
                    onClick={() => handleRemoveState(item.state.code)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors opacity-70 group-hover:opacity-100"
                    title="Remove from comparison"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Risk Level Badge & Score */}
                <div className="my-2.5 flex items-center justify-between">
                  <RiskBadge level={item.riskLevel} size="sm" />
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      Score: {item.riskScore}
                    </span>
                    <span className="text-[10px] text-slate-500">/100</span>
                  </div>
                </div>

                {/* Condition row & AQI pill */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 mb-3 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <WeatherIcon iconName={item.condition.icon} size={20} />
                    <span className="font-medium text-slate-300 truncate">{item.condition.label}</span>
                  </div>
                  {item.aqi && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30 shrink-0">
                      AQI {item.aqi}
                    </span>
                  )}
                </div>

                {/* Metric comparisons */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                      Temperature
                    </span>
                    <span className="font-mono font-semibold text-slate-200">
                      {item.currentTemp}°C <span className="text-[10px] text-slate-400">({item.avgTemp}° avg)</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                      24h Rainfall
                    </span>
                    <span className="font-mono font-semibold text-cyan-300">
                      {item.precipitation24h} mm
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" />
                      Humidity
                    </span>
                    <span className="font-mono font-semibold text-blue-300">
                      {item.humidity}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      Rain Probability
                    </span>
                    <span className="font-mono font-semibold text-teal-300">
                      {item.rainProbability}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Select State button */}
              <button
                onClick={() => onSelectState(item.state)}
                className="mt-4 w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/50 transition-all text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <span>View Full State Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
