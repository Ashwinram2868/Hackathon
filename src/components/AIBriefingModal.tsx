import React, { useState, useEffect } from 'react';
import { WeatherDataPayload } from '../types/weather';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Square,
  Copy,
  Check,
  Radio,
  Sparkles,
  Bot,
  Share2,
} from 'lucide-react';

interface AIBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WeatherDataPayload | null;
}

export const AIBriefingModal: React.FC<AIBriefingModalProps> = ({ isOpen, onClose, data }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setIsSupported(false);
    }
  }, []);

  // Stop speech when modal is closed
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const { location, current, prediction, airQuality, alerts } = data;

  // Construct natural-sounding AI Briefing Script
  const briefingScript = `India Weather Intelligence Version 2.0 Meteorological Dispatch for ${location.name}, ${location.state || 'India'}.
Currently reporting ${current.condition.label} with an ambient temperature of ${current.temperature} degrees Celsius, feeling like ${current.feelsLike} degrees. Relative humidity stands at ${current.humidity} percent with surface wind speeds at ${current.windSpeed} kilometers per hour.
Mathematical Risk Assessment: Our hybrid prediction engine calculates a composite weather risk score of ${prediction.riskScore} out of 100, placing the region in the ${prediction.riskLevel} tier. ${prediction.explanation}.
Rainfall Outlook: Over the next 24 hours, accumulated rainfall is projected at ${prediction.rainfallOutlook.next24HoursAccumulation} millimeters, with a peak probability of ${prediction.rainfallOutlook.peakProbability} percent.
Air Quality Status: ${airQuality ? `The ambient Air Quality Index is ${airQuality.aqi}, classified as ${airQuality.category}. ${airQuality.advice.general}` : 'Air quality baseline is within nominal standards.'}
Advisory Protocol: ${alerts && alerts.length > 0 ? alerts[0].title + '. ' + alerts[0].instruction : 'Standard routine conditions prevail. Safe transit advised.'}
This concludes the automated meteorological intelligence bulletin.`;

  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device/browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel(); // Reset any existing queue
      const utterance = new SpeechSynthesisUtterance(briefingScript);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select natural English voice if present
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => (v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US')) && !v.name.includes('Google')
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferred) utterance.voice = preferred;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(briefingScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                AI Voice Weather Dispatch
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  v2.0 Audio
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Natural-language synthetic intelligence briefing for {location.name}
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
          {/* Audio Player Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSpeak}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isPlaying
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                    : 'bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'
                }`}
              >
                {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <div>
                <strong className="text-white text-sm block">
                  {isPlaying ? 'Synthesizing Live Voice Briefing...' : 'Listen to AI Voice Briefing'}
                </strong>
                <span className="text-xs text-slate-400">
                  {isPlaying ? 'Click square to pause' : 'Powered by Browser Neural Speech Synthesis'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Radio className={`w-4 h-4 ${isPlaying ? 'animate-ping' : ''}`} />
              <span>{isPlaying ? 'LIVE AUDIO' : 'STANDBY'}</span>
            </div>
          </div>

          {/* Transcript */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Executive Audio Transcript</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Script'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-line border-l-4 border-l-cyan-500">
              {briefingScript}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-between items-center text-xs text-slate-500">
          <span>Zero external audio API cost • Instant offline synthesis</span>
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
