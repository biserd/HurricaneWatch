import { useState, useEffect } from "react";
import MapContainer from "@/components/map-container";
import ControlPanel from "@/components/control-panel";
import TimeControls from "@/components/time-controls";
import StormDetailsModal from "@/components/storm-details-modal";
import DataAttribution from "@/components/data-attribution";
import { DataSourceStatus } from "@/components/data-source-status";
import { AIPredictionPanel } from "@/components/ai-prediction-panel";
import { OverlayControls } from "@/components/overlay-controls";
import { MobileLayerToggle } from "@/components/mobile-layer-toggle";
import { useHurricaneData } from "@/hooks/use-hurricane-data";
import { useQuery } from "@tanstack/react-query";
import type { Hurricane } from "@shared/schema";

export default function HurricaneTracker() {
  const [selectedStorm, setSelectedStorm] = useState<Hurricane | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [activeLayers, setActiveLayers] = useState({
    'nhc-cones': true,
    'nhc-tracks': true,
    'nhc-warnings': false,
    'gfs-temperature': false,
    'gfs-pressure': true,
    'gfs-wind': false,
    'cmems-currents': false,
    'cmems-waves': false
  });

  const { data: hurricanes = [], isLoading: hurricanesLoading } = useHurricaneData();
  
  const { data: systemStatus } = useQuery<{
    activeStorms: number;
    lastNhcUpdate?: string;
    lastWeatherUpdate?: string;
    lastOceanUpdate?: string;
    status: string;
  }>({
    queryKey: ['/api/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => new Date(prev.getTime() + 3 * 60 * 60 * 1000)); // +3 hours
      }, 1000 / animationSpeed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, animationSpeed]);

  const handleToggleLayer = (layerId: string) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId as keyof typeof prev]
    }));
  };

  const handleTimeStepUpdate = (step: number) => {
    // Convert step to actual timestamp
    const baseTime = new Date();
    baseTime.setHours(baseTime.getHours() - 24); // Start 24h ago
    const newTime = new Date(baseTime.getTime() + (step * 3 * 60 * 60 * 1000)); // 3h steps
    setCurrentTime(newTime);
  };

  const handleTogglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-gray-900 text-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700/50">
        <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <i className="fas fa-hurricane text-hurricane-500 text-xl sm:text-2xl animate-spin" style={{ animation: 'spin 8s linear infinite' }}></i>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">Hurricane Tracker</h1>
                <p className="text-xs text-gray-400 hidden sm:block">Real-time Storm Analysis & Forecasting</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Live Data Indicator */}
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300 hidden sm:inline">Live Data</span>
              <span className="text-xs text-gray-400 hidden md:inline">
                {systemStatus?.lastNhcUpdate ? `Updated ${new Date(systemStatus.lastNhcUpdate).toLocaleTimeString()}` : 'Loading...'}
              </span>
            </div>
            
            {/* Settings */}
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors" data-testid="button-settings">
              <i className="fas fa-cog text-gray-400 text-sm sm:text-base"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Map Container */}
      <div className="absolute inset-0 pt-16 sm:pt-20">
        <MapContainer 
          hurricanes={hurricanes}
          activeLayers={activeLayers}
          currentTime={currentTime}
          onStormSelect={setSelectedStorm}
        />
        
        {/* Overlay Controls - positioned over map (desktop) */}
        <div className="hidden md:block">
          <OverlayControls
            activeLayers={activeLayers}
            onLayerToggle={handleToggleLayer}
            className="top-4 right-4"
          />
        </div>

        {/* Mobile Layer Toggle - simple clean view toggle */}
        <MobileLayerToggle
          activeLayers={activeLayers}
          onLayerToggle={handleToggleLayer}
        />
      </div>

      {/* Control Panel - hidden on mobile for clean view */}
      <div className="hidden md:block">
        <ControlPanel
          hurricanes={hurricanes}
          activeLayers={activeLayers}
          onToggleLayer={handleToggleLayer}
          onStormSelect={setSelectedStorm}
          isLoading={hurricanesLoading}
        />
      </div>

      {/* Time Controls - hidden on mobile for clean view */}
      <div className="hidden md:block">
        <TimeControls
          currentTime={currentTime}
          isPlaying={isPlaying}
          animationSpeed={animationSpeed}
          onTimeStepUpdate={handleTimeStepUpdate}
          onTogglePlayPause={handleTogglePlayPause}
          onAnimationSpeedChange={setAnimationSpeed}
        />
      </div>

      {/* Storm Details Modal */}
      {selectedStorm && (
        <StormDetailsModal
          storm={selectedStorm}
          onClose={() => setSelectedStorm(null)}
        />
      )}

      {/* Data Source Status - hidden on mobile for clean view */}
      <div className="hidden md:block absolute bottom-16 sm:bottom-4 right-2 sm:right-4 z-40 w-72 sm:w-80">
        <DataSourceStatus />
      </div>

      {/* Data Attribution */}
      <DataAttribution systemStatus={systemStatus} />
    </div>
  );
}
