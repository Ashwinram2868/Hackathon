import React, { useState } from 'react';
import { WeatherDataPayload } from '../types/weather';
import {
  X,
  FileDown,
  Copy,
  Check,
  FileText,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

interface ExportDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WeatherDataPayload | null;
}

export const ExportDossierModal: React.FC<ExportDossierModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [format, setFormat] = useState<'text' | 'csv'>('text');

  if (!isOpen || !data) return null;

  const { location, current, prediction, airQuality, daily, lastUpdated } = data;

  const textReport = `========================================================================
INDIA WEATHER INTELLIGENCE & RISK PREDICTION PLATFORM (v2.0 ULTRA)
METEOROLOGICAL INTELLIGENCE DOSSIER
Generated: ${new Date().toLocaleString('en-IN')}
========================================================================

1. GEOGRAPHIC & TELEMETRY IDENTIFIERS
------------------------------------------------------------------------
Location:       ${location.name}, ${location.state || 'India'}
Coordinates:    ${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E
Elevation:      ${location.elevation ?? 'N/A'} m above MSL
Timezone:       ${location.timezone}
Telemetry Sync: ${lastUpdated}

2. REAL-TIME OBSERVED METEOROLOGICAL STATE
------------------------------------------------------------------------
Condition:      ${current.condition.label} (${current.condition.description})
Temperature:    ${current.temperature} °C (Feels like: ${current.feelsLike} °C)
Humidity:       ${current.humidity} %
Rainfall Rate:  ${current.precipitation} mm/h
Wind Velocity:  ${current.windSpeed} km/h (Heading: ${current.windDirection}°)
Pressure:       ${current.pressure} hPa
Cloud Cover:    ${current.cloudCover} %

3. AIR QUALITY & ATMOSPHERIC HEALTH (v2.0)
------------------------------------------------------------------------
AQI (US Std):   ${airQuality?.aqi ?? 'N/A'} [${airQuality?.category ?? 'Normal'}]
Dominant Tox:   ${airQuality?.dominantPollutant ?? 'N/A'}
PM2.5:          ${airQuality?.pm25 ?? 'N/A'} µg/m³
PM10:           ${airQuality?.pm10 ?? 'N/A'} µg/m³
NO2 / SO2:      ${airQuality?.no2 ?? 'N/A'} / ${airQuality?.so2 ?? 'N/A'} µg/m³
Public Advice:  ${airQuality?.advice.general ?? 'Normal ventilation'}

4. MATHEMATICAL RISK PREDICTION ENGINE
------------------------------------------------------------------------
Composite Score: ${prediction.riskScore} / 100
Risk Category:   ${prediction.riskLevel}
Confidence:      ${prediction.confidenceScore} %
Summary:         ${prediction.headline}
Detailed Vector: ${prediction.explanation}

Rainfall Outlook:
- Rate Now:      ${prediction.rainfallOutlook.currentRainfallRate} mm/h
- 24h Accum:     ${prediction.rainfallOutlook.next24HoursAccumulation} mm
- 7d Projected:  ${prediction.rainfallOutlook.next7DaysAccumulation} mm
- Peak Prob:     ${prediction.rainfallOutlook.peakProbability} %
- IMD Category:  ${prediction.rainfallOutlook.intensityCategory}

5. 7-DAY SYNOPTIC OUTLOOK
------------------------------------------------------------------------
${daily
  .map(
    (d) =>
      `${d.dayName} (${d.date}): ${d.condition.label.padEnd(16)} | Max: ${d.tempMax}°C | Min: ${d.tempMin}°C | Rain: ${d.precipitationSum}mm (${d.precipitationProbabilityMax}%)`
  )
  .join('\n')}

========================================================================
END OF DOSSIER • Open-Meteo High Resolution NWP & Hybrid Deterministic Pipeline
========================================================================`;

  const csvReport = `Parameter,Value,Unit
Location,"${location.name}",
State,"${location.state || ''}",
Latitude,${location.latitude},deg N
Longitude,${location.longitude},deg E
Timestamp,"${lastUpdated}",
Condition,"${current.condition.label}",
Temperature,${current.temperature},deg C
FeelsLike,${current.feelsLike},deg C
Humidity,${current.humidity},%
RainfallRate,${current.precipitation},mm/h
WindSpeed,${current.windSpeed},km/h
Pressure,${current.pressure},hPa
RiskScore,${prediction.riskScore},0-100
RiskLevel,"${prediction.riskLevel}",
Precipitation24h,${prediction.rainfallOutlook.next24HoursAccumulation},mm
RainProbability,${prediction.rainfallOutlook.peakProbability},%
AQI,${airQuality?.aqi ?? 0},US AQI
PM2_5,${airQuality?.pm25 ?? 0},ug/m3
PM10,${airQuality?.pm10 ?? 0},ug/m3`;

  const contentToDisplay = format === 'text' ? textReport : csvReport;

  const handleCopy = () => {
    navigator.clipboard.writeText(contentToDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([contentToDisplay], {
      type: format === 'text' ? 'text/plain;charset=utf-8' : 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weather-dossier-${location.name.toLowerCase().replace(/\s+/g, '-')}-${format === 'text' ? 'report.txt' : 'data.csv'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Export Intelligence Dossier
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  v2.0
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Official briefing ready for State Disaster Management, agriculture, and emergency response
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
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Format selector & download triggers */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFormat('text')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                  format === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Text Dossier (.txt)</span>
              </button>
              <button
                onClick={() => setFormat('csv')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                  format === 'csv'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Tabular Data (.csv)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          {/* Dossier Preview Screen */}
          <pre className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-72 leading-relaxed select-all">
            {contentToDisplay}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
