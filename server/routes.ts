import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { DataScheduler } from "./services/data-scheduler";
import { NHCService } from "./services/nhc-service";
import { GFSService } from "./services/gfs-service";
import { CMEMSService } from "./services/cmems-service";
import { AIPredictionService } from "./services/ai-prediction-service";

const dataScheduler = new DataScheduler();
const nhcService = new NHCService();
const gfsService = new GFSService();
const cmemsService = new CMEMSService();
const aiPredictionService = new AIPredictionService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Start data scheduler
  dataScheduler.start();

  // Hurricane endpoints
  app.get("/api/hurricanes", async (req, res) => {
    try {
      const hurricanes = await storage.getActiveHurricanes();
      res.json(hurricanes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hurricanes" });
    }
  });

  app.get("/api/hurricanes/:id", async (req, res) => {
    try {
      const hurricane = await storage.getHurricane(req.params.id);
      if (!hurricane) {
        return res.status(404).json({ error: "Hurricane not found" });
      }
      res.json(hurricane);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hurricane" });
    }
  });

  // NHC data endpoints
  app.get("/api/nhc/cones", async (req, res) => {
    try {
      const data = await storage.getLatestNhcData('cones');
      if (!data) {
        // Fetch fresh data if none exists
        await nhcService.fetchStormCones();
        const freshData = await storage.getLatestNhcData('cones');
        return res.json(freshData?.geoJsonData || {});
      }
      res.json(data.geoJsonData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cone data" });
    }
  });

  app.get("/api/nhc/tracks", async (req, res) => {
    try {
      const data = await storage.getLatestNhcData('tracks');
      if (!data) {
        await nhcService.fetchStormTracks();
        const freshData = await storage.getLatestNhcData('tracks');
        return res.json(freshData?.geoJsonData || {});
      }
      res.json(data.geoJsonData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch track data" });
    }
  });

  app.get("/api/nhc/warnings", async (req, res) => {
    try {
      const data = await storage.getLatestNhcData('warnings');
      if (!data) {
        await nhcService.fetchWarnings();
        const freshData = await storage.getLatestNhcData('warnings');
        return res.json(freshData?.geoJsonData || {});
      }
      res.json(data.geoJsonData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch warning data" });
    }
  });

  // Weather data endpoints
  app.get("/api/weather/:dataType", async (req, res) => {
    try {
      const { dataType } = req.params;
      const data = await storage.getLatestWeatherData(dataType);
      
      if (!data) {
        // Fetch fresh data
        if (dataType === 'temperature') {
          await gfsService.fetchTemperature();
        } else if (dataType === 'pressure') {
          await gfsService.fetchPressure();
        } else if (dataType === 'wind') {
          await gfsService.fetchWind();
        }
        
        const freshData = await storage.getLatestWeatherData(dataType);
        return res.json(freshData || {});
      }
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch ${req.params.dataType} data` });
    }
  });

  // Ocean data endpoints
  app.get("/api/ocean/:dataType", async (req, res) => {
    try {
      const { dataType } = req.params;
      const data = await storage.getLatestOceanData(dataType);
      
      if (!data) {
        if (dataType === 'currents') {
          await cmemsService.fetchCurrents();
        } else if (dataType === 'waves') {
          await cmemsService.fetchWaves();
        }
        
        const freshData = await storage.getLatestOceanData(dataType);
        return res.json(freshData || {});
      }
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch ${req.params.dataType} data` });
    }
  });

  // General predictions endpoint (for all hurricanes)
  app.get("/api/predictions", async (req, res) => {
    try {
      const { hurricaneId } = req.query;
      const predictions = await storage.getHurricanePredictions(hurricaneId as string);
      res.json(predictions);
    } catch (error) {
      console.error('Error fetching AI predictions:', error);
      res.status(500).json({ error: 'Failed to fetch AI predictions' });
    }
  });

  // Hurricane prediction endpoints
  app.get("/api/hurricanes/:id/predictions", async (req, res) => {
    try {
      const predictions = await storage.getHurricanePredictions(req.params.id);
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch predictions" });
    }
  });

  app.post("/api/hurricanes/:id/predictions", async (req, res) => {
    try {
      const hurricane = await storage.getHurricane(req.params.id);
      if (!hurricane) {
        return res.status(404).json({ error: "Hurricane not found" });
      }

      // Build hurricane data for AI analysis
      const hurricaneData = {
        name: hurricane.name,
        latitude: hurricane.latitude,
        longitude: hurricane.longitude,
        windSpeed: hurricane.windSpeed,
        pressure: hurricane.pressure,
        movement: hurricane.movement,
        category: hurricane.category,
        lastUpdate: hurricane.lastUpdate
      };

      // Get weather context
      const weatherContext = await aiPredictionService.buildWeatherContext();
      
      // Generate AI prediction
      const prediction = await aiPredictionService.generateHurricanePrediction(
        hurricaneData,
        weatherContext
      );

      // Store prediction in database
      const savedPrediction = await storage.createHurricanePrediction({
        hurricaneId: req.params.id,
        predictionType: "comprehensive",
        predictionData: prediction,
        confidence: prediction.confidence,
        pathCoordinates: prediction.pathPrediction.coordinates,
        intensityForecast: prediction.intensityForecast,
        landfallProbability: prediction.landfall.probability,
        landfallLocation: prediction.landfall.estimatedLocation || null,
        landfallTime: prediction.landfall.estimatedTime ? new Date(prediction.landfall.estimatedTime) : null,
        analysis: prediction.analysis,
        validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
      });

      res.json(savedPrediction);
    } catch (error) {
      console.error("Error generating hurricane prediction:", error);
      res.status(500).json({ error: "Failed to generate prediction" });
    }
  });

  app.get("/api/hurricanes/:id/predictions/latest", async (req, res) => {
    try {
      const prediction = await storage.getLatestPrediction(req.params.id);
      if (!prediction) {
        return res.status(404).json({ error: "No predictions found" });
      }
      res.json(prediction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest prediction" });
    }
  });

  app.post("/api/hurricanes/:id/intensification-analysis", async (req, res) => {
    try {
      const hurricane = await storage.getHurricane(req.params.id);
      if (!hurricane) {
        return res.status(404).json({ error: "Hurricane not found" });
      }

      const hurricaneData = {
        name: hurricane.name,
        latitude: hurricane.latitude,
        longitude: hurricane.longitude,
        windSpeed: hurricane.windSpeed,
        pressure: hurricane.pressure,
        movement: hurricane.movement,
        category: hurricane.category,
        lastUpdate: hurricane.lastUpdate
      };

      const analysis = await aiPredictionService.analyzeIntensificationPotential(hurricaneData);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze intensification potential" });
    }
  });

  // Manual data refresh endpoint
  app.post("/api/refresh", async (req, res) => {
    try {
      await dataScheduler.fetchLatestHurricaneData();
      res.json({ success: true, message: "Data refresh initiated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to refresh data" });
    }
  });

  // Data status endpoint
  app.get("/api/status", async (req, res) => {
    try {
      const hurricanes = await storage.getActiveHurricanes();
      const latestNhc = await storage.getLatestNhcData('cones');
      const latestWeather = await storage.getLatestWeatherData('pressure');
      const latestOcean = await storage.getLatestOceanData('currents');

      // Check data source status
      const dataSourceStatus = {
        nhc: {
          status: 'unavailable',
          message: 'External API access restricted in demo environment',
          lastUpdate: latestNhc?.timestamp
        },
        gfs: {
          status: 'unavailable', 
          message: 'External API access restricted in demo environment',
          lastUpdate: latestWeather?.timestamp
        },
        cmems: {
          status: process.env.CMEMS_USERNAME ? 'configured' : 'needs_credentials',
          message: process.env.CMEMS_USERNAME ? 
            'Credentials configured - external access restricted in demo' : 
            'CMEMS credentials required',
          lastUpdate: latestOcean?.timestamp
        }
      };

      res.json({
        activeStorms: hurricanes.length,
        lastNhcUpdate: latestNhc?.timestamp,
        lastWeatherUpdate: latestWeather?.timestamp,
        lastOceanUpdate: latestOcean?.timestamp,
        status: "demo_mode",
        dataSources: dataSourceStatus,
        aiPredictions: {
          enabled: !!process.env.OPENAI_API_KEY,
          status: "ready"
        },
        message: 'Hurricane tracker ready with AI predictions - external data sources restricted in demo environment'
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
