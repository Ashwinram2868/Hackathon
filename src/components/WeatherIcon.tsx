import React from 'react';
import {
  Sun,
  SunMedium,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  Snowflake,
  CloudLightning,
  Wind,
} from 'lucide-react';

interface WeatherIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ iconName, className = 'w-6 h-6', size = 24 }) => {
  switch (iconName) {
    case 'Sun':
      return <Sun size={size} className={`${className} text-amber-400`} />;
    case 'SunMedium':
      return <SunMedium size={size} className={`${className} text-amber-300`} />;
    case 'CloudSun':
      return <CloudSun size={size} className={`${className} text-sky-300`} />;
    case 'Cloud':
      return <Cloud size={size} className={`${className} text-slate-400`} />;
    case 'CloudFog':
      return <CloudFog size={size} className={`${className} text-slate-300`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle size={size} className={`${className} text-cyan-400`} />;
    case 'CloudRain':
      return <CloudRain size={size} className={`${className} text-blue-400`} />;
    case 'CloudRainWind':
      return <CloudRainWind size={size} className={`${className} text-blue-500`} />;
    case 'Snowflake':
      return <Snowflake size={size} className={`${className} text-indigo-300`} />;
    case 'CloudLightning':
      return <CloudLightning size={size} className={`${className} text-purple-400`} />;
    default:
      return <Cloud size={size} className={`${className} text-slate-400`} />;
  }
};
