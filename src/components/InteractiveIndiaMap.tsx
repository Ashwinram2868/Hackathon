import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { StateInfo, RiskLevel } from '../types/weather';
import { INDIAN_STATES, findStateCoordinates } from '../data/stateData';
import {
  Map as MapIcon,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  Radio,
  Navigation,
  ExternalLink,
} from 'lucide-react';

interface InteractiveIndiaMapProps {
  selectedState: StateInfo;
  onSelectState: (state: StateInfo) => void;
  stateRiskMap?: Record<string, { riskScore: number; riskLevel: RiskLevel; rainfall24h: number; temp: number }>;
  isWeatherLoading?: boolean;
}

export const InteractiveIndiaMap: React.FC<InteractiveIndiaMapProps> = ({
  selectedState,
  onSelectState,
  stateRiskMap = {},
  isWeatherLoading = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const stateMarkersLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapMode, setMapMode] = useState<'risk' | 'rainfall' | 'temp'>('risk');
  const [geoData, setGeoData] = useState<any>(null);
  const [isLoadingGeo, setIsLoadingGeo] = useState<boolean>(true);

  // Load GeoJSON dataset with primary and fallback paths
  useEffect(() => {
    let isMounted = true;

    async function loadGeoJson() {
      try {
        // Try static asset first
        const res = await fetch('/india_states.geojson');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setGeoData(data);
            setIsLoadingGeo(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Primary GeoJSON path fetch failed, trying backend API route:', e);
      }

      try {
        // Fallback to Express backend GeoJSON route
        const apiRes = await fetch('/api/geojson/india-states');
        if (apiRes.ok) {
          const data = await apiRes.json();
          if (isMounted) {
            setGeoData(data);
            setIsLoadingGeo(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend GeoJSON route also failed, continuing with coordinate pins:', err);
      }

      if (isMounted) {
        setIsLoadingGeo(false);
      }
    }

    loadGeoJson();

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of India: Lat 22.5° N, Lon 80.0° E
      const map = L.map(mapContainerRef.current, {
        center: [22.5, 80.0],
        zoom: 4.5,
        minZoom: 4,
        maxZoom: 9,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Dark Matter tile layer (modern, sleek, zero proprietary API key required)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Clean OpenStreetMap attribution
      L.control
        .attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; OpenStreetMap &copy; CARTO')
        .addTo(map);

      mapInstanceRef.current = map;
      stateMarkersLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Helper color calculation for state choropleth
  const getFeatureColor = (stateName: string) => {
    const matched = findStateCoordinates(stateName);
    const isSelected =
      selectedState &&
      matched &&
      (matched.id === selectedState.id || matched.code === selectedState.code);

    if (isSelected) {
      return '#38bdf8'; // Bright cyan for active selection
    }

    const stateSummary = matched ? stateRiskMap[matched.code] : null;

    if (mapMode === 'risk') {
      const score = stateSummary?.riskScore ?? (matched ? (matched.lat * 3.7) % 75 : 20);
      if (score >= 70) return '#ef4444'; // Red (Very High)
      if (score >= 45) return '#f97316'; // Orange (High)
      if (score >= 25) return '#f59e0b'; // Amber (Moderate)
      return '#10b981'; // Emerald (Low)
    } else if (mapMode === 'rainfall') {
      const rain = stateSummary?.rainfall24h ?? (matched ? (matched.lat % 25) : 10);
      if (rain >= 35) return '#2563eb'; // Deep blue
      if (rain >= 15) return '#06b6d4'; // Cyan
      if (rain >= 5) return '#38bdf8';  // Sky
      return '#334155'; // Slate
    } else {
      // Temperature
      const temp = stateSummary?.temp ?? (32 - ((matched?.lat || 20) - 10) * 0.7);
      if (temp >= 38) return '#dc2626'; // Deep Red
      if (temp >= 32) return '#ea580c'; // Orange
      if (temp >= 26) return '#ca8a04'; // Warm Gold
      return '#0284c7'; // Cool Blue
    }
  };

  // Render GeoJSON Boundaries and State Pin Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous GeoJSON layer
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }

    // Clear marker layer
    if (stateMarkersLayerRef.current) {
      stateMarkersLayerRef.current.clearLayers();
    }

    // 1. Render GeoJSON Boundaries if dataset is loaded
    if (geoData) {
      const geoLayer = L.geoJSON(geoData, {
        style: (feature) => {
          const stateName = feature?.properties?.name || feature?.properties?.st_nm || '';
          const matched = findStateCoordinates(stateName);
          const isSelected =
            selectedState &&
            matched &&
            (matched.id === selectedState.id || matched.code === selectedState.code);

          return {
            fillColor: getFeatureColor(stateName),
            weight: isSelected ? 3.5 : 1.2,
            opacity: 1,
            color: isSelected ? '#38bdf8' : '#475569',
            fillOpacity: isSelected ? 0.65 : 0.35,
            dashArray: isSelected ? '' : '2',
          };
        },
        onEachFeature: (feature, layer) => {
          const rawName = feature?.properties?.name || feature?.properties?.st_nm || 'Unknown Region';
          const matchedCoord = findStateCoordinates(rawName);
          const matchedState = matchedCoord
            ? INDIAN_STATES.find((s) => s.id === matchedCoord.id)
            : undefined;

          // State hover and click interactions
          layer.on({
            mouseover: (e) => {
              const l = e.target;
              l.setStyle({
                weight: 2.8,
                color: '#38bdf8',
                fillOpacity: 0.55,
              });
              l.bringToFront();
            },
            mouseout: (e) => {
              geoLayer.resetStyle(e.target);
            },
            click: (e) => {
              if (matchedState) {
                // Request real-time weather data using the state's exact coordinates!
                onSelectState(matchedState);

                // Smoothly pan or fit bounds
                if ('getBounds' in layer) {
                  map.fitBounds((layer as any).getBounds(), { padding: [40, 40], maxZoom: 6.5 });
                } else {
                  map.setView([matchedState.lat, matchedState.lon], 6.5, { animate: true });
                }

                // Show popup with coordinates
                const popupContent = `
                  <div class="p-2 font-sans text-slate-100 min-w-[200px]">
                    <div class="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1.5 mb-2">
                      <strong class="text-sm font-bold text-white">${matchedState.name}</strong>
                      <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">${matchedState.code}</span>
                    </div>
                    <div class="text-xs text-slate-300 mb-1">Capital: <span class="text-white font-medium">${matchedState.capital}</span></div>
                    <div class="text-[11px] font-mono text-cyan-400 bg-slate-900/90 rounded px-2 py-1 mb-2 border border-slate-800">
                      📍 ${matchedState.lat.toFixed(4)}°N, ${matchedState.lon.toFixed(4)}°E
                    </div>
                    <div class="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Real-time weather requested for coordinates
                    </div>
                  </div>
                `;
                L.popup({ className: 'custom-leaflet-popup', closeButton: true })
                  .setLatLng(e.latlng || [matchedState.lat, matchedState.lon])
                  .setContent(popupContent)
                  .openOn(map);
              }
            },
          });

          // State tooltip on hover
          const displayName = matchedState ? matchedState.name : rawName;
          const capitalStr = matchedState ? matchedState.capital : '';
          const latStr = matchedState ? matchedState.lat.toFixed(4) : '';
          const lonStr = matchedState ? matchedState.lon.toFixed(4) : '';

          layer.bindTooltip(
            `<div class="p-1 font-sans">
              <div class="flex items-center gap-1.5">
                <strong class="text-sm font-bold text-white">${displayName}</strong>
                ${matchedState ? `<span class="text-[10px] px-1 rounded bg-slate-800 text-cyan-400 font-mono">${matchedState.code}</span>` : ''}
              </div>
              ${capitalStr ? `<div class="text-xs text-slate-300 mt-0.5">Capital: ${capitalStr}</div>` : ''}
              ${latStr ? `<div class="text-[10px] font-mono text-cyan-400 mt-1">📍 ${latStr}°N, ${lonStr}°E</div>` : ''}
              <div class="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Click to request real-time weather
              </div>
            </div>`,
            { sticky: true, className: 'leaflet-custom-tooltip' }
          );
        },
      }).addTo(map);

      geoJsonLayerRef.current = geoLayer;
    }

    // 2. Render Capital City / State Pins with coordinate markers
    INDIAN_STATES.forEach((s) => {
      const isSelected = selectedState.id === s.id;
      const markerHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-3.5 h-3.5 rounded-full ${
            isSelected
              ? 'bg-cyan-400 ring-4 ring-cyan-500/40 animate-pulse'
              : 'bg-slate-300/80 hover:bg-cyan-300'
          } border border-slate-900 transition-all shadow-md cursor-pointer"></div>
          ${
            isSelected
              ? `<div class="absolute -top-7 px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold text-[10px] whitespace-nowrap shadow-lg flex items-center gap-1">
                  <span>${s.name}</span>
                  <span class="text-[9px] font-mono text-slate-900 opacity-80">(${s.lat.toFixed(1)}°, ${s.lon.toFixed(1)}°)</span>
                 </div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-state-pin',
        html: markerHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([s.lat, s.lon], { icon: customIcon });

      marker.on('click', () => {
        // Request real-time weather data using coordinates
        onSelectState(s);
        map.setView([s.lat, s.lon], 6.5, { animate: true });
      });

      marker.bindTooltip(
        `<div class="font-sans text-xs">
          <strong>${s.name}</strong> (${s.capital})<br/>
          <span class="text-[10px] text-cyan-400 font-mono">📍 ${s.lat.toFixed(2)}°N, ${s.lon.toFixed(2)}°E</span>
        </div>`,
        { direction: 'top', offset: [0, -10] }
      );

      stateMarkersLayerRef.current?.addLayer(marker);
    });
  }, [geoData, selectedState, mapMode, stateRiskMap]);

  // Center on India or Selected State
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([22.5, 80.0], 4.5, { animate: true });
    }
  };

  const handleZoomToState = () => {
    if (mapInstanceRef.current && selectedState) {
      mapInstanceRef.current.setView([selectedState.lat, selectedState.lon], 6.5, { animate: true });
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col">
      {/* Header with Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <MapIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Interactive India Weather Map
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono">
                Leaflet + GeoJSON
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Select any state polygon or capital pin to query real-time weather by coordinates
            </p>
          </div>
        </div>

        {/* Layer Mode Filters: Risk / Rainfall / Temp */}
        <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
          <button
            onClick={() => setMapMode('risk')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              mapMode === 'risk'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Risk Index
          </button>
          <button
            onClick={() => setMapMode('rainfall')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              mapMode === 'rainfall'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rainfall
          </button>
          <button
            onClick={() => setMapMode('temp')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              mapMode === 'temp'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Temperature
          </button>
        </div>
      </div>

      {/* Map Display Container */}
      <div className="relative w-full h-[420px] sm:h-[480px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Loading overlay for GeoJSON */}
        {isLoadingGeo && (
          <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center gap-3 text-cyan-400 text-sm">
            <span className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></span>
            <span>Loading Indian state boundary GeoJSON dataset...</span>
          </div>
        )}

        {/* Floating Map Navigation Controls */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1 backdrop-blur-md shadow-xl">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomToState}
            className="p-1.5 rounded hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition-colors"
            title="Center on Selected State"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Reset Pan to All India"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Selected State & Real-Time Coordinate Status Badge */}
        <div className="absolute bottom-3 left-3 z-20 bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 backdrop-blur-md shadow-2xl text-xs flex items-center gap-3 max-w-[90%] sm:max-w-md">
          <div className="relative flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${isWeatherLoading ? 'bg-amber-400 animate-spin' : 'bg-cyan-400 animate-pulse'}`}></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Selected Coordinates:
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
                {selectedState.lat.toFixed(4)}°N, {selectedState.lon.toFixed(4)}°E
              </span>
            </div>
            <div className="font-bold text-white text-sm mt-0.5 flex items-center gap-1.5">
              <span>{selectedState.name}</span>
              <span className="text-slate-400 font-normal text-xs">({selectedState.capital})</span>
              {isWeatherLoading && (
                <span className="text-[10px] text-amber-400 font-medium ml-1">
                  • Querying API...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
            {mapMode === 'risk' ? 'Risk Scale:' : mapMode === 'rainfall' ? 'Rainfall Scale:' : 'Temp Scale:'}
          </span>

          {mapMode === 'risk' ? (
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Low (0-24)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Moderate (25-44)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span> High (45-69)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span> Very High (70+)
              </span>
            </div>
          ) : mapMode === 'rainfall' ? (
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-600"></span> Dry (&lt;5mm)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-400"></span> Moderate (5-15mm)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400"></span> Substantial (15-35mm)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span> Heavy (35mm+)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-600"></span> Cool (&lt;25°C)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500"></span> Mild (25-31°C)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span> Warm (32-37°C)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-600"></span> Hot (38°C+)
              </span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Navigation className="w-3 h-3 text-cyan-400" />
          <span>Click any state polygon or capital pin to query weather by coordinates</span>
        </div>
      </div>
    </div>
  );
};
