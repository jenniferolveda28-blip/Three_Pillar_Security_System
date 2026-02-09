import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Database } from 'lucide-react';

export default function ResourceUtilizationChart({ universes, metrics }) {
    const chartData = useMemo(() => {
        return universes.map(universe => {
            const universeMetrics = metrics.filter(m => m.universe_id === universe.id);
            
            const requests = universeMetrics.length;
            const avgLatency = universeMetrics.length > 0
                ? universeMetrics.reduce((sum, m) => sum + (m.latency_ms || 0), 0) / universeMetrics.length
                : 0;
            const errors = universeMetrics.filter(m => !m.success).length;

            return {
                name: universe.name.length > 15 ? universe.name.substring(0, 15) + '...' : universe.name,
                requests,
                avgLatency: Math.round(avgLatency),
                errors
            };
        }).sort((a, b) => b.requests - a.requests);
    }, [universes, metrics]);

    return (
        <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Database className="w-5 h-5 text-emerald-400" />
                    Resource Utilization
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                            labelStyle={{ color: '#cbd5e1' }}
                        />
                        <Legend />
                        <Bar dataKey="requests" fill="#06b6d4" name="Total Requests" />
                        <Bar dataKey="errors" fill="#ef4444" name="Errors" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}