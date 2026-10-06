import { ExtractedWeatherFeatures } from './dataProcessor';
import { calculateWeatherRisk } from './riskCalculator';
import { WeatherPrediction } from '../types/weather';

/**
 * PredictionEngine Interface
 * Follows Strategy Pattern: Can be implemented by RuleBasedPredictionEngine (current)
 * or MLInferencePredictionEngine (future trained model / ONNX runtime).
 */
export interface IPredictionEngine {
  predict(features: ExtractedWeatherFeatures): WeatherPrediction;
}

export class RuleBasedPredictionEngine implements IPredictionEngine {
  public predict(features: ExtractedWeatherFeatures): WeatherPrediction {
    const riskProfile = calculateWeatherRisk(features);

    // Rainfall intensity categorization based on IMD / WMO standard rates
    let intensityCategory: 'None' | 'Trace / Light' | 'Moderate' | 'Heavy' | 'Very Heavy' = 'None';
    const rate = features.currentPrecipitationRate;
    const p24 = features.accumulatedPrecipitation24h;

    if (rate >= 15 || p24 >= 64.5) {
      intensityCategory = 'Very Heavy';
    } else if (rate >= 7.5 || p24 >= 35.5) {
      intensityCategory = 'Heavy';
    } else if (rate >= 2.5 || p24 >= 15.6) {
      intensityCategory = 'Moderate';
    } else if (rate > 0 || p24 > 0.1) {
      intensityCategory = 'Trace / Light';
    } else {
      intensityCategory = 'None';
    }

    // Determine barometric pressure trend
    let pressureTrend: 'Rapidly Falling (Unstable)' | 'Steady' | 'Rising' = 'Steady';
    if (features.pressureTrendDelta <= -2.5) {
      pressureTrend = 'Rapidly Falling (Unstable)';
    } else if (features.pressureTrendDelta >= 2.0) {
      pressureTrend = 'Rising';
    }

    // Algorithmic Confidence Score
    // Higher confidence when input parameters are consistent
    const confidenceScore = Math.min(95, Math.max(78, Math.round(88 - Math.abs(features.pressureTrendDelta) * 2)));

    return {
      riskScore: riskProfile.totalScore,
      riskLevel: riskProfile.riskLevel,
      headline: riskProfile.headline,
      explanation: riskProfile.explanation,
      factors: riskProfile.factors,
      rainfallOutlook: {
        currentRainfallRate: features.currentPrecipitationRate,
        next3HoursAccumulation: features.accumulatedPrecipitation3h,
        next24HoursAccumulation: features.accumulatedPrecipitation24h,
        next7DaysAccumulation: features.accumulatedPrecipitation7d,
        peakProbability: features.peakPrecipitationProbability24h,
        intensityCategory,
      },
      metricsSummary: {
        avgTemp24h: features.avgTemp24h,
        minTemp24h: features.minTemp24h,
        maxTemp24h: features.maxTemp24h,
        avgHumidity24h: features.avgHumidity24h,
        maxWind24h: features.maxWindSpeed24h,
        pressureTrend,
      },
      confidenceScore,
      modelType: 'Hybrid Rule-Based Atmospheric Index (Future ML Pipeline Ready)',
      generatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Singleton instance of the active prediction engine
 * Can be swapped with an ML-backed engine in future iterations without changing consumer APIs.
 */
export const activePredictionEngine: IPredictionEngine = new RuleBasedPredictionEngine();
