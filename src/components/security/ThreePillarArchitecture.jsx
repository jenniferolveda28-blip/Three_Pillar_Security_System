import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Globe, Lock, ArrowRight, CheckCircle, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function ThreePillarArchitecture() {
    const [activeFlow, setActiveFlow] = useState(0);
    const [scrambleCount, setScrambleCount] = useState(0);

    // Simulate scrambling every 100ms
    useEffect(() => {
        const interval = setInterval(() => {
            setScrambleCount(prev => prev + 1);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // Cycle through flow steps
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFlow(prev => (prev + 1) % 4);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const pillars = [
        {
            id: 'bioverify',
            name: 'BioVerify',
            subtitle: 'DNA Authentication',
            icon: Shield,
            color: 'from-cyan-500 to-blue-600',
            borderColor: 'border-cyan-500',
            glowColor: 'shadow-cyan-500/50',
            description: 'WHO YOU ARE',
            details: ['DNA verification', 'Hardware tokens', 'Continuous auth', 'Multi-biometric']
        },
        {
            id: 'forgedapi',
            name: 'Forged API',
            subtitle: 'Universal Gateway',
            icon: Globe,
            color: 'from-emerald-500 to-green-600',
            borderColor: 'border-emerald-500',
            glowColor: 'shadow-emerald-500/50',
            description: 'WHAT YOU ACCESS',
            details: ['AI routing', 'Key encryption', 'Auto-fallback', 'Rate limiting']
        },
        {
            id: 'ipshield',
            name: 'IP Shield',
            subtitle: 'Dynamic Scrambling',
            icon: Zap,
            color: 'from-violet-500 to-purple-600',
            borderColor: 'border-violet-500',
            glowColor: 'shadow-violet-500/50',
            description: 'HOW YOU\'RE PROTECTED',
            details: ['100ms scramble', 'Key rotation', 'Path shifting', 'Piranha defense']
        }
    ];

    const flowSteps = [
        { step: 1, text: 'DNA token inserted', pillar: 'bioverify' },
        { step: 2, text: 'Identity verified', pillar: 'bioverify' },
        { step: 3, text: 'Request routed to API', pillar: 'forgedapi' },
        { step: 4, text: 'Shield scrambling active', pillar: 'ipshield' }
    ];

    return (
        <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Lock className="w-6 h-6 text-cyan-400" />
                        <span className="gradient-text">The Key to the City: Three-Pillar Architecture</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Three Pillars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pillars.map((pillar, index) => {
                            const Icon = pillar.icon;
                            const isActive = flowSteps[activeFlow]?.pillar === pillar.id;
                            
                            return (
                                <motion.div
                                    key={pillar.id}
                                    animate={{
                                        scale: isActive ? 1.05 : 1,
                                        opacity: isActive ? 1 : 0.8
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="relative"
                                >
                                    <Card className={`bg-slate-900/80 border-2 ${pillar.borderColor} ${isActive ? pillar.glowColor + ' shadow-2xl' : ''}`}>
                                        <CardContent className="p-6 space-y-4">
                                            <div className={`p-4 bg-gradient-to-br ${pillar.color} rounded-xl ${pillar.glowColor} shadow-lg w-fit`}>
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                            
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{pillar.name}</h3>
                                                <p className="text-sm text-slate-400">{pillar.subtitle}</p>
                                            </div>

                                            <div className="py-2 px-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                                <p className="text-xs font-semibold text-cyan-400">{pillar.description}</p>
                                            </div>

                                            <ul className="space-y-2">
                                                {pillar.details.map((detail, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                        {detail}
                                                    </li>
                                                ))}
                                            </ul>

                                            {pillar.id === 'ipshield' && (
                                                <div className="pt-2 border-t border-slate-700">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-slate-400">Scrambles:</span>
                                                        <motion.span 
                                                            key={scrambleCount}
                                                            initial={{ scale: 1.2, color: '#a78bfa' }}
                                                            animate={{ scale: 1, color: '#cbd5e1' }}
                                                            className="font-mono font-bold"
                                                        >
                                                            {scrambleCount.toLocaleString()}
                                                        </motion.span>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Flow Visualization */}
                    <Card className="bg-slate-900/50 border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-cyan-400" />
                                    Access Flow
                                </h4>
                                <span className="text-xs text-slate-400">Live simulation</span>
                            </div>

                            <div className="space-y-3">
                                {flowSteps.map((flow, index) => (
                                    <motion.div
                                        key={index}
                                        animate={{
                                            backgroundColor: activeFlow === index ? 'rgba(6, 182, 212, 0.1)' : 'rgba(15, 23, 42, 0.5)',
                                            borderColor: activeFlow === index ? '#06b6d4' : '#334155'
                                        }}
                                        className="flex items-center gap-4 p-4 rounded-lg border-2"
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                            activeFlow === index 
                                                ? 'bg-cyan-500 text-white' 
                                                : 'bg-slate-700 text-slate-400'
                                        }`}>
                                            {flow.step}
                                        </div>
                                        
                                        <p className={`flex-1 ${
                                            activeFlow === index ? 'text-white font-semibold' : 'text-slate-400'
                                        }`}>
                                            {flow.text}
                                        </p>

                                        <ArrowRight className={`w-5 h-5 ${
                                            activeFlow === index ? 'text-cyan-400' : 'text-slate-600'
                                        }`} />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Attack Scenario */}
                            <div className="mt-6 p-4 bg-red-950/20 border-2 border-red-900/50 rounded-lg">
                                <h5 className="text-sm font-semibold text-red-400 mb-2">🚨 Hacker Attack Scenario</h5>
                                <div className="space-y-1 text-xs text-slate-300">
                                    <p>• 0.00s: Hacker intercepts API call</p>
                                    <p>• 0.05s: Hacker analyzes encryption</p>
                                    <p>• 0.10s: <span className="text-violet-400 font-semibold">IP Shield scrambles</span> - pattern changed</p>
                                    <p>• 0.15s: <span className="text-cyan-400 font-semibold">BioVerify fails</span> - DNA mismatch</p>
                                    <p>• 0.20s: <span className="text-violet-400 font-semibold">IP Shield scrambles again</span> - code path shifted</p>
                                    <p className="text-red-400 font-semibold pt-2">→ Attack failed. System logged. Criminal alert triggered.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary */}
                    <Card className="bg-gradient-to-r from-cyan-950/50 to-violet-950/50 border-2 border-cyan-500/30">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <Lock className="w-12 h-12 text-cyan-400 flex-shrink-0" />
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-2">The Unbreakable Trinity</h4>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        Your DNA unlocks the universal gateway (BioVerify → Forged API), and the gateway exists 
                                        in a state of constant quantum flux every 100 milliseconds (IP Shield). Unauthorized access 
                                        is mathematically impossible—the system changes faster than any hacker can react.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
}