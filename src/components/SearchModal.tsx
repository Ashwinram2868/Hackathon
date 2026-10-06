import React, { useState, useEffect, useRef } from 'react';
import { searchLocations, SearchResult } from '../services/geoService';
import { MAJOR_INDIAN_CITIES } from '../data/majorCities';
import { INDIAN_STATES } from '../data/stateData';
import { Search, MapPin, Building2, X, Sparkles, Navigation } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (result: SearchResult) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectLocation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Popular quick picks
  const quickPicks = [
    { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
    { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
    { name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198 },
    { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
    { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
    { name: 'Delhi', state: 'Delhi (NCT)', lat: 28.6139, lon: 77.2090 },
    { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
    { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await searchLocations(query);
        setResults(res);
      } catch (e) {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-cyan-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Indian cities or states (e.g., Chennai, Bengaluru, Delhi)..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-white mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-400 hover:text-white"
          >
            Esc
          </button>
        </div>

        {/* Quick Picks when query is empty */}
        {!query && (
          <div className="p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Popular Meteorological Hubs</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickPicks.map((pick) => (
                <button
                  key={pick.name}
                  onClick={() => {
                    onSelectLocation({
                      name: pick.name,
                      state: pick.state,
                      country: 'India',
                      latitude: pick.lat,
                      longitude: pick.lon,
                      type: 'city',
                    });
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/50 text-xs text-slate-200 hover:text-cyan-300 transition-all flex items-center gap-1.5"
                >
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>{pick.name}</span>
                  <span className="text-[10px] text-slate-500">({pick.state})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Search Results */}
        {query && (
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-2">
            {isSearching ? (
              <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></span>
                <span>Searching Indian geographic index...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No matching locations found for "{query}". Try searching by city name (e.g., Coimbatore) or state.
              </div>
            ) : (
              results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSelectLocation(r);
                    onClose();
                  }}
                  className="w-full px-3 py-2.5 rounded-lg hover:bg-slate-800/80 text-left flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {r.type === 'state' ? (
                      <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : (
                      <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-cyan-300">
                        {r.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {r.state ? `${r.state}, ` : ''}{r.country} • {r.type === 'state' ? 'State' : 'City'}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 group-hover:text-slate-300">
                    {r.latitude.toFixed(2)}°N, {r.longitude.toFixed(2)}°E
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Search covers 36 Indian states & union territories and 60+ major urban zones.</span>
        </div>
      </div>
    </div>
  );
};
