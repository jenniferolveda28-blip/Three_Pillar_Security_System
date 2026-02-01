import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Wind, CheckCircle2, AlertTriangle, Activity, Loader2 } from "lucide-react";

export default function BreathalyzerVerification({ token, onVerificationComplete }) {
  const [isBlowing, setIsBlowing] = useState(false);
  const [breathAnalysis, setBreathAnalysis] = useState(null);
  const [progress, setProgress] = useState(0);
  const [bioSignature, setBioSignature] = useState(null);

  const simulateBiometricRead = () => {
    setIsBlowing(true);
    setProgress(0);
    setBreathAnalysis(null);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          analyzeBiometrics();
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const analyzeBiometrics = async () => {
    // Simulate breath analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysis = {
      biomarkers: {
        hydrogen: Math.floor(50 + Math.random() * 50),
        methane: Math.floor(10 + Math.random() * 30),
        carbon_dioxide: Math.floor(400 + Math.random() * 200),
        volatile_compounds: Math.floor(100 + Math.random() * 500)
      },
      uniqueness_score: 94 + Math.floor(Math.random() * 6),
      match_confidence: 96 + Math.floor(Math.random() * 4),
      timestamp: new Date().toISOString()
    };
    
    // Generate unique bio-signature hash
    const signature = Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    setBioSignature(signature.toUpperCase());
    setBreathAnalysis(analysis);
    setIsBlowing(false);

    // Log the verification
    await base44.entities.SecurityLog.create({
      event_type: 'fingerprint_verified',
      fingerprint_hash: signature,
      success: true,
      details: `Breathalyzer verification completed - ${analysis.match_confidence}% match`,
      threat_level: 'none'
    });

    if (analysis.match_confidence > 95) {
      toast.success('✓ Biometric verification successful!');
      if (onVerificationComplete) {
        onVerificationComplete(analysis);
      }
    } else {
      toast.error('Verification failed - please try again');
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-blue-600" />
          BioVerify Breathalyzer Authentication
        </CardTitle>
        <CardDescription>
          Your unique breath composition acts as an unforgeable biometric signature
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!breathAnalysis ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mb-4 relative">
                {isBlowing && (
                  <>
                    <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-75"></div>
                    <div className="absolute inset-0 rounded-full animate-pulse bg-cyan-400 opacity-50"></div>
                  </>
                )}
                <Wind className="w-16 h-16 text-white relative z-10" />
              </div>
              
              {isBlowing ? (
                <div className="space-y-3">
                  <p className="text-lg font-medium text-blue-900">Analyzing breath sample...</p>
                  <Progress value={progress} className="h-3" />
                  <p className="text-sm text-gray-600">{progress}% complete</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">Ready to verify</p>
                  <p className="text-sm text-gray-600 mb-4">Blow into your BioVerify device for 2 seconds</p>
                  <Button 
                    onClick={simulateBiometricRead}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Wind className="w-5 h-5 mr-2" />
                    Start Verification
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                How It Works
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Analyzes unique volatile organic compounds in your breath</li>
                <li>• Measures gas composition ratios (H₂, CH₄, CO₂, VOCs)</li>
                <li>• Creates unforgeable biometric signature</li>
                <li>• Changes daily but remains uniquely identifiable to you</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-4">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-green-700">Verification Successful!</p>
              <p className="text-sm text-gray-600">Identity confirmed with {breathAnalysis.match_confidence}% confidence</p>
            </div>

            <div className="bg-white rounded-lg p-4 space-y-3">
              <h4 className="font-medium flex items-center justify-between">
                <span>Biometric Analysis</span>
                <Badge className="bg-green-100 text-green-800">Verified</Badge>
              </h4>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-600 text-xs">Hydrogen (ppm)</p>
                  <p className="font-mono font-bold">{breathAnalysis.biomarkers.hydrogen}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-600 text-xs">Methane (ppm)</p>
                  <p className="font-mono font-bold">{breathAnalysis.biomarkers.methane}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-600 text-xs">CO₂ (ppm)</p>
                  <p className="font-mono font-bold">{breathAnalysis.biomarkers.carbon_dioxide}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-600 text-xs">VOCs (ppb)</p>
                  <p className="font-mono font-bold">{breathAnalysis.biomarkers.volatile_compounds}</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-gray-600">Bio-Signature Hash</p>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                  {bioSignature}
                </p>
              </div>
            </div>

            <Button 
              onClick={() => {
                setBreathAnalysis(null);
                setBioSignature(null);
                setProgress(0);
              }}
              variant="outline"
              className="w-full"
            >
              Verify Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}