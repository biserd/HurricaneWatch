import { useQuery } from "@tanstack/react-query";
import type { OceanData } from "@shared/schema";

export function useOceanData() {
  const currentsQuery = useQuery<OceanData>({
    queryKey: ['/api/ocean/currents'],
    refetchInterval: 30000,
  });

  const wavesQuery = useQuery<OceanData>({
    queryKey: ['/api/ocean/waves'],
    refetchInterval: 30000,
  });

  return {
    data: {
      currents: currentsQuery.data,
      waves: wavesQuery.data
    },
    isLoading: currentsQuery.isLoading || wavesQuery.isLoading,
    error: currentsQuery.error || wavesQuery.error
  };
}
