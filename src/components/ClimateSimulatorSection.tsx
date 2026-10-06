import React, { useState, useMemo } from 'react';
import { WeatherDataPayload } from '../types/weather';
import { calculateWeatherRisk } from '../engine/riskCalculator';
import { ExtractedWeatherFeatures } from '../engine/dataProcessor';
import {
  Sliders,
  Sparkles,
  CloudRain,
  Flame,
  Wind,
  Droplets,
  RotateCcw,
  Zap,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface ClimateSimulatorSectionProps {
  data: WeatherDataPayload;
}

export const ClimateSimulatorSection: React.FC<ClimateSimulatorSectionProps> = ({ data }) => {
  // Simulator Modifiers
  const [extraRainfall, setExtraRainfall] = useState<number>(0); // mm
  const [tempShift, setTempShift] = useState<number>(0); // °C (-5 to +12)
  const [windSurge, setWindSurge] = useState<number>(0); // km/h (0 to +70)
  const [humidityShift, setHumidityShift] = useState<number>(0); // % (-30 to +30)
  const [pressureDrop, setPressureDrop] = useState<number>(0); // hPa (0 to -10)

  // Baseline extraction from active dataset
  const baseline = data.prediction;
  const current = data.current;

  // Compute simulated features
  const simulatedRisk = useMemo(() => {
    const p24 = Math.max(0, baseline.rainfallOutlook.next24HoursAccumulation + extraRainfall);
    const pRate = Math.max(0, baseline.rainfallOutlook.currentRainfallRate + (extraRainfall > 0 ? extraRainfall * 0.15 : 0));
    const prob = Math.min(100, Math.max(0, baseline.rainfallOutlook.peakProbability + (extraRainfall > 0 ? 30 : 0)));

    const cTemp = current.temperature + tempShift;
    const maxTemp = baseline.metricsSummary.maxTemp24h + tempShift;
    const minTemp = baseline.metricsSummary.minTemp24h + tempShift;

    const cWind = current.windSpeed + windSurge;
    const maxWind = baseline.metricsSummary.maxWind24h + windSurge;

    const cHumidity = Math.min(100, Math.max(10, current.humidity + humidityShift));
    const avgHumidity = Math.min(100, Math.max(10, baseline.metricsSummary.avgHumidity24h + humidityShift));

    const simulatedFeatures: ExtractedWeatherFeatures = {
      currentTemp: cTemp,
      feelsLikeTemp: cTemp + (cHumidity > 70 ? 3 : 0),
      currentHumidity: cHumidity,
      currentPrecipitationRate: pRate,
      currentWindSpeed: cWind,
      currentPressure: current.pressure - pressureDrop,
      currentCloudCover: Math.min(100, current.cloudCover + (extraRainfall > 0 ? 40 : 0)),
      weatherCode: extraRainfall > 40 ? 65 : current.weatherCode,
      avgTemp24h: baseline.metricsSummary.avgTemp24h + tempShift,
      minTemp24h: minTemp,
      maxTemp24h: maxTemp,
      avgHumidity24h: avgHumidity,
      accumulatedPrecipitation24h: p24,
      accumulatedPrecipitation3h: baseline.rainfallOutlook.next3HoursAccumulation + extraRainfall * 0.35,
      peakPrecipitationProbability24h: prob,
      maxWindSpeed24h: maxWind,
      accumulatedPrecipitation7d: baseline.rainfallOutlook.next7DaysAccumulation + extraRainfall * 1.5,
      pressureTrendDelta: -pressureDrop,
    };

    return calculateWeatherRisk(simulatedFeatures);
  }, [
    extraRainfall,
    tempShift,
    windSurge,
    humidityShift,
    pressureDrop,
    baseline,
    current,
  ]);

  const resetSimulator = () => {
    setExtraRainfall(0);
    setTempShift(0);
    setWindSurge(0);
    setHumidityShift(0);
    setPressureDrop(0);
  };

  const applyPreset = (preset: 'cloudburst' | 'heatwave' | 'cyclone' | 'calm') => {
    if (preset === 'cloudburst') {
      setExtraRainfall(75);
      setTempShift(-2);
      setWindSurge(30);
      setHumidityShift(25);
      setPressureDrop(4);
    } else if (preset === 'heatwave') {
      setExtraRainfall(0);
      setTempShift(7);
      setWindSurge(10);
      setHumidityShift(-20);
      setPressureDrop(1);
    } else if (preset === 'cyclone') {
      setExtraRainfall(110);
      setTempShift(-3);
      setWindSurge(60);
      setHumidityShift(30);
      setPressureDrop(8);
    } else if (preset === 'calm') {
      resetSimulator();
    }
  };

  const scoreDiff = simulatedRisk.totalScore - baseline.riskScore;

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Atmospheric & What-If Climate Simulator
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                v2.0 AI Sandbox
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Perturb environmental vectors in real time to simulate catastrophic weather triggers
            </p>
          </div>
        </div>

        <button
          onClick={resetSimulator}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Parameters</span>
        </button>
      </div>

      {/* Preset Scenario Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs font-semibold text-slate-400 mr-1">One-Click Scenarios:</span>
        <button
          onClick={() => applyPreset('cloudburst')}
          className="px-3 py-1.5 rounded-lg bg-blue-950/70 hover:bg-blue-900/80 border border-blue-800/80 text-blue-200 text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
        >
          <CloudRain className="w-3.5 h-3.5 text-blue-400" />
          <span>Monsoon Cloudburst (+75mm)</span>
        </button>
        <button
          onClick={() => applyPreset('heatwave')}
          className="px-3 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 border border-amber-800/80 text-amber-200 text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Peak May Heatwave (+7°C)</span>
        </button>
        <button
          onClick={() => applyPreset('cyclone')}
          className="px-3 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900/80 border border-red-800/80 text-red-200 text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Wind className="w-3.5 h-3.5 text-red-400" />
          <span>Coastal Super Cyclone (+60km/h)</span>
        </button>
        <button
          onClick={() => applyPreset('calm')}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Baseline Live Weather</span>
        </button>
      </div>

      {/* Grid: Controls on Left, Live Outcome on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sliders Panel */}
        <div className="lg:col-span-7 space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          {/* Slider 1: Extra Rainfall */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                Additional Precipitation Volume
              </span>
              <span className="font-mono text-cyan-300 font-bold">+{extraRainfall} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={extraRainfall}
              onChange={(e) => setExtraRainfall(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>0 mm (Normal)</span>
              <span>+60 mm (Downpour)</span>
              <span>+120 mm (Flood Hazard)</span>
            </div>
          </div>

          {/* Slider 2: Temperature Shift */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Flame className="w-4 h-4 text-amber-400" />
                Thermal Dynamic Shift
              </span>
              <span className="font-mono text-amber-300 font-bold">
                {tempShift > 0 ? `+${tempShift}` : tempShift}°C
              </span>
            </div>
            <input
              type="range"
              min="-5"
              max="12"
              step="1"
              value={tempShift}
              onChange={(e) => setTempShift(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>-5°C (Cool Wave)</span>
              <span>0°C (Current)</span>
              <span>+12°C (Heatwave Alert)</span>
            </div>
          </div>

          {/* Slider 3: Wind Squall Surge */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Wind className="w-4 h-4 text-blue-400" />
                Wind Velocity & Squall Surge
              </span>
              <span className="font-mono text-blue-300 font-bold">+{windSurge} km/h</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="5"
              value={windSurge}
              onChange={(e) => setWindSurge(Number(e.target.value))}
              className="w-full accent-blue-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>0 km/h</span>
              <span>+35 km/h (Breezy)</span>
              <span>+70 km/h (Gale Storm)</span>
            </div>
          </div>

          {/* Slider 4: Humidity Saturation */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Droplets className="w-4 h-4 text-teal-400" />
                Atmospheric Saturation (Relative Humidity)
              </span>
              <span className="font-mono text-teal-300 font-bold">
                {humidityShift > 0 ? `+${humidityShift}` : humidityShift}%
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="5"
              value={humidityShift}
              onChange={(e) => setHumidityShift(Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Slider 5: Barometric Drop */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Zap className="w-4 h-4 text-rose-400" />
                Barometric Cyclonic Pressure Drop
              </span>
              <span className="font-mono text-rose-300 font-bold">-{pressureDrop} hPa</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={pressureDrop}
              onChange={(e) => setPressureDrop(Number(e.target.value))}
              className="w-full accent-rose-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>

        {/* Live Simulation Outcomes Panel */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800/80 border border-slate-700/80 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-4">
              <span className="text-xs uppercase font-mono font-bold text-slate-400">
                Engine Risk Impact
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  scoreDiff > 0
                    ? 'bg-rose-500/20 text-rose-300'
                    : scoreDiff < 0
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {scoreDiff > 0 ? `+${scoreDiff} pts` : scoreDiff < 0 ? `${scoreDiff} pts` : 'No Delta'}
              </span>
            </div>

            {/* Score Comparison Display */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Baseline</span>
                <span className="text-2xl font-black text-slate-300">{baseline.riskScore}</span>
                <span className="text-[10px] block text-slate-400 mt-0.5">{baseline.riskLevel}</span>
              </div>

              <div
                className="p-3 rounded-lg border text-center transition-colors"
                style={{
                  backgroundColor:
                    simulatedRisk.totalScore >= 70
                      ? 'rgba(239, 68, 68, 0.15)'
                      : simulatedRisk.totalScore >= 45
                      ? 'rgba(249, 115, 22, 0.15)'
                      : simulatedRisk.totalScore >= 25
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'rgba(16, 185, 129, 0.15)',
                  borderColor:
                    simulatedRisk.totalScore >= 70
                      ? '#ef4444'
                      : simulatedRisk.totalScore >= 45
                      ? '#f97316'
                      : simulatedRisk.totalScore >= 25
                      ? '#f59e0b'
                      : '#10b981',
                }}
              >
                <span className="text-[10px] text-purple-300 uppercase font-mono block">Simulated</span>
                <span className="text-2xl font-black text-white">{simulatedRisk.totalScore}</span>
                <span className="text-[10px] block font-bold text-white mt-0.5">
                  {simulatedRisk.riskLevel}
                </span>
              </div>
            </div>

            {/* Headline and Explanation */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs mb-4">
              <strong className="text-white block font-semibold mb-1">
                {simulatedRisk.headline}
              </strong>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {simulatedRisk.explanation}
              </p>
            </div>

            {/* Simulated Factor Breakdown */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Factor Contribution Weights
              </span>
              {simulatedRisk.factors.map((f) => (
                <div key={f.name} className="text-xs">
                  <div className="flex justify-between text-slate-300 mb-0.5">
                    <span className="text-[11px] truncate max-w-[180px]">{f.name}</span>
                    <span className="font-mono text-[11px] font-bold">
                      {f.score} / {f.maxScore}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        f.score / f.maxScore > 0.7
                          ? 'bg-red-400'
                          : f.score / f.maxScore > 0.4
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${(f.score / f.maxScore) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
