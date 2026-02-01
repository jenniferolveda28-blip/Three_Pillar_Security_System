import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Globe, Activity } from "lucide-react";

export default function ApiUsageChart({ metrics = [], universes = [], timeRange }) {
  const chartData = useMemo(() => {
    // Group by hour
    const grouped = {};
    metrics.forEach(m => {
      const date = new Date(m.created_date);
      const hour = `${date.getHours()}:00`;
      if (!grouped[hour]) {
        grouped[hour] = { time: hour, calls: 0, success: 0, failed: 0 };
      }
      grouped[hour].calls++;
      if (m.success) {
        grouped[hour].success++;
      } else {
        grouped[hour].failed++;
      }
    });
    return Object.values(grouped).slice(-24);
  }, [metrics]);

  const universeData = useMemo(() => {
    const grouped = {};
    metrics.forEach(m => {
      if (m.universe_id) {
        if (!grouped[m.universe_id]) {
          const universe = universes.find(u => u.id === m.universe_id);
          grouped[m.universe_id] = { 
            name: universe?.name || 'Unknown', 
            calls: 0 
          };
        }
        grouped[m.universe_id].calls++;
      }
    });
    return Object.values(grouped);
  }, [metrics, universes]);

  const methodData = useMemo(() => {
    const grouped = {};
    metrics.forEach(m => {
      const method = m.method || 'UNKNOWN';
      if (!grouped[method]) {
        grouped[method] = { name: method, value: 0 };
      }
      grouped[method].value++;
    });
    return Object.values(grouped);
  }, [metrics]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      {/* API Calls Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            API Calls Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={2} name="Total Calls" />
              <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} name="Successful" />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage by Universe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              Usage by Universe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={universeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calls" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* HTTP Methods Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              HTTP Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={methodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {methodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Top Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.slice(0, 10).map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={metric.success ? 'default' : 'destructive'}>
                    {metric.method || 'GET'}
                  </Badge>
                  <span className="font-mono text-sm">{metric.endpoint || '/api/unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">{metric.latency_ms}ms</span>
                  <Badge variant="outline">{metric.status_code}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}