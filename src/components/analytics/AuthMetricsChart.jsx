import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UserCheck, TrendingUp, Fingerprint } from "lucide-react";

export default function AuthMetricsChart({ metrics = [], timeRange }) {
  const timelineData = useMemo(() => {
    const grouped = {};
    metrics.forEach(m => {
      const date = new Date(m.created_date);
      const hour = `${date.getHours()}:00`;
      if (!grouped[hour]) {
        grouped[hour] = { time: hour, total: 0, success: 0, failed: 0 };
      }
      grouped[hour].total++;
      if (m.success) {
        grouped[hour].success++;
      } else {
        grouped[hour].failed++;
      }
    });
    return Object.values(grouped).slice(-24);
  }, [metrics]);

  const methodData = useMemo(() => {
    const grouped = {};
    metrics.forEach(m => {
      const method = m.auth_method || 'unknown';
      if (!grouped[method]) {
        grouped[method] = { name: method, total: 0, success: 0 };
      }
      grouped[method].total++;
      if (m.success) {
        grouped[method].success++;
      }
    });
    return Object.values(grouped).map(item => ({
      ...item,
      successRate: item.total > 0 ? ((item.success / item.total) * 100).toFixed(1) : 0
    }));
  }, [metrics]);

  const distributionData = useMemo(() => {
    const grouped = {};
    metrics.forEach(m => {
      const method = m.auth_method || 'unknown';
      grouped[method] = (grouped[method] || 0) + 1;
    });
    return Object.entries(grouped).map(([name, value]) => ({ 
      name: name.toUpperCase(), 
      value 
    }));
  }, [metrics]);

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

  const totalAttempts = metrics.length;
  const successfulAttempts = metrics.filter(m => m.success).length;
  const successRate = totalAttempts > 0 ? ((successfulAttempts / totalAttempts) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Success Rate Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-3xl font-bold text-purple-600">{totalAttempts}</p>
              </div>
              <UserCheck className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-3xl font-bold text-green-600">{successfulAttempts}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-blue-600">{successRate}%</p>
              </div>
              <Fingerprint className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Authentication Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Authentication Attempts Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} name="Total Attempts" />
              <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} name="Successful" />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate by Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-blue-600" />
              Success Rate by Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={methodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="success" fill="#10b981" name="Successful" />
                <Bar dataKey="total" fill="#6366f1" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Method Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              Method Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Authentication Attempts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Authentication Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.slice(0, 15).map((metric, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg border-2 ${
                  metric.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className={`w-4 h-4 ${metric.success ? 'text-green-600' : 'text-red-600'}`} />
                    <span className="font-medium text-sm capitalize">
                      {metric.auth_method || 'Unknown'} Authentication
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={metric.success ? 'default' : 'destructive'}>
                      {metric.success ? 'SUCCESS' : 'FAILED'}
                    </Badge>
                    <span className="text-xs text-gray-600">
                      {new Date(metric.created_date).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                {metric.user_identifier && (
                  <p className="text-xs mt-1 text-gray-700">User: {metric.user_identifier}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}