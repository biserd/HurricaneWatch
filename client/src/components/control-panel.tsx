import { cn } from "@/lib/utils";
import type { Hurricane } from "@shared/schema";

interface ControlPanelProps {
  hurricanes: Hurricane[];
  activeLayers: Record<string, boolean>;
  onToggleLayer: (layerId: string) => void;
  onStormSelect: (storm: Hurricane) => void;
  isLoading: boolean;
}

export default function ControlPanel({ 
  hurricanes, 
  activeLayers, 
  onToggleLayer, 
  onStormSelect, 
  isLoading 
}: ControlPanelProps) {
  
  const getCategoryColor = (category: string) => {
    if (category.includes("Category 5") || category.includes("Category 4")) return "text-hurricane-500";
    if (category.includes("Category 3") || category.includes("Category 2")) return "text-hurricane-400";
    if (category.includes("Category 1")) return "text-hurricane-300";
    if (category.includes("Tropical Storm")) return "text-ocean-400";
    return "text-gray-400";
  };

  const getWindSpeedColor = (windSpeed: number) => {
    if (windSpeed >= 130) return "text-hurricane-500";
    if (windSpeed >= 96) return "text-hurricane-400";
    if (windSpeed >= 74) return "text-hurricane-300";
    if (windSpeed >= 39) return "text-ocean-400";
    return "text-gray-400";
  };

  return (
    <div className="absolute left-4 top-24 bottom-24 w-80 bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden shadow-2xl">
      
      {/* Active Storms Tab */}
      <div className="border-b border-gray-700/50">
        <div className="px-4 py-3 bg-hurricane-600/20">
          <h2 className="font-semibold flex items-center">
            <i className="fas fa-eye text-hurricane-500 mr-2"></i>
            Active Storms
            <span className="ml-auto bg-hurricane-500 text-white text-xs px-2 py-1 rounded-full" data-testid="text-storm-count">
              {hurricanes.length}
            </span>
          </h2>
        </div>
        
        {/* Storm List */}
        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Loading storms...
            </div>
          ) : hurricanes.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No active storms detected
            </div>
          ) : (
            hurricanes.map((hurricane) => (
              <div 
                key={hurricane.id}
                className="p-4 border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors cursor-pointer"
                onClick={() => onStormSelect(hurricane)}
                data-testid={`card-storm-${hurricane.id}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={cn("font-medium", getCategoryColor(hurricane.category))} data-testid={`text-storm-name-${hurricane.id}`}>
                      {hurricane.name}
                    </h3>
                    <p className="text-sm text-gray-400" data-testid={`text-storm-category-${hurricane.id}`}>
                      {hurricane.category}
                    </p>
                    <p className="text-xs text-gray-500 mt-1" data-testid={`text-storm-location-${hurricane.id}`}>
                      {hurricane.latitude.toFixed(1)}°N, {Math.abs(hurricane.longitude).toFixed(1)}°W
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-lg font-bold", getWindSpeedColor(hurricane.windSpeed))} data-testid={`text-storm-wind-${hurricane.id}`}>
                      {hurricane.windSpeed} mph
                    </div>
                    <div className="text-xs text-gray-400" data-testid={`text-storm-pressure-${hurricane.id}`}>
                      {hurricane.pressure} mb
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400" data-testid={`text-storm-update-${hurricane.id}`}>
                  Updated: {new Date(hurricane.lastUpdate).toLocaleTimeString()} UTC
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Layer Controls */}
      <div className="p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <i className="fas fa-layers text-blue-500 mr-2"></i>
          Data Layers
        </h3>
        
        {/* Hurricane Data */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm">
              <input 
                type="checkbox" 
                checked={activeLayers['nhc-cones']}
                onChange={() => onToggleLayer('nhc-cones')}
                className="mr-2 rounded bg-gray-700 border-gray-600" 
                data-testid="input-layer-nhc-cones"
              />
              <i className="fas fa-circle-dot text-hurricane-500 mr-1"></i>
              Hurricane Cones
            </label>
            <div className="text-xs text-gray-400">NHC</div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm">
              <input 
                type="checkbox" 
                checked={activeLayers['nhc-tracks']}
                onChange={() => onToggleLayer('nhc-tracks')}
                className="mr-2 rounded bg-gray-700 border-gray-600" 
                data-testid="input-layer-nhc-tracks"
              />
              <i className="fas fa-route text-yellow-500 mr-1"></i>
              Storm Tracks
            </label>
            <div className="text-xs text-gray-400">NHC</div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm">
              <input 
                type="checkbox" 
                checked={activeLayers['nhc-warnings']}
                onChange={() => onToggleLayer('nhc-warnings')}
                className="mr-2 rounded bg-gray-700 border-gray-600" 
                data-testid="input-layer-nhc-warnings"
              />
              <i className="fas fa-exclamation-triangle text-red-500 mr-1"></i>
              Warnings
            </label>
            <div className="text-xs text-gray-400">NHC</div>
          </div>
        </div>

        {/* Weather Data */}
        <div className="border-t border-gray-700/50 pt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Weather Overlays</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm">
                <input 
                  type="checkbox" 
                  checked={activeLayers['gfs-temperature']}
                  onChange={() => onToggleLayer('gfs-temperature')}
                  className="mr-2 rounded bg-gray-700 border-gray-600" 
                  data-testid="input-layer-gfs-temperature"
                />
                <i className="fas fa-thermometer-half text-red-400 mr-1"></i>
                Temperature
              </label>
              <div className="text-xs text-gray-400">GFS</div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm">
                <input 
                  type="checkbox" 
                  checked={activeLayers['gfs-pressure']}
                  onChange={() => onToggleLayer('gfs-pressure')}
                  className="mr-2 rounded bg-gray-700 border-gray-600" 
                  data-testid="input-layer-gfs-pressure"
                />
                <i className="fas fa-tachometer-alt text-blue-400 mr-1"></i>
                Pressure
              </label>
              <div className="text-xs text-gray-400">GFS</div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm">
                <input 
                  type="checkbox" 
                  checked={activeLayers['gfs-wind']}
                  onChange={() => onToggleLayer('gfs-wind')}
                  className="mr-2 rounded bg-gray-700 border-gray-600" 
                  data-testid="input-layer-gfs-wind"
                />
                <i className="fas fa-wind text-green-400 mr-1"></i>
                Wind Speed
              </label>
              <div className="text-xs text-gray-400">GFS</div>
            </div>
          </div>
        </div>

        {/* Ocean Data */}
        <div className="border-t border-gray-700/50 pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Ocean Data</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm">
                <input 
                  type="checkbox" 
                  checked={activeLayers['cmems-currents']}
                  onChange={() => onToggleLayer('cmems-currents')}
                  className="mr-2 rounded bg-gray-700 border-gray-600" 
                  data-testid="input-layer-cmems-currents"
                />
                <i className="fas fa-water text-ocean-400 mr-1"></i>
                Ocean Currents
              </label>
              <div className="text-xs text-gray-400">CMEMS</div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm">
                <input 
                  type="checkbox" 
                  checked={activeLayers['cmems-waves']}
                  onChange={() => onToggleLayer('cmems-waves')}
                  className="mr-2 rounded bg-gray-700 border-gray-600" 
                  data-testid="input-layer-cmems-waves"
                />
                <i className="fas fa-wave-square text-cyan-400 mr-1"></i>
                Wave Height
              </label>
              <div className="text-xs text-gray-400">CMEMS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
