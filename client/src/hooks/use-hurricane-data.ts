import { useQuery } from "@tanstack/react-query";
import type { Hurricane } from "@shared/schema";

export function useHurricaneData() {
  return useQuery<Hurricane[]>({
    queryKey: ['/api/hurricanes'],
    refetchInterval: 60000, // Refresh every minute
  });
}
