import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

interface DataSource {
  status: string;
  message: string;
  lastUpdate?: string;
}

interface SystemStatus {
  activeStorms: number;
  lastNhcUpdate?: string;
  lastWeatherUpdate?: string;
  lastOceanUpdate?: string;
  status: string;
  dataSources: {
    nhc: DataSource;
    gfs: DataSource;
    cmems: DataSource;
  };
  message: string;
}

export function DataSourceStatus() {
  const { data: systemStatus, isLoading } = useQuery<SystemStatus>({
    queryKey: ['/api/status'],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card data-testid="card-data-source-status">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading system status...</p>
        </CardContent>
      </Card>
    );
  }

  if (!systemStatus) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'configured':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'unavailable':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'needs_credentials':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'operational' || status === 'configured' ? 'default' : 
                   status === 'unavailable' ? 'destructive' : 'secondary';
    return (
      <Badge variant={variant} className="text-xs">
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Card data-testid="card-data-source-status">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {systemStatus.status === 'demo_mode' ? (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Active Storms:</span>
          <Badge variant="outline" data-testid="badge-active-storms">
            {systemStatus.activeStorms}
          </Badge>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Data Sources</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between" data-testid="status-nhc">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.dataSources.nhc.status)}
                <span className="text-sm">NHC (Hurricane Data)</span>
              </div>
              {getStatusBadge(systemStatus.dataSources.nhc.status)}
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              {systemStatus.dataSources.nhc.message}
            </p>

            <div className="flex items-center justify-between" data-testid="status-gfs">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.dataSources.gfs.status)}
                <span className="text-sm">GFS (Weather Model)</span>
              </div>
              {getStatusBadge(systemStatus.dataSources.gfs.status)}
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              {systemStatus.dataSources.gfs.message}
            </p>

            <div className="flex items-center justify-between" data-testid="status-cmems">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.dataSources.cmems.status)}
                <span className="text-sm">CMEMS (Ocean Data)</span>
              </div>
              {getStatusBadge(systemStatus.dataSources.cmems.status)}
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              {systemStatus.dataSources.cmems.message}
            </p>
          </div>
        </div>

        {systemStatus.message && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              {systemStatus.message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}