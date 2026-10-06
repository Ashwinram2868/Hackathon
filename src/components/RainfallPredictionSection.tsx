import React, { useState } from 'react';
import { WeatherDataPayload } from '../types/weather';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Area,
} from 'recharts';
import {
  CloudRain,
  Droplets,
  Calendar,
  Clock,
  Activity,
  Layers,
  Info,
} from 'lucide-react';

interface RainfallPredictionSectionProps {
  data: WeatherDataPayload;
}

export const RainfallPredictionSection: React.FC<RainfallPredictionSectionProps> = ({ data }) => {
  const [viewRange, setViewRange] = useState<'24h' | '7d'>('24h');
  const { hourly, daily, prediction, current } = data;
  const { rainfallOutlook } = prediction;

  // Prepare chart data for 24 hours
  const hourlyChartData = hourly.slice(0, 24).map((item) => ({
    time: item.hour,
    fullTime: item.time,
    rainfall: item.precipitation,
    probability: item.precipitationProbability,
    temp: item.temperature,
  }));

  // Prepare chart data for 7 days
  const dailyChartData = daily.slice(0, 7).map((item) => ({
    time: item.dayName,
    fullTime: item.date,
    rainfall: item.precipitationSum,
    probability: item.precipitationProbabilityMax,
    tempMax: item.tempMax,
    tempMin: item.tempMin,
  }));

  const chartData = viewRange === '24h' ? hourlyChartData : dailyChartData;

  // Custom chart tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pRain = payload.find((p: any) => p.dataKey === 'rainfall');
      const pProb = payload.find((p: any) => p.dataKey === 'probability');

      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs">
          <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between gap-3">
            <span>{label}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {viewRange === '24h' ? 'Hourly Outlook' : 'Daily Trend'}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4 text-cyan-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Precipitation:
              </span>
              <span className="font-mono font-bold">{pRain?.value ?? 0} mm</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-blue-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Rain Probability:
              </span>
              <span className="font-mono font-bold">{pProb?.value ?? 0}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Header & Range Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Rainfall Prediction & Intensity Modeling
            </h3>
            <p className="text-xs text-slate-400">
              Interactive precipitation accumulation and probability projection
            </p>
          </div>
        </div>

        {/* 24h / 7d Toggle */}
        <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
          <button
            onClick={() => setViewRange('24h')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              viewRange === '24h'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Next 24 Hours
          </button>
          <button
            onClick={() => setViewRange('7d')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              viewRange === '7d'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7-Day Outlook
          </button>
        </div>
      </div>

      {/* 4 Key Rainfall Metrics Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">Current Rainfall</div>
          <div className="text-lg font-bold text-cyan-300 mt-0.5">
            {rainfallOutlook.currentRainfallRate.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-400">mm/h</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Real-time intensity</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">Next 3 Hours Accum.</div>
          <div className="text-lg font-bold text-sky-300 mt-0.5">
            {rainfallOutlook.next3HoursAccumulation.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-400">mm</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Short-term runoff</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">24-Hour Outlook</div>
          <div className="text-lg font-bold text-blue-300 mt-0.5">
            {rainfallOutlook.next24HoursAccumulation.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-400">mm</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Daily forecast volume</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">Intensity Category</div>
          <div className="text-base font-bold text-slate-100 mt-1 truncate">
            {rainfallOutlook.intensityCategory}
          </div>
          <div className="text-[10px] text-cyan-400 mt-0.5 font-mono">
            Peak: {rainfallOutlook.peakProbability}% prob
          </div>
        </div>
      </div>

      {/* Interactive Chart: Rainfall Bar + Probability Line */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="rainfallBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#0284c7" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="probabilityArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
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
            {/* Left Y Axis: Rainfall in mm */}
            <YAxis
              yAxisId="rain"
              stroke="#06b6d4"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}mm`}
            />
            {/* Right Y Axis: Probability in % */}
            <YAxis
              yAxisId="prob"
              orientation="right"
              domain={[0, 100]}
              stroke="#3b82f6"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Probability Area & Line */}
            <Area
              yAxisId="prob"
              type="monotone"
              dataKey="probability"
              fill="url(#probabilityArea)"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />

            {/* Rainfall Bar */}
            <Bar
              yAxisId="rain"
              dataKey="rainfall"
              fill="url(#rainfallBarGradient)"
              radius={[4, 4, 0, 0]}
              barSize={viewRange === '24h' ? 14 : 26}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend & Summary info */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-400"></span>
            <span>Precipitation (mm) [Bar]</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-500"></span>
            <span>Rain Probability (%) [Curve]</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Total 7-Day Cumulative: <strong className="text-cyan-300">{rainfallOutlook.next7DaysAccumulation} mm</strong>
        </div>
      </div>
    </div>
  );
};
