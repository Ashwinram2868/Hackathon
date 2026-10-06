export type RiskLevel = 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Very High Risk';

export interface WeatherCondition {
  code: number;
  label: string;
  description: string;
  icon: string;
  category: 'clear' | 'clouds' | 'fog' | 'drizzle' | 'rain' | 'thunderstorm' | 'snow';
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitation: number;
  rain: number;
  weatherCode: number;
  condition: WeatherCondition;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  pressure: number;
  uvIndex?: number;
}

export interface HourlyForecastItem {
  time: string;
  hour: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitation: number;
  precipitationProbability: number;
  weatherCode: number;
  condition: WeatherCondition;
  windSpeed: number;
  pressure: number;
  cloudCover: number;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  weatherCode: number;
  condition: WeatherCondition;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  sunrise?: string;
  sunset?: string;
}

export interface RiskFactorBreakdown {
  name: string;
  score: number;       // Score contribution (0 to max)
  maxScore: number;    // Maximum possible for this factor
  weight: number;      // Weight percentage (e.g. 35%)
  rawValue: string;    // Human readable raw metric (e.g. "18.5 mm/24h")
  level: 'Low' | 'Moderate' | 'High' | 'Very High';
  impactDescription: string;
}

export interface WeatherPrediction {
  riskScore: number;             // 0 - 100
  riskLevel: RiskLevel;
  headline: string;
  explanation: string;
  factors: RiskFactorBreakdown[];
  rainfallOutlook: {
    currentRainfallRate: number;      // mm/h
    next3HoursAccumulation: number;   // mm
    next24HoursAccumulation: number;  // mm
    next7DaysAccumulation: number;    // mm
    peakProbability: number;          // %
    intensityCategory: 'None' | 'Trace / Light' | 'Moderate' | 'Heavy' | 'Very Heavy';
  };
  metricsSummary: {
    avgTemp24h: number;
    minTemp24h: number;
    maxTemp24h: number;
    avgHumidity24h: number;
    maxWind24h: number;
    pressureTrend: 'Rapidly Falling (Unstable)' | 'Steady' | 'Rising';
  };
  confidenceScore: number; // 0 - 100% confidence of short-term prediction
  modelType: 'Hybrid Rule-Based Atmospheric Index (Future ML Pipeline Ready)';
  generatedAt: string;
}

export interface StateInfo {
  id: string;
  name: string;
  code: string;
  capital: string;
  zone: 'North' | 'South' | 'East' | 'West' | 'Central' | 'North-East' | 'Union Territory';
  lat: number;
  lon: number;
  description: string;
  majorCities: string[];
}

export type AirQualityCategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

export interface AirQualityData {
  aqi: number; // US AQI standard (0 - 500)
  category: AirQualityCategory;
  pm25: number; // Particulate Matter 2.5 µg/m³
  pm10: number; // Particulate Matter 10 µg/m³
  no2: number;  // Nitrogen Dioxide µg/m³
  so2: number;  // Sulphur Dioxide µg/m³
  co: number;   // Carbon Monoxide µg/m³
  o3: number;   // Surface Ozone µg/m³
  color: string;
  dominantPollutant: string;
  advice: {
    general: string;
    sensitiveGroups: string;
    maskRequired: boolean;
    outdoorExercise: 'Safe' | 'Moderate' | 'Avoid' | 'Hazardous';
  };
}

export type AlertSeverity = 'green' | 'yellow' | 'orange' | 'red';
export type AlertCategory =
  | 'Heavy Rainfall / Flood'
  | 'Severe Heatwave'
  | 'Squall & Gale Winds'
  | 'Hazardous Air Quality'
  | 'Thunderstorm / Lightning'
  | 'Standard Advisory';

export interface SevereAlert {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  description: string;
  instruction: string;
  issuedAt: string;
  color: string;
}

export interface WeatherDataPayload {
  location: {
    name: string;
    state?: string;
    country: string;
    latitude: number;
    longitude: number;
    elevation?: number;
    timezone: string;
  };
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  prediction: WeatherPrediction;
  airQuality?: AirQualityData;
  alerts?: SevereAlert[];
  dataSource: {
    name: string;
    model: string;
    resolution: string;
    updateFrequency: string;
    latency: string;
  };
  lastUpdated: string;
  fromCache?: boolean;
}

export interface StateComparisonItem {
  state: StateInfo;
  currentTemp: number;
  avgTemp: number;
  humidity: number;
  precipitation24h: number;
  rainProbability: number;
  windSpeed: number;
  riskScore: number;
  riskLevel: RiskLevel;
  condition: WeatherCondition;
  aqi?: number;
  loading?: boolean;
  error?: string;
}

