# Hurricane Tracker Application

## Overview

This is a comprehensive hurricane tracking and weather visualization application built with React and Express. The system provides real-time hurricane monitoring, weather data visualization, and oceanographic information through an interactive map interface. It integrates multiple data sources including the National Hurricane Center (NHC), Global Forecast System (GFS), and Copernicus Marine Environment Monitoring Service (CMEMS) to deliver comprehensive meteorological insights.

**Current Status (August 19, 2025):** Core application architecture complete with TypeScript-based frontend and backend. External API connections are restricted in the Replit demo environment, but the system is designed for production deployment with authentic data sources. CMEMS credentials are configured and ready for ocean data integration when network restrictions are lifted.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/UI component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom color variables and responsive design
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for client-side routing
- **Map Visualization**: MapLibre GL for interactive mapping capabilities

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL using Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Data Storage**: In-memory storage implementation with interface for database abstraction
- **API Design**: RESTful endpoints with JSON responses

### Database Schema
The application uses four main data tables:
- **Hurricanes**: Storm tracking data with position, intensity, and forecast information
- **Weather Data**: Meteorological data from GFS models (temperature, pressure, wind)
- **Ocean Data**: Oceanographic information from CMEMS (currents, waves)
- **NHC Data**: National Hurricane Center official products (cones, tracks, warnings)

### Data Ingestion & Processing
- **Scheduled Data Fetching**: Automated 30-minute intervals for all data sources
- **NHC Service**: Fetches official hurricane forecasts and warnings from NOAA
- **GFS Service**: Retrieves global weather model data from AWS Open Data
- **CMEMS Service**: Accesses ocean current and wave data from European marine services
- **Data Transformation**: Converts various formats (GRIB2, NetCDF, KML) to web-compatible formats

### Real-time Features
- **Live Updates**: WebSocket-ready architecture for real-time storm tracking
- **Time Animation**: Historical and forecast data playback capabilities  
- **Layer Management**: Dynamic overlay system for different data types
- **Interactive Controls**: Storm selection, layer toggling, and time navigation

## External Dependencies

### Weather & Hurricane Data
- **National Hurricane Center (NHC)**: Official hurricane forecasts, warning cones, and storm tracks via ArcGIS REST services
- **NOAA GFS Model**: Global weather forecast data hosted on AWS Open Data (GRIB2 format)
- **Copernicus CMEMS**: European ocean monitoring service for current and wave data (NetCDF format)

### Infrastructure Services
- **Neon Database**: Serverless PostgreSQL database for data persistence
- **TiTiler**: Cloud Optimized GeoTIFF (COG) tile server for weather data visualization
- **MapLibre GL**: Open-source mapping library for interactive cartography

### Development & Build Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Type safety across frontend and backend
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: JavaScript bundling for production builds

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Font Awesome**: Additional icons for meteorological symbols

The system is designed to be scalable and maintainable, with clear separation between data ingestion, processing, and presentation layers. The modular architecture allows for easy integration of additional weather data sources and visualization capabilities.