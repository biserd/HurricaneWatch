interface DataAttributionProps {
  systemStatus?: {
    activeStorms: number;
    lastNhcUpdate?: string;
    lastWeatherUpdate?: string;
    lastOceanUpdate?: string;
    status: string;
  };
}

export default function DataAttribution({ systemStatus }: DataAttributionProps) {
  const formatUpdateTime = (timestamp?: string) => {
    if (!timestamp) return "Loading...";
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short'
    });
  };

  const getStatusColor = (timestamp?: string) => {
    if (!timestamp) return "text-gray-400";
    const now = new Date();
    const updateTime = new Date(timestamp);
    const diffMinutes = (now.getTime() - updateTime.getTime()) / (1000 * 60);
    
    if (diffMinutes < 60) return "text-green-400";
    if (diffMinutes < 180) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="absolute bottom-4 right-4 bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-400 max-w-xs">
      <div className="font-medium mb-1">Data Sources:</div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Hurricane Data:</span>
          <span className={getStatusColor(systemStatus?.lastNhcUpdate)} data-testid="text-nhc-status">
            NHC • {formatUpdateTime(systemStatus?.lastNhcUpdate)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Weather Model:</span>
          <span className={getStatusColor(systemStatus?.lastWeatherUpdate)} data-testid="text-gfs-status">
            GFS 0.25° • {formatUpdateTime(systemStatus?.lastWeatherUpdate)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Ocean Data:</span>
          <span className={getStatusColor(systemStatus?.lastOceanUpdate)} data-testid="text-cmems-status">
            CMEMS • {formatUpdateTime(systemStatus?.lastOceanUpdate)}
          </span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-700/50 text-xs">
        System Status: <span className="text-green-400" data-testid="text-system-status">
          {systemStatus?.status || "Initializing..."}
        </span>
      </div>
    </div>
  );
}
