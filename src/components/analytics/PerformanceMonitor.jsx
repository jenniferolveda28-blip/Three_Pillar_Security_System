import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, Clock, Database, TrendingDown } from "lucide-react";

export default function PerformanceMonitor() {
  const { data: events = [] } = useQuery({
    queryKey: ['analyticsEvents'],
    queryFn: () => base44.entities.AnalyticsEvent.list('-created_date', 1000),
  });

  const { data: cacheEntries = [] } = useQuery({
    queryKey: ['apiCache'],
    queryFn: () => base44.entities.ApiCache.list('-hit_count', 100),
  });

  // Calculate statistics
  const avgLatency = events.length > 0 
    ? (events.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / events.length).toFixed(2)
    : 0;
  
  const maxLatency = events.length > 0 
    ? Math.max(...events.map(e => e.duration_ms || 0)).toFixed(2)
    : 0;

  const p95Latency = events.length > 0
    ? events.map(e => e.duration_ms || 0).sort((a, b) => a - b)[Math.floor(events.length * 0.95)]?.toFixed(2)
    : 0;

  const totalCacheHits = cacheEntries.reduce((sum, e) => sum + (e.hit_count || 0), 0);
  const cacheHitRate = events.length > 0 ? ((totalCacheHits / events.length) * 100).toFixed(1) : 0;

  const errorRate = events.length > 0 
    ? ((events.filter(e => e.status === 'error' || e.status === 'failure').length / events.length) * 100).toFixed(2)
    : 0;

  // Latency over time
  const last24Hours = Array.from({ length: 24 }, (_, hour) => {
    const hourEvents = events.filter(e => {
      const eventHour = new Date(e.created_date).getHours();
      return eventHour === hour;
    });
    const avgHourLatency = hourEvents.length > 0
      ? hourEvents.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / hourEvents.length
      : 0;
    return {
      hour: `${hour}:00`,
      latency: parseFloat(avgHourLatency.toFixed(2)),
      requests: hourEvents.length
    };
  });

  // Error distribution by category
  const errorsByCategory = {};
  events.filter(e => e.status === 'error' || e.status === 'failure').forEach(e => {
    errorsByCategory[e.event_category] = (errorsByCategory[e.event_category] || 0) + 1;
  });
  const errorData = Object.entries(errorsByCategory).map(([category, count]) => ({
    category: category.replace(/_/g, ' ').toUpperCase(),
    count
  }));

  // Data transfer stats
  const totalRequestSize = events.reduce((sum, e) => sum + (e.request_size_bytes || 0), 0);
  const totalResponseSize = events.reduce((sum, e) => sum + (e.response_size_bytes || 0), 0);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Latency</p>
                <p className="text-3xl font-bold text-blue-600">{avgLatency}ms</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">P95 Latency</p>
                <p className="text-3xl font-bold text-purple-600">{p95Latency}ms</p>
              </div>
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cache Hit Rate</p>
                <p className="text-3xl font-bold text-green-600">{cacheHitRate}%</p>
              </div>
              <Database className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Error Rate</p>
                <p className="text-3xl font-bold text-red-600">{errorRate}%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>24-Hour Latency & Request Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last24Hours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="latency" stroke="#6366f1" strokeWidth={2} name="Latency (ms)" />
              <Line yAxisId="right" type="monotone" dataKey="requests" stroke="#10b981" strokeWidth={2} name="Requests" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Errors by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {errorData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={errorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No errors detected
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Total Request Size</span>
                  <Badge variant="outline">{formatBytes(totalRequestSize)}</Badge>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Total Response Size</span>
                  <Badge variant="outline">{formatBytes(totalResponseSize)}</Badge>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{maxLatency}ms</p>
                    <p className="text-xs text-gray-600">Max Latency</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{totalCacheHits}</p>
                    <p className="text-xs text-gray-600">Cache Hits</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}