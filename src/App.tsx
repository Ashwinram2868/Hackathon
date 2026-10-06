import React, { useState, useEffect, useCallback } from 'react';
import { StateInfo, WeatherDataPayload, RiskLevel } from './types/weather';
import { INDIAN_STATES, DEFAULT_STATE } from './data/stateData';
import { fetchWeatherData } from './services/weatherService';
import { reverseGeocodeIndia, SearchResult } from './services/geoService';

import { Navbar } from './components/Navbar';
import { StateChipsBar } from './components/StateChipsBar';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { PredictionCard } from './components/PredictionCard';
import { RainfallPredictionSection } from './components/RainfallPredictionSection';
import { TempHumidityCharts } from './components/TempHumidityCharts';
import { InteractiveIndiaMap } from './components/InteractiveIndiaMap';
import { StateComparisonSection } from './components/StateComparisonSection';
import { SearchModal } from './components/SearchModal';
import { AboutPredictionModal } from './components/AboutPredictionModal';
import { DataSourceModal } from './components/DataSourceModal';

import {
  AlertTriangle,
  RefreshCw,
  CloudOff,
  ShieldAlert,
  MapPin,
  ExternalLink,
  Heart,
  Radio,
} from 'lucide-react';

export const App: React.FC = () => {
  const [selectedState, setSelectedState] = useState<StateInfo>(DEFAULT_STATE);
  const [currentLocationTitle, setCurrentLocationTitle] = useState<{ name: string; state?: string }>({
    name: DEFAULT_STATE.capital,
    state: DEFAULT_STATE.name,
  });

  const [weatherData, setWeatherData] = useState<WeatherDataPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState<boolean>(false);

  // Background map risk cache for all states
  const [stateRiskMap, setStateRiskMap] = useState<
    Record<string, { riskScore: number; riskLevel: RiskLevel; rainfall24h: number; temp: number }>
  >({});

  // Core Data Fetcher
  const loadWeatherData = useCallback(
    async (lat: number, lon: number, locationName: string, stateName?: string, isBackgroundRefresh = false) => {
      if (!isBackgroundRefresh) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setErrorMessage(null);

      try {
        const payload = await fetchWeatherData(lat, lon, locationName, stateName);
        setWeatherData(payload);

        // Update state risk map entry
        if (stateName) {
          const matched = INDIAN_STATES.find(
            (s) => s.name.toLowerCase() === stateName.toLowerCase() || s.id === stateName.toLowerCase()
          );
          if (matched) {
            setStateRiskMap((prev) => ({
              ...prev,
              [matched.code]: {
                riskScore: payload.prediction.riskScore,
                riskLevel: payload.prediction.riskLevel,
                rainfall24h: payload.prediction.rainfallOutlook.next24HoursAccumulation,
                temp: payload.current.temperature,
              },
            }));
          }
        }
      } catch (err: any) {
        console.error('Weather load error:', err);
        setErrorMessage(
          err.message || 'Unable to retrieve real-time weather information. Please check your network connection and retry.'
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    loadWeatherData(selectedState.lat, selectedState.lon, selectedState.capital, selectedState.name);
  }, [selectedState, loadWeatherData]);

  // Periodic Auto-Refresh every 10 minutes (Section 13)
  useEffect(() => {
    const interval = setInterval(() => {
      if (weatherData) {
        loadWeatherData(
          weatherData.location.latitude,
          weatherData.location.longitude,
          weatherData.location.name,
          weatherData.location.state,
          true
        );
      }
    }, 600000); // 10 minutes

    return () => clearInterval(interval);
  }, [weatherData, loadWeatherData]);

  // Handle State Selection from Map, Chips, or Comparison
  const handleSelectState = (state: StateInfo) => {
    setSelectedState(state);
    setCurrentLocationTitle({ name: state.capital, state: state.name });
    loadWeatherData(state.lat, state.lon, state.capital, state.name);
  };

  // Handle Search Result Selection
  const handleSelectSearchResult = (result: SearchResult) => {
    // If it's a state, match state object
    const matchedState = INDIAN_STATES.find(
      (s) => s.name.toLowerCase() === result.name.toLowerCase() || (result.state && s.name.toLowerCase() === result.state.toLowerCase())
    );

    if (matchedState) {
      setSelectedState(matchedState);
    }

    setCurrentLocationTitle({ name: result.name, state: result.state });
    loadWeatherData(result.latitude, result.longitude, result.name, result.state);
  };

  // HTML5 Geolocation "Locate Me"
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const detected = await reverseGeocodeIndia(latitude, longitude);
          setCurrentLocationTitle(detected);

          // Find if belongs to Indian state
          if (detected.state) {
            const matchedState = INDIAN_STATES.find((s) => s.name.toLowerCase().includes(detected.state!.toLowerCase()));
            if (matchedState) setSelectedState(matchedState);
          }

          await loadWeatherData(latitude, longitude, detected.name, detected.state);
        } catch (e) {
          console.error('Reverse geocode error:', e);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        alert(`Geolocation access was denied or timed out (${err.message}). Using manual search.`);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // Manual Refresh
  const handleRefresh = () => {
    if (!weatherData) return;
    loadWeatherData(
      weatherData.location.latitude,
      weatherData.location.longitude,
      weatherData.location.name,
      weatherData.location.state,
      true
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onLocateMe={handleLocateMe}
        onRefresh={handleRefresh}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenDataSources={() => setIsDataSourcesOpen(true)}
        isLocating={isLocating}
        isRefreshing={isRefreshing}
        lastUpdated={weatherData?.lastUpdated || ''}
      />

      {/* Horizontal State Chips Selector */}
      <StateChipsBar selectedState={selectedState} onSelectState={handleSelectState} />

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error State Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <CloudOff className="w-6 h-6 text-red-400 shrink-0" />
              <div>
                <strong className="font-semibold block text-sm">Meteorological Feed Interrupted</strong>
                <p className="text-xs text-red-300">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => loadWeatherData(selectedState.lat, selectedState.lon, selectedState.capital, selectedState.name)}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && !weatherData && (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-slate-400">
            <div className="relative flex items-center justify-center">
              <div className="w-14 h-14 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
              <Radio className="w-6 h-6 text-cyan-400 absolute animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-200">
                Contacting Real-Time Numerical Weather Prediction Feeds...
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Executing feature extraction and mathematical risk indexing for {currentLocationTitle.name}
              </p>
            </div>
          </div>
        )}

        {/* Loaded Content */}
        {weatherData && (
          <div className="space-y-6 animate-fadeIn">
            {/* Active State & Coordinate Meteorological Sync Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs shadow-md">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium text-slate-300">
                  <span className={`w-2 h-2 rounded-full ${isLoading || isRefreshing ? 'bg-amber-400 animate-spin' : 'bg-cyan-400 animate-pulse'}`}></span>
                  Active Region: <strong className="text-white font-bold">{selectedState.name}</strong>
                  <span className="text-slate-400">({selectedState.capital})</span>
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-cyan-400 font-mono flex items-center gap-1">
                  <span>📍 Coordinates:</span>
                  <span className="font-semibold">{selectedState.lat.toFixed(4)}° N, {selectedState.lon.toFixed(4)}° E</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Real-Time Weather API Synced
                </span>
              </div>
            </div>

            {/* Row 1: Current Weather Card & Prediction / Risk Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 xl:col-span-7">
                <CurrentWeatherCard data={weatherData} selectedStateName={selectedState.name} />
              </div>
              <div className="lg:col-span-6 xl:col-span-5">
                <PredictionCard
                  prediction={weatherData.prediction}
                  onOpenModelDetails={() => setIsAboutOpen(true)}
                />
              </div>
            </div>

            {/* Row 2: Rainfall Prediction Modeling & Temperature/Humidity Dynamics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <RainfallPredictionSection data={weatherData} />
              </div>
              <div className="lg:col-span-6">
                <TempHumidityCharts data={weatherData} />
              </div>
            </div>

            {/* Row 3: Interactive Leaflet India Map */}
            <div>
              <InteractiveIndiaMap
                selectedState={selectedState}
                onSelectState={handleSelectState}
                stateRiskMap={stateRiskMap}
                isWeatherLoading={isLoading || isRefreshing}
              />
            </div>

            {/* Row 4: Cross-State Meteorological Comparison */}
            <div>
              <StateComparisonSection onSelectState={handleSelectState} />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={handleSelectSearchResult}
      />
      <AboutPredictionModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <DataSourceModal isOpen={isDataSourcesOpen} onClose={() => setIsDataSourcesOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400 font-semibold mb-1">
              <span>India Weather Intelligence & Risk Analytics Platform</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                v1.0.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-xl">
              High-resolution numerical weather prediction (NWP) model feeds, real-time feature extraction, and explainable multi-vector atmospheric risk prediction for Indian regions.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              Risk Model Formula
            </button>
            <span>•</span>
            <button
              onClick={() => setIsDataSourcesOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              Data Providers
            </button>
            <span>•</span>
            <span className="text-slate-600 font-mono">
              Status: Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
