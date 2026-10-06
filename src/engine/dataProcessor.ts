import { WeatherCondition } from '../types/weather';

/**
 * WMO Weather Interpretation Codes (WW)
 * Standardized meteorological interpretation
 */
export function interpretWMOCode(code: number): WeatherCondition {
  switch (code) {
    case 0:
      return { code, label: 'Clear Sky', description: 'Cloudless sunny/clear conditions', icon: 'Sun', category: 'clear' };
    case 1:
      return { code, label: 'Mainly Clear', description: 'Scattered high clouds, mostly sunny', icon: 'SunMedium', category: 'clear' };
    case 2:
      return { code, label: 'Partly Cloudy', description: 'Intermittent cloud cover', icon: 'CloudSun', category: 'clouds' };
    case 3:
      return { code, label: 'Overcast', description: 'Heavy uniform stratocumulus cloud deck', icon: 'Cloud', category: 'clouds' };
    case 45:
      return { code, label: 'Foggy', description: 'Ground-level fog with reduced visibility', icon: 'CloudFog', category: 'fog' };
    case 48:
      return { code, label: 'Depositing Rime Fog', description: 'Freezing rime fog conditions', icon: 'CloudFog', category: 'fog' };
    case 51:
      return { code, label: 'Light Drizzle', description: 'Fine water droplets falling gently', icon: 'CloudDrizzle', category: 'drizzle' };
    case 53:
      return { code, label: 'Moderate Drizzle', description: 'Steady fine drizzle reducing visibility', icon: 'CloudDrizzle', category: 'drizzle' };
    case 55:
      return { code, label: 'Dense Drizzle', description: 'Thick drizzle accumulation', icon: 'CloudDrizzle', category: 'drizzle' };
    case 56:
    case 57:
      return { code, label: 'Freezing Drizzle', description: 'Freezing drizzle hazard', icon: 'CloudSnow', category: 'drizzle' };
    case 61:
      return { code, label: 'Slight Rain', description: 'Light rain showers', icon: 'CloudRain', category: 'rain' };
    case 63:
      return { code, label: 'Moderate Rain', description: 'Continuous moderate precipitation', icon: 'CloudRain', category: 'rain' };
    case 65:
      return { code, label: 'Heavy Rain', description: 'Substantial downpour, risk of runoff', icon: 'CloudRainWind', category: 'rain' };
    case 66:
    case 67:
      return { code, label: 'Freezing Rain', description: 'Cold rain forming glazed ice', icon: 'CloudSnow', category: 'rain' };
    case 71:
      return { code, label: 'Slight Snow', description: 'Light snowflake flurries', icon: 'Snowflake', category: 'snow' };
    case 73:
      return { code, label: 'Moderate Snow', description: 'Steady snowfall cover', icon: 'Snowflake', category: 'snow' };
    case 75:
      return { code, label: 'Heavy Snow', description: 'Intense blizzard/heavy snowfall', icon: 'Snowflake', category: 'snow' };
    case 77:
      return { code, label: 'Snow Grains', description: 'Small crystalline frozen pellets', icon: 'Snowflake', category: 'snow' };
    case 80:
      return { code, label: 'Light Rain Showers', description: 'Scattered brief rain showers', icon: 'CloudRain', category: 'rain' };
    case 81:
      return { code, label: 'Moderate Rain Showers', description: 'Periodic convective showers', icon: 'CloudRain', category: 'rain' };
    case 82:
      return { code, label: 'Violent Rain Showers', description: 'Torrential convective cloudburst', icon: 'CloudLightning', category: 'rain' };
    case 85:
    case 86:
      return { code, label: 'Snow Showers', description: 'Periodic snow showers', icon: 'Snowflake', category: 'snow' };
    case 95:
      return { code, label: 'Thunderstorm', description: 'Convective storm with lightning & thunder', icon: 'CloudLightning', category: 'thunderstorm' };
    case 96:
      return { code, label: 'Thunderstorm with Slight Hail', description: 'Severe convective storm with small hail', icon: 'CloudLightning', category: 'thunderstorm' };
    case 99:
      return { code, label: 'Thunderstorm with Heavy Hail', description: 'Severe storm with damaging hail & squalls', icon: 'CloudLightning', category: 'thunderstorm' };
    default:
      return { code, label: 'Variable Weather', description: 'Mixed weather patterns', icon: 'Cloud', category: 'clouds' };
  }
}

export interface ExtractedWeatherFeatures {
  currentTemp: number;
  feelsLikeTemp: number;
  currentHumidity: number;
  currentPrecipitationRate: number; // mm/h
  currentWindSpeed: number;        // km/h
  currentPressure: number;         // hPa
  currentCloudCover: number;       // %
  weatherCode: number;

  // Hourly Aggregations (Next 24h)
  avgTemp24h: number;
  minTemp24h: number;
  maxTemp24h: number;
  avgHumidity24h: number;
  accumulatedPrecipitation24h: number; // mm
  accumulatedPrecipitation3h: number;  // mm
  peakPrecipitationProbability24h: number; // %
  maxWindSpeed24h: number; // km/h
  
  // 7-day outlook
  accumulatedPrecipitation7d: number; // mm
  
  // Pressure trend (first 6 hours difference)
  pressureTrendDelta: number; // hPa change over 6h: negative means falling
}

export function extractWeatherFeatures(raw: any): ExtractedWeatherFeatures {
  const current = raw.current || {};
  const hourly = raw.hourly || {};
  const daily = raw.daily || {};

  const currentTemp = current.temperature_2m ?? 28;
  const feelsLikeTemp = current.apparent_temperature ?? currentTemp;
  const currentHumidity = current.relative_humidity_2m ?? 60;
  const currentPrecipitationRate = current.precipitation ?? current.rain ?? 0;
  const currentWindSpeed = current.wind_speed_10m ?? 10;
  const currentPressure = current.surface_pressure ?? 1010;
  const currentCloudCover = current.cloud_cover ?? 30;
  const weatherCode = current.weather_code ?? 0;

  // Process hourly arrays (typically 168 hours = 7 days)
  const hourlyTemps: number[] = (hourly.temperature_2m || []).slice(0, 24);
  const hourlyHumidity: number[] = (hourly.relative_humidity_2m || []).slice(0, 24);
  const hourlyPrecip: number[] = (hourly.precipitation || []).slice(0, 24);
  const hourlyProb: number[] = (hourly.precipitation_probability || []).slice(0, 24);
  const hourlyWinds: number[] = (hourly.wind_speed_10m || []).slice(0, 24);
  const hourlyPressures: number[] = (hourly.surface_pressure || []).slice(0, 24);

  // 24h stats
  const avgTemp24h = hourlyTemps.length > 0 
    ? Math.round((hourlyTemps.reduce((a, b) => a + b, 0) / hourlyTemps.length) * 10) / 10 
    : currentTemp;
  const minTemp24h = hourlyTemps.length > 0 ? Math.min(...hourlyTemps) : currentTemp - 4;
  const maxTemp24h = hourlyTemps.length > 0 ? Math.max(...hourlyTemps) : currentTemp + 4;
  
  const avgHumidity24h = hourlyHumidity.length > 0
    ? Math.round(hourlyHumidity.reduce((a, b) => a + b, 0) / hourlyHumidity.length)
    : currentHumidity;

  const accumulatedPrecipitation3h = (hourlyPrecip.slice(0, 3)).reduce((a, b) => a + (b || 0), 0);
  const accumulatedPrecipitation24h = hourlyPrecip.reduce((a, b) => a + (b || 0), 0);
  
  // 7-day precip sum from daily or full hourly
  let accumulatedPrecipitation7d = 0;
  if (daily.precipitation_sum && Array.isArray(daily.precipitation_sum)) {
    accumulatedPrecipitation7d = daily.precipitation_sum.reduce((a: number, b: number) => a + (b || 0), 0);
  } else if (hourly.precipitation && Array.isArray(hourly.precipitation)) {
    accumulatedPrecipitation7d = hourly.precipitation.reduce((a: number, b: number) => a + (b || 0), 0);
  }

  const peakPrecipitationProbability24h = hourlyProb.length > 0
    ? Math.max(...hourlyProb)
    : 0;

  const maxWindSpeed24h = hourlyWinds.length > 0
    ? Math.max(...hourlyWinds)
    : currentWindSpeed;

  // Pressure delta over 6 hours
  const pressureTrendDelta = (hourlyPressures.length >= 6 && hourlyPressures[0] && hourlyPressures[5])
    ? hourlyPressures[5] - hourlyPressures[0]
    : 0;

  return {
    currentTemp,
    feelsLikeTemp,
    currentHumidity,
    currentPrecipitationRate,
    currentWindSpeed,
    currentPressure,
    currentCloudCover,
    weatherCode,
    avgTemp24h,
    minTemp24h,
    maxTemp24h,
    avgHumidity24h,
    accumulatedPrecipitation24h: Math.round(accumulatedPrecipitation24h * 10) / 10,
    accumulatedPrecipitation3h: Math.round(accumulatedPrecipitation3h * 10) / 10,
    accumulatedPrecipitation7d: Math.round(accumulatedPrecipitation7d * 10) / 10,
    peakPrecipitationProbability24h: Math.round(peakPrecipitationProbability24h),
    maxWindSpeed24h: Math.round(maxWindSpeed24h * 10) / 10,
    pressureTrendDelta: Math.round(pressureTrendDelta * 10) / 10,
  };
}
