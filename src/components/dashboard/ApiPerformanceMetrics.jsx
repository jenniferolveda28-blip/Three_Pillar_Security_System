import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ApiPerformanceMetrics({ universes, metrics, detailed = false }) {
    const performanceData = useMemo(() => {
        return universes.map(universe => {
            const universeMetrics = metrics.filter(m => m.universe_id === universe.id);
            
            const avgLatency = universeMetrics.length > 0
                ? universeMetrics.reduce((sum, m) => sum + (m.latency_ms || 0), 0) / universeMetrics.length
                : 0;
            
            const errorRate = universeMetrics.length > 0
                ? (universeMetrics.filter(m => !m.success).length / universeMetrics.length) * 100
                : 0;
            
            const uptime = universe.success_rate || 100;
            
            const recentMetrics = universeMetrics.slice(0, 20).reverse().map((m, i) => ({
                time: i,
                latency: m.latency_ms || 0
            }));

            return {
                id: universe.id,
                name: universe.name,
                avgLatency: Math.round(avgLatency),
                errorRate: errorRate.toFixed(2),
                uptime: uptime.toFixed(1),
                totalRequests: universeMetrics.length,
                status: universe.status,
                recentMetrics
            };
        });
    }, [universes, metrics]);

    const getLatencyColor = (latency) => {
        if (latency < 100) return 'text-green-500';
        if (latency < 300) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            active: { variant: 'default', color: 'bg-green-500', text: 'Active' },
            degraded: { variant: 'secondary', color: 'bg-yellow-500', text: 'Degraded' },
            offline: { variant: 'destructive', color: 'bg-red-500', text: 'Offline' }
        };
        return statusMap[status] || statusMap.active;
    };

    if (!detailed) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {performanceData.map(data => {
                    const statusInfo = getStatusBadge(data.status);
                    return (
                        <Card key={data.id} className="bg-slate-900/50 border-slate-700">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg text-white">{data.name}</CardTitle>
                                    <Badge className={statusInfo.color}>{statusInfo.text}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Clock className="w-4 h-4" />
                                        Avg Latency
                                    </div>
                                    <span className={`font-bold ${getLatencyColor(data.avgLatency)}`}>
                                        {data.avgLatency}ms
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <AlertTriangle className="w-4 h-4" />
                                        Error Rate
                                    </div>
                                    <span className="font-bold text-slate-300">{data.errorRate}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <CheckCircle className="w-4 h-4" />
                                        Uptime
                                    </div>
                                    <span className="font-bold text-green-400">{data.uptime}%</span>
                                </div>
                                <div className="pt-2 border-t border-slate-700">
                                    <div className="text-xs text-slate-500">
                                        {data.totalRequests} requests monitored
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {performanceData.map(data => {
                const statusInfo = getStatusBadge(data.status);
                return (
                    <Card key={data.id} className="bg-slate-900/50 border-slate-700">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl text-white">{data.name}</CardTitle>
                                <Badge className={statusInfo.color}>{statusInfo.text}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                    <div className="text-sm text-slate-400 mb-1">Avg Latency</div>
                                    <div className={`text-2xl font-bold ${getLatencyColor(data.avgLatency)}`}>
                                        {data.avgLatency}ms
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                    <div className="text-sm text-slate-400 mb-1">Error Rate</div>
                                    <div className="text-2xl font-bold text-slate-300">{data.errorRate}%</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                    <div className="text-sm text-slate-400 mb-1">Uptime</div>
                                    <div className="text-2xl font-bold text-green-400">{data.uptime}%</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                    <div className="text-sm text-slate-400 mb-1">Total Requests</div>
                                    <div className="text-2xl font-bold text-cyan-400">{data.totalRequests}</div>
                                </div>
                            </div>

                            {data.recentMetrics.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Latency Trend (Last 20 Requests)</h4>
                                    <ResponsiveContainer width="100%" height={150}>
                                        <LineChart data={data.recentMetrics}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="time" stroke="#64748b" />
                                            <YAxis stroke="#64748b" />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                                                labelStyle={{ color: '#cbd5e1' }}
                                            />
                                            <Line type="monotone" dataKey="latency" stroke="#06b6d4" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}