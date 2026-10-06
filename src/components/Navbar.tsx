import React from 'react';
import {
  CloudLightning,
  Search,
  MapPin,
  RotateCw,
  Info,
  Database,
  Compass,
} from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onLocateMe: () => void;
  onRefresh: () => void;
  onOpenAbout: () => void;
  onOpenDataSources: () => void;
  isLocating: boolean;
  isRefreshing: boolean;
  lastUpdated: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onLocateMe,
  onRefresh,
  onOpenAbout,
  onOpenDataSources,
  isLocating,
  isRefreshing,
  lastUpdated,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      {/* Top Problem Statement Banner (Section 18 requirement) */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 border-b border-cyan-900/30 px-4 py-1.5 text-center text-xs text-cyan-300/90 font-mono flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>
          <strong className="text-cyan-200">Mission:</strong> Understanding changing weather conditions across India through real-time data and short-term risk analysis.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white">
              <CloudLightning className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  India Weather Intelligence
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                  Live WMO Feeds
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Predictive Risk Analytics & Real-Time Meteorological Monitoring
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button */}
            <button
              id="search-location-btn"
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all text-sm group shadow-sm"
              title="Search states and cities across India"
            >
              <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-xs text-slate-400">Search Indian Cities / States...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Current Location Button */}
            <button
              id="current-location-btn"
              onClick={onLocateMe}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 text-slate-300 hover:text-white transition-all text-xs font-medium"
              title="Detect nearest location via GPS"
            >
              <Compass className={`w-3.5 h-3.5 text-blue-400 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isLocating ? 'Detecting...' : 'My Location'}</span>
            </button>

            {/* Refresh Button & Timestamp */}
            <button
              id="refresh-weather-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all text-xs"
              title="Refresh meteorological feed"
            >
              <RotateCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline font-mono text-[11px] text-slate-400">
                {isRefreshing ? 'Updating...' : `Updated: ${lastUpdated || 'Live'}`}
              </span>
            </button>

            {/* About Prediction / Help */}
            <button
              id="about-prediction-btn"
              onClick={onOpenAbout}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-400 hover:text-slate-200 transition-all text-xs"
              title="Learn how prediction and risk scores are calculated"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Data Source Info */}
            <button
              id="data-sources-btn"
              onClick={onOpenDataSources}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-400 hover:text-slate-200 transition-all text-xs"
              title="Data Provider & Architecture"
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
