import { useQuery } from "@tanstack/react-query";
import type { HurricanePrediction } from "@shared/schema";

export function useAIPredictions(hurricaneId?: string) {
  return useQuery<HurricanePrediction[]>({
    queryKey: ['/api/predictions', hurricaneId],
    enabled: !!hurricaneId,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useAllAIPredictions() {
  return useQuery<HurricanePrediction[]>({
    queryKey: ['/api/predictions'],
    refetchInterval: 60000,
  });
}