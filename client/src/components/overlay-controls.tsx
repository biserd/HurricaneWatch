import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Eye, 
  EyeOff, 
  Layers, 
  Wind, 
  Thermometer, 
  Gauge, 
  Waves, 
  Navigation,
  AlertTriangle,
  Target,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface OverlayControlsProps {
  activeLayers: Record<string, boolean>;
  onLayerToggle: (layerId: string) => void;
  className?: string;
}

export function OverlayControls({ activeLayers, onLayerToggle, className = "" }: OverlayControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllLayers, setShowAllLayers] = useState(true);

  const layerGroups = [
    {
      title: "Hurricane Data",
      icon: <AlertTriangle className="h-4 w-4" />,
      layers: [
        { id: 'nhc-cones', label: 'NHC Forecast Cones', icon: <Target className="h-4 w-4" /> },
        { id: 'nhc-tracks', label: 'Storm Tracks', icon: <Navigation className="h-4 w-4" /> },
        { id: 'nhc-warnings', label: 'Warnings & Watches', icon: <AlertTriangle className="h-4 w-4" /> },
        { id: 'ai-predictions', label: 'AI Predictions', icon: <Eye className="h-4 w-4" /> },
      ]
    },
    {
      title: "Weather Data",
      icon: <Wind className="h-4 w-4" />,
      layers: [
        { id: 'gfs-temperature', label: 'Temperature', icon: <Thermometer className="h-4 w-4" /> },
        { id: 'gfs-pressure', label: 'Pressure', icon: <Gauge className="h-4 w-4" /> },
        { id: 'gfs-wind', label: 'Wind Speed', icon: <Wind className="h-4 w-4" /> },
      ]
    },
    {
      title: "Ocean Data",
      icon: <Waves className="h-4 w-4" />,
      layers: [
        { id: 'cmems-currents', label: 'Ocean Currents', icon: <Navigation className="h-4 w-4" /> },
        { id: 'cmems-waves', label: 'Wave Height', icon: <Waves className="h-4 w-4" /> },
      ]
    }
  ];

  const handleToggleAll = () => {
    const newState = !showAllLayers;
    setShowAllLayers(newState);
    
    // Toggle all layers
    layerGroups.forEach(group => {
      group.layers.forEach(layer => {
        onLayerToggle(layer.id);
      });
    });
  };

  const getActiveCount = () => {
    return Object.values(activeLayers).filter(Boolean).length;
  };

  return (
    <Card className={`absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm border shadow-lg ${className}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-3 h-auto"
            data-testid="toggle-overlay-controls"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="text-sm font-medium">
                Layers ({getActiveCount()})
              </span>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="p-3 pt-0 space-y-3">
          {/* Toggle All Button */}
          <div className="flex items-center justify-between">
            <Label htmlFor="toggle-all" className="text-sm font-medium">
              Show All Layers
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleAll}
              className="h-8 px-3"
              data-testid="toggle-all-layers"
            >
              {showAllLayers ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Hide All
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Show All
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Layer Groups */}
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {layerGroups.map((group, groupIndex) => (
              <div key={group.title} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  {group.icon}
                  {group.title}
                </div>
                
                <div className="space-y-2 ml-6">
                  {group.layers.map((layer) => (
                    <div
                      key={layer.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {layer.icon}
                        <Label
                          htmlFor={layer.id}
                          className="text-sm cursor-pointer"
                          data-testid={`label-${layer.id}`}
                        >
                          {layer.label}
                        </Label>
                      </div>
                      <Switch
                        id={layer.id}
                        checked={activeLayers[layer.id] || false}
                        onCheckedChange={() => onLayerToggle(layer.id)}
                        data-testid={`switch-${layer.id}`}
                      />
                    </div>
                  ))}
                </div>
                
                {groupIndex < layerGroups.length - 1 && <Separator />}
              </div>
            ))}
          </div>

          {/* Mobile-specific quick actions */}
          <div className="md:hidden pt-2 border-t space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Hide all weather and ocean layers for clean mobile view
                ['gfs-temperature', 'gfs-pressure', 'gfs-wind', 'cmems-currents', 'cmems-waves'].forEach(id => {
                  if (activeLayers[id]) onLayerToggle(id);
                });
              }}
              className="w-full text-xs"
              data-testid="clean-mobile-view"
            >
              Clean Mobile View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Show only hurricane essentials
                ['nhc-cones', 'ai-predictions'].forEach(id => {
                  if (!activeLayers[id]) onLayerToggle(id);
                });
              }}
              className="w-full text-xs"
              data-testid="hurricane-essentials"
            >
              Hurricane Essentials Only
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}