import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Shield, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

export default function AuthenticationAnalytics() {
  const { data: sessions = [] } = useQuery({
    queryKey: ['biometricSessions'],
    queryFn: () => base44.entities.BiometricSession.list('-created_date', 500),
  });

  const { data: tokenRegistrations = [] } = useQuery({
    queryKey: ['tokenRegistrations'],
    queryFn: () => base44.entities.TokenRegistration.list('-created_date'),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['analyticsEvents', 'authentication'],
    queryFn: () => base44.entities.AnalyticsEvent.filter({ event_category: 'authentication' }, '-created_date', 500),
  });

  // Calculate statistics
  const totalAttempts = events.length;
  const successfulAuths = events.filter(e => e.status === 'success').length;
  const failedAuths = events.filter(e => e.status === 'failure' || e.status === 'error').length;
  const successRate = totalAttempts > 0 ? ((successfulAuths / totalAttempts) * 100).toFixed(1) : 0;

  // Active sessions by status
  const activeSessions = sessions.filter(s => s.status === 'active').length;
  const suspiciousSessions = sessions.filter(s => s.status === 'suspicious').length;
  const expiredSessions = sessions.filter(s => s.status === 'expired').length;

  // Authentication methods distribution
  const methodData = {};
  sessions.forEach(s => {
    methodData[s.verification_method] = (methodData[s.verification_method] || 0) + 1;
  });
  const authMethods = Object.entries(methodData).map(([method, count]) => ({
    method: method.toUpperCase(),
    count,
    color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][Object.keys(methodData).indexOf(method)]
  }));

  // Success vs Failed over time
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.created_date);
      return eventDate.toDateString() === date.toDateString();
    });
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      success: dayEvents.filter(e => e.status === 'success').length,
      failed: dayEvents.filter(e => e.status !== 'success').length
    };
  });

  // Token registration status
  const registrationStatus = [
    { name: 'Activated', value: tokenRegistrations.filter(t => t.registration_status === 'activated').length, color: '#10b981' },
    { name: 'DNA Verified', value: tokenRegistrations.filter(t => t.registration_status === 'dna_verified').length, color: '#6366f1' },
    { name: 'Pending', value: tokenRegistrations.filter(t => t.registration_status === 'pending').length, color: '#f59e0b' },
    { name: 'Rejected', value: tokenRegistrations.filter(t => t.registration_status === 'rejected').length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-green-600">{successRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-3xl font-bold text-blue-600">{totalAttempts}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="text-3xl font-bold text-purple-600">{activeSessions}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed Attempts</p>
                <p className="text-3xl font-bold text-red-600">{failedAuths}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={authMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, count }) => `${method}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {authMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Registration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={registrationStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {registrationStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>7-Day Authentication Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} name="Successful" />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}