import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Shield, AlertTriangle, Activity } from "lucide-react";

export default function SecurityEventsChart({ metrics = [], timeRange }) {
  const timelineData = useMemo(() => {
    const grouped = {};
    metrics.forEach(m => {
      const date = new Date(m.created_date);
      const hour = `${date.getHours()}:00`;
      if (!grouped[hour]) {
        grouped[hour] = { time: hour, events: 0, critical: 0, high: 0, medium: 0, low: 0 };
      }
      grouped[hour].events++;
      const severity = m.metadata?.severity || 'low';
      if (grouped[hour][severity] !== undefined) {
        grouped[hour][severity]++;
      }
    });
    return Object.values(grouped).slice(-24);
  }, [metrics]);

  const severityData = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    metrics.forEach(m => {
      const severity = m.metadata?.severity || 'low';
      if (counts[severity] !== undefined) {
        counts[severity]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.toUpperCase(), value }));
  }, [metrics]);

  const threatTypes = useMemo(() => {
    const grouped = {};
    metrics.forEach(m => {
      const type = m.metadata?.threat_type || 'unknown';
      grouped[type] = (grouped[type] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [metrics]);

  return (
    <div className="space-y-6">
      {/* Security Events Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-600" />
            Security Events Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="critical" stackId="1" stroke="#dc2626" fill="#dc2626" name="Critical" />
              <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="#f97316" name="High" />
              <Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="#eab308" name="Medium" />
              <Area type="monotone" dataKey="low" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Low" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Severity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Threat Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Top Threat Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {threatTypes.map((threat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="font-medium text-sm capitalize">{threat.name.replace(/_/g, ' ')}</span>
                  <Badge className="bg-red-600">{threat.value} events</Badge>
                </div>
              ))}
              {threatTypes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No security events detected</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.slice(0, 15).map((metric, idx) => {
              const severity = metric.metadata?.severity || 'low';
              const severityColors = {
                critical: 'bg-red-100 border-red-300 text-red-900',
                high: 'bg-orange-100 border-orange-300 text-orange-900',
                medium: 'bg-yellow-100 border-yellow-300 text-yellow-900',
                low: 'bg-blue-100 border-blue-300 text-blue-900',
                info: 'bg-gray-100 border-gray-300 text-gray-900'
              };
              
              return (
                <div key={idx} className={`p-3 rounded-lg border-2 ${severityColors[severity]}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium text-sm">
                        {metric.metadata?.threat_type || 'Security Event'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{severity}</Badge>
                      <span className="text-xs text-gray-600">
                        {new Date(metric.created_date).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  {metric.ip_address && (
                    <p className="text-xs mt-1 text-gray-700">Source: {metric.ip_address}</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}