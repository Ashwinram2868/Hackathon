import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { apiCache } from './cache';
import { INDIAN_STATES } from '../src/data/stateData';
import { MAJOR_INDIAN_CITIES } from '../src/data/majorCities';
import { extractWeatherFeatures, interpretWMOCode } from '../src/engine/dataProcessor';
import { activePredictionEngine } from '../src/engine/predictionEngine';
import { WeatherDataPayload } from '../src/types/weather';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '300', 10);

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.path.startsWith('/assets')) {
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    cacheEntries: apiCache.size(),
    provider: 'Open-Meteo High Resolution NWP (WMO Standard)',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Helper to fetch Open-Meteo data
async function fetchOpenMeteoRaw(lat: number, lon: number): Promise<any> {
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
  const response = await fetch(url, { signal: AbortSignal.timeout(9000) });

  if (!response.ok) {
    throw new Error(`Open-Meteo API returned HTTP status ${response.status}`);
  }

  return await response.json();
}

// 2. Weather by Coordinates
app.get('/api/weather/coordinates', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const name = (req.query.name as string) || 'Selected Location';
    const state = (req.query.state as string) || undefined;

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Valid latitude and longitude are required query parameters.' });
    }

    const cacheKey = `weather_${lat.toFixed(3)}_${lon.toFixed(3)}`;
    const cached = apiCache.get<WeatherDataPayload>(cacheKey);

    if (cached) {
      return res.json({ ...cached, fromCache: true });
    }

    const raw = await fetchOpenMeteoRaw(lat, lon);
    const features = extractWeatherFeatures(raw);
    const prediction = activePredictionEngine.predict(features);

    const currentCondition = interpretWMOCode(raw.current?.weather_code ?? 0);
    const currentRaw = raw.current || {};
    const hourlyRaw = raw.hourly || {};
    const dailyRaw = raw.daily || {};

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

    // Calculate hourly slice
    const currentTimeStr = currentRaw.time ? currentRaw.time.slice(0, 13) : '';
    let startIndex = 0;
    if (hourlyRaw.time && currentTimeStr) {
      const idx = (hourlyRaw.time as string[]).findIndex((t) => t.startsWith(currentTimeStr));
      if (idx !== -1) startIndex = idx;
    }

    const times: string[] = (hourlyRaw.time || []).slice(startIndex, startIndex + 168);
    const hourly = times.map((t, idx) => {
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

    const dailyDates: string[] = dailyRaw.time || [];
    const daily = dailyDates.slice(0, 7).map((d, i) => {
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

    const payload: WeatherDataPayload = {
      location: {
        name,
        state,
        country: 'India',
        latitude: raw.latitude ?? lat,
        longitude: raw.longitude ?? lon,
        elevation: raw.elevation,
        timezone: raw.timezone || 'Asia/Kolkata',
      },
      current,
      hourly,
      daily,
      prediction,
      dataSource: {
        name: 'Open-Meteo NWP Global Feeds',
        model: 'ECMWF / DWD ICON Gridded Model',
        resolution: '0.25° (~25km)',
        updateFrequency: 'Hourly Dynamic Updates',
        latency: 'Cached in Backend',
      },
      lastUpdated: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
      fromCache: false,
    };

    apiCache.set(cacheKey, payload, CACHE_TTL);
    return res.json(payload);
  } catch (err: any) {
    console.error('Error fetching weather coordinates:', err.message);
    return res.status(502).json({
      error: 'Weather service temporarily unavailable',
      details: err.message,
    });
  }
});

// 3. Weather by State ID
app.get('/api/weather/state/:stateId', async (req: Request, res: Response) => {
  const { stateId } = req.params;
  const state = INDIAN_STATES.find(
    (s) => s.id === stateId || s.code.toLowerCase() === stateId.toLowerCase() || s.name.toLowerCase() === stateId.toLowerCase()
  );

  if (!state) {
    return res.status(404).json({ error: `State '${stateId}' not found in registry.` });
  }

  // Redirect to coordinates logic
  req.query.lat = state.lat.toString();
  req.query.lon = state.lon.toString();
  req.query.name = state.capital;
  req.query.state = state.name;

  // Delegate
  const nextHandler = app._router.stack.find((layer: any) => layer.route?.path === '/api/weather/coordinates');
  if (nextHandler) {
    return nextHandler.handle(req, res);
  }
  return res.status(500).json({ error: 'Internal routing error' });
});

// 4. Compare multiple states
app.get('/api/weather/compare', async (req: Request, res: Response) => {
  try {
    const rawCodes = (req.query.states as string) || 'TN,KL,KA,MH';
    const stateCodes = rawCodes.split(',').map((s) => s.trim().toUpperCase());

    const results = await Promise.all(
      stateCodes.map(async (code) => {
        const state = INDIAN_STATES.find((s) => s.code === code || s.id === code.toLowerCase());
        if (!state) return null;

        try {
          const cacheKey = `weather_${state.lat.toFixed(3)}_${state.lon.toFixed(3)}`;
          let data = apiCache.get<WeatherDataPayload>(cacheKey);

          if (!data) {
            const raw = await fetchOpenMeteoRaw(state.lat, state.lon);
            const features = extractWeatherFeatures(raw);
            const prediction = activePredictionEngine.predict(features);
            const currentCondition = interpretWMOCode(raw.current?.weather_code ?? 0);
            
            data = {
              location: { name: state.capital, state: state.name, country: 'India', latitude: state.lat, longitude: state.lon, timezone: 'Asia/Kolkata' },
              current: {
                time: new Date().toISOString(),
                temperature: Math.round((raw.current?.temperature_2m ?? 28) * 10) / 10,
                feelsLike: Math.round((raw.current?.apparent_temperature ?? 28) * 10) / 10,
                humidity: Math.round(raw.current?.relative_humidity_2m ?? 60),
                precipitation: Math.round((raw.current?.precipitation ?? 0) * 10) / 10,
                rain: Math.round((raw.current?.rain ?? 0) * 10) / 10,
                weatherCode: raw.current?.weather_code ?? 0,
                condition: currentCondition,
                windSpeed: Math.round((raw.current?.wind_speed_10m ?? 10) * 10) / 10,
                windDirection: 0,
                cloudCover: 20,
                pressure: 1010
              },
              hourly: [],
              daily: [],
              prediction,
              dataSource: { name: 'Open-Meteo', model: 'ECMWF', resolution: '0.25°', updateFrequency: 'Hourly', latency: '0ms' },
              lastUpdated: new Date().toLocaleTimeString('en-IN')
            };
            apiCache.set(cacheKey, data, CACHE_TTL);
          }

          return {
            state,
            currentTemp: data.current.temperature,
            avgTemp: data.prediction.metricsSummary.avgTemp24h,
            humidity: data.current.humidity,
            precipitation24h: data.prediction.rainfallOutlook.next24HoursAccumulation,
            rainProbability: data.prediction.rainfallOutlook.peakProbability,
            windSpeed: data.current.windSpeed,
            riskScore: data.prediction.riskScore,
            riskLevel: data.prediction.riskLevel,
            condition: data.current.condition,
          };
        } catch (err) {
          return {
            state,
            currentTemp: 0,
            avgTemp: 0,
            humidity: 0,
            precipitation24h: 0,
            rainProbability: 0,
            windSpeed: 0,
            riskScore: 0,
            riskLevel: 'Low Risk',
            condition: interpretWMOCode(0),
            error: 'Failed to fetch'
          };
        }
      })
    );

    res.json(results.filter(Boolean));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Search query proxy
app.get('/api/weather/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  if (!query || query.length < 2) return res.json([]);

  const cleanQ = query.toLowerCase().trim();
  const matchedCities = MAJOR_INDIAN_CITIES.filter(
    (c) => c.name.toLowerCase().includes(cleanQ) || c.state.toLowerCase().includes(cleanQ)
  ).slice(0, 8);

  const matchedStates = INDIAN_STATES.filter(
    (s) => s.name.toLowerCase().includes(cleanQ) || s.code.toLowerCase() === cleanQ
  ).slice(0, 4);

  res.json({
    states: matchedStates,
    cities: matchedCities,
  });
});

// 6. Serve GeoJSON
app.get('/api/geojson/india-states', (req: Request, res: Response) => {
  const geoPath = path.resolve(process.cwd(), 'public/india_states.geojson');
  if (fs.existsSync(geoPath)) {
    res.setHeader('Content-Type', 'application/json');
    fs.createReadStream(geoPath).pipe(res);
  } else {
    res.status(404).json({ error: 'GeoJSON file not found' });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(process.cwd(), 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🌦️  India Weather Intelligence Server running on http://localhost:${PORT}`);
  console.log(`📊  Cache TTL configured to ${CACHE_TTL} seconds`);
});
