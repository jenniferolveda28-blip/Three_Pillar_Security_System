import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RotateCcw, Dna, Server, Shield, Activity, AlertTriangle, Eye, Zap, CheckCircle2, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ThreePillarIntegratedDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [activePillars, setActivePillars] = useState([]);
  const [scrambleCount, setScrambleCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState('jane');
  const [selectedApi, setSelectedApi] = useState('weather');

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= 8) {
          setIsPlaying(false);
          return 8;
        }
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    // Update active pillars based on step
    if (step === 1) setActivePillars(['BioVerify']);
    if (step === 2) setActivePillars(['BioVerify', 'Forged API']);
    if (step === 3) setActivePillars(['BioVerify', 'Forged API', 'IP Shield']);
    if (step >= 4) setActivePillars(['BioVerify', 'Forged API', 'IP Shield']);
  }, [step]);

  useEffect(() => {
    if (step >= 3) {
      // Simulate IP Shield scrambling
      const scrambleInterval = setInterval(() => {
        setScrambleCount(prev => prev + 1);
      }, 100);

      return () => clearInterval(scrambleInterval);
    }
  }, [step]);

  const reset = () => {
    setIsPlaying(false);
    setStep(0);
    setActivePillars([]);
    setScrambleCount(0);
  };

  const startCustomDemo = () => {
    const users = { jane: 'Jane Smith', john: 'John Doe', sarah: 'Sarah Johnson' };
    const apis = { weather: 'Weather Data', news: 'News Feed', stocks: 'Stock Prices' };
    
    toast.success(`Starting demo for ${users[selectedUser]}`, {
      description: `Requesting ${apis[selectedApi]} via Forged API`
    });
    setIsPlaying(true);
  };

  const steps = [
    {
      num: 1,
      title: "User Authenticates with DNA",
      description: "Jane blows into BioVerify token. DNA hash verified in 0.5s. Confidence: 99.8%",
      color: "blue",
      icon: Dna,
      pillar: "BioVerify"
    },
    {
      num: 2,
      title: "Request Enters Forged API",
      description: "Jane's app requests weather data. Forged API receives authenticated session token.",
      color: "purple",
      icon: Server,
      pillar: "Forged API"
    },
    {
      num: 3,
      title: "IP Shield Pre-Scramble",
      description: "All API keys rotated, encryption mutated, execution paths randomized.",
      color: "orange",
      icon: Shield,
      pillar: "IP Shield"
    },
    {
      num: 4,
      title: "AI Routes to Weather API",
      description: "AI analyzes intent, selects OpenWeather, retrieves scrambled key, executes request.",
      color: "green",
      icon: Activity,
      pillar: "All Systems"
    },
    {
      num: 5,
      title: "Attacker Intercepts Traffic",
      description: "Hacker at IP 203.45.78.91 intercepts network traffic, attempts replay attack.",
      color: "red",
      icon: AlertTriangle,
      pillar: "THREAT"
    },
    {
      num: 6,
      title: "AI Detects Attack Pattern",
      description: "450 req/sec from unusual IP. Correlates 4-stage APT. Confidence: 97%",
      color: "yellow",
      icon: Eye,
      pillar: "AI Analysis"
    },
    {
      num: 7,
      title: "IP Shield Neutralizes",
      description: "Next scramble (0.1s later): All data attacker gathered is obsolete. Attack fails.",
      color: "orange",
      icon: Zap,
      pillar: "Defense Active"
    },
    {
      num: 8,
      title: "Mission Complete",
      description: "Jane gets weather data (0.3s total). Attacker blocked. Zero data compromised.",
      color: "green",
      icon: CheckCircle2,
      pillar: "SUCCESS"
    }
  ];

  return (
    <Card className="bg-slate-900/50 border-purple-500">
      <CardHeader>
        <CardTitle className="text-3xl flex items-center gap-3">
          <Zap className="h-8 w-8 text-purple-500 animate-pulse" />
          Live Demo: All Three Pillars Working Together
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
                      className={isPlaying ? "bg-orange-600 hover:bg-orange-700" : "bg-purple-600 hover:bg-purple-700"}
                    >
                      {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                      {isPlaying ? 'Pause' : 'Start Integrated Demo'}
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

                {/* Custom Scenario Builder */}
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-sm text-slate-400 mb-3 flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    Customize the scenario: Choose user and API request
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400">Select User</label>
                      <Select value={selectedUser} onValueChange={setSelectedUser}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jane">Jane Smith</SelectItem>
                          <SelectItem value="john">John Doe</SelectItem>
                          <SelectItem value="sarah">Sarah Johnson</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400">Select API Request</label>
                      <Select value={selectedApi} onValueChange={setSelectedApi}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weather">Weather Data</SelectItem>
                          <SelectItem value="news">News Feed</SelectItem>
                          <SelectItem value="stocks">Stock Prices</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={startCustomDemo} className="w-full mt-3 bg-purple-600 hover:bg-purple-700">
                    <Zap className="mr-2 h-4 w-4" />
                    Run Custom Scenario
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Three Pillars Status */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              animate={{
                borderColor: activePillars.includes('BioVerify') ? 'rgb(59, 130, 246)' : 'rgb(71, 85, 105)',
                backgroundColor: activePillars.includes('BioVerify') ? 'rgba(30, 58, 138, 0.4)' : 'rgba(30, 41, 59, 1)'
              }}
              className="p-6 rounded-lg border-2 text-center"
            >
              <Dna className={`h-12 w-12 mx-auto mb-3 ${activePillars.includes('BioVerify') ? 'text-blue-400 animate-pulse' : 'text-slate-600'}`} />
              <h3 className="font-bold text-lg mb-1">BioVerify</h3>
              <p className="text-xs text-slate-400">DNA Authentication</p>
              {activePillars.includes('BioVerify') && (
                <Badge className="mt-3 bg-blue-600">ACTIVE</Badge>
              )}
            </motion.div>

            <motion.div
              animate={{
                borderColor: activePillars.includes('Forged API') ? 'rgb(168, 85, 247)' : 'rgb(71, 85, 105)',
                backgroundColor: activePillars.includes('Forged API') ? 'rgba(88, 28, 135, 0.4)' : 'rgba(30, 41, 59, 1)'
              }}
              className="p-6 rounded-lg border-2 text-center"
            >
              <Server className={`h-12 w-12 mx-auto mb-3 ${activePillars.includes('Forged API') ? 'text-purple-400 animate-pulse' : 'text-slate-600'}`} />
              <h3 className="font-bold text-lg mb-1">Forged API</h3>
              <p className="text-xs text-slate-400">Universal Gateway</p>
              {activePillars.includes('Forged API') && (
                <Badge className="mt-3 bg-purple-600">ACTIVE</Badge>
              )}
            </motion.div>

            <motion.div
              animate={{
                borderColor: activePillars.includes('IP Shield') ? 'rgb(249, 115, 22)' : 'rgb(71, 85, 105)',
                backgroundColor: activePillars.includes('IP Shield') ? 'rgba(124, 45, 18, 0.4)' : 'rgba(30, 41, 59, 1)'
              }}
              className="p-6 rounded-lg border-2 text-center"
            >
              <Shield className={`h-12 w-12 mx-auto mb-3 ${activePillars.includes('IP Shield') ? 'text-orange-400 animate-pulse' : 'text-slate-600'}`} />
              <h3 className="font-bold text-lg mb-1">IP Shield</h3>
              <p className="text-xs text-slate-400">Dynamic Scrambling</p>
              {activePillars.includes('IP Shield') && (
                <div className="mt-3">
                  <Badge className="bg-orange-600">ACTIVE</Badge>
                  <p className="text-xs text-orange-400 mt-2 font-bold">
                    {scrambleCount} scrambles
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* System Flow */}
          <div className="space-y-3">
            <AnimatePresence>
              {steps.map((item) => {
                const Icon = item.icon;
                const isActive = step >= item.num;
                const isCurrent = step === item.num;

                return (
                  <motion.div
                    key={item.num}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: isActive ? 1 : 0.3,
                      x: 0
                    }}
                    className={`p-5 rounded-lg border-2 transition-all ${
                      isActive 
                        ? `bg-${item.color}-950/40 border-${item.color}-500` 
                        : 'bg-slate-800 border-slate-700'
                    } ${isCurrent ? 'ring-4 ring-' + item.color + '-500/50 scale-105 shadow-2xl' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 ${
                        isActive ? `bg-${item.color}-600` : 'bg-slate-700'
                      } ${isCurrent ? 'animate-pulse' : ''}`}>
                        {item.num}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`h-7 w-7 ${isActive ? `text-${item.color}-400` : 'text-slate-600'}`} />
                          <h3 className="text-xl font-bold">{item.title}</h3>
                        </div>
                        <p className="text-slate-300 mb-2">{item.description}</p>
                        <Badge className={`${isActive ? `bg-${item.color}-600` : 'bg-slate-700'}`}>
                          {item.pillar}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Final Stats */}
          {step >= 8 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-950/50 to-blue-950/50 p-8 rounded-lg border-2 border-green-500"
            >
              <h3 className="text-2xl font-bold text-center mb-6 text-green-400">Attack Neutralized Successfully</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total Time</p>
                  <p className="text-3xl font-bold text-blue-400">0.3s</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Data Compromised</p>
                  <p className="text-3xl font-bold text-green-400">0 bytes</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">IP Shield Scrambles</p>
                  <p className="text-3xl font-bold text-orange-400">{scrambleCount}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">User Experience</p>
                  <p className="text-3xl font-bold text-purple-400">Seamless</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}