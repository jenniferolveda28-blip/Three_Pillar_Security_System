import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Play, Pause, RotateCcw, AlertTriangle, Shield, Eye, Zap, CheckCircle2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function IllegalActivityDetectionDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [attackMetrics, setAttackMetrics] = useState({
    requestsPerSecond: 0,
    confidenceScore: 0,
    threatsBlocked: 0
  });
  const [customIp, setCustomIp] = useState('');
  const [simulatedAttack, setSimulatedAttack] = useState(null);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= 6) {
          setIsPlaying(false);
          return 6;
        }
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (step === 2) {
      // Simulate attack metrics ramping up
      const metricsInterval = setInterval(() => {
        setAttackMetrics(prev => ({
          requestsPerSecond: Math.min(prev.requestsPerSecond + 45, 450),
          confidenceScore: Math.min(prev.confidenceScore + 10, 98),
          threatsBlocked: prev.threatsBlocked
        }));
      }, 100);

      setTimeout(() => clearInterval(metricsInterval), 2000);
      return () => clearInterval(metricsInterval);
    }
    if (step === 5) {
      setAttackMetrics(prev => ({
        ...prev,
        threatsBlocked: prev.threatsBlocked + 1
      }));
    }
  }, [step]);

  const reset = () => {
    setIsPlaying(false);
    setStep(0);
    setAttackMetrics({ requestsPerSecond: 0, confidenceScore: 0, threatsBlocked: 0 });
    setSimulatedAttack(null);
  };

  const simulateCustomAttack = () => {
    const ip = customIp || '203.45.78.91';
    setSimulatedAttack({
      ip,
      timestamp: new Date().toISOString(),
      requestsPerSecond: Math.floor(Math.random() * 500) + 100,
      confidence: Math.floor(Math.random() * 30) + 70
    });
    toast.success(`Simulated attack from IP: ${ip}`, {
      description: 'Watch how the system responds in real-time'
    });
    setIsPlaying(true);
    setStep(1);
  };

  const steps = [
    {
      title: "Normal API Traffic",
      description: "User 'john@company.com' making 5 requests/min to /api/data",
      color: "green",
      icon: CheckCircle2,
      status: "normal"
    },
    {
      title: "Suspicious Activity Detected",
      description: "IP 203.45.78.91 suddenly making 450 requests/second",
      color: "yellow",
      icon: Eye,
      status: "warning"
    },
    {
      title: "AI Analyzing Behavior",
      description: "Pattern matches credential stuffing attack. 98% confidence.",
      color: "orange",
      icon: AlertTriangle,
      status: "analyzing"
    },
    {
      title: "Attack Chain Identified",
      description: "4-stage APT detected: Reconnaissance → Initial Access → Privilege Escalation → Data Exfiltration",
      color: "red",
      icon: AlertTriangle,
      status: "threat"
    },
    {
      title: "IP Shield Scrambling",
      description: "All API keys rotated, encryption mutated, execution paths randomized",
      color: "purple",
      icon: Shield,
      status: "defending"
    },
    {
      title: "Threat Neutralized",
      description: "IP blocked, sessions terminated, authorities notified. Attack failed in 0.15 seconds.",
      color: "green",
      icon: Zap,
      status: "secured"
    }
  ];

  return (
    <Card className="bg-slate-900/50 border-red-500">
      <CardHeader>
        <CardTitle className="text-3xl flex items-center gap-3">
          <Shield className="h-8 w-8 text-red-500" />
          Live Demo: API Illegal Activity Detection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Interactive Controls */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setIsPlaying(!isPlaying)} 
                      className={isPlaying ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}
                    >
                      {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                      {isPlaying ? 'Pause' : 'Start Demo'}
                    </Button>
                    <Button onClick={reset} variant="outline">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                  <div className="text-sm text-slate-400">
                    Step {step} of {steps.length}
                  </div>
                </div>

                {/* Custom Attack Simulation */}
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-sm text-slate-400 mb-3">Try it yourself: Simulate an attack from any IP</p>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter IP address (e.g., 192.168.1.1)"
                      value={customIp}
                      onChange={(e) => setCustomIp(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={simulateCustomAttack} className="bg-red-600 hover:bg-red-700">
                      <Upload className="mr-2 h-4 w-4" />
                      Simulate Attack
                    </Button>
                  </div>
                  {simulatedAttack && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-red-950/40 border border-red-500 rounded-lg"
                    >
                      <p className="text-sm text-red-400">
                        <strong>Attack Detected:</strong> {simulatedAttack.ip} | 
                        {simulatedAttack.requestsPerSecond} req/s | 
                        {simulatedAttack.confidence}% confidence
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <Card className={`${step >= 2 ? 'bg-red-950/40 border-red-500' : 'bg-slate-800 border-slate-700'} transition-all`}>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-slate-400 mb-2">Requests/Second</p>
                <p className={`text-4xl font-bold ${step >= 2 ? 'text-red-400' : 'text-green-400'}`}>
                  {attackMetrics.requestsPerSecond}
                </p>
              </CardContent>
            </Card>

            <Card className={`${step >= 3 ? 'bg-orange-950/40 border-orange-500' : 'bg-slate-800 border-slate-700'} transition-all`}>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-slate-400 mb-2">Threat Confidence</p>
                <p className={`text-4xl font-bold ${step >= 3 ? 'text-orange-400' : 'text-slate-600'}`}>
                  {attackMetrics.confidenceScore}%
                </p>
              </CardContent>
            </Card>

            <Card className={`${step >= 5 ? 'bg-green-950/40 border-green-500' : 'bg-slate-800 border-slate-700'} transition-all`}>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-slate-400 mb-2">Threats Blocked</p>
                <p className={`text-4xl font-bold ${step >= 5 ? 'text-green-400' : 'text-slate-600'}`}>
                  {attackMetrics.threatsBlocked}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <AnimatePresence>
              {steps.map((item, idx) => {
                const Icon = item.icon;
                const isActive = step >= idx;
                const isCurrent = step === idx;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: isActive ? 1 : 0.3,
                      x: 0
                    }}
                    className={`p-5 rounded-lg border-2 transition-all ${
                      isActive 
                        ? `bg-${item.color}-950/40 border-${item.color}-500` 
                        : 'bg-slate-800 border-slate-700'
                    } ${isCurrent ? 'ring-4 ring-' + item.color + '-500/50 scale-105' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive ? `bg-${item.color}-600` : 'bg-slate-700'
                      } ${isCurrent ? 'animate-pulse' : ''}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold">{item.title}</h3>
                          <Badge className={`bg-${item.color}-600`}>
                            {item.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-slate-300">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Law Enforcement Integration */}
          {step >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-950/40 p-6 rounded-lg border-2 border-blue-500"
            >
              <h3 className="text-xl font-bold text-blue-400 mb-3">Law Enforcement Integration</h3>
              <div className="space-y-2 text-sm">
                <p>✓ Automated report sent to FBI IC3 cybercrime unit</p>
                <p>✓ Complete forensic trail preserved (IP, timestamps, attack patterns)</p>
                <p>✓ Evidence package ready for legal proceedings</p>
                <p>✓ Attacker IP added to global threat database</p>
                <p className="text-blue-400 font-semibold mt-3">
                  Total time from detection to law enforcement notification: 0.15 seconds
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}