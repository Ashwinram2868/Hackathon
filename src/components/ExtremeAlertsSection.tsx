import React, { useState } from 'react';
import { SevereAlert, WeatherDataPayload } from '../types/weather';
import {
  AlertTriangle,
  ShieldAlert,
  Flame,
  CloudLightning,
  Wind,
  PhoneCall,
  CheckCircle2,
  Tractor,
  Building2,
  Home,
  Info,
  Bell,
  ArrowUpRight,
} from 'lucide-react';

interface ExtremeAlertsSectionProps {
  alerts?: SevereAlert[];
  locationName: string;
  data: WeatherDataPayload;
}

export const ExtremeAlertsSection: React.FC<ExtremeAlertsSectionProps> = ({
  alerts = [],
  locationName,
  data,
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'agriculture' | 'urban' | 'contacts'>('alerts');

  // Highest severity determination
  const hasRed = alerts.some((a) => a.severity === 'red');
  const hasOrange = alerts.some((a) => a.severity === 'orange');
  const hasYellow = alerts.some((a) => a.severity === 'yellow');

  const topSeverity = hasRed ? 'red' : hasOrange ? 'orange' : hasYellow ? 'yellow' : 'green';

  const severityMeta = {
    red: {
      label: 'IMD RED WARNING (TAKE IMMEDIATE ACTION)',
      badge: 'bg-red-500/20 text-red-400 border-red-500/40',
      bannerBg: 'from-red-950/70 via-slate-900 to-rose-950/70 border-red-800/80',
      desc: 'Extremely severe meteorological hazard threatening public infrastructure and personal safety.',
    },
    orange: {
      label: 'IMD ORANGE ALERT (BE PREPARED)',
      badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      bannerBg: 'from-orange-950/70 via-slate-900 to-amber-950/70 border-orange-800/80',
      desc: 'Very heavy precipitation, severe convective wind squalls, or extreme thermal stress imminent.',
    },
    yellow: {
      label: 'IMD YELLOW WATCH (BE UPDATED)',
      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      bannerBg: 'from-amber-950/60 via-slate-900 to-yellow-950/60 border-amber-800/70',
      desc: 'Atmospheric instability developing. Monitor meteorological bulletins and exercise transit caution.',
    },
    green: {
      label: 'IMD GREEN ADVISORY (NO WARNING / NORMAL)',
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      bannerBg: 'from-emerald-950/50 via-slate-900 to-teal-950/50 border-emerald-800/60',
      desc: 'Atmospheric state within standard seasonal climatological limits. Routine activities can proceed.',
    },
  }[topSeverity];

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Extreme Weather & Early Warning Matrix
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                IMD Standard
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Color-coded multi-hazard advisory based on Indian Meteorological Department guidelines
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'alerts'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('agriculture')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'agriculture'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Agriculture
          </button>
          <button
            onClick={() => setActiveTab('urban')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'urban'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Urban Transit
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'contacts'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Emergency 112
          </button>
        </div>
      </div>

      {/* Main Status Headline Banner */}
      <div
        className={`p-4 rounded-xl bg-gradient-to-r ${severityMeta.bannerBg} border mb-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${severityMeta.badge}`}>
              {severityMeta.label}
            </span>
            <span className="text-xs text-slate-300 font-medium">for {locationName}</span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">{severityMeta.desc}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-slate-400">
            Issued: {data.lastUpdated}
          </span>
        </div>
      </div>

      {/* Tab 1: Live Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-xl bg-slate-900/70 border transition-all hover:bg-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              style={{ borderColor: `${alert.color}40` }}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="w-2.5 h-2.5 rounded-full animate-ping"
                    style={{ backgroundColor: alert.color }}
                  ></span>
                  <h4 className="text-sm font-bold text-white tracking-wide">{alert.title}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {alert.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>
                <div className="flex items-center gap-2 text-xs font-semibold pt-1" style={{ color: alert.color }}>
                  <span>Action:</span>
                  <span className="text-slate-200 font-normal">{alert.instruction}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 text-[11px] text-slate-400 shrink-0">
                <span className="font-mono">{alert.issuedAt}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Agricultural Advisory */}
      {activeTab === 'agriculture' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Tractor className="w-4 h-4" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Crop Irrigation</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {data.prediction.rainfallOutlook.next24HoursAccumulation > 20
                ? 'High precipitation forecast. Suspend all supplementary canal irrigation and clear furrow drainages to prevent root suffocation.'
                : 'Minimal rainfall anticipated. Standard drip or scheduled irrigation may proceed for horticultural standing crops.'}
            </p>
            <span className="text-[10px] text-slate-500 font-mono block">Water Management Matrix</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Wind className="w-4 h-4" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Pesticide Spraying</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {data.current.windSpeed > 25 || data.prediction.rainfallOutlook.peakProbability > 50
                ? 'High wind gusts or rain probability will cause spray drift and chemical wash-off. Postpone foliar spraying.'
                : 'Atmospheric conditions stable. Suitable window for pesticide and fertilizer applications.'}
            </p>
            <span className="text-[10px] text-slate-500 font-mono block">Chemical Application Window</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Post-Harvest Storage</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ensure harvested grain and produce in mandi yards are covered with tarpaulin sheets to shield against high relative humidity ({data.current.humidity}%).
            </p>
            <span className="text-[10px] text-slate-500 font-mono block">Yield Protection Protocols</span>
          </div>
        </div>
      )}

      {/* Tab 3: Urban Transit & Commuter Grid */}
      {activeTab === 'urban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-blue-400">
              <Building2 className="w-4 h-4" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Roads & Subways</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {data.prediction.rainfallOutlook.next24HoursAccumulation > 35
                ? 'High likelihood of urban waterlogging at underpasses and low arterial intersections. Avoid low-clearance vehicles.'
                : 'Clear traffic corridors with dry pavements. Standard arterial transit times expected.'}
            </p>
            <span className="text-[10px] text-slate-500 font-mono block">Municipal Drainage Status</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Power Grid & Line Safety</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {data.prediction.metricsSummary.maxWind24h > 40
                ? 'Elevated gust velocities may snap tree branches onto overhead transmission lines. Report sparking wires immediately.'
                : 'Normal line tension and substation operational conditions.'}
            </p>
            <span className="text-[10px] text-slate-500 font-mono block">DISCOM Infrastructure</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-teal-400">
              <Home className="w-4 h-4" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Commuter Commendation</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Check live railway and metro feeds. Keep phone batteries charged and carry waterproof gear for intercity transit.
            </p>
            <span className="text-[10px] text-slate-500 font-mono block">Public Transport Sync</span>
          </div>
        </div>
      )}

      {/* Tab 4: Emergency Contacts & Helplines */}
      {activeTab === 'contacts' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">National Emergency</span>
              <span className="text-xl font-mono font-bold text-white">112</span>
            </div>
            <PhoneCall className="w-5 h-5 text-red-400" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Disaster Mgmt (NDMA)</span>
              <span className="text-xl font-mono font-bold text-white">1078</span>
            </div>
            <PhoneCall className="w-5 h-5 text-orange-400" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">State Emergency (SDMA)</span>
              <span className="text-xl font-mono font-bold text-white">1070</span>
            </div>
            <PhoneCall className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Ambulance Service</span>
              <span className="text-xl font-mono font-bold text-white">108</span>
            </div>
            <PhoneCall className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      )}
    </div>
  );
};
