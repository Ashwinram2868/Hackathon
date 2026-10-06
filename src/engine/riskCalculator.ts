import { ExtractedWeatherFeatures } from './dataProcessor';
import { RiskFactorBreakdown, RiskLevel } from '../types/weather';

export interface CalculatedRiskProfile {
  totalScore: number; // 0 - 100
  riskLevel: RiskLevel;
  factors: RiskFactorBreakdown[];
  headline: string;
  explanation: string;
}

/**
 * Calculates deterministic, explainable weather risk index
 * Weights:
 * - Precipitation Volume & Intensity: 35%
 * - Rain Probability & Outlook: 25%
 * - Wind & Barometric Instability: 20%
 * - Thermal & Atmospheric Saturation (Humidity/Heat Index): 20%
 */
export function calculateWeatherRisk(features: ExtractedWeatherFeatures): CalculatedRiskProfile {
  // 1. Precipitation Factor (Max 35 points)
  // Considers current rain rate (mm/h) and 24h accumulation
  let precipPoints = 0;
  const p24 = features.accumulatedPrecipitation24h;
  const pRate = features.currentPrecipitationRate;
  
  if (pRate >= 15 || p24 >= 65) {
    precipPoints = 35; // Heavy to torrential
  } else if (pRate >= 7.5 || p24 >= 35) {
    precipPoints = 27; // Substantial downpour
  } else if (pRate >= 2.5 || p24 >= 15) {
    precipPoints = 18; // Moderate rain
  } else if (pRate > 0 || p24 >= 2.5) {
    precipPoints = 9;  // Light rain / drizzle
  } else if (p24 > 0.2) {
    precipPoints = 4;  // Trace precipitation
  } else {
    precipPoints = 0;  // Dry
  }

  const precipLevel: 'Low' | 'Moderate' | 'High' | 'Very High' = 
    precipPoints >= 27 ? 'Very High' : precipPoints >= 18 ? 'High' : precipPoints >= 9 ? 'Moderate' : 'Low';

  const precipFactor: RiskFactorBreakdown = {
    name: 'Precipitation Volume & Rate',
    score: precipPoints,
    maxScore: 35,
    weight: 35,
    rawValue: `${pRate.toFixed(1)} mm/h now | ${p24.toFixed(1)} mm next 24h`,
    level: precipLevel,
    impactDescription: p24 >= 35 
      ? 'High rainfall accumulation anticipated; potential for localized runoff and waterlogging.' 
      : p24 >= 10 
      ? 'Moderate rain forecast; localized surface wetting and reduced visibility.' 
      : 'Minimal to no rain accumulation expected over the next 24 hours.'
  };

  // 2. Rainfall Probability Factor (Max 25 points)
  // Max probability over the next 24 hours
  const prob = features.peakPrecipitationProbability24h;
  const probPoints = Math.round((prob / 100) * 25);
  const probLevel: 'Low' | 'Moderate' | 'High' | 'Very High' = 
    prob >= 75 ? 'Very High' : prob >= 50 ? 'High' : prob >= 25 ? 'Moderate' : 'Low';

  const probFactor: RiskFactorBreakdown = {
    name: 'Rain Probability Index',
    score: probPoints,
    maxScore: 25,
    weight: 25,
    rawValue: `${prob}% peak probability`,
    level: probLevel,
    impactDescription: prob >= 70
      ? 'High likelihood of precipitation events occurring within the forecast window.'
      : prob >= 35
      ? 'Moderate chance of scattered precipitation or convective showers.'
      : 'Low likelihood of precipitation occurring.'
  };

  // 3. Wind & Atmospheric Instability Factor (Max 20 points)
  // Considers maximum wind gust and falling barometric pressure
  let windPoints = 0;
  const maxWind = features.maxWindSpeed24h;
  const pressureDelta = features.pressureTrendDelta;

  if (maxWind >= 55) {
    windPoints += 14; // Gale / strong squall
  } else if (maxWind >= 35) {
    windPoints += 10; // Fresh to strong breeze
  } else if (maxWind >= 20) {
    windPoints += 5;  // Moderate breeze
  } else {
    windPoints += 2;  // Gentle
  }

  // Barometric drop (falling pressure indicates approaching convective disturbance or cyclone)
  if (pressureDelta <= -3.0) {
    windPoints += 6; // Rapid drop
  } else if (pressureDelta <= -1.5) {
    windPoints += 3;
  }
  windPoints = Math.min(windPoints, 20);

  const windLevel: 'Low' | 'Moderate' | 'High' | 'Very High' = 
    windPoints >= 15 ? 'Very High' : windPoints >= 10 ? 'High' : windPoints >= 6 ? 'Moderate' : 'Low';

  const windFactor: RiskFactorBreakdown = {
    name: 'Wind & Barometric Dynamics',
    score: windPoints,
    maxScore: 20,
    weight: 20,
    rawValue: `${maxWind.toFixed(1)} km/h max wind | ${pressureDelta > 0 ? '+' : ''}${pressureDelta.toFixed(1)} hPa ΔP`,
    level: windLevel,
    impactDescription: maxWind >= 40 
      ? 'Gusty squall conditions detected; potential disruption to temporary structures and coastal zones.'
      : pressureDelta <= -2.0
      ? 'Falling barometric pressure indicates incoming atmospheric instability and cloud intensification.'
      : 'Calm to moderate wind speeds within typical seasonal ranges.'
  };

  // 4. Moisture & Thermal Saturation Factor (Max 20 points)
  // Considers relative humidity & temperature (heat index / convective available potential)
  let saturationPoints = 0;
  const hum = features.currentHumidity;
  const temp = features.currentTemp;

  if (hum >= 85) {
    saturationPoints += 12;
  } else if (hum >= 70) {
    saturationPoints += 8;
  } else if (hum >= 50) {
    saturationPoints += 4;
  } else {
    saturationPoints += 2;
  }

  // Extreme heat or cold anomalies
  if (temp >= 40) {
    saturationPoints += 8; // Heatwave / extreme convective lift
  } else if (temp >= 35) {
    saturationPoints += 5;
  } else if (temp <= 5) {
    saturationPoints += 5; // Cold wave
  } else {
    saturationPoints += 2;
  }
  saturationPoints = Math.min(saturationPoints, 20);

  const satLevel: 'Low' | 'Moderate' | 'High' | 'Very High' = 
    saturationPoints >= 15 ? 'Very High' : saturationPoints >= 10 ? 'High' : saturationPoints >= 6 ? 'Moderate' : 'Low';

  const moistureFactor: RiskFactorBreakdown = {
    name: 'Thermal & Moisture Saturation',
    score: saturationPoints,
    maxScore: 20,
    weight: 20,
    rawValue: `${hum}% humidity | ${temp.toFixed(1)}°C temp`,
    level: satLevel,
    impactDescription: hum >= 80 && temp >= 30
      ? 'Elevated heat index and high ambient moisture promote rapid vertical cloud development.'
      : hum >= 75
      ? 'High moisture content in the lower troposphere sustains persistent cloudiness.'
      : 'Moderate ambient humidity and comfortable thermal conditions.'
  };

  // Total composite score
  const totalScore = Math.min(100, Math.max(0, precipPoints + probPoints + windPoints + saturationPoints));

  // Determine categorical Risk Level
  let riskLevel: RiskLevel = 'Low Risk';
  if (totalScore >= 70) {
    riskLevel = 'Very High Risk';
  } else if (totalScore >= 45) {
    riskLevel = 'High Risk';
  } else if (totalScore >= 25) {
    riskLevel = 'Moderate Risk';
  } else {
    riskLevel = 'Low Risk';
  }

  // Build transparent, non-random, mathematically derived explanation citing actual values (Section 9)
  const explanation = generateDeterministicExplanation(
    riskLevel,
    totalScore,
    features,
    precipPoints,
    probPoints,
    windPoints,
    saturationPoints
  );

  const headline = generateRiskHeadline(riskLevel, features);

  return {
    totalScore,
    riskLevel,
    factors: [precipFactor, probFactor, windFactor, moistureFactor],
    headline,
    explanation
  };
}

function generateRiskHeadline(level: RiskLevel, f: ExtractedWeatherFeatures): string {
  if (level === 'Very High Risk') {
    return `Intense Weather Disturbance: ${f.accumulatedPrecipitation24h > 25 ? 'Heavy Rainfall' : 'Severe Atmospheric Instability'} Expected`;
  }
  if (level === 'High Risk') {
    return `Elevated Weather Risk: ${f.peakPrecipitationProbability24h >= 60 ? 'Active Rain Pattern' : 'Gusty Conditions & High Moisture'}`;
  }
  if (level === 'Moderate Risk') {
    return `Moderate Weather Risk: ${f.accumulatedPrecipitation24h > 5 ? 'Periodic Showers Anticipated' : 'Subtle Meteorological Shifts'}`;
  }
  return 'Favorable & Stable Meteorological Conditions';
}

function generateDeterministicExplanation(
  level: RiskLevel,
  score: number,
  f: ExtractedWeatherFeatures,
  pPts: number,
  probPts: number,
  wPts: number,
  sPts: number
): string {
  const parts: string[] = [];

  parts.push(`${level} (Composite Score: ${score}/100).`);

  // Rainfall factor explanation
  if (f.accumulatedPrecipitation24h >= 25 || f.currentPrecipitationRate >= 5) {
    parts.push(`Forecast indicates significant 24-hour precipitation accumulation of ${f.accumulatedPrecipitation24h}mm with an active rainfall rate of ${f.currentPrecipitationRate}mm/h.`);
  } else if (f.accumulatedPrecipitation24h >= 5) {
    parts.push(`Forecast indicates moderate rainfall accumulation of ${f.accumulatedPrecipitation24h}mm over the next 24 hours.`);
  } else if (f.accumulatedPrecipitation24h > 0) {
    parts.push(`Trace rainfall of ${f.accumulatedPrecipitation24h}mm is expected.`);
  } else {
    parts.push(`Precipitation remains near 0.0mm with dry ambient atmospheric strata.`);
  }

  // Probability factor
  if (f.peakPrecipitationProbability24h >= 60) {
    parts.push(`Rain probability is elevated at ${f.peakPrecipitationProbability24h}%.`);
  } else if (f.peakPrecipitationProbability24h >= 30) {
    parts.push(`Rain probability stands at a moderate ${f.peakPrecipitationProbability24h}%.`);
  } else {
    parts.push(`Rainfall probability is low at ${f.peakPrecipitationProbability24h}%.`);
  }

  // Wind and pressure dynamics
  if (f.maxWindSpeed24h >= 35) {
    parts.push(`Elevated wind gusts up to ${f.maxWindSpeed24h} km/h contribute to dynamic instability.`);
  } else if (f.pressureTrendDelta <= -2.0) {
    parts.push(`A 6-hour barometric pressure drop of ${Math.abs(f.pressureTrendDelta)} hPa suggests localized convective development.`);
  }

  // Thermal & moisture
  if (f.currentHumidity >= 75) {
    parts.push(`High relative humidity of ${f.currentHumidity}% enhances cloud condensation.`);
  } else if (f.currentTemp >= 38) {
    parts.push(`High ambient temperature of ${f.currentTemp}°C indicates intense solar heating.`);
  }

  return parts.join(' ');
}
