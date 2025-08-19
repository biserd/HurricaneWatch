import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, TrendingUp, MapPin, Clock, AlertTriangle } from "lucide-react";

interface AIPredictionPanelProps {
  hurricaneId: string;
  hurricaneName: string;
}

interface PredictionData {
  pathPrediction: {
    coordinates: [number, number][];
    timePoints: string[];
    confidenceLevel: number;
  };
  intensityForecast: {
    windSpeeds: number[];
    pressures: number[];
    categories: string[];
    timePoints: string[];
  };
  landfall: {
    probability: number;
    estimatedLocation?: string;
    estimatedTime?: string;
  };
  analysis: string;
  confidence: number;
  lastUpdated: string;
}

interface Prediction {
  id: string;
  predictionData: PredictionData;
  confidence: number;
  landfallProbability: number | null;
  landfallLocation: string | null;
  landfallTime: string | null;
  analysis: string | null;
  createdAt: string;
}

export function AIPredictionPanel({ hurricaneId, hurricaneName }: AIPredictionPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: prediction, refetch } = useQuery<Prediction>({
    queryKey: [`/api/hurricanes/${hurricaneId}/predictions/latest`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: intensificationAnalysis, refetch: refetchAnalysis } = useQuery({
    queryKey: [`/api/hurricanes/${hurricaneId}/intensification-analysis`],
    enabled: false, // Only fetch when explicitly requested
  });

  const generatePrediction = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/hurricanes/${hurricaneId}/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        await refetch();
      }
    } catch (error) {
      console.error('Error generating prediction:', error);
    }
    setIsGenerating(false);
  };

  const analyzeIntensification = async () => {
    await refetchAnalysis();
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getLandfallRiskColor = (probability: number) => {
    if (probability >= 0.7) return "destructive";
    if (probability >= 0.4) return "secondary";
    return "outline";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <CardTitle>AI Hurricane Predictions</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={analyzeIntensification}
              data-testid="analyze-intensification-button"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Analyze
            </Button>
            <Button 
              size="sm" 
              onClick={generatePrediction} 
              disabled={isGenerating}
              data-testid="generate-prediction-button"
            >
              {isGenerating ? "Generating..." : "Generate Prediction"}
            </Button>
          </div>
        </div>
        <CardDescription>
          AI-powered 5-day forecast for {hurricaneName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!prediction ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No AI predictions available yet</p>
            <p className="text-sm">Click "Generate Prediction" to create a forecast</p>
          </div>
        ) : (
          <>
            {/* Prediction Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4" data-testid="prediction-summary">
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(prediction.confidence * 100)}%</div>
                <div className="text-sm text-muted-foreground">Confidence</div>
                <div className={`h-1 w-full mt-1 rounded ${getConfidenceColor(prediction.confidence)}`} />
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {prediction.landfallProbability ? Math.round(prediction.landfallProbability * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Landfall Risk</div>
                <Badge 
                  variant={getLandfallRiskColor(prediction.landfallProbability || 0)}
                  className="mt-1"
                >
                  {(prediction.landfallProbability || 0) >= 0.7 ? "High" : 
                   (prediction.landfallProbability || 0) >= 0.4 ? "Moderate" : "Low"}
                </Badge>
              </div>

              <div className="text-center">
                <div className="text-xl font-bold">
                  {prediction.predictionData?.pathPrediction?.coordinates?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Track Points</div>
                <MapPin className="h-4 w-4 mx-auto mt-1 text-muted-foreground" />
              </div>

              <div className="text-center">
                <div className="text-xl font-bold">5 days</div>
                <div className="text-sm text-muted-foreground">Forecast</div>
                <Clock className="h-4 w-4 mx-auto mt-1 text-muted-foreground" />
              </div>
            </div>

            <Separator />

            {/* Landfall Information */}
            {prediction.landfallLocation && (
              <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                      Potential Landfall
                    </h4>
                    <p className="text-orange-700 dark:text-orange-300">
                      <strong>Location:</strong> {prediction.landfallLocation}
                    </p>
                    {prediction.landfallTime && (
                      <p className="text-orange-700 dark:text-orange-300">
                        <strong>Estimated Time:</strong> {formatTime(prediction.landfallTime)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Intensity Forecast */}
            {prediction.predictionData?.intensityForecast && (
              <div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Intensity Forecast</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
                  <div>
                    <div className="font-medium">Peak Winds</div>
                    <div className="text-2xl font-bold text-red-500">
                      {Math.max(...prediction.predictionData.intensityForecast.windSpeeds)} mph
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Min Pressure</div>
                    <div className="text-2xl font-bold text-blue-500">
                      {Math.min(...prediction.predictionData.intensityForecast.pressures)} mb
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Peak Category</div>
                    <div className="text-lg font-bold text-purple-500">
                      {prediction.predictionData.intensityForecast.categories[0]}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* AI Analysis */}
            {prediction.analysis && (
              <div>
                <h4 className="font-semibold mb-2">AI Analysis</h4>
                <div className="bg-muted p-3 rounded-lg text-sm" data-testid="ai-analysis">
                  {prediction.analysis}
                </div>
              </div>
            )}

            {/* Intensification Analysis */}
            {intensificationAnalysis && (
              <div>
                <h4 className="font-semibold mb-2">Intensification Potential</h4>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Badge variant="outline" className="mb-2">
                    {intensificationAnalysis.potential.toUpperCase()}
                  </Badge>
                  <p className="text-sm">{intensificationAnalysis.reasoning}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Confidence: {Math.round(intensificationAnalysis.confidence * 100)}%
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground text-center pt-2">
              Last updated: {formatTime(prediction.createdAt)}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}