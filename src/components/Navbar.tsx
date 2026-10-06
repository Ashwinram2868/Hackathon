import React from 'react';
import {
  CloudLightning,
  Search,
  MapPin,
  RotateCw,
  Info,
  Database,
  Compass,
  Volume2,
  FileDown,
  LayoutDashboard,
  Map,
  Wind,
  ShieldAlert,
  Sparkles,
  BarChart3,
} from 'lucide-react';

export type DashboardTab =
  | 'overview'
  | 'map'
  | 'air-quality'
  | 'alerts'
  | 'simulator'
  | 'comparison';

interface NavbarProps {
  onOpenSearch: () => void;
  onLocateMe: () => void;
  onRefresh: () => void;
  onOpenAbout: () => void;
  onOpenDataSources: () => void;
  onOpenAIBriefing: () => void;
  onOpenExportDossier: () => void;
  isLocating: boolean;
  isRefreshing: boolean;
  lastUpdated: string;
  tempUnit: 'C' | 'F';
  onToggleUnit: () => void;
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  alertCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onLocateMe,
  onRefresh,
  onOpenAbout,
  onOpenDataSources,
  onOpenAIBriefing,
  onOpenExportDossier,
  isLocating,
  isRefreshing,
  lastUpdated,
  tempUnit,
  onToggleUnit,
  activeTab,
  onSelectTab,
  alertCount = 0,
}) => {
  const tabs: { id: DashboardTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Command Center', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'air-quality', label: 'Air Quality (AQI)', icon: <Wind className="w-3.5 h-3.5" />, badge: 'v2' },
    { id: 'alerts', label: 'IMD Alerts', icon: <ShieldAlert className="w-3.5 h-3.5" />, badge: alertCount > 0 ? `${alertCount}` : undefined },
    { id: 'simulator', label: 'AI Simulator', icon: <Sparkles className="w-3.5 h-3.5" />, badge: 'v2' },
    { id: 'map', label: 'GIS Radar Map', icon: <Map className="w-3.5 h-3.5" /> },
    { id: 'comparison', label: 'State Matrix', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      {/* Top Banner with v2 mission & quick triggers */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-slate-950 to-blue-950/80 border-b border-cyan-900/40 px-4 py-1.5 text-center text-xs text-cyan-300 font-mono flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-bold text-cyan-200">VERSION 2.0 ULTRA</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 hidden md:inline">
            Numerical Weather Prediction & Explainable Atmospheric Risk AI
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Voice Dispatch Shortcut */}
          <button
            onClick={onOpenAIBriefing}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-semibold transition-colors"
            title="Listen to synthesized AI voice briefing"
          >
            <Volume2 className="w-3 h-3 animate-pulse" />
            <span>AI Voice Briefing</span>
          </button>

          {/* Quick Export Dossier Shortcut */}
          <button
            onClick={onOpenExportDossier}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[11px] font-semibold transition-colors"
            title="Download formatted disaster & weather report"
          >
            <FileDown className="w-3 h-3" />
            <span>Export Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/25 text-white">
              <CloudLightning className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  India Weather Intelligence
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/30 rounded-full shadow-sm">
                  v2.0 PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Atmospheric Risk Indexing, Real-Time AQI & IMD Alert Modeling
              </p>
            </div>
          </div>

          {/* Quick Actions & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Unit Switcher (°C / °F) */}
            <button
              onClick={onToggleUnit}
              className="flex items-center px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-500/60 text-xs font-mono font-bold transition-all shadow-sm"
              title="Toggle temperature between Celsius and Fahrenheit"
            >
              <span className={tempUnit === 'C' ? 'text-cyan-400' : 'text-slate-500'}>°C</span>
              <span className="text-slate-600 mx-1">|</span>
              <span className={tempUnit === 'F' ? 'text-cyan-400' : 'text-slate-500'}>°F</span>
            </button>

            {/* Search Button */}
            <button
              id="search-location-btn"
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all text-sm group shadow-sm"
              title="Search states and cities across India (⌘K)"
            >
              <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-xs text-slate-400">Search India...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Current Location GPS Button */}
            <button
              id="current-location-btn"
              onClick={onLocateMe}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 text-slate-300 hover:text-white transition-all text-xs font-medium"
              title="Detect nearest location via GPS"
            >
              <Compass className={`w-3.5 h-3.5 text-blue-400 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'My GPS'}</span>
            </button>

            {/* Refresh Button */}
            <button
              id="refresh-weather-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all text-xs"
              title="Refresh meteorological feed"
            >
              <RotateCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline font-mono text-[11px] text-slate-400">
                {isRefreshing ? 'Updating...' : lastUpdated ? `${lastUpdated}` : 'Live'}
              </span>
            </button>

            {/* About / Model Info */}
            <button
              id="about-prediction-btn"
              onClick={onOpenAbout}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-slate-200 transition-all text-xs"
              title="Inspect algorithmic weighting and formula"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Data Source Info */}
            <button
              id="data-sources-btn"
              onClick={onOpenDataSources}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-slate-200 transition-all text-xs"
              title="Data Provider & Architecture"
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Version 2.0 Workspaces & Mode Tab Bar */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-900 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                      tab.id === 'alerts' && alertCount > 0
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

