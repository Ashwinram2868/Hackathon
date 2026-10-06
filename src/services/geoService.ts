import { MAJOR_INDIAN_CITIES, IndianCity } from '../data/majorCities';
import { INDIAN_STATES } from '../data/stateData';

export interface SearchResult {
  name: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  type: 'city' | 'state';
}

/**
 * Searches for Indian cities or states
 * Combines online geocoding with local curated index for instant offline responsiveness
 */
export async function searchLocations(query: string): Promise<SearchResult[]> {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ || cleanQ.length < 2) return [];

  const results: SearchResult[] = [];

  // 1. Check local states
  INDIAN_STATES.forEach((s) => {
    if (s.name.toLowerCase().includes(cleanQ) || s.code.toLowerCase() === cleanQ) {
      results.push({
        name: s.name,
        state: s.name,
        country: 'India',
        latitude: s.lat,
        longitude: s.lon,
        type: 'state',
      });
    }
  });

  // 2. Check local major cities
  MAJOR_INDIAN_CITIES.forEach((c) => {
    if (c.name.toLowerCase().includes(cleanQ) || (c.state && c.state.toLowerCase().includes(cleanQ))) {
      results.push({
        name: c.name,
        state: c.state,
        country: 'India',
        latitude: c.lat,
        longitude: c.lon,
        type: 'city',
      });
    }
  });

  // 3. Try Open-Meteo Geocoding API restricted to India (country_code=IN)
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query
    )}&count=6&language=en&format=json&country_code=IN`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((item: any) => {
          // Avoid duplicate entries if name and state match
          const exists = results.some(
            (r) => r.name.toLowerCase() === item.name.toLowerCase() && Math.abs(r.latitude - item.latitude) < 0.1
          );
          if (!exists) {
            results.push({
              name: item.name,
              state: item.admin1 || item.country,
              country: item.country || 'India',
              latitude: item.latitude,
              longitude: item.longitude,
              type: 'city',
            });
          }
        });
      }
    }
  } catch (err) {
    // Local results will be returned seamlessly
  }

  return results.slice(0, 8);
}

/**
 * Reverse geocode latitude and longitude to the nearest Indian city/state
 */
export async function reverseGeocodeIndia(lat: number, lon: number): Promise<{ name: string; state?: string }> {
  try {
    // Find closest city in our curated dataset
    let closestCity: IndianCity | null = null;
    let minDist = Infinity;

    for (const city of MAJOR_INDIAN_CITIES) {
      const dLat = city.lat - lat;
      const dLon = city.lon - lon;
      const distSq = dLat * dLat + dLon * dLon;
      if (distSq < minDist) {
        minDist = distSq;
        closestCity = city;
      }
    }

    if (closestCity && Math.sqrt(minDist) < 1.0) {
      return { name: closestCity.name, state: closestCity.state };
    }

    // Otherwise use BigDataCloud / OSM open reverse geocoding API or fallback
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: AbortSignal.timeout(3500),
      }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName = addr.city || addr.town || addr.district || addr.county || 'Detected Location';
      const stateName = addr.state;
      return { name: cityName, state: stateName };
    }
  } catch (e) {
    // ignore
  }

  return { name: `Lat: ${lat.toFixed(2)}°, Lon: ${lon.toFixed(2)}°`, state: 'India' };
}
