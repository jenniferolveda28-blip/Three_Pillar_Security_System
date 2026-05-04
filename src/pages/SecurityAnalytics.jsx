import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, BarChart2, TrendingUp, ShieldAlert, Activity } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' },
  labelStyle: { color: '#cbd5e1' },
};

function getWeeklyData(alerts, logs) {
  const now = new Date();
  return Array.from({ length: 8 }, (_, i) => {
    const weekIndex = 7 - i;
    const start = new Date(now); start.setDate(now.getDate() - weekIndex * 7 - 6); start.setHours(0, 0, 0, 0);
    const end = new Date(now); end.setDate(now.getDate() - weekIndex * 7); end.setHours(23, 59, 59, 999);
    const inRange = d => new Date(d) >= start && new Date(d) <= end;

    return {
      week: `Wk ${8 - weekIndex}`,
      alerts: alerts.filter(a => inRange(a.created_date)).length,
      threats: logs.filter(l => inRange(l.created_date) && l.threat_level !== 'none').length,
    };
  });
}

function getMonthlyByType(alerts) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const offset = 5 - i;
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23, 59, 59);
    const inRange = d => new Date(d) >= start && new Date(d) <= end;
    const label = start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const byType = (type) => alerts.filter(a => inRange(a.created_date) && a.alert_type === type).length;

    return {
      month: label,
      fraud: byType('fraud'),
      unauthorized: byType('unauthorized_access'),
      breach: byType('data_breach'),
      malicious: byType('malicious_intent'),
    };
  });
}

function getMonthlySeverity(alerts) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const offset = 5 - i;
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23, 59, 59);
    const inRange = d => new Date(d) >= start && new Date(d) <= end;
    const label = start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    return {
      month: label,
      critical: alerts.filter(a => inRange(a.created_date) && a.severity === 'critical').length,
      emergency: alerts.filter(a => inRange(a.created_date) && a.severity === 'emergency').length,
      high: alerts.filter(a => inRange(a.created_date) && a.severity === 'high').length,
      medium: alerts.filter(a => inRange(a.created_date) && a.severity === 'medium').length,
    };
  });
}

export default function SecurityAnalytics() {
  const { data: alerts = [] } = useQuery({
    queryKey: ['analyticsAlerts'],
    queryFn: () => base44.entities.CriminalActivityAlert.list('-created_date', 500),
  });
  const { data: logs = [] } = useQuery({
    queryKey: ['analyticsLogs'],
    queryFn: () => base44.entities.SecurityLog.list('-created_date', 500),
  });
  const { data: anomalies = [] } = useQuery({
    queryKey: ['analyticsAnomalies'],
    queryFn: () => base44.entities.BehaviorAnomaly.list('-created_date', 500),
  });

  const weeklyData = useMemo(() => getWeeklyData(alerts, logs), [alerts, logs]);
  const monthlyTypeData = useMemo(() => getMonthlyByType(alerts), [alerts]);
  const monthlySeverityData = useMemo(() => getMonthlySeverity(alerts), [alerts]);

  const totalThreats = alerts.length + logs.filter(l => l.threat_level !== 'none').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;
  const avgResolution = alerts.length > 0 ? Math.round((resolvedCount / alerts.length) * 100) : 100;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to="/Dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl shadow-lg shadow-blue-500/50">
              <BarChart2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Security Analytics</h1>
              <p className="text-slate-400">Historical threat patterns and long-term vulnerability analysis</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Threats', value: totalThreats, color: 'text-red-400', border: 'border-red-500/20', icon: ShieldAlert },
            { label: 'Critical Alerts', value: criticalCount, color: 'text-orange-400', border: 'border-orange-500/20', icon: Activity },
            { label: 'Anomalies', value: anomalies.length, color: 'text-amber-400', border: 'border-amber-500/20', icon: TrendingUp },
            { label: 'Resolution Rate', value: `${avgResolution}%`, color: 'text-emerald-400', border: 'border-emerald-500/20', icon: BarChart2 },
          ].map(({ label, value, color, border, icon: IconComp }) => (
            <div key={label} className={`multi-layer-card rounded-xl p-5 border ${border}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">{label}</p>
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                </div>
                <IconComp className={`w-8 h-8 opacity-40 ${color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Volume Chart */}
        <Card className="multi-layer-card card-layer-threat border mb-6">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-400" />
              Weekly Threat Volume (Last 8 Weeks)
            </CardTitle>
            <CardDescription className="text-slate-400">Criminal alerts vs. security log threats per week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend />
                <Line type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} name="Criminal Alerts" />
                <Line type="monotone" dataKey="threats" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} name="Security Threats" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly by Attack Type */}
          <Card className="multi-layer-card card-layer-monitoring border">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-violet-400" />
                Attack Types by Month
              </CardTitle>
              <CardDescription className="text-slate-400">Breakdown of attack categories over 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend />
                  <Bar dataKey="fraud" fill="#ef4444" name="Fraud" stackId="a" />
                  <Bar dataKey="unauthorized" fill="#f59e0b" name="Unauthorized Access" stackId="a" />
                  <Bar dataKey="breach" fill="#8b5cf6" name="Data Breach" stackId="a" />
                  <Bar dataKey="malicious" fill="#06b6d4" name="Malicious Intent" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Severity Distribution */}
          <Card className="multi-layer-card card-layer-scramble border">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                Severity Distribution by Month
              </CardTitle>
              <CardDescription className="text-slate-400">Long-term attack severity escalation patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlySeverityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend />
                  <Area type="monotone" dataKey="emergency" fill="#dc2626" stroke="#dc2626" fillOpacity={0.6} name="Emergency" />
                  <Area type="monotone" dataKey="critical" fill="#ef4444" stroke="#ef4444" fillOpacity={0.5} name="Critical" />
                  <Area type="monotone" dataKey="high" fill="#f97316" stroke="#f97316" fillOpacity={0.4} name="High" />
                  <Area type="monotone" dataKey="medium" fill="#f59e0b" stroke="#f59e0b" fillOpacity={0.3} name="Medium" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}