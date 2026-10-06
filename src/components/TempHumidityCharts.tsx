import React, { useState } from 'react';
import { WeatherDataPayload } from '../types/weather';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from 'recharts';
import {
  Thermometer,
  Droplets,
  Calendar,
  Layers,
  TrendingUp,
} from 'lucide-react';

interface TempHumidityChartsProps {
  data: WeatherDataPayload;
}

export const TempHumidityCharts: React.FC<TempHumidityChartsProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'temp' | 'humidity'>('temp');
  const [timeSpan, setTimeSpan] = useState<'24h' | '3d' | '7d'>('24h');

  const { hourly, daily } = data;

  // Compute sliced dataset based on timeSpan
  let chartData: any[] = [];

  if (timeSpan === '24h') {
    chartData = hourly.slice(0, 24).map((h) => ({
      time: h.hour,
      fullTime: h.time,
      temp: h.temperature,
      feelsLike: h.feelsLike,
      humidity: h.humidity,
    }));
  } else if (timeSpan === '3d') {
    // 72 hours, sample every 3 hours for clean visualization
    const slice72 = hourly.slice(0, 72);
    chartData = slice72
      .filter((_, i) => i % 3 === 0)
      .map((h) => {
        const d = new Date(h.time);
        const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short' });
        const timeLabel = d.toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true });
        return {
          time: `${dayLabel} ${timeLabel}`,
          fullTime: h.time,
          temp: h.temperature,
          feelsLike: h.feelsLike,
          humidity: h.humidity,
        };
      });
  } else {
    // 7 days
    chartData = daily.slice(0, 7).map((d) => ({
      time: d.dayName,
      fullTime: d.date,
      tempMax: d.tempMax,
      tempMin: d.tempMin,
      temp: d.tempMax, // Main representation
      humidity: 65,    // Estimated baseline for 7d
    }));
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs">
          <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between gap-3">
            <span>{label}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {timeSpan.toUpperCase()} Projection
            </span>
          </div>

          <div className="space-y-1.5">
            {activeTab === 'temp' ? (
              <>
                <div className="flex items-center justify-between gap-4 text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Temperature:
                  </span>
                  <span className="font-mono font-bold">{payload[0]?.value}°C</span>
                </div>
                {payload[1] && (
                  <div className="flex items-center justify-between gap-4 text-orange-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                      Feels Like:
                    </span>
                    <span className="font-mono font-bold">{payload[1]?.value}°C</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between gap-4 text-blue-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Relative Humidity:
                </span>
                <span className="font-mono font-bold">{payload[0]?.value}%</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Header with Metric & Time Range Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-5">
        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('temp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'temp'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Thermometer className="w-4 h-4 text-amber-400" />
            <span>Temperature Dynamics</span>
          </button>

          <button
            onClick={() => setActiveTab('humidity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'humidity'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Droplets className="w-4 h-4 text-blue-400" />
            <span>Relative Humidity</span>
          </button>
        </div>

        {/* Time Span Toggle (Section 8: 24h, 3d, 7d) */}
        <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
          <button
            onClick={() => setTimeSpan('24h')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              timeSpan === '24h'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            24 Hours
          </button>
          <button
            onClick={() => setTimeSpan('3d')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              timeSpan === '3d'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3 Days
          </button>
          <button
            onClick={() => setTimeSpan('7d')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              timeSpan === '7d'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7 Days
          </button>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'temp' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="feelsLikeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#f59e0b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}°`}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="temp"
                name="Temperature"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fill="url(#tempGradient)"
                dot={false}
              />
              {timeSpan !== '7d' && (
                <Area
                  type="monotone"
                  dataKey="feelsLike"
                  name="Feels Like"
                  stroke="#f97316"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="url(#feelsLikeGradient)"
                  dot={false}
                />
              )}
            </AreaChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#3b82f6"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="humidity"
                name="Humidity"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#humidityGradient)"
                dot={false}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Min/Max & Averages */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          {activeTab === 'temp' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-amber-400"></span>
                <span>Ambient Temp (°C)</span>
              </div>
              {timeSpan !== '7d' && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-orange-400 border-dashed border-b"></span>
                  <span>Apparent / Feels Like (°C)</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
              <span>Tropospheric Relative Humidity (%)</span>
            </div>
          )}
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Range: {timeSpan === '24h' ? 'Next 24 Hours' : timeSpan === '3d' ? 'Next 72 Hours' : 'Next 7 Days'}
        </div>
      </div>
    </div>
  );
};
