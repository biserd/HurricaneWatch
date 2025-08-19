import { NHCService } from "./nhc-service";
import { GFSService } from "./gfs-service";
import { CMEMSService } from "./cmems-service";
import { storage } from "../storage";

export class DataScheduler {
  private nhcService = new NHCService();
  private gfsService = new GFSService();
  private cmemsService = new CMEMSService();
  private updateInterval = 30 * 60 * 1000; // 30 minutes

  start() {
    console.log("Starting data scheduler...");
    
    // Initial data fetch
    this.fetchAllData();
    
    // Schedule regular updates
    setInterval(() => {
      this.fetchAllData();
    }, this.updateInterval);
  }

  private async fetchAllData() {
    console.log("Fetching all hurricane and weather data...");
    
    try {
      // Fetch NHC data
      await Promise.allSettled([
        this.nhcService.fetchStormCones(),
        this.nhcService.fetchStormTracks(),
        this.nhcService.fetchWarnings()
      ]);

      // Fetch GFS weather data
      await Promise.allSettled([
        this.gfsService.fetchTemperature(),
        this.gfsService.fetchPressure(),
        this.gfsService.fetchWind()
      ]);

      // Fetch CMEMS ocean data
      await Promise.allSettled([
        this.cmemsService.fetchCurrents(),
        this.cmemsService.fetchWaves()
      ]);

      console.log("Data fetch completed successfully");
    } catch (error) {
      console.error("Error during scheduled data fetch:", error);
    }
  }

  async fetchLatestHurricaneData() {
    try {
      const conesData = await this.nhcService.fetchStormCones();
      const tracksData = await this.nhcService.fetchStormTracks();
      
      // Process and create/update hurricane records
      await this.processNHCData(conesData, tracksData);
      
      return { success: true };
    } catch (error) {
      console.error("Error fetching hurricane data:", error);
      throw error;
    }
  }

  private async processNHCData(conesData: any, tracksData: any) {
    // Process NHC data to extract hurricane information
    // This would parse the GeoJSON features and create Hurricane records
    
    if (conesData?.features) {
      for (const feature of conesData.features) {
        const properties = feature.properties;
        
        if (properties && properties.STORMNAME) {
          await storage.createHurricane({
            name: properties.STORMNAME,
            category: this.determineCategory(properties.MAXWIND),
            windSpeed: properties.MAXWIND || 0,
            pressure: properties.MSLP || 0,
            latitude: feature.geometry?.coordinates?.[1] || 0,
            longitude: feature.geometry?.coordinates?.[0] || 0,
            movement: `${properties.TCDIRECTION} at ${properties.TCSPEED} mph` || "Unknown",
            lastUpdate: new Date(properties.SYNOPTIC || Date.now()),
            nextUpdate: new Date(Date.now() + 6 * 60 * 60 * 1000), // +6 hours
            forecastTrack: feature,
            isActive: true
          });
        }
      }
    }
  }

  private determineCategory(windSpeed: number): string {
    if (windSpeed >= 157) return "Category 5 Hurricane";
    if (windSpeed >= 130) return "Category 4 Hurricane";
    if (windSpeed >= 111) return "Category 3 Hurricane";
    if (windSpeed >= 96) return "Category 2 Hurricane";
    if (windSpeed >= 74) return "Category 1 Hurricane";
    if (windSpeed >= 39) return "Tropical Storm";
    return "Tropical Depression";
  }
}
