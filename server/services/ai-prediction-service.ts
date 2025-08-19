import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface HurricaneData {
  name: string;
  latitude: number;
  longitude: number;
  windSpeed: number;
  pressure: number;
  movement: string;
  category: string;
  lastUpdate: Date;
}

export interface WeatherContext {
  seaTemperature: number;
  atmosphericPressure: number;
  windShear: number;
  oceanCurrents: string;
}

export interface PredictionResult {
  pathPrediction: {
    coordinates: [number, number][];
    timePoints: string[];
    confidenceLevel: number;
  };
  intensityForecast: {
    windSpeeds: number[];
    pressures: number[];
    categories: string[];
    timePoints: string[];
  };
  landfall: {
    probability: number;
    estimatedLocation?: string;
    estimatedTime?: string;
  };
  analysis: string;
  confidence: number;
  lastUpdated: Date;
}

export class AIPredictionService {
  /**
   * Generate AI-powered hurricane path and intensity predictions
   */
  async generateHurricanePrediction(
    hurricane: HurricaneData,
    weatherContext: WeatherContext
  ): Promise<PredictionResult> {
    try {
      const prompt = this.buildPredictionPrompt(hurricane, weatherContext);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an advanced meteorological AI specializing in hurricane forecasting. 
            Analyze current hurricane data and environmental conditions to generate detailed predictions.
            Your predictions should be based on meteorological principles including:
            - Sea surface temperatures and their impact on intensification
            - Wind shear effects on storm organization
            - Steering currents and atmospheric patterns
            - Historical storm behavior in similar conditions
            - Pressure gradients and their influence on storm movement
            
            Provide scientific, data-driven forecasts with confidence levels.
            Respond with JSON in the exact format specified.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3 // Lower temperature for more consistent predictions
      });

      const predictionData = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        pathPrediction: {
          coordinates: predictionData.pathPrediction?.coordinates || [],
          timePoints: predictionData.pathPrediction?.timePoints || [],
          confidenceLevel: predictionData.pathPrediction?.confidenceLevel || 0.7
        },
        intensityForecast: {
          windSpeeds: predictionData.intensityForecast?.windSpeeds || [],
          pressures: predictionData.intensityForecast?.pressures || [],
          categories: predictionData.intensityForecast?.categories || [],
          timePoints: predictionData.intensityForecast?.timePoints || []
        },
        landfall: {
          probability: predictionData.landfall?.probability || 0,
          estimatedLocation: predictionData.landfall?.estimatedLocation,
          estimatedTime: predictionData.landfall?.estimatedTime
        },
        analysis: predictionData.analysis || "Analysis not available",
        confidence: predictionData.confidence || 0.7,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error("Error generating hurricane prediction:", error);
      throw new Error("Failed to generate hurricane prediction");
    }
  }

  /**
   * Build comprehensive prompt for hurricane prediction
   */
  private buildPredictionPrompt(hurricane: HurricaneData, weather: WeatherContext): string {
    return `Analyze this hurricane and provide a detailed forecast:

CURRENT HURRICANE DATA:
- Name: ${hurricane.name}
- Position: ${hurricane.latitude}°N, ${hurricane.longitude}°W
- Maximum Sustained Winds: ${hurricane.windSpeed} mph
- Minimum Central Pressure: ${hurricane.pressure} mb
- Movement: ${hurricane.movement}
- Current Category: ${hurricane.category}
- Last Update: ${hurricane.lastUpdate && hurricane.lastUpdate instanceof Date && !isNaN(hurricane.lastUpdate.getTime()) ? hurricane.lastUpdate.toISOString() : new Date().toISOString()}

ENVIRONMENTAL CONDITIONS:
- Sea Surface Temperature: ${weather.seaTemperature}°C
- Atmospheric Pressure: ${weather.atmosphericPressure} hPa
- Wind Shear: ${weather.windShear} knots
- Ocean Currents: ${weather.oceanCurrents}

PREDICTION REQUIREMENTS:
Generate a 120-hour (5-day) forecast including:
1. Storm track with 12-hour interval coordinates
2. Intensity changes (wind speed, pressure, category)
3. Landfall probability and potential impact areas
4. Meteorological analysis explaining the forecast

Respond with JSON in this exact format:
{
  "pathPrediction": {
    "coordinates": [[longitude, latitude], ...], // 10 points for 120-hour forecast
    "timePoints": ["2025-08-19T12:00:00Z", ...], // Corresponding timestamps
    "confidenceLevel": 0.85 // 0-1 scale
  },
  "intensityForecast": {
    "windSpeeds": [130, 125, 120, ...], // mph values for each time point
    "pressures": [947, 950, 955, ...], // mb values for each time point  
    "categories": ["Category 4", "Category 4", "Category 3", ...], // Saffir-Simpson categories
    "timePoints": ["2025-08-19T12:00:00Z", ...] // Same as path timePoints
  },
  "landfall": {
    "probability": 0.75, // 0-1 probability of landfall in next 120 hours
    "estimatedLocation": "North Carolina Coast", // If probability > 0.3
    "estimatedTime": "2025-08-22T18:00:00Z" // If probability > 0.3
  },
  "analysis": "Detailed meteorological analysis explaining the forecast reasoning, environmental factors, and uncertainty considerations.",
  "confidence": 0.8 // Overall forecast confidence 0-1
}`;
  }

  /**
   * Generate weather context from available data
   */
  async buildWeatherContext(): Promise<WeatherContext> {
    // In a real system, this would pull from weather data APIs
    // For now, using typical Atlantic hurricane season values
    return {
      seaTemperature: 28.5, // °C - favorable for hurricane development
      atmosphericPressure: 1013.2, // hPa - standard pressure
      windShear: 10, // knots - moderate shear
      oceanCurrents: "Gulf Stream influence, warm water transport northward"
    };
  }

  /**
   * Analyze hurricane intensification potential
   */
  async analyzeIntensificationPotential(hurricane: HurricaneData): Promise<{
    potential: 'rapid' | 'gradual' | 'weakening' | 'steady';
    reasoning: string;
    confidence: number;
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Analyze hurricane intensification potential based on current conditions. Consider pressure, wind speed trends, and environmental factors."
          },
          {
            role: "user",
            content: `Analyze intensification potential for ${hurricane.name}:
            Current winds: ${hurricane.windSpeed} mph
            Pressure: ${hurricane.pressure} mb
            Movement: ${hurricane.movement}
            
            Classify as: rapid, gradual, weakening, or steady
            Provide reasoning and confidence (0-1).
            
            Respond with JSON: {"potential": "rapid", "reasoning": "explanation", "confidence": 0.8}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        potential: result.potential || 'steady',
        reasoning: result.reasoning || 'Analysis not available',
        confidence: result.confidence || 0.7
      };
    } catch (error) {
      console.error("Error analyzing intensification potential:", error);
      return {
        potential: 'steady',
        reasoning: 'Unable to analyze due to technical error',
        confidence: 0.5
      };
    }
  }
}