import { useEffect, useRef, useState } from "react";
import { useWeatherData } from "@/hooks/use-weather-data";
import { useOceanData } from "@/hooks/use-ocean-data";
import { useQuery } from "@tanstack/react-query";
import type { Hurricane } from "@shared/schema";

interface MapContainerProps {
  hurricanes: Hurricane[];
  activeLayers: Record<string, boolean>;
  currentTime: Date;
  onStormSelect: (storm: Hurricane) => void;
}

export default function MapContainer({ hurricanes, activeLayers, currentTime, onStormSelect }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  const { data: nhcCones } = useQuery<{ features?: any[] }>({
    queryKey: ['/api/nhc/cones'],
    refetchInterval: 30000,
  });

  const { data: nhcTracks } = useQuery<{ features?: any[] }>({
    queryKey: ['/api/nhc/tracks'],
    refetchInterval: 30000,
  });

  const { data: nhcWarnings } = useQuery<{ features?: any[] }>({
    queryKey: ['/api/nhc/warnings'],
    refetchInterval: 30000,
  });

  const { data: weatherData } = useWeatherData();
  const { data: oceanData } = useOceanData();

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize MapLibre GL map
    const maplibregl = (window as any).maplibregl;
    if (!maplibregl) {
      console.error("MapLibre GL not loaded");
      return;
    }

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
            ],
            tileSize: 256,
            attribution: '© CartoDB'
          }
        },
        layers: [
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark'
          }
        ]
      },
      center: [-80, 25], // Gulf of Mexico
      zoom: 5,
      pitch: 0,
      bearing: 0
    });

    // Add navigation control
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      mapInstanceRef.current = map;
      setMapReady(true);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Update NHC layers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Hurricane Cones
    if (activeLayers['nhc-cones'] && nhcCones?.features) {
      if (map.getSource('hurricane-cones')) {
        map.getSource('hurricane-cones').setData(nhcCones);
      } else {
        map.addSource('hurricane-cones', {
          type: 'geojson',
          data: nhcCones
        });

        map.addLayer({
          id: 'hurricane-cones',
          type: 'fill',
          source: 'hurricane-cones',
          paint: {
            'fill-color': '#ef7944',
            'fill-opacity': 0.2
          }
        });

        map.addLayer({
          id: 'hurricane-cones-outline',
          type: 'line',
          source: 'hurricane-cones',
          paint: {
            'line-color': '#ef7944',
            'line-width': 2
          }
        });
      }
    } else {
      if (map.getLayer('hurricane-cones')) {
        map.removeLayer('hurricane-cones');
        map.removeLayer('hurricane-cones-outline');
        map.removeSource('hurricane-cones');
      }
    }

    // Hurricane Tracks
    if (activeLayers['nhc-tracks'] && nhcTracks?.features) {
      if (map.getSource('hurricane-tracks')) {
        map.getSource('hurricane-tracks').setData(nhcTracks);
      } else {
        map.addSource('hurricane-tracks', {
          type: 'geojson',
          data: nhcTracks
        });

        map.addLayer({
          id: 'hurricane-tracks',
          type: 'line',
          source: 'hurricane-tracks',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ef7944',
            'line-width': 3,
            'line-dasharray': [2, 2]
          }
        });
      }
    } else {
      if (map.getLayer('hurricane-tracks')) {
        map.removeLayer('hurricane-tracks');
        map.removeSource('hurricane-tracks');
      }
    }

    // Hurricane Warnings
    if (activeLayers['nhc-warnings'] && nhcWarnings?.features) {
      if (map.getSource('hurricane-warnings')) {
        map.getSource('hurricane-warnings').setData(nhcWarnings);
      } else {
        map.addSource('hurricane-warnings', {
          type: 'geojson',
          data: nhcWarnings
        });

        map.addLayer({
          id: 'hurricane-warnings',
          type: 'fill',
          source: 'hurricane-warnings',
          paint: {
            'fill-color': '#dc2626',
            'fill-opacity': 0.3
          }
        });
      }
    } else {
      if (map.getLayer('hurricane-warnings')) {
        map.removeLayer('hurricane-warnings');
        map.removeSource('hurricane-warnings');
      }
    }

  }, [mapReady, activeLayers, nhcCones, nhcTracks, nhcWarnings]);

  // Update hurricane markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const hurricaneData = {
      type: 'FeatureCollection',
      features: hurricanes.map(hurricane => ({
        type: 'Feature',
        properties: {
          id: hurricane.id,
          name: hurricane.name,
          category: hurricane.category,
          windSpeed: hurricane.windSpeed,
          pressure: hurricane.pressure
        },
        geometry: {
          type: 'Point',
          coordinates: [hurricane.longitude, hurricane.latitude]
        }
      }))
    };

    if (map.getSource('current-hurricanes')) {
      map.getSource('current-hurricanes').setData(hurricaneData);
    } else {
      map.addSource('current-hurricanes', {
        type: 'geojson',
        data: hurricaneData
      });

      map.addLayer({
        id: 'current-hurricanes',
        type: 'circle',
        source: 'current-hurricanes',
        paint: {
          'circle-radius': 8,
          'circle-color': '#ef7944',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      });

      // Add click handler for hurricanes
      map.on('click', 'current-hurricanes', (e: any) => {
        const feature = e.features[0];
        const hurricane = hurricanes.find(h => h.id === feature.properties.id);
        if (hurricane) {
          onStormSelect(hurricane);
        }
      });

      map.on('mouseenter', 'current-hurricanes', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'current-hurricanes', () => {
        map.getCanvas().style.cursor = '';
      });
    }
  }, [mapReady, hurricanes, onStormSelect]);

  // Update weather layers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Temperature layer
    if (activeLayers['gfs-temperature'] && weatherData?.temperature?.tileUrl) {
      if (!map.getSource('temperature-tiles')) {
        map.addSource('temperature-tiles', {
          type: 'raster',
          tiles: [weatherData.temperature.tileUrl],
          tileSize: 256
        });

        map.addLayer({
          id: 'temperature-layer',
          type: 'raster',
          source: 'temperature-tiles',
          paint: {
            'raster-opacity': 0.6
          }
        });
      }
    } else {
      if (map.getLayer('temperature-layer')) {
        map.removeLayer('temperature-layer');
        map.removeSource('temperature-tiles');
      }
    }

    // Similar logic for pressure and wind layers...

  }, [mapReady, activeLayers, weatherData]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full" 
      data-testid="map-container"
    />
  );
}
