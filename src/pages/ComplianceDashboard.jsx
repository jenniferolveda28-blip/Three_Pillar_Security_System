import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShieldCheck, AlertTriangle, Brain, FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PIE_COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

export default function ComplianceDashboard() {
  const { data: logs = [] } = useQuery({ queryKey: ['secLogsComp'], queryFn: () => base44.entities.SecurityLog.list('-created_date', 200) });
  const { data: anomalies = [] } = useQuery({ queryKey: ['anomaliesComp'], queryFn: () => base44.entities.BehaviorAnomaly.list('-created_date', 200) });
  const { data: alerts = [] } = useQuery({ queryKey: ['alertsComp'], queryFn: () => base44.entities.CriminalActivityAlert.list('-created_date', 200) });

  const isLoading = logs === undefined || anomalies === undefined || alerts === undefined;
  if (isLoading) return <div className="p-8 text-slate-400">Loading compliance dashboard…</div>;

  const accessGranted = logs.filter(l => l.event_type === 'access_granted').length;
  const accessDenied = logs.filter(l => l.event_type === 'access_denied').length;
  const suspicious = logs.filter(l => l.event_type === 'suspicious_activity').length;
  const dnaVerified = logs.filter(l => l.event_type === 'dna_verified').length;
  const totalEvents = logs.length;
  const successRate = totalEvents > 0 ? Math.round((logs.filter(l => l.success !== false).length / totalEvents) * 100) : 100;
  const complianceScore = Math.max(0, Math.min(100, successRate - suspicious * 2 - alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency').length * 5));

  const eventTypeData = Object.entries(
    logs.reduce((acc, l) => { acc[l.event_type] = (acc[l.event_type] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  const severityData = Object.entries(
    anomalies.reduce((acc, a) => { acc[a.severity] = (acc[a.severity] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const threatLevelData = Object.entries(
    logs.reduce((acc, l) => { acc[l.threat_level] = (acc[l.threat_level] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const recentAlerts = alerts.slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-cyan-400" /> Compliance Dashboard
        </h1>
        <p className="text-slate-400 mt-1">Centralized view of audit logs, anomalies, and security status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 flex items-center justify-between">
            <div><p className="text-sm text-slate-400">Compliance Score</p><p className={`text-3xl font-bold ${complianceScore >= 80 ? 'text-green-400' : complianceScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{complianceScore}</p></div>
            <ShieldCheck className="w-10 h-10 text-cyan-500/50" />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 flex items-center justify-between">
            <div><p className="text-sm text-slate-400">Security Events</p><p className="text-3xl font-bold text-white">{totalEvents}</p></div>
            <FileCheck className="w-10 h-10 text-violet-500/50" />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 flex items-center justify-between">
            <div><p className="text-sm text-slate-400">Active Anomalies</p><p className="text-3xl font-bold text-amber-400">{anomalies.filter(a => a.status === 'detected' || a.status === 'investigating').length}</p></div>
            <Brain className="w-10 h-10 text-amber-500/50" />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 flex items-center justify-between">
            <div><p className="text-sm text-slate-400">Open Alerts</p><p className="text-3xl font-bold text-red-400">{alerts.filter(a => a.status === 'open' || a.status === 'investigating').length}</p></div>
            <AlertTriangle className="w-10 h-10 text-red-500/50" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white">Security Event Distribution</CardTitle></CardHeader>
          <CardContent>
            {eventTypeData.length === 0 ? <p className="text-slate-500 text-center py-8">No data</p> : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={eventTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {eventTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white">Anomaly Severity Breakdown</CardTitle></CardHeader>
          <CardContent>
            {severityData.length === 0 ? <p className="text-slate-500 text-center py-8">No anomalies</p> : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={severityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Threat Level Distribution</CardTitle></CardHeader>
        <CardContent>
          {threatLevelData.length === 0 ? <p className="text-slate-500 text-center py-8">No data</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={threatLevelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {threatLevelData.map((entry, i) => {
                    const colors = { none: '#10b981', low: '#3b82f6', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };
                    return <Cell key={i} fill={colors[entry.name] || '#06b6d4'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Recent Security Alerts</CardTitle></CardHeader>
        <CardContent>
          {recentAlerts.length === 0 ? <p className="text-slate-500 text-center py-4">No alerts</p> : (
            <div className="space-y-2">
              {recentAlerts.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/50 mr-2">{a.alert_type}</Badge>
                    <span className="text-sm text-slate-300">{a.user_identifier || 'Unknown user'}</span>
                  </div>
                  <Badge className={a.severity === 'critical' || a.severity === 'emergency' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-amber-500/20 text-amber-400 border-amber-500/50'}>{a.severity}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}