import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const hurricanes = pgTable("hurricanes", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  windSpeed: real("wind_speed").notNull(),
  pressure: real("pressure").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  movement: text("movement").notNull(),
  lastUpdate: timestamp("last_update").notNull(),
  nextUpdate: timestamp("next_update"),
  forecastTrack: json("forecast_track"),
  isActive: boolean("is_active").default(true),
});

export const weatherData = pgTable("weather_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull(),
  dataType: text("data_type").notNull(), // 'temperature', 'pressure', 'wind'
  bounds: json("bounds").notNull(), // [minLng, minLat, maxLng, maxLat]
  gribUrl: text("grib_url"),
  cogUrl: text("cog_url"),
  tileUrl: text("tile_url"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const oceanData = pgTable("ocean_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull(),
  dataType: text("data_type").notNull(), // 'currents', 'waves'
  bounds: json("bounds").notNull(),
  netcdfUrl: text("netcdf_url"),
  cogUrl: text("cog_url"),
  tileUrl: text("tile_url"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const nhcData = pgTable("nhc_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull(),
  dataType: text("data_type").notNull(), // 'cones', 'tracks', 'warnings'
  geoJsonData: json("geojson_data").notNull(),
  stormId: text("storm_id"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertHurricaneSchema = createInsertSchema(hurricanes).omit({
  id: true,
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
  createdAt: true,
});

export const insertOceanDataSchema = createInsertSchema(oceanData).omit({
  id: true,
  createdAt: true,
});

export const insertNhcDataSchema = createInsertSchema(nhcData).omit({
  id: true,
  createdAt: true,
});

export type Hurricane = typeof hurricanes.$inferSelect;
export type InsertHurricane = z.infer<typeof insertHurricaneSchema>;
export type WeatherData = typeof weatherData.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;
export type OceanData = typeof oceanData.$inferSelect;
export type InsertOceanData = z.infer<typeof insertOceanDataSchema>;
export type NhcData = typeof nhcData.$inferSelect;
export type InsertNhcData = z.infer<typeof insertNhcDataSchema>;
