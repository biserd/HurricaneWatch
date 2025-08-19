import { storage } from "../storage";
import { type InsertWeatherData } from "@shared/schema";

export class GFSService {
  private readonly awsBaseUrl = "https://noaa-gfs-bdp-pds.s3.amazonaws.com";
  private readonly tilerBaseUrl = process.env.TITILER_URL || "http://localhost:8001";

  async fetchGFSData(dataType: 'temperature' | 'pressure' | 'wind', timestamp?: Date): Promise<any> {
    try {
      const date = timestamp || new Date();
      const dateStr = this.formatGFSDate(date);
      const hour = this.getGFSHour(date);
      
      // Construct GFS file URL
      const gribUrl = `${this.awsBaseUrl}/gfs.${dateStr}/${hour}/atmos/gfs.t${hour}z.pgrb2.0p25.f000`;
      
      // Create COG tile URL using TiTiler
      const cogUrl = await this.convertToCOG(gribUrl, dataType);
      const tileUrl = `${this.tilerBaseUrl}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodeURIComponent(cogUrl)}`;
      
      // Store the data
      const weatherData = await storage.createWeatherData({
        timestamp: date,
        dataType,
        bounds: [-180, -90, 180, 90], // Global bounds
        gribUrl,
        cogUrl,
        tileUrl,
        metadata: {
          source: 'GFS',
          resolution: '0.25°',
          forecast_hour: 0
        }
      });
      
      return weatherData;
    } catch (error) {
      console.error(`Error fetching GFS ${dataType} data:`, error);
      throw error;
    }
  }

  private formatGFSDate(date: Date): string {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }

  private getGFSHour(date: Date): string {
    const hour = Math.floor(date.getUTCHours() / 6) * 6;
    return hour.toString().padStart(2, '0');
  }

  private async convertToCOG(gribUrl: string, dataType: string): Promise<string> {
    // In a real implementation, you would:
    // 1. Download the GRIB2 file
    // 2. Extract the specific variable (temperature, pressure, wind)
    // 3. Convert to COG format using GDAL
    // 4. Upload to storage and return URL
    
    // For now, return a placeholder COG URL
    return `${this.tilerBaseUrl}/sample-${dataType}.tif`;
  }

  async fetchTemperature(timestamp?: Date) {
    return this.fetchGFSData('temperature', timestamp);
  }

  async fetchPressure(timestamp?: Date) {
    return this.fetchGFSData('pressure', timestamp);
  }

  async fetchWind(timestamp?: Date) {
    return this.fetchGFSData('wind', timestamp);
  }
}
