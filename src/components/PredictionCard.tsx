import React from 'react';
import { WeatherPrediction } from '../types/weather';
import { RiskBadge } from './RiskBadge';
import {
  BrainCircuit,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  ChevronRight,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface PredictionCardProps {
  prediction: WeatherPrediction;
  onOpenModelDetails: () => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, onOpenModelDetails }) => {
  const { riskScore, riskLevel, headline, explanation, factors, rainfallOutlook, confidenceScore } = prediction;

  // Determine progress bar color based on score
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'from-red-500 to-rose-600';
    if (score >= 45) return 'from-orange-500 to-amber-500';
    if (score >= 25) return 'from-amber-400 to-yellow-500';
    return 'from-emerald-400 to-teal-500';
  };

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header with clear scientific distinction label (Section 16 requirement) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Short-Term Weather Risk & Prediction
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic index derived from real-time meteorological indicators
            </p>
          </div>
        </div>

        {/* Scientific tag distinguishing application prediction */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
            APPLICATION PREDICTION LAYER
          </span>
          <button
            onClick={onOpenModelDetails}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium ml-1"
            title="Inspect algorithmic weighting and formula"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inspect Model</span>
          </button>
        </div>
      </div>

      {/* Main Score & Risk Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 mb-5">
        {/* Left: Big Score Meter */}
        <div className="md:col-span-4 flex items-center gap-4">
          <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
            {/* Circular SVG meter */}
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="7"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="7"
                strokeDasharray={213}
                strokeDashoffset={213 - (213 * riskScore) / 100}
                strokeLinecap="round"
                className={`${
                  riskScore >= 70
                    ? 'text-red-500'
                    : riskScore >= 45
                    ? 'text-orange-500'
                    : riskScore >= 25
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                } transition-all duration-1000 ease-out`}
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold text-white leading-none">{riskScore}</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">/100</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1">Calculated Risk Level:</div>
            <RiskBadge level={riskLevel} size="md" />
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Model Confidence: <span className="text-emerald-400">{confidenceScore}%</span>
            </div>
          </div>
        </div>

        {/* Right: Headline & Key Takeaway */}
        <div className="md:col-span-8 border-t md:border-t-0 md:border-l border-slate-800 md:pl-5 pt-3 md:pt-0">
          <h4 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            {headline}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {explanation}
          </p>
        </div>
      </div>

      {/* Factor Breakdown Accordion / Grid (Section 9 Requirement: Showing Actual Numerical Values) */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Algorithmic Weighting & Feature Contributions
          </span>
          <span className="text-slate-500 text-[11px]">Sum of 4 Atmospheric Vectors = 100 pts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {factors.map((factor, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-200">{factor.name}</span>
                <span className="font-mono text-[11px] text-cyan-400">
                  {factor.score}/{factor.maxScore} pts ({factor.weight}% wt)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full bg-gradient-to-r ${getScoreColor(
                    (factor.score / factor.maxScore) * 100
                  )} transition-all duration-500`}
                  style={{ width: `${Math.max(4, (factor.score / factor.maxScore) * 100)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono text-slate-300">{factor.rawValue}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                    factor.level === 'Very High'
                      ? 'bg-red-500/20 text-red-400'
                      : factor.level === 'High'
                      ? 'bg-orange-500/20 text-orange-400'
                      : factor.level === 'Moderate'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {factor.level} Impact
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Scientific Disclaimer (Section 6 & 16 Requirement) */}
      <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 flex items-start gap-2.5 text-[11px] text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-normal">
          <strong className="text-slate-300">Meteorological Advisory Notice:</strong> This weather-risk prediction is algorithmically computed from real-time numerical weather prediction parameters for short-term situational awareness. It is not an official warning from the India Meteorological Department (IMD) or state disaster management authorities.
        </p>
      </div>
    </div>
  );
};
