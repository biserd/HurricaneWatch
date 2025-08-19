import { useQuery } from "@tanstack/react-query";
import type { WeatherData } from "@shared/schema";

export function useWeatherData() {
  const temperatureQuery = useQuery<WeatherData>({
    queryKey: ['/api/weather/temperature'],
    refetchInterval: 30000,
  });

  const pressureQuery = useQuery<WeatherData>({
    queryKey: ['/api/weather/pressure'],
    refetchInterval: 30000,
  });

  const windQuery = useQuery<WeatherData>({
    queryKey: ['/api/weather/wind'],
    refetchInterval: 30000,
  });

  return {
    data: {
      temperature: temperatureQuery.data,
      pressure: pressureQuery.data,
      wind: windQuery.data
    },
    isLoading: temperatureQuery.isLoading || pressureQuery.isLoading || windQuery.isLoading,
    error: temperatureQuery.error || pressureQuery.error || windQuery.error
  };
}
