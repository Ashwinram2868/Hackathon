import React from 'react';
import { WeatherDataPayload } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Gauge,
  Cloud,
  Eye,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface CurrentWeatherCardProps {
  data: WeatherDataPayload;
  selectedStateName?: string;
  tempUnit?: 'C' | 'F';
  onOpenAQI?: () => void;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  data,
  selectedStateName,
  tempUnit = 'C',
  onOpenAQI,
}) => {
  const { current, location, prediction, lastUpdated, fromCache, airQuality } = data;

  const formatTemp = (val: number) => {
    if (tempUnit === 'F') return `${Math.round(val * 1.8 + 32)}°F`;
    return `${val}°C`;
  };

  const displayTemp = tempUnit === 'F' ? Math.round(current.temperature * 1.8 + 32) : current.temperature;
  const displayFeels = tempUnit === 'F' ? Math.round(current.feelsLike * 1.8 + 32) : current.feelsLike;

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header: Location & Observed Label */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold tracking-tight text-white">{location.name}</h2>
            {location.state && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                {location.state}
              </span>
            )}
            {fromCache && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Cached
              </span>
            )}

            {/* v2 AQI Badge Shortcut */}
            {airQuality && (
              <button
                onClick={onOpenAQI}
                className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1.5 transition-transform hover:scale-105"
                style={{
                  backgroundColor: `${airQuality.color}20`,
                  color: airQuality.color,
                  border: `1px solid ${airQuality.color}50`,
                }}
                title="View full Air Quality & Particulate breakdown"
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: airQuality.color }}></span>
                <span>AQI {airQuality.aqi}</span>
                <span className="text-[10px] opacity-80 hidden sm:inline">({airQuality.category})</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Coordinates: {location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E • Timezone: {location.timezone}
          </p>
        </div>

        {/* Scientific tag distinguishing observed data */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE OBSERVED
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            as of {lastUpdated}
          </span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Big Temperature & Condition */}
        <div className="lg:col-span-5 flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800/80 border border-slate-700/60 shadow-inner">
            <WeatherIcon iconName={current.condition.icon} size={64} className="animate-float" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                {displayTemp}°
              </span>
              <span className="text-2xl font-semibold text-slate-400">{tempUnit}</span>
            </div>
            <div className="mt-1">
              <p className="text-lg font-semibold text-slate-200">{current.condition.label}</p>
              <p className="text-xs text-slate-400">
                Feels like <strong className="text-slate-200">{displayFeels}°{tempUnit}</strong> • {current.condition.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Key Meteorological Metrics */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Rainfall / Precipitation Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                Rainfall Rate
              </span>
            </div>
            <div className="text-xl font-bold text-cyan-300">
              {current.precipitation} <span className="text-xs font-normal text-slate-400">mm/h</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>24h outlook:</span>
              <strong className="text-cyan-400">{prediction.rainfallOutlook.next24HoursAccumulation} mm</strong>
            </div>
          </div>

          {/* Humidity Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                Humidity
              </span>
            </div>
            <div className="text-xl font-bold text-blue-300">
              {current.humidity} <span className="text-xs font-normal text-slate-400">%</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              24h avg: <strong className="text-blue-400">{prediction.metricsSummary.avgHumidity24h}%</strong>
            </div>
          </div>

          {/* Wind Speed Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-teal-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                Wind Speed
              </span>
            </div>
            <div className="text-xl font-bold text-teal-300">
              {current.windSpeed} <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Gusts to: <strong className="text-teal-400">{prediction.metricsSummary.maxWind24h} km/h</strong>
            </div>
          </div>

          {/* Surface Pressure Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-purple-400" />
                Pressure
              </span>
            </div>
            <div className="text-xl font-bold text-purple-300">
              {current.pressure} <span className="text-xs font-normal text-slate-400">hPa</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate" title={prediction.metricsSummary.pressureTrend}>
              Trend: <strong className="text-purple-400">{prediction.metricsSummary.pressureTrend.split(' ')[0]}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Bar: Cloud Cover, Rain Prob, Avg Temp */}
      <div className="mt-5 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-slate-500" />
            <span>Cloud Coverage: <strong className="text-slate-200">{current.cloudCover}%</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-500" />
            <span>Peak 24h Rain Prob: <strong className="text-cyan-300">{prediction.rainfallOutlook.peakProbability}%</strong></span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-500" />
            <span>24h Avg Temp: <strong className="text-slate-200">{formatTemp(prediction.metricsSummary.avgTemp24h)}</strong></span>
          </div>
        </div>

        <div className="font-mono text-[11px] text-slate-500">
          Source: {data.dataSource.name} ({data.dataSource.resolution})
        </div>
      </div>
    </div>
  );
};

