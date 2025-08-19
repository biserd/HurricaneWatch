import type { Hurricane } from "@shared/schema";
import { AIPredictionPanel } from "./ai-prediction-panel";

interface StormDetailsModalProps {
  storm: Hurricane;
  onClose: () => void;
}

export default function StormDetailsModal({ storm, onClose }: StormDetailsModalProps) {
  
  const handleTrackStorm = () => {
    // This would center the map on the storm and follow its movement
    console.log("Tracking storm:", storm.name);
  };

  const handleShowForecastDetails = () => {
    // This would show detailed forecast models and uncertainty
    console.log("Showing forecast details for:", storm.name);
  };

  const getCategoryColor = () => {
    if (storm.category.includes("Category 5") || storm.category.includes("Category 4")) return "text-hurricane-500";
    if (storm.category.includes("Category 3") || storm.category.includes("Category 2")) return "text-hurricane-400";
    if (storm.category.includes("Category 1")) return "text-hurricane-300";
    if (storm.category.includes("Tropical Storm")) return "text-ocean-400";
    return "text-gray-400";
  };

  const formatForecastTrack = () => {
    // In a real implementation, this would parse the forecast track data
    // from storm.forecastTrack and display it properly
    return [
      { time: "12h", category: "Cat 4", winds: "145 mph", position: "25.1°N, 82.8°W" },
      { time: "24h", category: "Cat 3", winds: "125 mph", position: "26.4°N, 83.2°W" },
      { time: "48h", category: "Cat 1", winds: "85 mph", position: "28.1°N, 83.9°W" },
      { time: "72h", category: "TS", winds: "65 mph", position: "30.2°N, 84.1°W" }
    ];
  };

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60">
      <div className="bg-gray-800/95 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-2xl w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <i className="fas fa-hurricane text-hurricane-500 text-2xl animate-spin" style={{ animation: 'spin 8s linear infinite' }}></i>
              <div>
                <h3 className="text-xl font-bold" data-testid="text-modal-storm-name">{storm.name}</h3>
                <p className="text-sm text-gray-400" data-testid="text-modal-storm-category">{storm.category}</p>
              </div>
            </div>
            <button 
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors" 
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <i className="fas fa-times text-gray-400"></i>
            </button>
          </div>

          {/* Storm Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Max Winds</div>
              <div className={`text-2xl font-bold ${getCategoryColor()}`} data-testid="text-modal-wind-speed">
                {storm.windSpeed} mph
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Pressure</div>
              <div className={`text-2xl font-bold ${getCategoryColor()}`} data-testid="text-modal-pressure">
                {storm.pressure} mb
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Movement</div>
              <div className="text-lg font-bold text-gray-300" data-testid="text-modal-movement">
                {storm.movement}
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Next Update</div>
              <div className="text-lg font-bold text-gray-300" data-testid="text-modal-next-update">
                {storm.nextUpdate ? new Date(storm.nextUpdate).toLocaleTimeString() : "TBD"} UTC
              </div>
            </div>
          </div>

          {/* Forecast Track */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">5-Day Forecast Track</h4>
            <div className="bg-gray-700/30 rounded-lg p-3 text-sm text-gray-400">
              {formatForecastTrack().map((forecast, index) => (
                <div key={index} className="flex justify-between py-1" data-testid={`text-forecast-${index}`}>
                  <span>{forecast.time}: {forecast.category}, {forecast.winds}</span>
                  <span>{forecast.position}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Predictions Section */}
          <div className="mb-4">
            <AIPredictionPanel 
              hurricaneId={storm.id} 
              hurricaneName={storm.name}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button 
              className="flex-1 bg-hurricane-600 hover:bg-hurricane-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
              onClick={handleTrackStorm}
              data-testid="button-track-storm"
            >
              <i className="fas fa-crosshairs mr-2"></i>
              Track Storm
            </button>
            <button 
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors text-sm"
              onClick={handleShowForecastDetails}
              data-testid="button-forecast-details"
            >
              <i className="fas fa-chart-line mr-2"></i>
              Forecast Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
