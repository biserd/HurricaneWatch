import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

interface MobileLayerToggleProps {
  activeLayers: Record<string, boolean>;
  onLayerToggle: (layerId: string) => void;
}

export function MobileLayerToggle({ activeLayers, onLayerToggle }: MobileLayerToggleProps) {
  const isMobile = useMobile();
  const [showOverlays, setShowOverlays] = useState(true);

  if (!isMobile) return null;

  const handleToggleOverlays = () => {
    const newState = !showOverlays;
    setShowOverlays(newState);

    // Toggle all weather and ocean overlays for clean mobile view
    const layersToToggle = [
      'gfs-temperature', 
      'gfs-pressure', 
      'gfs-wind', 
      'cmems-currents', 
      'cmems-waves',
      'nhc-warnings'
    ];

    layersToToggle.forEach(layerId => {
      if (newState) {
        // Show overlays - turn them on if they weren't already
        if (!activeLayers[layerId]) {
          onLayerToggle(layerId);
        }
      } else {
        // Hide overlays - turn them off if they were on
        if (activeLayers[layerId]) {
          onLayerToggle(layerId);
        }
      }
    });
  };

  const getActiveOverlayCount = () => {
    const overlayLayers = [
      'gfs-temperature', 
      'gfs-pressure', 
      'gfs-wind', 
      'cmems-currents', 
      'cmems-waves',
      'nhc-warnings'
    ];
    return overlayLayers.filter(layer => activeLayers[layer]).length;
  };

  return (
    <div className="absolute top-20 right-4 z-20">
      <Button
        variant={showOverlays ? "default" : "outline"}
        size="sm"
        onClick={handleToggleOverlays}
        className="bg-white/90 backdrop-blur-sm border shadow-lg hover:bg-white/95 text-gray-900"
        data-testid="mobile-overlay-toggle"
      >
        {showOverlays ? (
          <>
            <EyeOff className="h-4 w-4 mr-2" />
            Clean View
          </>
        ) : (
          <>
            <Eye className="h-4 w-4 mr-2" />
            Show Data ({getActiveOverlayCount()})
          </>
        )}
      </Button>
    </div>
  );
}