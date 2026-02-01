import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Shield, AlertTriangle, Ban, TrendingDown } from "lucide-react";

export default function SecurityAnalytics() {
  const { data: securityLogs = [] } = useQuery({
    queryKey: ['securityLogs'],
    queryFn: () => base44.entities.SecurityLog.list('-created_date', 500),
  });

  const { data: threats = [] } = useQuery({
    queryKey: ['threats'],
    queryFn: () => base44.entities.ThreatIntelligence.list('-created_date', 500),
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['auditTrail'],
    queryFn: () => base44.entities.AuditTrail.list('-created_date', 500),
  });

  // Calculate statistics
  const totalSecurityEvents = securityLogs.length;
  const highThreatEvents = securityLogs.filter(e => e.threat_level === 'high' || e.threat_level === 'critical').length;
  const blockedThreats = threats.filter(t => t.blocked).length;
  const anomalies = auditLogs.filter(a => a.anomaly_detected).length;

  // Threat levels over time
  const threatLevelData = ['none', 'low', 'medium', 'high', 'critical'].map(level => ({
    level: level.toUpperCase(),
    count: securityLogs.filter(e => e.threat_level === level).length
  }));

  // Threat types distribution
  const threatTypeData = {};
  threats.forEach(t => {
    threatTypeData[t.threat_type] = (threatTypeData[t.threat_type] || 0) + 1;
  });
  const threatTypes = Object.entries(threatTypeData).map(([type, count]) => ({
    type: type.replace(/_/g, ' ').toUpperCase(),
    count
  }));

  // Daily security events
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayEvents = securityLogs.filter(e => {
      const eventDate = new Date(e.created_date);
      return eventDate.toDateString() === date.toDateString();
    });
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      events: dayEvents.length,
      threats: dayEvents.filter(e => e.threat_level === 'high' || e.threat_level === 'critical').length
    };
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Security Events</p>
                <p className="text-3xl font-bold text-purple-600">{totalSecurityEvents}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Threats</p>
                <p className="text-3xl font-bold text-red-600">{highThreatEvents}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blocked</p>
                <p className="text-3xl font-bold text-green-600">{blockedThreats}</p>
              </div>
              <Ban className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Anomalies</p>
                <p className="text-3xl font-bold text-orange-600">{anomalies}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Threat Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={threatLevelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Threat Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={threatTypes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>7-Day Security Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="events" stroke="#8b5cf6" strokeWidth={2} name="All Events" />
              <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} name="High Threats" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}