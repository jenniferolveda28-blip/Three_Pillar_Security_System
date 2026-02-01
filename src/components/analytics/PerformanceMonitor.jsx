import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Activity, Zap, AlertCircle, TrendingDown } from "lucide-react";

export default function PerformanceMonitor({ metrics = [], universes = [], timeRange }) {
  const latencyData = useMemo(() => {
    const grouped = {};
    metrics.forEach(m => {
      if (m.latency_ms) {
        const date = new Date(m.created_date);
        const hour = `${date.getHours()}:00`;
        if (!grouped[hour]) {
          grouped[hour] = { time: hour, total: 0, count: 0, max: 0, min: 999999 };
        }
        grouped[hour].total += m.latency_ms;
        grouped[hour].count++;
        grouped[hour].max = Math.max(grouped[hour].max, m.latency_ms);
        grouped[hour].min = Math.min(grouped[hour].min, m.latency_ms);
      }
    });
    return Object.values(grouped).map(g => ({
      ...g,
      avg: g.count > 0 ? (g.total / g.count).toFixed(0) : 0
    })).slice(-24);
  }, [metrics]);

  const universePerformance = useMemo(() => {
    const grouped = {};
    metrics.forEach(m => {
      if (m.universe_id && m.latency_ms) {
        if (!grouped[m.universe_id]) {
          const universe = universes.find(u => u.id === m.universe_id);
          grouped[m.universe_id] = { 
            name: universe?.name || 'Unknown', 
            total: 0,
            count: 0,
            errors: 0
          };
        }
        grouped[m.universe_id].total += m.latency_ms;
        grouped[m.universe_id].count++;
        if (!m.success) {
          grouped[m.universe_id].errors++;
        }
      }
    });
    return Object.values(grouped).map(g => ({
      ...g,
      avgLatency: g.count > 0 ? (g.total / g.count).toFixed(0) : 0,
      errorRate: g.count > 0 ? ((g.errors / g.count) * 100).toFixed(1) : 0
    }));
  }, [metrics, universes]);

  const errorData = useMemo(() => {
    const grouped = {};
    metrics.filter(m => !m.success).forEach(m => {
      const errorType = m.error_type || 'Unknown Error';
      grouped[errorType] = (grouped[errorType] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [metrics]);

  const avgLatency = metrics.length > 0
    ? (metrics.reduce((sum, m) => sum + (m.latency_ms || 0), 0) / metrics.length).toFixed(0)
    : 0;
  const maxLatency = metrics.length > 0
    ? Math.max(...metrics.map(m => m.latency_ms || 0))
    : 0;
  const errorCount = metrics.filter(m => !m.success).length;
  const errorRate = metrics.length > 0 ? ((errorCount / metrics.length) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Latency</p>
                <p className="text-3xl font-bold text-blue-600">{avgLatency}ms</p>
              </div>
              <Zap className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Max Latency</p>
                <p className="text-3xl font-bold text-orange-600">{maxLatency}ms</p>
              </div>
              <Activity className="w-10 h-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Errors</p>
                <p className="text-3xl font-bold text-red-600">{errorCount}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Error Rate</p>
                <p className="text-3xl font-bold text-purple-600">{errorRate}%</p>
              </div>
              <TrendingDown className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latency Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Latency Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2} name="Average" />
              <Line type="monotone" dataKey="max" stroke="#ef4444" strokeWidth={2} name="Maximum" />
              <Line type="monotone" dataKey="min" stroke="#10b981" strokeWidth={2} name="Minimum" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Universe Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Universe Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {universePerformance.map((universe, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{universe.name}</span>
                    <Badge variant={universe.avgLatency < 200 ? 'default' : 'destructive'}>
                      {universe.avgLatency}ms avg
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Requests: {universe.count}</div>
                    <div>Errors: {universe.errorRate}%</div>
                  </div>
                </div>
              ))}
              {universePerformance.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No performance data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Top Error Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={errorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}