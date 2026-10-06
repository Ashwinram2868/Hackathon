import { WeatherDataPayload, HourlyForecastItem, DailyForecastItem } from '../types/weather';
import { extractWeatherFeatures, interpretWMOCode } from '../engine/dataProcessor';
import { activePredictionEngine } from '../engine/predictionEngine';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Weather Service: Provides real-time and forecast weather data
 * with graceful fallback between backend proxy and direct client-side queries.
 */
export async function fetchWeatherData(
  lat: number,
  lon: number,
  locationName: string,
  stateName?: string
): Promise<WeatherDataPayload> {
  const startTime = performance.now();

  try {
    // 1. Try querying the Node.js/Express backend API first
    const backendUrl = `${API_BASE_URL}/weather/coordinates?lat=${lat}&lon=${lon}&name=${encodeURIComponent(
      locationName
    )}${stateName ? `&state=${encodeURIComponent(stateName)}` : ''}`;

    const res = await fetch(backendUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000), // 6-second timeout
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
    // If backend returns an error or 404, fall through to client-side fallback
    console.warn('Backend API returned non-OK status, falling back to direct provider:', res.status);
  } catch (err) {
    // Backend might be offline or starting up, fall through gracefully
    console.info('Direct provider fallback activated (Backend not responding or client standalone)');
  }

  // 2. Direct provider query (Open-Meteo High Resolution Numerical Weather Prediction)
  // Completely keyless, WMO compliant, accurate Indian coordinates coverage
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m',
    hourly:
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset',
    timezone: 'Asia/Kolkata',
    forecast_days: '7',
    past_days: '1',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Weather provider responded with error code ${response.status}`);
  }

  const raw = await response.json();
  const latency = Math.round(performance.now() - startTime);

  // Process data using our deterministic pipeline
  return transformRawWeatherResponse(raw, locationName, stateName, `${latency}ms`);
}

/**
 * Transforms raw Open-Meteo payload into structured WeatherDataPayload
 * runs feature extraction and computes prediction engine outputs.
 */
export function transformRawWeatherResponse(
  raw: any,
  locationName: string,
  stateName?: string,
  latency = '120ms'
): WeatherDataPayload {
  const currentRaw = raw.current || {};
  const hourlyRaw = raw.hourly || {};
  const dailyRaw = raw.daily || {};

  const currentCondition = interpretWMOCode(currentRaw.weather_code ?? 0);

  // Extract features for prediction engine
  const features = extractWeatherFeatures(raw);
  const prediction = activePredictionEngine.predict(features);

  // Format current weather
  const current = {
    time: currentRaw.time || new Date().toISOString(),
    temperature: Math.round((currentRaw.temperature_2m ?? 28) * 10) / 10,
    feelsLike: Math.round((currentRaw.apparent_temperature ?? currentRaw.temperature_2m ?? 28) * 10) / 10,
    humidity: Math.round(currentRaw.relative_humidity_2m ?? 60),
    precipitation: Math.round((currentRaw.precipitation ?? 0) * 10) / 10,
    rain: Math.round((currentRaw.rain ?? 0) * 10) / 10,
    weatherCode: currentRaw.weather_code ?? 0,
    condition: currentCondition,
    windSpeed: Math.round((currentRaw.wind_speed_10m ?? 10) * 10) / 10,
    windDirection: Math.round(currentRaw.wind_direction_10m ?? 0),
    cloudCover: Math.round(currentRaw.cloud_cover ?? 20),
    pressure: Math.round(currentRaw.surface_pressure ?? 1010),
  };

  // Format hourly forecast
  // Look for current hour index in hourlyRaw.time
  const currentTimeStr = currentRaw.time ? currentRaw.time.slice(0, 13) : '';
  let startIndex = 0;
  if (hourlyRaw.time && currentTimeStr) {
    const idx = (hourlyRaw.time as string[]).findIndex((t) => t.startsWith(currentTimeStr));
    if (idx !== -1) startIndex = idx;
  }

  const times: string[] = (hourlyRaw.time || []).slice(startIndex, startIndex + 168);
  const hourly: HourlyForecastItem[] = times.map((t, idx) => {
    const actualIdx = startIndex + idx;
    const wCode = hourlyRaw.weather_code?.[actualIdx] ?? 0;
    const dateObj = new Date(t);
    const hourLabel = dateObj.toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true });

    return {
      time: t,
      hour: hourLabel,
      temperature: Math.round((hourlyRaw.temperature_2m?.[actualIdx] ?? 25) * 10) / 10,
      feelsLike: Math.round((hourlyRaw.apparent_temperature?.[actualIdx] ?? 25) * 10) / 10,
      humidity: Math.round(hourlyRaw.relative_humidity_2m?.[actualIdx] ?? 60),
      precipitation: Math.round((hourlyRaw.precipitation?.[actualIdx] ?? 0) * 10) / 10,
      precipitationProbability: Math.round(hourlyRaw.precipitation_probability?.[actualIdx] ?? 0),
      weatherCode: wCode,
      condition: interpretWMOCode(wCode),
      windSpeed: Math.round((hourlyRaw.wind_speed_10m?.[actualIdx] ?? 10) * 10) / 10,
      pressure: Math.round(hourlyRaw.surface_pressure?.[actualIdx] ?? 1010),
      cloudCover: Math.round(hourlyRaw.cloud_cover?.[actualIdx] ?? 20),
    };
  });

  // Format daily forecast (7 days)
  const dailyDates: string[] = dailyRaw.time || [];
  const daily: DailyForecastItem[] = dailyDates.slice(0, 7).map((d, i) => {
    const wCode = dailyRaw.weather_code?.[i] ?? 0;
    const dateObj = new Date(d);
    const dayName = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-IN', { weekday: 'short' });

    return {
      date: d,
      dayName,
      weatherCode: wCode,
      condition: interpretWMOCode(wCode),
      tempMax: Math.round((dailyRaw.temperature_2m_max?.[i] ?? 30) * 10) / 10,
      tempMin: Math.round((dailyRaw.temperature_2m_min?.[i] ?? 22) * 10) / 10,
      precipitationSum: Math.round((dailyRaw.precipitation_sum?.[i] ?? 0) * 10) / 10,
      precipitationProbabilityMax: Math.round(dailyRaw.precipitation_probability_max?.[i] ?? 0),
      windSpeedMax: Math.round((dailyRaw.wind_speed_10m_max?.[i] ?? 15) * 10) / 10,
      sunrise: dailyRaw.sunrise?.[i],
      sunset: dailyRaw.sunset?.[i],
    };
  });

  return {
    location: {
      name: locationName,
      state: stateName,
      country: 'India',
      latitude: raw.latitude ?? 20.0,
      longitude: raw.longitude ?? 78.0,
      elevation: raw.elevation,
      timezone: raw.timezone || 'Asia/Kolkata',
    },
    current,
    hourly,
    daily,
    prediction,
    dataSource: {
      name: 'Open-Meteo NWP & WMO Global Model',
      model: 'ECMWF IFS / DWD ICON Ensemble Hybrid',
      resolution: '0.25° (~25km) Gridded Analysis',
      updateFrequency: 'Hourly Refresh',
      latency,
    },
    lastUpdated: new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }),
  };
}
