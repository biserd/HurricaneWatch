# Hurricane Tracker 🌀

A comprehensive real-time hurricane tracking and weather visualization platform that integrates multiple official meteorological data sources to provide authentic storm monitoring and forecasting capabilities.

## 🌊 Live Data Sources

This platform connects to **authentic, real-time data** from official sources:

- **National Hurricane Center (NHC)** - Official hurricane forecasts, warning cones, and storm tracks
- **Global Forecast System (GFS)** - NOAA's global weather model data 
- **Copernicus Marine Environment Monitoring Service (CMEMS)** - European ocean current and wave data
- **NOAA AWS Open Data** - Global weather forecast data in GRIB2 format

## ✨ Features

### Real-Time Hurricane Tracking
- **Live Storm Data**: Current positions, intensities, and official ATCF tracking IDs
- **Authentic Forecasts**: Official NHC forecast cones and warning products
- **Historical Tracks**: Complete storm path visualization with time controls
- **Category Classification**: Saffir-Simpson scale with color-coded intensity

### Interactive Mapping
- **MapLibre GL**: High-performance, WebGL-powered mapping
- **Layer Management**: Toggle weather overlays, ocean data, and storm tracks
- **Time Animation**: Playback historical and forecast data
- **Storm Selection**: Click storms for detailed information panels

### Weather Data Visualization
- **Temperature Fields**: Global surface and atmospheric temperature
- **Pressure Systems**: Atmospheric pressure patterns and gradients
- **Wind Patterns**: Surface and upper-level wind speed and direction
- **Ocean Currents**: Real-time current speeds and directions
- **Wave Heights**: Significant wave height and period data

### Data Monitoring
- **Source Status**: Real-time connectivity indicators for all data sources
- **Update Frequency**: Automated 30-minute refresh intervals
- **Error Handling**: Graceful fallbacks and clear error states
- **Performance Metrics**: API response times and data freshness

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or use Neon serverless)
- CMEMS account credentials (for ocean data)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd hurricane-tracker
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Database connection
   DATABASE_URL=your_postgresql_connection_string
   
   # CMEMS ocean data credentials
   CMEMS_USERNAME=your_cmems_username
   CMEMS_PASSWORD=your_cmems_password
   ```

3. **Initialize database**
   ```bash
   npm run db:push
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript and Vite
- **UI Components**: Shadcn/UI with Radix primitives
- **Styling**: Tailwind CSS with custom meteorological themes
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Mapping**: MapLibre GL for interactive cartography

### Backend (Express + TypeScript)
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Data Processing**: Automated schedulers for real-time ingestion
- **API Design**: RESTful endpoints with comprehensive error handling
- **Authentication**: Secure credential management for external APIs

### Data Pipeline
```
NHC KML Feeds ──┐
GFS Model Data ──┤
CMEMS Ocean ────┤──► Data Scheduler ──► Processing ──► Database ──► API ──► Frontend
Real-time APIs ──┘
```

## 🗄️ Database Schema

### Core Tables
- **hurricanes**: Storm tracking with position, intensity, and forecasts
- **weather_data**: Meteorological data from GFS models
- **ocean_data**: Oceanographic information from CMEMS
- **nhc_data**: National Hurricane Center official products

### Key Features
- **Type Safety**: Full TypeScript integration with Drizzle ORM
- **Real-time Updates**: Optimized for frequent data ingestion
- **Geospatial Support**: PostGIS-compatible coordinate storage
- **Historical Data**: Complete temporal tracking for analysis

## 🔌 API Endpoints

### Hurricane Data
- `GET /api/hurricanes` - Active storm list
- `GET /api/nhc/tracks` - Official storm tracks
- `GET /api/nhc/cones` - Forecast cone data
- `GET /api/nhc/warnings` - Active warnings and watches

### Weather Data
- `GET /api/weather/temperature` - Global temperature fields
- `GET /api/weather/pressure` - Atmospheric pressure data
- `GET /api/weather/wind` - Wind speed and direction

### Ocean Data
- `GET /api/ocean/currents` - Current speeds and directions
- `GET /api/ocean/waves` - Wave height and period data

### System Status
- `GET /api/status` - Data source connectivity and metrics

## 🌐 Data Sources & Authentication

### National Hurricane Center (NHC)
- **Format**: KML/XML feeds
- **Update Frequency**: Every 6 hours during active seasons
- **Authentication**: Public access, no credentials required
- **Coverage**: Atlantic and Eastern Pacific basins

### CMEMS Ocean Data
- **Format**: NetCDF via REST API
- **Update Frequency**: Daily for analysis, 6-hourly for forecasts
- **Authentication**: Username/password credentials required
- **Coverage**: Global ocean models

### GFS Weather Model
- **Format**: GRIB2 files via AWS Open Data
- **Update Frequency**: 4 times daily (00, 06, 12, 18 UTC)
- **Authentication**: Public access via AWS
- **Resolution**: 0.25° global grid

## 🛠️ Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Route components
│   │   └── lib/            # Utilities and config
├── server/                 # Express backend
│   ├── services/           # Data fetching services
│   ├── routes.ts           # API route definitions
│   └── storage.ts          # Database abstraction
├── shared/                 # Shared TypeScript types
└── drizzle/               # Database migrations
```

### Key Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Push schema changes
npm run db:migrate   # Run database migrations
npm run type-check   # TypeScript validation
```

### Data Flow
1. **Scheduled Fetching**: Background services fetch data every 30 minutes
2. **Data Processing**: Raw formats converted to standardized schemas
3. **Database Storage**: Processed data stored with temporal indexing
4. **API Serving**: RESTful endpoints serve data to frontend
5. **Real-time Updates**: Frontend polls for latest data automatically

## 🔧 Configuration

### Environment Variables
```bash
# Required
DATABASE_URL=postgresql://user:pass@host:port/db
CMEMS_USERNAME=your_cmems_username
CMEMS_PASSWORD=your_cmems_password

# Optional
PORT=5000
NODE_ENV=production
```

### Data Source Configuration
- **NHC Endpoints**: Configurable in `server/services/nhc-service.ts`
- **CMEMS Parameters**: Adjustable in `server/services/cmems-service.ts`
- **Fetch Intervals**: Modifiable in `server/services/data-scheduler.ts`

## 🚀 Deployment

### Replit Deployment (Recommended)
1. Connect your repository to Replit
2. Set environment variables in Secrets
3. Use the "Deploy" button for automatic deployment
4. Configure custom domain if needed

### Manual Deployment
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production environment**
   - PostgreSQL database
   - Environment variables
   - SSL certificates (if needed)

3. **Start the production server**
   ```bash
   npm start
   ```

### Infrastructure Requirements
- **Memory**: 512MB minimum, 1GB recommended
- **Storage**: 10GB for database and logs
- **Network**: Outbound HTTPS for data sources
- **Database**: PostgreSQL 12+ with PostGIS support

## 🔍 Monitoring & Troubleshooting

### Health Checks
- **API Status**: `/api/status` endpoint provides system metrics
- **Data Freshness**: Timestamps show last successful updates
- **Error Logging**: Comprehensive error tracking with context

### Common Issues
- **Network Connectivity**: Check firewall rules for HTTPS outbound
- **CMEMS Authentication**: Verify credentials and account status
- **Database Connections**: Monitor connection pool usage
- **Memory Usage**: Large datasets may require optimization

### Performance Optimization
- **Database Indexing**: Optimized for geospatial and temporal queries
- **Caching**: API responses cached based on data update frequency
- **CDN**: Consider CDN for static assets in production

## 📊 Data Formats

### Hurricane Data Structure
```typescript
interface Hurricane {
  id: string;
  atcfId: string;        // Official ATCF tracking ID
  name: string;
  category: number;      // Saffir-Simpson scale
  latitude: number;
  longitude: number;
  maxWindSpeed: number;  // mph
  minimumPressure: number; // mb
  movement: string;      // Direction and speed
  lastUpdate: Date;
}
```

### Weather Data Structure
```typescript
interface WeatherData {
  timestamp: Date;
  latitude: number;
  longitude: number;
  temperature: number;   // Celsius
  pressure: number;      // hPa
  windSpeed: number;     // m/s
  windDirection: number; // degrees
}
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Follow TypeScript and ESLint configurations
4. Add tests for new functionality
5. Submit a pull request with detailed description

### Code Style
- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier with 2-space indentation
- **Linting**: ESLint with React and TypeScript rules
- **Commits**: Conventional commit messages

### Testing
- **Unit Tests**: Jest for utility functions
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright for user workflows

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **National Hurricane Center** - Official hurricane data and forecasts
- **NOAA** - Global Forecast System weather model data
- **Copernicus Programme** - European ocean monitoring services
- **MapLibre** - Open-source mapping technology
- **Replit** - Development and deployment platform

---

For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/your-username/hurricane-tracker) or contact the development team.

**⚠️ Disclaimer**: This application is for educational and research purposes. For official weather warnings and emergency information, always consult the National Hurricane Center and local emergency management agencies.