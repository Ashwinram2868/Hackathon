import React from 'react';
import { AirQualityData } from '../types/weather';
import {
  Wind,
  ShieldAlert,
  ShieldCheck,
  Activity,
  HeartPulse,
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface AirQualitySectionProps {
  airQuality?: AirQualityData;
  locationName: string;
}

export const AirQualitySection: React.FC<AirQualitySectionProps> = ({ airQuality, locationName }) => {
  if (!airQuality) return null;

  const { aqi, category, pm25, pm10, no2, so2, co, o3, color, dominantPollutant, advice } = airQuality;

  // Percentage for semi-circular or linear gauge (max 400 for scale)
  const aqiPercentage = Math.min(100, Math.round((aqi / 350) * 100));

  const pollutants = [
    {
      name: 'PM2.5',
      fullName: 'Fine Particulate Matter (≤2.5 µm)',
      value: `${pm25} µg/m³`,
      limit: 'WHO Limit: 15 µg/m³',
      ratio: Math.min(100, Math.round((pm25 / 75) * 100)),
      status: pm25 <= 15 ? 'Safe' : pm25 <= 35 ? 'Moderate' : pm25 <= 75 ? 'Elevated' : 'Critical',
      color: pm25 <= 15 ? 'text-emerald-400' : pm25 <= 35 ? 'text-cyan-400' : pm25 <= 75 ? 'text-amber-400' : 'text-red-400',
    },
    {
      name: 'PM10',
      fullName: 'Coarse Inhalable Dust (≤10 µm)',
      value: `${pm10} µg/m³`,
      limit: 'WHO Limit: 45 µg/m³',
      ratio: Math.min(100, Math.round((pm10 / 150) * 100)),
      status: pm10 <= 45 ? 'Safe' : pm10 <= 100 ? 'Moderate' : 'Elevated',
      color: pm10 <= 45 ? 'text-emerald-400' : pm10 <= 100 ? 'text-cyan-400' : 'text-amber-400',
    },
    {
      name: 'NO₂',
      fullName: 'Nitrogen Dioxide (Vehicular Emissions)',
      value: `${no2} µg/m³`,
      limit: 'Standard: 25 µg/m³',
      ratio: Math.min(100, Math.round((no2 / 50) * 100)),
      status: no2 <= 25 ? 'Normal' : 'Elevated',
      color: no2 <= 25 ? 'text-cyan-400' : 'text-amber-400',
    },
    {
      name: 'O₃',
      fullName: 'Tropospheric Surface Ozone',
      value: `${o3} µg/m³`,
      limit: 'Standard: 100 µg/m³',
      ratio: Math.min(100, Math.round((o3 / 120) * 100)),
      status: o3 <= 70 ? 'Normal' : 'Elevated',
      color: o3 <= 70 ? 'text-cyan-400' : 'text-amber-400',
    },
    {
      name: 'SO₂',
      fullName: 'Sulphur Dioxide (Industrial Exhaust)',
      value: `${so2} µg/m³`,
      limit: 'Standard: 40 µg/m³',
      ratio: Math.min(100, Math.round((so2 / 60) * 100)),
      status: so2 <= 40 ? 'Safe' : 'Elevated',
      color: so2 <= 40 ? 'text-emerald-400' : 'text-amber-400',
    },
    {
      name: 'CO',
      fullName: 'Carbon Monoxide (Combustion Trace)',
      value: `${co} µg/m³`,
      limit: 'Standard: 4,000 µg/m³',
      ratio: Math.min(100, Math.round((co / 2000) * 100)),
      status: co <= 1000 ? 'Safe' : 'Elevated',
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background glow tinted to current AQI color */}
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: color }}
      ></div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Air Quality & Atmospheric Health (AQI Hub)
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                v2.0
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live particulate matter, toxic gaseous trace monitoring, and public health impact indices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
            Dominant: <strong className="text-cyan-300">{dominantPollutant}</strong>
          </span>
        </div>
      </div>

      {/* Main AQI Meter & Health Synopsis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-6">
        {/* Left: Dynamic AQI Radial Card */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/50 border border-slate-800 flex flex-col items-center text-center relative shadow-lg">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
            Air Quality Index (US AQI Standard)
          </span>

          <div className="relative flex items-center justify-center my-2">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="58"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="58"
                stroke={color}
                strokeWidth="10"
                strokeDasharray={364}
                strokeDashoffset={364 - (364 * aqiPercentage) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white tracking-tight">{aqi}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">AQI SCORE</span>
            </div>
          </div>

          <div
            className="mt-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-md flex items-center gap-1.5"
            style={{ backgroundColor: `${color}25`, color: color, border: `1px solid ${color}50` }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }}></span>
            {category}
          </div>

          <p className="text-xs text-slate-400 mt-3 max-w-xs leading-relaxed">
            {advice.general}
          </p>
        </div>

        {/* Right: Health Impact Protocols */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Sensitive Groups Advisory */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-semibold text-white">Sensitive Groups</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              {advice.sensitiveGroups}
            </p>
            <span className="text-[10px] text-slate-500 font-mono">
              Children, Elders & Asthmatics
            </span>
          </div>

          {/* Outdoor Sports / Exercise */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">Outdoor Activities</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  advice.outdoorExercise === 'Safe'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : advice.outdoorExercise === 'Moderate'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}
              >
                {advice.outdoorExercise}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              {advice.outdoorExercise === 'Safe'
                ? 'Ideal for morning jogs, cycling, and outdoor recreation.'
                : advice.outdoorExercise === 'Moderate'
                ? 'Reduce prolonged heavy cardiovascular strain outdoors.'
                : 'Avoid vigorous outdoor exertion; utilize indoor filtration.'}
            </p>
            <span className="text-[10px] text-slate-500 font-mono">
              Cardiorespiratory Fitness
            </span>
          </div>

          {/* Mask Recommendation */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white">Mask Advisory</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  advice.maskRequired
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {advice.maskRequired ? 'N95 Recommended' : 'Not Necessary'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              {advice.maskRequired
                ? 'Microscopic PM2.5 particulates penetrate deep pulmonary alveoli. Certified N95 masks advised outdoors.'
                : 'Ambient particulate levels are within tolerable biological thresholds for casual transit.'}
            </p>
            <span className="text-[10px] text-slate-500 font-mono">
              Respiratory Protection
            </span>
          </div>

          {/* Indoor Air Purification */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-white">Indoor Ventilation</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">
                {aqi > 150 ? 'Seal Windows' : 'Normal Vent'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              {aqi > 150
                ? 'Keep windows closed during early morning temperature inversion. Run HEPA air purifiers.'
                : 'Natural ventilation is clean and safe for home and office environments.'}
            </p>
            <span className="text-[10px] text-slate-500 font-mono">
              Indoor Air Quality (IAQ)
            </span>
          </div>
        </div>
      </div>

      {/* Grid of 6 Specific Chemical & Particulate Pollutants */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <span>Continuous Ambient Air Pollutants Breakdown</span>
          <span className="text-[10px] text-slate-500 font-normal">({locationName})</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {pollutants.map((item) => (
            <div
              key={item.name}
              className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-white text-sm">{item.name}</span>
                  <span className={`text-[10px] font-semibold ${item.color}`}>{item.status}</span>
                </div>
                <div className="text-base font-extrabold text-slate-100">{item.value}</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-1 line-clamp-1" title={item.fullName}>
                  {item.fullName}
                </div>
              </div>

              <div className="mt-2.5">
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${item.ratio}%` }}
                  ></div>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 block font-mono">{item.limit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
