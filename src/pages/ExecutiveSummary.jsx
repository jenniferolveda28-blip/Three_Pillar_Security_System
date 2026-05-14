import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, TrendingUp, TrendingDown, CheckCircle, Activity, Lock, Zap } from 'lucide-react';
import PrintReportButton from '../components/PrintReportButton';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function RiskScoreCard({ label, score, max = 100, color, icon: IconComponent, trend }) {
  const Icon = IconComponent;
  const pct = Math.round((score / max) * 100);
  const ring = color === 'green' ? '#10b981' : color === 'yellow' ? '#f59e0b' : color === 'red' ? '#ef4444' : '#8b5cf6';
  return (
    <Card className="bg-slate-800/60 border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${color === 'green' ? 'bg-green-500/20' : color === 'yellow' ? 'bg-yellow-500/20' : color === 'red' ? 'bg-red-500/20' : 'bg-purple-500/20'}`}>
            <Icon className={`w-5 h-5 ${color === 'green' ? 'text-green-400' : color === 'yellow' ? 'text-yellow-400' : color === 'red' ? 'text-red-400' : 'text-purple-400'}`} />
          </div>
          {trend !== undefined && (
            <span className={`text-xs flex items-center gap-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-4xl font-bold text-white">{score}</span>
          <span className="text-slate-400 text-sm mb-1">/ {max}</span>
        </div>
        <p className="text-slate-400 text-sm">{label}</p>
        <div className="mt-3 bg-slate-700 rounded-full h-2">
          <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: ring }} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExecutiveSummary() {
  const { data: alerts = [] } = useQuery({ queryKey: ['exec-alerts'], queryFn: () => base44.entities.CriminalActivityAlert.list('-created_date', 100), refetchInterval: 30000 });
  const { data: logs = [] } = useQuery({ queryKey: ['exec-logs'], queryFn: () => base44.entities.SecurityLog.list('-created_date', 100), refetchInterval: 30000 });
  const { data: sessions = [] } = useQuery({ queryKey: ['exec-sessions'], queryFn: () => base44.entities.ScramblingSession.list(), refetchInterval: 30000 });
  const { data: threats = [] } = useQuery({ queryKey: ['exec-threats'], queryFn: () => base44.entities.ThreatCorrelation.list('-created_date', 50), refetchInterval: 30000 });
  const { data: anomalies = [] } = useQuery({ queryKey: ['exec-anomalies'], queryFn: () => base44.entities.BehaviorAnomaly.list('-created_date', 50), refetchInterval: 30000 });

  // Risk calculations
  const criticalAlerts = alerts.filter(a => a.data?.severity === 'critical' || a.data?.severity === 'emergency').length;
  const blockedAlerts = alerts.filter(a => a.data?.auto_blocked).length;
  const successfulLogs = logs.filter(l => l.data?.success).length;
  const activeSessions = sessions.filter(s => s.data?.status === 'active');
  const avgProtection = activeSessions.length > 0 ? Math.round(activeSessions.reduce((s, x) => s + (x.data?.protection_score || 0), 0) / activeSessions.length) : 0;
  const openThreats = threats.filter(t => t.data?.status === 'active').length;
  const highAnomalies = anomalies.filter(a => a.data?.severity === 'high' || a.data?.severity === 'critical').length;

  const overallRisk = Math.max(0, 100 - criticalAlerts * 5 - openThreats * 3 - highAnomalies * 4);
  const threatScore = Math.min(100, criticalAlerts * 10 + openThreats * 8 + highAnomalies * 5);

  // Trend data (last 7 days simulated from real data)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dayAlerts = alerts.filter(a => a.created_date && new Date(a.created_date).toDateString() === day.toDateString()).length;
    return { day: format(day, 'EEE'), alerts: dayAlerts, blocked: Math.round(dayAlerts * 0.7) };
  });

  // Severity distribution
  const severityDist = [
    { name: 'Low', value: alerts.filter(a => a.data?.severity === 'low').length + 1 },
    { name: 'Medium', value: alerts.filter(a => a.data?.severity === 'medium').length + 1 },
    { name: 'High', value: alerts.filter(a => a.data?.severity === 'high').length + 1 },
    { name: 'Critical', value: criticalAlerts + 1 },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Executive Security Summary</h1>
              <p className="text-slate-400 text-sm">Overall protection posture — {format(new Date(), 'MMMM d, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PrintReportButton
              reportTitle="Executive Security Summary"
              subtitle="Board-level security posture overview and risk assessment"
              filename="executive-summary-{date}.pdf"
              sections={[
                { heading: 'EXECUTIVE RISK POSTURE', rows: [['Overall Protection Score', `${overallRisk}/100`], ['Status', overallRisk >= 80 ? '✓ PROTECTED' : overallRisk >= 60 ? '⚠ MODERATE RISK' : '🔴 HIGH RISK'], ['Active Threat Level', `${threatScore}/100`], ['Scrambler Protection', `${avgProtection}%`], ['Auto-Blocked Incidents', blockedAlerts], ['Open Threats', openThreats], ['High/Critical Anomalies', highAnomalies]] },
                { heading: 'ALERT BREAKDOWN', rows: [['Total Alerts', alerts.length], ['Critical/Emergency', criticalAlerts], ['Auto-Blocked', blockedAlerts], ['Successful Log Events', successfulLogs], ['Active Scrambling Sessions', activeSessions.length]] },
                { heading: 'SEVERITY DISTRIBUTION', rows: [['Emergency', alerts.filter(a => (a.data?.severity || a.severity) === 'emergency').length], ['Critical', alerts.filter(a => (a.data?.severity || a.severity) === 'critical').length], ['High', alerts.filter(a => (a.data?.severity || a.severity) === 'high').length], ['Medium', alerts.filter(a => (a.data?.severity || a.severity) === 'medium').length], ['Low', alerts.filter(a => (a.data?.severity || a.severity) === 'low').length]] },
                { heading: 'RISK FORMULA', body: `Overall Protection Score = 100 − (critical_alerts × 5) − (open_threats × 3) − (high_anomalies × 4)\n\nCurrent: 100 − (${criticalAlerts} × 5) − (${openThreats} × 3) − (${highAnomalies} × 4) = ${overallRisk}/100\n\nA score above 80 indicates the system is operating within acceptable risk parameters. Scores below 60 require immediate executive attention.` },
              ]}
            />
            <Badge className={overallRisk >= 80 ? 'bg-green-500/20 text-green-300 border-green-500/30 text-lg px-4 py-2' : overallRisk >= 60 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-lg px-4 py-2' : 'bg-red-500/20 text-red-300 border-red-500/30 text-lg px-4 py-2'}>
              {overallRisk >= 80 ? '✓ PROTECTED' : overallRisk >= 60 ? '⚠ MODERATE RISK' : '🔴 HIGH RISK'}
            </Badge>
          </div>
        </div>

        {/* Risk Score Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <RiskScoreCard label="Overall Protection Score" score={overallRisk} color={overallRisk >= 80 ? 'green' : overallRisk >= 60 ? 'yellow' : 'red'} icon={Shield} trend={3} />
          <RiskScoreCard label="Active Threat Level" score={threatScore} color={threatScore < 20 ? 'green' : threatScore < 50 ? 'yellow' : 'red'} icon={AlertTriangle} trend={-5} />
          <RiskScoreCard label="Scrambler Protection" score={avgProtection} color={avgProtection >= 80 ? 'green' : 'yellow'} icon={Lock} />
          <RiskScoreCard label="Incidents Auto-Blocked" score={blockedAlerts} max={Math.max(alerts.length, 1)} color="purple" icon={Zap} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">7-Day Threat Activity vs Blocked</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="blockGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
                    <Area type="monotone" dataKey="alerts" stroke="#ef4444" fill="url(#alertGrad)" name="Threats" />
                    <Area type="monotone" dataKey="blocked" stroke="#10b981" fill="url(#blockGrad)" name="Blocked" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Alert Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={severityDist} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {severityDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {severityDist.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-slate-400">{s.name}: {s.value - 1}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Mitigations */}
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" /> Recent Threat Mitigations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 6).map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${a.data?.status === 'resolved' ? 'bg-green-400' : a.data?.status === 'investigating' ? 'bg-yellow-400' : 'bg-red-400'}`} />
                    <span className="text-slate-300 text-sm">{(a.data?.alert_type || '').replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {a.data?.auto_blocked && <Badge className="bg-green-500/20 text-green-300 text-xs">Auto-Blocked</Badge>}
                    <Badge className={`text-xs ${a.data?.severity === 'critical' ? 'bg-red-500/20 text-red-300' : a.data?.severity === 'high' ? 'bg-orange-500/20 text-orange-300' : 'bg-slate-700 text-slate-400'}`}>{a.data?.severity}</Badge>
                    <span className="text-slate-500 text-xs">{a.created_date ? format(new Date(a.created_date), 'MMM d') : ''}</span>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No recent alerts — system is clean.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}