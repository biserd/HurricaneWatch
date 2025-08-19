import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface MobileLayerToggleProps {
  activeLayers: Record<string, boolean>;
  onLayerToggle: (layerId: string) => void;
}

export function MobileLayerToggle({ activeLayers, onLayerToggle }: MobileLayerToggleProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

    // Force toggle all overlay layers regardless of current state
    layersToToggle.forEach(layerId => {
      onLayerToggle(layerId);
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
        variant={showOverlays ? "outline" : "default"}
        size="sm"
        onClick={handleToggleOverlays}
        className="bg-white/90 backdrop-blur-sm border shadow-lg hover:bg-white/95 text-gray-900"
        data-testid="mobile-overlay-toggle"
      >
        <EyeOff className="h-4 w-4 mr-2" />
        Toggle Overlays ({getActiveOverlayCount()})
      </Button>
    </div>
  );
}