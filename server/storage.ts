import { type Hurricane, type InsertHurricane, type WeatherData, type InsertWeatherData, type OceanData, type InsertOceanData, type NhcData, type InsertNhcData, type HurricanePrediction, type InsertHurricanePrediction } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Hurricane methods
  getHurricanes(): Promise<Hurricane[]>;
  getActiveHurricanes(): Promise<Hurricane[]>;
  getHurricane(id: string): Promise<Hurricane | undefined>;
  createHurricane(hurricane: InsertHurricane): Promise<Hurricane>;
  updateHurricane(id: string, hurricane: Partial<Hurricane>): Promise<Hurricane | undefined>;
  
  // Weather data methods
  getWeatherData(dataType?: string, timestamp?: Date): Promise<WeatherData[]>;
  getLatestWeatherData(dataType: string): Promise<WeatherData | undefined>;
  createWeatherData(data: InsertWeatherData): Promise<WeatherData>;
  
  // Ocean data methods
  getOceanData(dataType?: string, timestamp?: Date): Promise<OceanData[]>;
  getLatestOceanData(dataType: string): Promise<OceanData | undefined>;
  createOceanData(data: InsertOceanData): Promise<OceanData>;
  
  // NHC data methods
  getNhcData(dataType?: string, timestamp?: Date): Promise<NhcData[]>;
  getLatestNhcData(dataType: string): Promise<NhcData | undefined>;
  createNhcData(data: InsertNhcData): Promise<NhcData>;
  
  // Hurricane prediction methods
  getHurricanePredictions(hurricaneId?: string): Promise<HurricanePrediction[]>;
  getLatestPrediction(hurricaneId: string): Promise<HurricanePrediction | undefined>;
  createHurricanePrediction(data: InsertHurricanePrediction): Promise<HurricanePrediction>;
  getAIPredictions(hurricaneId?: string): Promise<HurricanePrediction[]>;
  createAIPrediction(data: InsertHurricanePrediction): Promise<HurricanePrediction>;
}

export class MemStorage implements IStorage {
  private hurricanes: Map<string, Hurricane>;
  private weatherData: Map<string, WeatherData>;
  private oceanData: Map<string, OceanData>;
  private nhcData: Map<string, NhcData>;
  private predictions: Map<string, HurricanePrediction>;

  constructor() {
    this.hurricanes = new Map();
    this.weatherData = new Map();
    this.oceanData = new Map();
    this.nhcData = new Map();
    this.predictions = new Map();
  }

  async getHurricanes(): Promise<Hurricane[]> {
    return Array.from(this.hurricanes.values());
  }

  async getActiveHurricanes(): Promise<Hurricane[]> {
    return Array.from(this.hurricanes.values()).filter(h => h.isActive);
  }

  async getHurricane(id: string): Promise<Hurricane | undefined> {
    return this.hurricanes.get(id);
  }

  async createHurricane(insertHurricane: InsertHurricane): Promise<Hurricane> {
    const id = insertHurricane.name.toLowerCase().replace(/\s+/g, '-');
    const hurricane: Hurricane = { 
      ...insertHurricane, 
      id,
      nextUpdate: insertHurricane.nextUpdate || null,
      forecastTrack: insertHurricane.forecastTrack || null,
      isActive: insertHurricane.isActive !== undefined ? insertHurricane.isActive : true
    };
    this.hurricanes.set(id, hurricane);
    return hurricane;
  }

  async updateHurricane(id: string, updates: Partial<Hurricane>): Promise<Hurricane | undefined> {
    const existing = this.hurricanes.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.hurricanes.set(id, updated);
    return updated;
  }

  async getWeatherData(dataType?: string, timestamp?: Date): Promise<WeatherData[]> {
    let data = Array.from(this.weatherData.values());
    if (dataType) {
      data = data.filter(d => d.dataType === dataType);
    }
    if (timestamp) {
      data = data.filter(d => d.timestamp.getTime() === timestamp.getTime());
    }
    return data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getLatestWeatherData(dataType: string): Promise<WeatherData | undefined> {
    const data = Array.from(this.weatherData.values())
      .filter(d => d.dataType === dataType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return data[0];
  }

  async createWeatherData(insertData: InsertWeatherData): Promise<WeatherData> {
    const id = randomUUID();
    const data: WeatherData = { 
      ...insertData, 
      id,
      createdAt: new Date(),
      metadata: insertData.metadata || null,
      gribUrl: insertData.gribUrl || null,
      cogUrl: insertData.cogUrl || null,
      tileUrl: insertData.tileUrl || null
    };
    this.weatherData.set(id, data);
    return data;
  }

  async getOceanData(dataType?: string, timestamp?: Date): Promise<OceanData[]> {
    let data = Array.from(this.oceanData.values());
    if (dataType) {
      data = data.filter(d => d.dataType === dataType);
    }
    if (timestamp) {
      data = data.filter(d => d.timestamp.getTime() === timestamp.getTime());
    }
    return data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getLatestOceanData(dataType: string): Promise<OceanData | undefined> {
    const data = Array.from(this.oceanData.values())
      .filter(d => d.dataType === dataType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return data[0];
  }

  async createOceanData(insertData: InsertOceanData): Promise<OceanData> {
    const id = randomUUID();
    const data: OceanData = { 
      ...insertData, 
      id,
      createdAt: new Date(),
      metadata: insertData.metadata || null,
      cogUrl: insertData.cogUrl || null,
      tileUrl: insertData.tileUrl || null,
      netcdfUrl: insertData.netcdfUrl || null
    };
    this.oceanData.set(id, data);
    return data;
  }

  async getNhcData(dataType?: string, timestamp?: Date): Promise<NhcData[]> {
    let data = Array.from(this.nhcData.values());
    if (dataType) {
      data = data.filter(d => d.dataType === dataType);
    }
    if (timestamp) {
      data = data.filter(d => d.timestamp.getTime() === timestamp.getTime());
    }
    return data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getLatestNhcData(dataType: string): Promise<NhcData | undefined> {
    const data = Array.from(this.nhcData.values())
      .filter(d => d.dataType === dataType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return data[0];
  }

  async createNhcData(insertData: InsertNhcData): Promise<NhcData> {
    const id = randomUUID();
    const data: NhcData = { 
      ...insertData, 
      id,
      createdAt: new Date(),
      stormId: insertData.stormId || null
    };
    this.nhcData.set(id, data);
    return data;
  }

  async getHurricanePredictions(hurricaneId?: string): Promise<HurricanePrediction[]> {
    const allPredictions = Array.from(this.predictions.values());
    if (hurricaneId) {
      return allPredictions.filter(p => p.hurricaneId === hurricaneId);
    }
    return allPredictions;
  }

  async getLatestPrediction(hurricaneId: string): Promise<HurricanePrediction | undefined> {
    const predictions = await this.getHurricanePredictions(hurricaneId);
    return predictions.sort((a, b) => 
      (b.createdAt || new Date()).getTime() - (a.createdAt || new Date()).getTime()
    )[0];
  }

  async createHurricanePrediction(insertPrediction: InsertHurricanePrediction): Promise<HurricanePrediction> {
    const id = randomUUID();
    const prediction: HurricanePrediction = {
      ...insertPrediction,
      id,
      createdAt: new Date(),
      landfallProbability: insertPrediction.landfallProbability || null,
      landfallLocation: insertPrediction.landfallLocation || null,
      landfallTime: insertPrediction.landfallTime || null,
      analysis: insertPrediction.analysis || null,
      pathCoordinates: insertPrediction.pathCoordinates || null,
      intensityForecast: insertPrediction.intensityForecast || null,
    };
    this.predictions.set(id, prediction);
    return prediction;
  }

  async getAIPredictions(hurricaneId?: string): Promise<HurricanePrediction[]> {
    return this.getHurricanePredictions(hurricaneId);
  }

  async createAIPrediction(insertPrediction: InsertHurricanePrediction): Promise<HurricanePrediction> {
    return this.createHurricanePrediction(insertPrediction);
  }
}

export const storage = new MemStorage();
