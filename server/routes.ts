import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { DataScheduler } from "./services/data-scheduler";
import { NHCService } from "./services/nhc-service";
import { GFSService } from "./services/gfs-service";
import { CMEMSService } from "./services/cmems-service";

const dataScheduler = new DataScheduler();
const nhcService = new NHCService();
const gfsService = new GFSService();
const cmemsService = new CMEMSService();

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
        message: 'Hurricane tracker ready - external data sources restricted in demo environment'
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
