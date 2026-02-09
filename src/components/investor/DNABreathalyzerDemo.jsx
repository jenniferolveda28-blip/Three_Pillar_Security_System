import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Dna, Activity, Lock, Shield, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DNABreathalyzerDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [dnaProgress, setDnaProgress] = useState(0);
  const [breathIntensity, setBreathIntensity] = useState(50);
  const [sampleQuality, setSampleQuality] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= 5) {
          setIsPlaying(false);
          return 5;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (step === 2) {
      // Simulate DNA processing
      const progressInterval = setInterval(() => {
        setDnaProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 50);

      return () => clearInterval(progressInterval);
    }
  }, [step]);

  const reset = () => {
    setIsPlaying(false);
    setStep(0);
    setDnaProgress(0);
    setSampleQuality(0);
  };

  const simulateBreath = () => {
    const quality = Math.floor((breathIntensity / 100) * 100);
    setSampleQuality(quality);
    if (quality >= 70) {
      toast.success('Excellent sample quality!', {
        description: `${quality}% DNA marker confidence`
      });
      setIsPlaying(true);
      setStep(1);
    } else {
      toast.error('Sample quality too low', {
        description: 'Please adjust breath intensity and try again'
      });
    }
  };

  const dnaSequence = "ATCGATCGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTATCGATCGTAGCTAGCT";
  const dnaHash = "sha256_AE4F2B891C3D7E5A9C2F1B8D4E7A3C6F9B2E5A8D1C4F7B0E3A6C9F2B5E8A1D4C7";

  return (
    <Card className="bg-slate-900/50 border-blue-500">
      <CardHeader>
        <CardTitle className="text-3xl flex items-center gap-3">
          <Dna className="h-8 w-8 text-blue-500" />
          Live Demo: DNA Breathalyzer Registration & Security
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between bg-slate-800 p-4 rounded-lg">
            <div className="flex gap-3">
              <Button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className={isPlaying ? "bg-orange-600" : "bg-blue-600"}
              >
                {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Start DNA Registration'}
              </Button>
              <Button onClick={reset} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
            <div className="text-sm text-slate-400">
              Step {step} of 5
            </div>
          </div>

          {/* Visual DNA Device */}
          <div className="relative">
            <motion.div
              animate={{ 
                scale: step >= 1 ? 1 : 0.95,
                boxShadow: step >= 1 ? '0 0 30px rgba(59, 130, 246, 0.5)' : '0 0 0px rgba(59, 130, 246, 0)'
              }}
              className="bg-gradient-to-br from-blue-900 to-purple-900 p-8 rounded-xl border-2 border-blue-500"
            >
              <div className="text-center">
                <Dna className={`h-24 w-24 mx-auto mb-4 ${step >= 1 ? 'text-blue-400 animate-pulse' : 'text-blue-600'}`} />
                <h3 className="text-2xl font-bold mb-2">BioVerify Pro Token</h3>
                <p className="text-slate-300">Serial: BIOVERIFY-8472-ALPHA</p>
                {step >= 1 && step < 5 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4"
                  >
                    <Activity className="h-8 w-8 mx-auto text-green-400 animate-pulse" />
                    <p className="text-green-400 font-semibold mt-2">Processing DNA Sample...</p>
                  </motion.div>
                )}
                {step >= 5 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4"
                  >
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-400" />
                    <p className="text-2xl font-bold text-green-400 mt-2">ACTIVATED</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Step 1: Collection */}
          <AnimatePresence>
            {step >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-950/40 p-6 rounded-lg border-2 border-purple-500"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">1</div>
                  <h3 className="text-xl font-bold">User Breathes Into Device</h3>
                </div>
                <p className="text-slate-300 mb-3">Saliva particles containing DNA markers hit nano-sensors</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-purple-900/40 p-3 rounded">
                    <p className="text-purple-400 font-semibold">Collection Time</p>
                    <p className="text-2xl font-bold">2 seconds</p>
                  </div>
                  <div className="bg-purple-900/40 p-3 rounded">
                    <p className="text-purple-400 font-semibold">DNA Markers</p>
                    <p className="text-2xl font-bold">24 unique</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 2: Processing */}
          <AnimatePresence>
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-950/40 p-6 rounded-lg border-2 border-blue-500"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">2</div>
                  <h3 className="text-xl font-bold">Extracting DNA Signature</h3>
                </div>
                <div className="bg-blue-900/40 p-4 rounded mb-3">
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Processing...</span>
                      <span>{dnaProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <motion.div 
                        className="bg-blue-500 h-3 rounded-full"
                        animate={{ width: `${dnaProgress}%` }}
                      />
                    </div>
                  </div>
                  {dnaProgress === 100 && (
                    <p className="text-green-400 font-semibold">✓ DNA Profile Extracted</p>
                  )}
                </div>
                <div className="text-sm space-y-1">
                  <p>✓ Saliva particles collected (0.5s)</p>
                  <p>✓ DNA markers isolated (1.0s)</p>
                  <p>✓ Genetic signature identified (1.5s)</p>
                  <p className="text-blue-400 font-semibold">✓ Unique DNA profile ready (2.0s)</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: Hashing */}
          <AnimatePresence>
            {step >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-950/40 p-6 rounded-lg border-2 border-green-500"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center font-bold">3</div>
                  <h3 className="text-xl font-bold">Creating Cryptographic Hash</h3>
                </div>
                
                {/* Raw DNA - Discarded */}
                <div className="bg-red-900/40 p-4 rounded-lg border-2 border-red-500 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-red-400 font-semibold">RAW DNA SEQUENCE</p>
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <p className="text-xs font-mono text-slate-600 line-through break-all mb-2">
                    {dnaSequence}...
                  </p>
                  <p className="text-sm text-red-400">⚠️ DISCARDED FROM MEMORY IMMEDIATELY</p>
                </div>

                <div className="flex items-center justify-center mb-4">
                  <ArrowRight className="h-8 w-8 text-green-400" />
                  <span className="mx-2 font-semibold">SHA-256 HASHING</span>
                  <ArrowRight className="h-8 w-8 text-green-400" />
                </div>

                {/* Hash - Stored */}
                <div className="bg-green-900/40 p-4 rounded-lg border-2 border-green-500">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-green-400 font-semibold">CRYPTOGRAPHIC HASH</p>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-xs font-mono text-green-300 break-all mb-2">
                    {dnaHash}...
                  </p>
                  <p className="text-sm text-green-400">✓ ONE-WAY FUNCTION - CANNOT BE REVERSED</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 4: Encryption */}
          <AnimatePresence>
            {step >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-orange-950/40 p-6 rounded-lg border-2 border-orange-500"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center font-bold">4</div>
                  <h3 className="text-xl font-bold">Encrypted Transmission to Cloud</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900 p-4 rounded text-center border border-blue-500/50">
                    <Lock className="h-10 w-10 mx-auto mb-2 text-blue-400" />
                    <p className="font-semibold text-sm">AES-256-GCM</p>
                    <p className="text-xs text-slate-400">Military-grade</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded text-center border border-purple-500/50">
                    <Shield className="h-10 w-10 mx-auto mb-2 text-purple-400" />
                    <p className="font-semibold text-sm">TLS 1.3</p>
                    <p className="text-xs text-slate-400">Secure tunnel</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded text-center border border-green-500/50">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-400" />
                    <p className="font-semibold text-sm">Zero-Knowledge</p>
                    <p className="text-xs text-slate-400">Never exposed</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 5: Complete */}
          <AnimatePresence>
            {step >= 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-green-950/50 to-blue-950/50 p-8 rounded-lg border-2 border-green-500"
              >
                <div className="text-center">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-400" />
                  <h3 className="text-3xl font-bold text-green-400 mb-4">Registration Complete!</h3>
                  <div className="grid grid-cols-3 gap-4 text-left">
                    <div>
                      <p className="text-sm text-slate-400">Total Time</p>
                      <p className="text-2xl font-bold text-blue-400">3 seconds</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">DNA Stored?</p>
                      <p className="text-2xl font-bold text-red-400">NO</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Hash Stored?</p>
                      <p className="text-2xl font-bold text-green-400">YES</p>
                    </div>
                  </div>
                  <div className="mt-6 bg-blue-900/40 p-4 rounded">
                    <p className="text-sm text-blue-300">
                      <strong>Your DNA is safe:</strong> Only an irreversible mathematical fingerprint is stored. 
                      Even if our database is breached, your genetic information cannot be reconstructed.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}