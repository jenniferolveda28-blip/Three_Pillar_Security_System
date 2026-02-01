import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Globe, Zap, Activity } from "lucide-react";

export default function ApiUsageAnalytics() {
  const { data: events = [] } = useQuery({
    queryKey: ['analyticsEvents', 'api_call'],
    queryFn: () => base44.entities.AnalyticsEvent.filter({ event_category: 'api_call' }, '-created_date', 500),
  });

  const { data: universes = [] } = useQuery({
    queryKey: ['universes'],
    queryFn: () => base44.entities.Universe.list('-created_date'),
  });

  // Calculate statistics
  const totalCalls = events.length;
  const successCalls = events.filter(e => e.status === 'success').length;
  const failedCalls = events.filter(e => e.status === 'failure' || e.status === 'error').length;
  const avgLatency = events.length > 0 
    ? (events.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / events.length).toFixed(2)
    : 0;

  // Usage by universe
  const usageByUniverse = universes.map(u => ({
    name: u.name,
    calls: events.filter(e => e.universe_id === u.id).length,
    success: events.filter(e => e.universe_id === u.id && e.status === 'success').length,
    failed: events.filter(e => e.universe_id === u.id && e.status !== 'success').length
  }));

  // Hourly usage pattern
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourCalls = events.filter(e => {
      const eventHour = new Date(e.created_date).getHours();
      return eventHour === hour;
    });
    return {
      hour: `${hour}:00`,
      calls: hourCalls.length,
      success: hourCalls.filter(e => e.status === 'success').length
    };
  });

  // Status distribution
  const statusData = [
    { name: 'Success', value: successCalls, color: '#10b981' },
    { name: 'Failed', value: failedCalls, color: '#ef4444' },
  ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total API Calls</p>
                <p className="text-3xl font-bold text-blue-600">{totalCalls}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-green-600">
                  {totalCalls > 0 ? ((successCalls / totalCalls) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed Calls</p>
                <p className="text-3xl font-bold text-red-600">{failedCalls}</p>
              </div>
              <Zap className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Latency</p>
                <p className="text-3xl font-bold text-purple-600">{avgLatency}ms</p>
              </div>
              <Globe className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Calls by Universe</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageByUniverse}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="success" fill="#10b981" name="Success" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success vs Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>24-Hour Usage Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={2} name="Total Calls" />
              <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} name="Successful" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}