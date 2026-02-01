import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Wind, Droplet, Activity, CheckCircle2, AlertTriangle, Thermometer } from "lucide-react";
import { toast } from "sonner";

export default function BreathalyzerVerification({ token, onVerificationComplete }) {
  const [isBlowing, setIsBlowing] = useState(false);
  const [breathProgress, setBreathProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [stage, setStage] = useState('idle'); // idle, sampling, analyzing, complete

  const startBreathTest = () => {
    setIsBlowing(true);
    setStage('sampling');
    setBreathProgress(0);
    setAnalysis(null);

    // Simulate breath collection
    const breathInterval = setInterval(() => {
      setBreathProgress(prev => {
        if (prev >= 100) {
          clearInterval(breathInterval);
          analyzeBreath();
          return 100;
        }
        return prev + 1;
      });
    }, 30);
  };

  const analyzeBreath = () => {
    setStage('analyzing');
    setTimeout(() => {
      const mockAnalysis = {
        dna_markers: {
          'STR-D3S1358': { value: '15,17', match: true },
          'STR-vWA': { value: '16,18', match: true },
          'STR-FGA': { value: '21,24', match: true },
          'STR-D8S1179': { value: '12,13', match: true },
          'STR-D21S11': { value: '29,30', match: true }
        },
        biomarkers: {
          temperature: (36.5 + Math.random() * 0.5).toFixed(1),
          humidity: (85 + Math.random() * 10).toFixed(0),
          co2_level: (4.5 + Math.random() * 0.5).toFixed(1),
          unique_proteins: Math.floor(Math.random() * 5) + 18
        },
        confidence: 96 + Math.floor(Math.random() * 4),
        timestamp: new Date().toISOString(),
        match: true
      };

      setAnalysis(mockAnalysis);
      setStage('complete');
      setIsBlowing(false);
      toast.success('Breathalyzer verification complete!');
      onVerificationComplete?.(mockAnalysis);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="w-6 h-6 text-blue-600" />
            BioVerify Breathalyzer Test
          </CardTitle>
          <CardDescription>
            Blow into the device sensor to verify your unique biometric signature
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {stage === 'idle' && (
            <div className="text-center py-8">
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse" />
                <Wind className="w-16 h-16 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
              </div>
              <p className="text-gray-700 mb-6">
                Position the device 2-3 inches from your mouth and click Start when ready
              </p>
              <Button 
                onClick={startBreathTest}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Wind className="w-5 h-5 mr-2" />
                Start Breath Test
              </Button>
            </div>
          )}

          {stage === 'sampling' && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border-2 border-blue-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-blue-900">Collecting Sample...</span>
                  <Wind className="w-6 h-6 text-blue-500 animate-bounce" />
                </div>
                <Progress value={breathProgress} className="h-3 bg-blue-100" />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Keep blowing steadily</span>
                  <span>{breathProgress}%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border text-center">
                  <Droplet className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs text-gray-500">Moisture</p>
                  <p className="text-sm font-bold text-blue-900">{Math.floor(breathProgress * 0.85)}%</p>
                </div>
                <div className="bg-white p-3 rounded-lg border text-center">
                  <Thermometer className="w-5 h-5 mx-auto mb-1 text-red-600" />
                  <p className="text-xs text-gray-500">Temp</p>
                  <p className="text-sm font-bold text-red-900">{(36.5 + breathProgress * 0.005).toFixed(1)}°C</p>
                </div>
                <div className="bg-white p-3 rounded-lg border text-center">
                  <Activity className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <p className="text-xs text-gray-500">Signal</p>
                  <p className="text-sm font-bold text-green-900">{Math.floor(breathProgress * 0.95)}%</p>
                </div>
              </div>
            </div>
          )}

          {stage === 'analyzing' && (
            <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200 text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-pulse" />
              <p className="text-purple-900 font-medium mb-2">Analyzing DNA Markers...</p>
              <p className="text-sm text-purple-700">Cross-referencing your unique biological signature</p>
            </div>
          )}

          {stage === 'complete' && analysis && (
            <div className="space-y-4">
              <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-600" />
                <p className="text-green-900 font-bold text-lg mb-1">Identity Verified!</p>
                <Badge className="bg-green-600 text-white">
                  {analysis.confidence}% Match Confidence
                </Badge>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">DNA Markers Verified</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(analysis.dna_markers).map(([marker, data]) => (
                    <div key={marker} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 font-mono">{marker}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{data.value}</span>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Biometric Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Temperature</p>
                      <p className="text-sm font-bold">{analysis.biomarkers.temperature}°C</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Humidity</p>
                      <p className="text-sm font-bold">{analysis.biomarkers.humidity}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">CO₂ Level</p>
                      <p className="text-sm font-bold">{analysis.biomarkers.co2_level}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Proteins</p>
                      <p className="text-sm font-bold">{analysis.biomarkers.unique_proteins}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={() => {
                  setStage('idle');
                  setAnalysis(null);
                }}
                variant="outline"
                className="w-full"
              >
                Test Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-orange-100 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900 text-sm">
            <AlertTriangle className="w-5 h-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2 text-orange-800">
          <p>• <strong>DNA Extraction:</strong> Saliva particles in your breath contain epithelial cells with your unique DNA</p>
          <p>• <strong>STR Analysis:</strong> Short Tandem Repeat markers are analyzed for identity confirmation</p>
          <p>• <strong>Multi-Factor:</strong> Combines DNA analysis with breath temperature, humidity, and protein markers</p>
          <p>• <strong>Secure:</strong> Results are never stored - only verified against your registered biometric template</p>
        </CardContent>
      </Card>
    </div>
  );
}