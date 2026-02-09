import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Play, Pause, RotateCcw, Package, DollarSign, Clock, Zap, AlertTriangle, CheckCircle2, XCircle, Dna, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function TokenReplacementDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [tokenSerial, setTokenSerial] = useState('');
  const [reportedToken, setReportedToken] = useState(null);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= 4) {
          setIsPlaying(false);
          return 4;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (step === 1) {
      // Fast countdown for revocation
      const countdown = setInterval(() => {
        setTimer(prev => {
          if (prev >= 1000) {
            clearInterval(countdown);
            return 1000;
          }
          return prev + 100;
        });
      }, 10);

      return () => clearInterval(countdown);
    }
  }, [step]);

  const reset = () => {
    setIsPlaying(false);
    setStep(0);
    setTimer(0);
    setReportedToken(null);
  };

  const reportLostToken = () => {
    const serial = tokenSerial || 'BIOVERIFY-8472-ALPHA';
    setReportedToken(serial);
    toast.success('Token reported lost', {
      description: `Serial ${serial} has been revoked globally`
    });
    setIsPlaying(true);
  };

  return (
    <Card className="bg-slate-900/50 border-green-500">
      <CardHeader>
        <CardTitle className="text-3xl flex items-center gap-3">
          <Package className="h-8 w-8 text-green-500" />
          Live Demo: Token Replacement Process
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Interactive Controls */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setIsPlaying(!isPlaying)} 
                      className={isPlaying ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}
                    >
                      {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                      {isPlaying ? 'Pause' : 'Start Replacement Process'}
                    </Button>
                    <Button onClick={reset} variant="outline">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                  <div className="text-sm text-slate-400">
                    Step {step} of 4
                  </div>
                </div>

                {/* Interactive Token Reporting */}
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-sm text-slate-400 mb-3 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Report your lost token by entering its serial number
                  </p>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter token serial (e.g., BIOVERIFY-XXXX-XXXX)"
                      value={tokenSerial}
                      onChange={(e) => setTokenSerial(e.target.value)}
                      className="flex-1 font-mono"
                    />
                    <Button onClick={reportLostToken} className="bg-red-600 hover:bg-red-700">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Report Lost
                    </Button>
                  </div>
                  {reportedToken && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-red-950/40 border border-red-500 rounded-lg"
                    >
                      <p className="text-sm text-red-400">
                        <strong>Token Revoked:</strong> {reportedToken} is now permanently disabled
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Overview */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-green-950/40 border-2 border-green-500">
              <CardContent className="pt-6 text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-3 text-green-400" />
                <p className="text-sm text-slate-400 mb-1">Replacement Cost</p>
                <p className="text-4xl font-bold text-green-400 mb-1">$29.99</p>
                <p className="text-xs text-green-400">✓ One-time fee only</p>
              </CardContent>
            </Card>

            <Card className="bg-blue-950/40 border-2 border-blue-500">
              <CardContent className="pt-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-3 text-blue-400" />
                <p className="text-sm text-slate-400 mb-1">Shipping Time</p>
                <p className="text-4xl font-bold text-blue-400 mb-1">2-3</p>
                <p className="text-xs text-slate-400">business days</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-950/40 border-2 border-purple-500">
              <CardContent className="pt-6 text-center">
                <Zap className="h-12 w-12 mx-auto mb-3 text-purple-400" />
                <p className="text-sm text-slate-400 mb-1">Re-activation</p>
                <p className="text-4xl font-bold text-purple-400 mb-1">30s</p>
                <p className="text-xs text-purple-400">✓ One breath</p>
              </CardContent>
            </Card>
          </div>

          {/* Step 1: Report Lost */}
          <AnimatePresence>
            {step >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-950/40 p-6 rounded-lg border-2 border-red-500"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="h-7 w-7 text-red-400" />
                      <h3 className="text-2xl font-bold">Report Lost Token</h3>
                    </div>
                    <p className="text-slate-300 mb-4">
                      User logs in from any device → Clicks "Report Lost Token" → Enters serial: <span className="font-mono text-red-400">BIOVERIFY-8472-ALPHA</span>
                    </p>
                    
                    <div className="bg-red-900/40 p-4 rounded border border-red-500/50">
                      <p className="text-sm font-semibold text-red-300 mb-3">
                        ⚡ What Happens in &lt;1 Second: ({(timer / 1000).toFixed(1)}s)
                      </p>
                      <div className="space-y-2 text-sm">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: timer >= 250 ? 1 : 0 }}
                        >
                          ✓ Old token serial revoked globally
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: timer >= 500 ? 1 : 0 }}
                        >
                          ✓ Device becomes non-functional (paperweight)
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: timer >= 750 ? 1 : 0 }}
                        >
                          ✓ All active sessions terminated
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: timer >= 1000 ? 1 : 0 }}
                          className="text-red-400 font-semibold"
                        >
                          ✓ Zero window for unauthorized access
                        </motion.p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 2: Order Replacement */}
          <AnimatePresence>
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-950/40 p-6 rounded-lg border-2 border-blue-500"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Package className="h-7 w-7 text-blue-400" />
                      <h3 className="text-2xl font-bold">Order Replacement ($29.99)</h3>
                    </div>
                    <p className="text-slate-300 mb-4">
                      New BioVerify token ships within 24 hours. New serial: <span className="font-mono text-blue-400">BIOVERIFY-9153-BETA</span>
                    </p>
                    
                    <div className="bg-blue-900/40 p-4 rounded border border-blue-500/50">
                      <p className="text-sm font-semibold text-blue-300 mb-2">💎 Key Point - No DNA Resubmission:</p>
                      <p className="text-sm">
                        Your DNA hash remains securely stored in the cloud. The new token just needs to verify 
                        you're the same person—<strong className="text-blue-400">one breath, instant match</strong>. 
                        No biological samples need to be resubmitted or shipped.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: Receive & Activate */}
          <AnimatePresence>
            {step >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-950/40 p-6 rounded-lg border-2 border-green-500"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Dna className="h-7 w-7 text-green-400 animate-pulse" />
                      <h3 className="text-2xl font-bold">Receive & Activate (2-3 Days)</h3>
                    </div>
                    <p className="text-slate-300 mb-4">
                      New token arrives → Open app → "Activate Replacement Token" → Blow once into breathalyzer
                    </p>
                    
                    <div className="bg-green-900/40 p-4 rounded border border-green-500/50">
                      <p className="text-sm font-semibold text-green-300 mb-2">🔐 How DNA Verification Works:</p>
                      <ol className="text-sm space-y-1">
                        <li>1. New device generates fresh DNA hash from your breath</li>
                        <li>2. System compares new hash to stored hash from original registration</li>
                        <li>3. Match confidence: 99.8% → Identity confirmed</li>
                        <li>4. New token linked to your account (30 seconds total)</li>
                      </ol>
                      <p className="text-sm text-green-400 font-semibold mt-3">
                        ✓ Your DNA is in data form (encrypted hash) in the cloud—not in the physical token
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 4: Full Access Restored */}
          <AnimatePresence>
            {step >= 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-purple-950/50 to-green-950/50 p-8 rounded-lg border-2 border-purple-500"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="h-10 w-10 text-purple-400" />
                      <h3 className="text-3xl font-bold text-purple-400">Full Access Restored!</h3>
                    </div>
                    <p className="text-slate-300 mb-4 text-lg">
                      All linked accounts immediately accessible: Google, Microsoft, banking, healthcare, government IDs
                    </p>
                    
                    <div className="bg-purple-900/40 p-5 rounded border border-purple-500/50">
                      <p className="text-sm font-semibold text-purple-300 mb-3">✨ User Experience:</p>
                      <ul className="text-sm space-y-2">
                        <li>✓ Zero passwords to reset</li>
                        <li>✓ Zero recovery emails needed</li>
                        <li>✓ Zero security questions</li>
                        <li>✓ Zero data loss or configuration changes</li>
                        <li className="text-purple-400 font-semibold text-base">✓ Your biological identity is the master key</li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mt-4">
                      <div className="bg-slate-900 p-3 rounded text-center">
                        <p className="text-xs text-slate-400 mb-1">Total Cost</p>
                        <p className="text-xl font-bold text-green-400">$29.99</p>
                      </div>
                      <div className="bg-slate-900 p-3 rounded text-center">
                        <p className="text-xs text-slate-400 mb-1">Downtime</p>
                        <p className="text-xl font-bold text-blue-400">2-3 days</p>
                      </div>
                      <div className="bg-slate-900 p-3 rounded text-center">
                        <p className="text-xs text-slate-400 mb-1">Setup Time</p>
                        <p className="text-xl font-bold text-purple-400">30 sec</p>
                      </div>
                      <div className="bg-slate-900 p-3 rounded text-center">
                        <p className="text-xs text-slate-400 mb-1">DNA Resubmit</p>
                        <p className="text-xl font-bold text-red-400">NO</p>
                      </div>
                    </div>
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