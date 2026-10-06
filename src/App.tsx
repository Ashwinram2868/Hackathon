import React, { useState, useEffect, useCallback } from 'react';
import { StateInfo, WeatherDataPayload, RiskLevel } from './types/weather';
import { INDIAN_STATES, DEFAULT_STATE } from './data/stateData';
import { fetchWeatherData } from './services/weatherService';
import { reverseGeocodeIndia, SearchResult } from './services/geoService';

import { Navbar, DashboardTab } from './components/Navbar';
import { StateChipsBar } from './components/StateChipsBar';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { PredictionCard } from './components/PredictionCard';
import { HourlyTimelineScrubber } from './components/HourlyTimelineScrubber';
import { AirQualitySection } from './components/AirQualitySection';
import { ExtremeAlertsSection } from './components/ExtremeAlertsSection';
import { ClimateSimulatorSection } from './components/ClimateSimulatorSection';
import { RainfallPredictionSection } from './components/RainfallPredictionSection';
import { TempHumidityCharts } from './components/TempHumidityCharts';
import { InteractiveIndiaMap } from './components/InteractiveIndiaMap';
import { StateComparisonSection } from './components/StateComparisonSection';
import { SearchModal } from './components/SearchModal';
import { AboutPredictionModal } from './components/AboutPredictionModal';
import { DataSourceModal } from './components/DataSourceModal';
import { AIBriefingModal } from './components/AIBriefingModal';
import { ExportDossierModal } from './components/ExportDossierModal';

import {
  AlertTriangle,
  RefreshCw,
  CloudOff,
  ShieldAlert,
  MapPin,
  ExternalLink,
  Heart,
  Radio,
  Wind,
  Sparkles,
  Bot,
  FileDown,
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

  // Version 2.0 User Preferences & Navigation Modes
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState<boolean>(false);
  const [isAIBriefingOpen, setIsAIBriefingOpen] = useState<boolean>(false);
  const [isExportDossierOpen, setIsExportDossierOpen] = useState<boolean>(false);

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

  // Periodic Auto-Refresh every 10 minutes
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

  // Keyboard shortcut (⌘K or Ctrl+K) for Search Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle State Selection
  const handleSelectState = (state: StateInfo) => {
    setSelectedState(state);
    setCurrentLocationTitle({ name: state.capital, state: state.name });
    loadWeatherData(state.lat, state.lon, state.capital, state.name);
  };

  // Handle Search Result Selection
  const handleSelectSearchResult = (result: SearchResult) => {
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

  const alertCount = weatherData?.alerts?.filter((a) => a.severity !== 'green').length || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation Bar with v2 Tabs & Controls */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onLocateMe={handleLocateMe}
        onRefresh={handleRefresh}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenDataSources={() => setIsDataSourcesOpen(true)}
        onOpenAIBriefing={() => setIsAIBriefingOpen(true)}
        onOpenExportDossier={() => setIsExportDossierOpen(true)}
        isLocating={isLocating}
        isRefreshing={isRefreshing}
        lastUpdated={weatherData?.lastUpdated || ''}
        tempUnit={tempUnit}
        onToggleUnit={() => setTempUnit((prev) => (prev === 'C' ? 'F' : 'C'))}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        alertCount={alertCount}
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
                Contacting Real-Time Numerical Weather Prediction & Satellite Feeds...
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Executing feature extraction, AQI indexing, and mathematical risk modeling for {currentLocationTitle.name}
              </p>
            </div>
          </div>
        )}

        {/* Loaded Content */}
        {weatherData && (
          <div className="space-y-6 animate-fadeIn">
            {/* Active Region Status & Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs shadow-md">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium text-slate-300">
                  <span className={`w-2 h-2 rounded-full ${isLoading || isRefreshing ? 'bg-amber-400 animate-spin' : 'bg-cyan-400 animate-pulse'}`}></span>
                  Region: <strong className="text-white font-bold">{selectedState.name}</strong>
                  <span className="text-slate-400">({selectedState.capital})</span>
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-cyan-400 font-mono flex items-center gap-1">
                  <span>📍 Coordinates:</span>
                  <span className="font-semibold">{selectedState.lat.toFixed(4)}° N, {selectedState.lon.toFixed(4)}° E</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[11px] flex-wrap">
                {weatherData.airQuality && (
                  <button
                    onClick={() => setActiveTab('air-quality')}
                    className="font-mono px-2 py-0.5 rounded border text-[10px] flex items-center gap-1 hover:brightness-110 transition-all"
                    style={{
                      backgroundColor: `${weatherData.airQuality.color}15`,
                      color: weatherData.airQuality.color,
                      borderColor: `${weatherData.airQuality.color}40`,
                    }}
                  >
                    <Wind className="w-3 h-3" />
                    <span>AQI {weatherData.airQuality.aqi} ({weatherData.airQuality.category})</span>
                  </button>
                )}

                <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Open-Meteo NWP Synced
                </span>
              </div>
            </div>

            {/* TAB: OVERVIEW (Full Executive Command Center) */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 24-Hour Interactive Timeline Scrubber (v2 Feature) */}
                <HourlyTimelineScrubber hourly={weatherData.hourly} tempUnit={tempUnit} />

                {/* Row 1: Current Weather Card & Prediction / Risk Card */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6 xl:col-span-7">
                    <CurrentWeatherCard
                      data={weatherData}
                      selectedStateName={selectedState.name}
                      tempUnit={tempUnit}
                      onOpenAQI={() => setActiveTab('air-quality')}
                    />
                  </div>
                  <div className="lg:col-span-6 xl:col-span-5">
                    <PredictionCard
                      prediction={weatherData.prediction}
                      onOpenModelDetails={() => setIsAboutOpen(true)}
                    />
                  </div>
                </div>

                {/* Row 2: Air Quality Hub & IMD Extreme Weather Alerts (v2 Highlights) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6">
                    <AirQualitySection airQuality={weatherData.airQuality} locationName={selectedState.name} />
                  </div>
                  <div className="lg:col-span-6">
                    <ExtremeAlertsSection alerts={weatherData.alerts} locationName={selectedState.name} data={weatherData} />
                  </div>
                </div>

                {/* Row 3: Rainfall Prediction Modeling & Temperature/Humidity Dynamics */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6">
                    <RainfallPredictionSection data={weatherData} />
                  </div>
                  <div className="lg:col-span-6">
                    <TempHumidityCharts data={weatherData} />
                  </div>
                </div>

                {/* Row 4: Climate Simulator Sandbox (v2 Feature) */}
                <div>
                  <ClimateSimulatorSection data={weatherData} />
                </div>

                {/* Row 5: Interactive Leaflet India Map */}
                <div>
                  <InteractiveIndiaMap
                    selectedState={selectedState}
                    onSelectState={handleSelectState}
                    stateRiskMap={stateRiskMap}
                    isWeatherLoading={isLoading || isRefreshing}
                  />
                </div>

                {/* Row 6: Cross-State Meteorological Comparison */}
                <div>
                  <StateComparisonSection onSelectState={handleSelectState} />
                </div>
              </div>
            )}

            {/* TAB: AIR QUALITY (Dedicated AQI Hub) */}
            {activeTab === 'air-quality' && (
              <div className="space-y-6 animate-fadeIn">
                <AirQualitySection airQuality={weatherData.airQuality} locationName={selectedState.name} />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6">
                    <ExtremeAlertsSection alerts={weatherData.alerts} locationName={selectedState.name} data={weatherData} />
                  </div>
                  <div className="lg:col-span-6">
                    <CurrentWeatherCard
                      data={weatherData}
                      selectedStateName={selectedState.name}
                      tempUnit={tempUnit}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: IMD ALERTS (Dedicated Extreme Weather Warning Center) */}
            {activeTab === 'alerts' && (
              <div className="space-y-6 animate-fadeIn">
                <ExtremeAlertsSection alerts={weatherData.alerts} locationName={selectedState.name} data={weatherData} />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6">
                    <PredictionCard
                      prediction={weatherData.prediction}
                      onOpenModelDetails={() => setIsAboutOpen(true)}
                    />
                  </div>
                  <div className="lg:col-span-6">
                    <RainfallPredictionSection data={weatherData} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SIMULATOR (Dedicated What-If Climate Sandbox) */}
            {activeTab === 'simulator' && (
              <div className="space-y-6 animate-fadeIn">
                <ClimateSimulatorSection data={weatherData} />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6">
                    <PredictionCard
                      prediction={weatherData.prediction}
                      onOpenModelDetails={() => setIsAboutOpen(true)}
                    />
                  </div>
                  <div className="lg:col-span-6">
                    <CurrentWeatherCard
                      data={weatherData}
                      selectedStateName={selectedState.name}
                      tempUnit={tempUnit}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: GIS MAP (Dedicated Full-Height Geospatial Radar) */}
            {activeTab === 'map' && (
              <div className="space-y-6 animate-fadeIn">
                <InteractiveIndiaMap
                  selectedState={selectedState}
                  onSelectState={handleSelectState}
                  stateRiskMap={stateRiskMap}
                  isWeatherLoading={isLoading || isRefreshing}
                />
                <StateComparisonSection onSelectState={handleSelectState} />
              </div>
            )}

            {/* TAB: COMPARISON (Dedicated Cross-State Matrix) */}
            {activeTab === 'comparison' && (
              <div className="space-y-6 animate-fadeIn">
                <StateComparisonSection onSelectState={handleSelectState} />
              </div>
            )}
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
      <AIBriefingModal isOpen={isAIBriefingOpen} onClose={() => setIsAIBriefingOpen(false)} data={weatherData} />
      <ExportDossierModal isOpen={isExportDossierOpen} onClose={() => setIsExportDossierOpen(false)} data={weatherData} />

      {/* Version 2.0 Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400 font-semibold mb-1">
              <span>India Weather Intelligence & Atmospheric Risk Platform</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono border border-cyan-500/30 font-bold">
                v2.0.0 ULTRA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-xl">
              ECMWF / DWD ICON High-Resolution Numerical Weather Prediction, Real-Time Continuous Air Quality (AQI), IMD-Compliant Early Warning System, and Explainable Multi-Vector Atmospheric Risk Indexing.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] flex-wrap">
            <button
              onClick={() => setIsAIBriefingOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Voice Dispatch</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsExportDossierOpen(true)}
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Dossier</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              Risk Formula
            </button>
            <span>•</span>
            <button
              onClick={() => setIsDataSourcesOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              Providers
            </button>
            <span>•</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
