import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, AlertTriangle, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function RealTimeThreatDetector({ logs, alerts, onThreatClick }) {
    const [liveThreats, setLiveThreats] = useState([]);
    const [detectionCount, setDetectionCount] = useState(0);

    useEffect(() => {
        const recentThreats = logs
            .filter(log => log.threat_level !== 'none' && log.threat_level !== 'low')
            .slice(0, 10)
            .map(log => ({
                id: log.id,
                type: log.event_type,
                severity: log.threat_level,
                ip: log.ip_address,
                timestamp: log.created_date,
                details: log.details
            }));

        if (recentThreats.length > liveThreats.length) {
            setDetectionCount(prev => prev + 1);
            toast.error('New threat detected!', { duration: 3000 });
        }

        setLiveThreats(recentThreats);
    }, [logs]);

    const getSeverityColor = (severity) => {
        const colors = {
            critical: 'bg-red-600',
            high: 'bg-orange-500',
            medium: 'bg-yellow-500',
            low: 'bg-blue-500'
        };
        return colors[severity] || 'bg-gray-500';
    };

    const getSeverityIcon = (severity) => {
        if (severity === 'critical') return AlertTriangle;
        if (severity === 'high') return Zap;
        return Shield;
    };

    return (
        <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Activity className="w-5 h-5 text-red-400 animate-pulse" />
                        Real-Time Threat Detection
                    </CardTitle>
                    <div className="flex items-center gap-4">
                        <Badge className="bg-red-600">
                            {alerts.length} Active Alerts
                        </Badge>
                        <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                            {detectionCount} Detections
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-red-900/50">
                        <div className="text-sm text-slate-400 mb-1">Critical</div>
                        <div className="text-2xl font-bold text-red-400">
                            {liveThreats.filter(t => t.severity === 'critical').length}
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-orange-900/50">
                        <div className="text-sm text-slate-400 mb-1">High</div>
                        <div className="text-2xl font-bold text-orange-400">
                            {liveThreats.filter(t => t.severity === 'high').length}
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-yellow-900/50">
                        <div className="text-sm text-slate-400 mb-1">Medium</div>
                        <div className="text-2xl font-bold text-yellow-400">
                            {liveThreats.filter(t => t.severity === 'medium').length}
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-900/50">
                        <div className="text-sm text-slate-400 mb-1">Blocked</div>
                        <div className="text-2xl font-bold text-cyan-400">
                            {detectionCount}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Live Threat Stream</h4>
                    <AnimatePresence>
                        {liveThreats.map((threat, index) => {
                            const Icon = getSeverityIcon(threat.severity);
                            return (
                                <motion.div
                                    key={threat.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 cursor-pointer"
                                    onClick={() => onThreatClick && onThreatClick(threat)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${getSeverityColor(threat.severity)}`}>
                                            <Icon className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-white">{threat.type}</span>
                                                <Badge className={getSeverityColor(threat.severity)}>
                                                    {threat.severity}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-slate-400">
                                                IP: {threat.ip || 'Unknown'} • {new Date(threat.timestamp).toLocaleString()}
                                            </div>
                                            {threat.details && (
                                                <div className="text-xs text-slate-500 mt-1">{threat.details}</div>
                                            )}
                                        </div>
                                        <Button size="sm" variant="outline" className="text-xs">
                                            Investigate
                                        </Button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                <div className="mt-6 p-4 bg-cyan-950/20 border border-cyan-900/50 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-cyan-400 mb-1">AI Protection Active</h4>
                            <p className="text-xs text-slate-400">
                                Neural network analyzing traffic patterns in real-time. Machine learning models 
                                continuously adapt to new attack vectors and improve detection accuracy.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}