import React from 'react';
import { RiskLevel } from '../types/weather';
import { ShieldAlert, ShieldCheck, ShieldAlert as ShieldWarning, AlertTriangle } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md', showIcon = true }) => {
  const getStyles = () => {
    switch (level) {
      case 'Very High Risk':
        return {
          bg: 'bg-red-500/15 border-red-500/40 text-red-400 glow-risk-extreme',
          dot: 'bg-red-500 animate-ping',
          icon: <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />,
        };
      case 'High Risk':
        return {
          bg: 'bg-orange-500/15 border-orange-500/40 text-orange-400 glow-risk-high',
          dot: 'bg-orange-500',
          icon: <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />,
        };
      case 'Moderate Risk':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400 glow-risk-moderate',
          dot: 'bg-amber-500',
          icon: <ShieldWarning className="w-4 h-4 text-amber-400 shrink-0" />,
        };
      case 'Low Risk':
      default:
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 glow-risk-low',
          dot: 'bg-emerald-500',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />,
        };
    }
  };

  const style = getStyles();

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3.5 py-1 gap-2',
    lg: 'text-base px-4 py-1.5 gap-2.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border backdrop-blur-sm transition-all ${style.bg} ${sizeClasses}`}
    >
      {showIcon && style.icon}
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
            level === 'Very High Risk' ? 'animate-ping bg-red-400' : ''
          }`}
        ></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`}></span>
      </span>
      <span>{level}</span>
    </span>
  );
};
