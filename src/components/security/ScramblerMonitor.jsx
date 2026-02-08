import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, Zap, Activity, Lock, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const scramblerIcons = {
    api_keys: Lock,
    data_paths: Activity,
    execution_sequence: Zap,
    encryption_layer: Shield,
    full_system: RefreshCw
};

const scramblerLabels = {
    api_keys: "API Key Scrambler",
    data_paths: "Data Path Obfuscator",
    execution_sequence: "Execution Randomizer",
    encryption_layer: "Encryption Rotator",
    full_system: "Full System Scrambler"
};

export default function ScramblerMonitor() {
    const [autoScramble, setAutoScramble] = useState(true);
    const queryClient = useQueryClient();

    const { data: sessions = [] } = useQuery({
        queryKey: ['scramblingSessions'],
        queryFn: () => base44.entities.ScramblingSession.filter({ status: 'active' }),
        refetchInterval: 2000
    });

    const scrambleMutation = useMutation({
        mutationFn: () => base44.functions.invoke('scrambleSystem', {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scramblingSessions'] });
            toast.success('System scrambled successfully');
        },
        onError: (error) => {
            toast.error('Scrambling failed: ' + error.message);
        }
    });

    // Auto-scramble every 0.1 seconds
    useEffect(() => {
        if (!autoScramble) return;

        const interval = setInterval(() => {
            scrambleMutation.mutate();
        }, 100);

        return () => clearInterval(interval);
    }, [autoScramble]);

    const totalIterations = sessions.reduce((sum, s) => sum + s.iterations, 0);
    const avgProtection = sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + s.protection_score, 0) / sessions.length 
        : 0;

    return (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <RefreshCw className={`h-5 w-5 text-purple-600 ${autoScramble ? 'animate-spin' : ''}`} />
                        <CardTitle>Dynamic Scrambling System</CardTitle>
                    </div>
                    <Badge variant={autoScramble ? "default" : "outline"} className="bg-purple-600">
                        {autoScramble ? "ACTIVE" : "PAUSED"}
                    </Badge>
                </div>
                <CardDescription>
                    Continuous code & data scrambling - Making the system an unpredictable moving target
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overall Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600">{totalIterations}</div>
                        <div className="text-xs text-gray-600">Total Scrambles</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600">{sessions.length}</div>
                        <div className="text-xs text-gray-600">Active Layers</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600">{Math.round(avgProtection)}%</div>
                        <div className="text-xs text-gray-600">Protection</div>
                    </div>
                </div>

                {/* Scrambler Layers */}
                <div className="space-y-3">
                    {sessions.map((session) => {
                        const Icon = scramblerIcons[session.scramble_type];
                        const label = scramblerLabels[session.scramble_type];
                        
                        return (
                            <div key={session.id} className="bg-white rounded-lg p-4 border border-purple-200">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Icon className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm">{label}</div>
                                            <div className="text-xs text-gray-500">
                                                {session.iterations} iterations • Every {session.scramble_interval_seconds < 1 ? `${session.scramble_interval_seconds * 1000}ms` : `${session.scramble_interval_seconds}s`}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="border-green-500 text-green-700">
                                        SCRAMBLING
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600">Protection Score</span>
                                        <span className="font-semibold text-purple-600">{session.protection_score}%</span>
                                    </div>
                                    <Progress value={session.protection_score} className="h-2" />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Controls */}
                <div className="flex gap-3">
                    <Button 
                        onClick={() => setAutoScramble(!autoScramble)}
                        variant={autoScramble ? "outline" : "default"}
                        className="flex-1"
                    >
                        {autoScramble ? 'Pause' : 'Resume'} Auto-Scramble
                    </Button>
                    <Button 
                        onClick={() => scrambleMutation.mutate()}
                        disabled={scrambleMutation.isPending}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${scrambleMutation.isPending ? 'animate-spin' : ''}`} />
                        Scramble Now
                    </Button>
                </div>

                {/* Info */}
                <div className="bg-purple-100 rounded-lg p-4 text-xs text-purple-900">
                    <div className="font-semibold mb-1">🛡️ Piranha Pool Defense Active</div>
                    <div>
                        Like a pool of piranhas constantly reshaping the system, this scrambler continuously 
                        alters internal code paths, encryption keys, and execution sequences every 100 milliseconds, 
                        making it virtually impossible for any unauthorized access to succeed—faster than any hacker can react.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}