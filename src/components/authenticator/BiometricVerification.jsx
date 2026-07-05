import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Fingerprint, Loader2, CheckCircle2, XCircle, Droplet, Wind, Zap, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useAuditMode } from '@/lib/AuditModeContext';

export default function BiometricVerification({ onVerified, tokenSerial }) {
  const { bypassActive } = useAuditMode();
  const [stage, setStage] = useState('idle'); // idle, sampling, analyzing, verifying, success, failed
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState({});
  const [breath, setBreath] = useState(0);

  // Auto-bypass when Audit Mode is active
  useEffect(() => {
    if (bypassActive) {
      setStage('success');
      setProgress(100);
      toast.info('Audit Mode: BioVerify authentication bypassed for demonstration.');
      setTimeout(() => onVerified?.({
        confidence: 100,
        markers: 5,
        auditBypass: true
      }), 500);
    }
  }, [bypassActive]);

  const stages = {
    idle: { label: 'Ready to Verify', icon: Fingerprint, color: 'text-gray-500' },
    sampling: { label: 'Collecting Sample...', icon: Droplet, color: 'text-blue-500' },
    analyzing: { label: 'Analyzing DNA Markers...', icon: Zap, color: 'text-purple-500' },
    verifying: { label: 'Verifying Identity...', icon: Wind, color: 'text-indigo-500' },
    success: { label: 'Verified!', icon: CheckCircle2, color: 'text-green-500' },
    failed: { label: 'Verification Failed', icon: XCircle, color: 'text-red-500' }
  };

  const startVerification = async () => {
    setStage('sampling');
    setProgress(0);
    setBreath(0);

    // Simulate breath sampling
    const breathInterval = setInterval(() => {
      setBreath(prev => {
        if (prev >= 100) {
          clearInterval(breathInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    setTimeout(() => {
      clearInterval(breathInterval);
      setStage('analyzing');
      setProgress(25);
      
      // Simulate DNA analysis
      const markers = [
        'HLA-DRB1*15:01',
        'APOE-ε3/ε3',
        'CYP2D6*1/*4',
        'MTHFR C677T',
        'ACE I/D'
      ];

      let analyzed = 0;
      const analysisInterval = setInterval(() => {
        if (analyzed < markers.length) {
          setAnalysis(prev => ({
            ...prev,
            [markers[analyzed]]: Math.random() > 0.1 ? 'Match' : 'Analyzing...'
          }));
          analyzed++;
          setProgress(25 + (analyzed / markers.length) * 50);
        } else {
          clearInterval(analysisInterval);
          setStage('verifying');
          setProgress(80);
          
          setTimeout(() => {
            const success = Math.random() > 0.05; // 95% success rate
            if (success) {
              setStage('success');
              setProgress(100);
              toast.success('Biometric verification successful!');
              setTimeout(() => onVerified?.({ 
                confidence: 98 + Math.floor(Math.random() * 2),
                markers: markers.length
              }), 500);
            } else {
              setStage('failed');
              setProgress(100);
              toast.error('Verification failed - sample quality too low');
            }
          }, 1500);
        }
      }, 800);
    }, 3000);
  };

  const CurrentIcon = stages[stage]?.icon || Fingerprint;

  return (
    <Card className="border-2 border-purple-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CurrentIcon className={`w-6 h-6 ${stages[stage]?.color}`} />
          {stages[stage]?.label}
        </CardTitle>
        <CardDescription>
          {stage === 'idle' && 'Place your finger on the sensor and blow gently'}
          {stage === 'sampling' && 'Keep breathing steadily into the device...'}
          {stage === 'analyzing' && 'Analyzing your unique DNA markers...'}
          {stage === 'verifying' && 'Cross-referencing with secure database...'}
          {stage === 'success' && 'Identity confirmed - Welcome!'}
          {stage === 'failed' && 'Please try again with a fresh sample'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stage !== 'idle' && stage !== 'success' && stage !== 'failed' && (
          <>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </>
        )}

        {stage === 'sampling' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Breath Sample</span>
              <Wind className="w-5 h-5 text-blue-500 animate-pulse" />
            </div>
            <Progress value={breath} className="h-1 bg-blue-100" />
          </div>
        )}

        {stage === 'analyzing' && Object.keys(analysis).length > 0 && (
          <div className="bg-purple-50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium text-purple-900 mb-2">DNA Markers</p>
            {Object.entries(analysis).map(([marker, status]) => (
              <div key={marker} className="flex items-center justify-between text-xs">
                <span className="text-gray-700">{marker}</span>
                <Badge variant="outline" className="text-xs bg-white">
                  {status === 'Match' ? '✓ Match' : <Loader2 className="w-3 h-3 animate-spin" />}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {stage === 'success' && (
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-green-900 font-medium">Biometric Match Confirmed</p>
            <p className="text-xs text-green-700 mt-1">5 DNA markers verified successfully</p>
          </div>
        )}

        {stage === 'idle' && (
          <Button 
            onClick={startVerification} 
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Fingerprint className="w-4 h-4 mr-2" />
            Start Verification
          </Button>
        )}

        {stage === 'failed' && (
          <Button 
            onClick={startVerification} 
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}