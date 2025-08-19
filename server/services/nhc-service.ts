import { storage } from "../storage";
import { type InsertNhcData } from "@shared/schema";
import { mockStormCones, mockStormTracks, mockWarnings } from "./mock-data";

export class NHCService {
  private readonly baseUrl = "https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer";
  private readonly altUrl = "https://www.nhc.noaa.gov/gis/rest/services/nhc_at_public_layers/hurricanes/MapServer";
  private readonly kmlUrl = "https://www.nhc.noaa.gov/gis/kml/nhc_active.kml";
  private readonly rssUrl = "https://www.nhc.noaa.gov/index-at.xml";

  async fetchStormCones(): Promise<any> {
    const endpoints = [
      `${this.baseUrl}/query?where=1=1&outFields=*&f=json`,
      `${this.altUrl}/0/query?where=1=1&outFields=*&f=json`,
      `https://www.nhc.noaa.gov/gis/forecast/archive/al052025_5day_007.zip`,
      this.kmlUrl
    ];
    
    for (const url of endpoints) {
      try {
        console.log(`Attempting to fetch from: ${url}`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Hurricane-Tracker/1.0',
            'Accept': 'application/json, application/xml, */*'
          }
        });
        
        if (!response.ok) {
          console.log(`Failed with status ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        
        // Store the authentic data
        await storage.createNhcData({
          timestamp: new Date(),
          dataType: 'cones',
          geoJsonData: data,
          stormId: null
        });
        
        console.log('Successfully fetched authentic NHC cone data');
        return data;
      } catch (error) {
        console.log(`Failed to fetch from ${url}:`, error instanceof Error ? error.message : 'Unknown error');
        continue;
      }
    }
    
    throw new Error('All NHC endpoints failed - network connectivity issues');
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
