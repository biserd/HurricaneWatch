import { storage } from "../storage";
import { type InsertNhcData } from "@shared/schema";
import { mockStormCones, mockStormTracks, mockWarnings } from "./mock-data";

export class NHCService {
  private readonly baseUrl = "https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer";
  private readonly kmlUrl = "https://www.nhc.noaa.gov/gis/kml/nhc_active.kml";

  async fetchStormCones(): Promise<any> {
    try {
      const url = `${this.baseUrl}/query?where=1=1&outFields=*&f=json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`NHC API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store the data
      await storage.createNhcData({
        timestamp: new Date(),
        dataType: 'cones',
        geoJsonData: data,
        stormId: null
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching NHC cone data:', error);
      
      // Store error information for system status
      await storage.createNhcData({
        timestamp: new Date(),
        dataType: 'cones',
        geoJsonData: null,
        stormId: null
      });
      
      throw new Error('NHC cone data unavailable - external API connection failed');
    }
  }

  async fetchStormTracks(): Promise<any> {
    try {
      const url = `${this.baseUrl}/1/query?where=1=1&outFields=*&f=json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`NHC API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store the data
      await storage.createNhcData({
        timestamp: new Date(),
        dataType: 'tracks',
        geoJsonData: data,
        stormId: null
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching NHC track data:', error);
      throw error;
    }
  }

  async fetchWarnings(): Promise<any> {
    try {
      const url = `${this.baseUrl}/2/query?where=1=1&outFields=*&f=json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`NHC API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store the data
      await storage.createNhcData({
        timestamp: new Date(),
        dataType: 'warnings',
        geoJsonData: data,
        stormId: null
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching NHC warning data:', error);
      throw error;
    }
  }

  async fetchKMLData(): Promise<string> {
    try {
      const response = await fetch(this.kmlUrl);
      
      if (!response.ok) {
        throw new Error(`NHC KML error: ${response.status}`);
      }
      
      return await response.text();
    } catch (error) {
      console.error('Error fetching NHC KML data:', error);
      throw error;
    }
  }
}
