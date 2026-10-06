import React from 'react';
import { X, Database, Globe, CheckCircle2, ShieldCheck, Key, RefreshCw } from 'lucide-react';

interface DataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSourceModal: React.FC<DataSourceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Meteorological Data Feeds & Architecture</h3>
              <p className="text-xs text-slate-400">
                Real-time API providers, WMO compliance, and server caching
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300">
          {/* Primary Provider */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-white text-sm">Primary Live Feed: Open-Meteo Global NWP</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              The application connects directly to Open-Meteo's Numerical Weather Prediction (NWP) infrastructure, amalgamating datasets from ECMWF IFS (European Centre for Medium-Range Weather Forecasts) and DWD ICON at 0.25° (~25km) resolution across India.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Standard</span>
                <span className="font-mono text-cyan-300">WMO-compliant Codes</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Temporal Resolution</span>
                <span className="font-mono text-cyan-300">Hourly + 7-Day Forecast</span>
              </div>
            </div>
          </div>

          {/* Optional API Key Configuration */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-white text-sm">Custom API Key Integration (.env)</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              While the application functions out-of-the-box using the keyless Open-Meteo NWP feed, you can optionally supply your own OpenWeatherMap or WeatherAPI credentials via environment variables without modifying client-side code:
            </p>
            <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
              # Copy .env.example to .env and configure:
              OPENWEATHER_API_KEY=your_key_here
              PORT=5000
              CACHE_TTL_SECONDS=300
            </pre>
          </div>

          {/* Caching Architecture */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-teal-400" />
              <h4 className="font-bold text-white text-sm">Server-Side In-Memory Caching (TTL)</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              To respect provider rate limits and guarantee low UI latencies (&lt;100ms), queries are automatically cached in server memory for 300 seconds (5 minutes). The client also includes transparent offline/standalone fallback to ensure 100% demo reliability.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
