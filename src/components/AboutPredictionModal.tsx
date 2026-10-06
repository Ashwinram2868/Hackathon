import React from 'react';
import { X, BrainCircuit, ShieldAlert, Cpu, CheckCircle2, Sliders, AlertTriangle } from 'lucide-react';

interface AboutPredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutPredictionModal: React.FC<AboutPredictionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Algorithmic Risk Prediction Model</h3>
              <p className="text-xs text-slate-400">
                Mathematical index formulation, feature extraction, and ML roadmap
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Mission & Problem Statement */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-900/40">
            <h4 className="font-semibold text-cyan-300 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>Problem Statement</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Understanding changing weather conditions across India through real-time data and short-term risk analysis."
              Traditional weather apps display raw temperature and icons without translating meteorological metrics into actionable risk levels for urban infrastructure, agriculture, and citizen preparedness.
            </p>
          </div>

          {/* Mathematical Index Weighting */}
          <div>
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Multi-Vector Meteorological Index (0 - 100 Points)</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              The short-term weather risk score is calculated deterministically across 4 physical atmospheric vectors:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-cyan-300">1. Precipitation Volume & Intensity (35% Weight)</strong>
                  <span className="font-mono text-cyan-400">0 - 35 points</span>
                </div>
                <p className="text-slate-400">
                  Evaluates instantaneous rainfall rate (mm/h) and projected 24-hour accumulation. Thresholds calibrate for IMD classifications: Light (&lt;10mm), Moderate (10-35mm), Heavy (35-65mm), and Torrential (&gt;65mm).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-blue-300">2. Rain Probability Index (25% Weight)</strong>
                  <span className="font-mono text-blue-400">0 - 25 points</span>
                </div>
                <p className="text-slate-400">
                  Maps the peak precipitation probability percentage over the next 24 hours into proportional risk points.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-purple-300">3. Wind & Barometric Instability (20% Weight)</strong>
                  <span className="font-mono text-purple-400">0 - 20 points</span>
                </div>
                <p className="text-slate-400">
                  Combines maximum expected wind gust speeds (&gt;35 km/h squalls) and 6-hour barometric pressure drop (ΔP &le; -2.5 hPa indicates incoming convective depressions/cyclonic formation).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-amber-300">4. Thermal & Moisture Saturation (20% Weight)</strong>
                  <span className="font-mono text-amber-400">0 - 20 points</span>
                </div>
                <p className="text-slate-400">
                  Evaluates high relative humidity (&gt;75%) paired with ambient temperature to measure heat index and moisture available for rapid vertical cloud condensation.
                </p>
              </div>
            </div>
          </div>

          {/* Categorical Risk Thresholds */}
          <div>
            <h4 className="text-sm font-bold text-white mb-2">Risk Level Classification</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center">
                <div className="font-bold">Low Risk</div>
                <div className="font-mono text-[10px] text-emerald-400 mt-0.5">0 - 24 pts</div>
                <div className="text-[10px] text-slate-400 mt-1">Minimal weather disruptions</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-center">
                <div className="font-bold">Moderate Risk</div>
                <div className="font-mono text-[10px] text-amber-400 mt-0.5">25 - 44 pts</div>
                <div className="text-[10px] text-slate-400 mt-1">Periodic showers or breezes</div>
              </div>
              <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300 text-center">
                <div className="font-bold">High Risk</div>
                <div className="font-mono text-[10px] text-orange-400 mt-0.5">45 - 69 pts</div>
                <div className="text-[10px] text-slate-400 mt-1">Elevated rainfall / wind gusts</div>
              </div>
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-center">
                <div className="font-bold">Very High Risk</div>
                <div className="font-mono text-[10px] text-red-400 mt-0.5">70 - 100 pts</div>
                <div className="text-[10px] text-slate-400 mt-1">Intense downpours or storms</div>
              </div>
            </div>
          </div>

          {/* Future ML Architecture (Section 15 Requirement) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1.5">
              <Cpu className="w-4 h-4" />
              <span>Future Machine Learning Pipeline Interface</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              The application adheres strictly to the Strategy Pattern via <code className="text-purple-300 font-mono">IPredictionEngine</code>. In subsequent development phases, the deterministic engine will be complemented by a trained Gradient Boosted Tree (XGBoost) or LSTM recurrent neural network accepting multi-station historical time series.
            </p>
            <div className="text-[11px] font-mono text-slate-500 bg-slate-900 p-2 rounded border border-slate-800">
              Weather API → Data Processor → Feature Extractor → IPredictionEngine → Risk Score & UI
            </div>
          </div>

          {/* Scientific Disclaimer */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Disclaimer:</strong> This application calculates short-term weather risk indicators strictly from numerical weather prediction parameters for research and educational purposes. It does not replace official meteorological bulletins or severe weather warnings issued by the India Meteorological Department (IMD) or NDMA.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
