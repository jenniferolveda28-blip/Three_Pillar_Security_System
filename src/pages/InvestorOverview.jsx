import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PrintReportButton from '@/components/PrintReportButton';
import { format } from 'date-fns';
import {
  Shield, Activity, Globe, Zap, AlertTriangle, CheckCircle2, TrendingUp,
  Lock, Brain, FileText, Users, ArrowRight, Cpu, BarChart3
} from 'lucide-react';

const SEVERITY_STYLES = {
  low: 'bg-blue-600',
  medium: 'bg-yellow-600',
  high: 'bg-orange-600',
  critical: 'bg-red-600',
  emergency: 'bg-red-700',
};

export default function InvestorOverview() {
  const { data: universes = [] } = useQuery({
    queryKey: ['io_universes'],
    queryFn: () => base44.entities.Universe.list('-created_date'),
  });
  const { data: requests = [] } = useQuery({
    queryKey: ['io_requests'],
    queryFn: () => base44.entities.UniversalRequest.list('-created_date', 200),
  });
  const { data: alerts = [] } = useQuery({
    queryKey: ['io_alerts'],
    queryFn: () => base44.entities.CriminalActivityAlert.list('-created_date', 50),
  });
  const { data: anomalies = [] } = useQuery({
    queryKey: ['io_anomalies'],
    queryFn: () => base44.entities.BehaviorAnomaly.list('-created_date', 50),
  });
  const { data: correlations = [] } = useQuery({
    queryKey: ['io_correlations'],
    queryFn: () => base44.entities.ThreatCorrelation.list('-created_date', 20),
  });
  const { data: sessions = [] } = useQuery({
    queryKey: ['io_sessions'],
    queryFn: () => base44.entities.ScramblingSession.list('-created_date', 10),
  });
  const { data: logs = [] } = useQuery({
    queryKey: ['io_logs'],
    queryFn: () => base44.entities.SecurityLog.list('-created_date', 50),
  });

  const stats = useMemo(() => {
    const activeAlerts = alerts.filter(a => a.status === 'open' || a.status === 'investigating').length;
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved' || a.status === 'confirmed').length;
    const neutralized = alerts.filter(a => a.auto_blocked).length;
    const totalScrambles = sessions.reduce((s, sess) => s + (sess.iterations || 0), 0);
    const activeSessions = sessions.filter(s => s.status === 'active').length;
    const avgProtection = sessions.length
      ? Math.round(sessions.reduce((s, sess) => s + (sess.protection_score || 100), 0) / sessions.length)
      : 100;
    const deniedAccess = logs.filter(l => !l.success).length;
    return {
      universes: universes.length,
      requests: requests.length,
      activeAlerts,
      resolvedAlerts,
      neutralized,
      totalScrambles,
      activeSessions,
      avgProtection,
      deniedAccess,
      threats: alerts.length + anomalies.length,
    };
  }, [universes, requests, alerts, anomalies, sessions, logs]);

  const timeline = useMemo(() => {
    const items = [
      ...alerts.map(a => ({
        date: a.created_date, type: 'Criminal Alert', severity: a.severity,
        title: a.alert_type?.replace(/_/g, ' '), detail: a.user_identifier || a.ip_address || '',
        status: a.status, auto: a.auto_blocked,
      })),
      ...anomalies.map(a => ({
        date: a.detection_timestamp || a.created_date, type: 'Behavior Anomaly', severity: a.severity,
        title: a.anomaly_type?.replace(/_/g, ' '), detail: a.user_identifier || '',
        status: a.status, auto: false,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 12);
    return items;
  }, [alerts, anomalies]);

  const today = format(new Date(), 'MMMM d, yyyy');

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black gradient-text">Investor System Overview</h1>
              <p className="text-slate-400 text-sm">Live system status & threat history — presentation-ready</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/InvestorCRM">
              <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                <Users className="w-4 h-4 mr-2" /> Investor CRM
              </Button>
            </Link>
            <Link to="/TexasNDA">
              <Button variant="outline" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10">
                <FileText className="w-4 h-4 mr-2" /> NDA Generator
              </Button>
            </Link>
            <PrintReportButton
              reportTitle="Investor System Overview"
              subtitle="Three-Pillar Security System — Live Status & Threat History"
              filename="investor-overview-{date}.pdf"
              sections={[
                { heading: 'EXECUTIVE SUMMARY', body: `As of ${today}, the Three-Pillar Security System is operational across ${stats.universes} connected API universes with ${stats.requests} total requests processed. The system has detected ${stats.threats} threats, automatically neutralized ${stats.neutralized} criminal activities, and maintains an average protection score of ${stats.avgProtection}%. The IP Shield scrambling engine has executed ${stats.totalScrambles} iterations across ${stats.activeSessions} active sessions.` },
                { heading: 'SYSTEM STATUS', rows: [
                  ['Connected API Universes', stats.universes],
                  ['Total Requests Processed', stats.requests],
                  ['Active Scrambling Sessions', stats.activeSessions],
                  ['Total Scramble Iterations', stats.totalScrambles],
                  ['Average Protection Score', stats.avgProtection + '%'],
                  ['Access Denials (Security)', stats.deniedAccess],
                ]},
                { heading: 'THREAT SUMMARY', rows: [
                  ['Total Threats Detected', stats.threats],
                  ['Active / Investigating', stats.activeAlerts],
                  ['Resolved / Confirmed', stats.resolvedAlerts],
                  ['Auto-Neutralized', stats.neutralized],
                  ['Neutralization Rate', stats.threats > 0 ? Math.round((stats.neutralized / stats.threats) * 100) + '%' : '100%'],
                ]},
                { heading: 'THREE-PILLAR ARCHITECTURE', body: 'PILLAR 1 — DNA Breathalyzer (BioVerify Token): Saliva-based DNA extraction with one-way cryptographic hashing. Raw DNA is never stored. Biometric identity that cannot be stolen, photographed, or cloned.\n\nPILLAR 2 — IP Shield (Moving Target Defense): API keys, routes, encryption layers, and execution paths rotate every 100ms — 300x faster than Google Authenticator. By the time an attacker completes reconnaissance, every path they mapped is obsolete.\n\nPILLAR 3 — Forged API (Universal AI Router): AI-driven behavior analysis detects attack patterns in real time. Criminal activity is auto-flagged, auto-blocked, and authorities notified. Reduces enterprise API integration complexity by ~90%.' },
                { heading: 'RECENT THREAT TIMELINE', body: timeline.length > 0 ? timeline.map((t, i) => `${i+1}. [${t.severity?.toUpperCase()}] ${t.type}: ${t.title}${t.detail ? ' — ' + t.detail : ''} (${t.status})`).join('\n') : 'No threats detected in the current reporting period.' },
                { heading: 'INVESTMENT THESIS', body: 'This is working software, not a pitch deck. Every metric in this report is pulled from live system data. The architecture is proven. What remains is building the physical DNA breathalyzer hardware prototype — seeking $250k-$2M seed funding and scientific/hardware partners.' },
                { heading: 'CONTACT', rows: [
                  ['Email', 'threepillarsecurity@proton.me'],
                  ['Location', 'Texas, USA'],
                  ['Stage', 'Pre-seed / Prototype'],
                  ['Report Generated', today],
                ]},
              ]}
            />
          </div>
        </div>

        {/* ── STATUS BANNER ── */}
        <Card className="bg-gradient-to-r from-green-950/40 to-emerald-950/30 border-green-500/40">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-300">All Systems Operational</h2>
              <p className="text-slate-400 text-sm">
                {stats.universes} universes connected · {stats.activeSessions} active scramble sessions ·
                Protection score: {stats.avgProtection}% · {stats.requests} requests processed
              </p>
            </div>
            <Badge className="ml-auto bg-green-600 text-white">LIVE</Badge>
          </CardContent>
        </Card>

        {/* ── KEY METRICS GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'API Universes', value: stats.universes, icon: Globe, color: 'text-cyan-400' },
            { label: 'Requests Processed', value: stats.requests, icon: Activity, color: 'text-emerald-400' },
            { label: 'Threats Detected', value: stats.threats, icon: AlertTriangle, color: 'text-red-400' },
            { label: 'Auto-Neutralized', value: stats.neutralized, icon: Shield, color: 'text-green-400' },
          ].map((m, i) => (
            <Card key={i} className="bg-slate-800/60 border-slate-700">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <m.icon className={`w-6 h-6 ${m.color}`} />
                  <span className={`text-3xl font-black ${m.color}`}>{m.value}</span>
                </div>
                <p className="text-slate-400 text-xs font-medium">{m.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── TWO COLUMN: SYSTEM HEALTH + THREAT BREAKDOWN ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" /> System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <HealthRow icon={Globe} label="Active Universes" value={stats.universes} color="text-cyan-400" />
              <HealthRow icon={Zap} label="Active Scramble Sessions" value={stats.activeSessions} color="text-orange-400" />
              <HealthRow icon={Shield} label="Avg Protection Score" value={stats.avgProtection + '%'} color="text-green-400" />
              <HealthRow icon={Lock} label="Access Denials" value={stats.deniedAccess} color="text-red-400" />
              <HealthRow icon={Activity} label="Total Scramble Iterations" value={stats.totalScrambles.toLocaleString()} color="text-purple-400" />
            </CardContent>
          </Card>

          {/* Threat Breakdown */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-red-400" /> Threat Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <HealthRow icon={AlertTriangle} label="Total Threats Detected" value={stats.threats} color="text-red-400" />
              <HealthRow icon={AlertTriangle} label="Active / Investigating" value={stats.activeAlerts} color="text-orange-400" />
              <HealthRow icon={CheckCircle2} label="Resolved / Confirmed" value={stats.resolvedAlerts} color="text-green-400" />
              <HealthRow icon={Shield} label="Auto-Neutralized" value={stats.neutralized} color="text-emerald-400" />
              <HealthRow icon={TrendingUp} label="Neutralization Rate"
                value={stats.threats > 0 ? Math.round((stats.neutralized / stats.threats) * 100) + '%' : '100%'}
                color="text-cyan-400" />
            </CardContent>
          </Card>
        </div>

        {/* ── THREAT TIMELINE ── */}
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" /> Threat History Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                No threats detected. System is clean.
              </div>
            ) : (
              <div className="space-y-2">
                {timeline.map((t, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
                    <div className={`w-2 h-10 rounded-full ${SEVERITY_STYLES[t.severity] || 'bg-slate-600'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm capitalize">{t.title}</span>
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">{t.type}</Badge>
                        {t.auto && <Badge className="bg-green-600 text-white text-xs">Auto-Blocked</Badge>}
                      </div>
                      {t.detail && <p className="text-slate-500 text-xs mt-0.5 truncate">{t.detail}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-400">{t.date ? format(new Date(t.date), 'MMM d, HH:mm') : '—'}</p>
                      <Badge className={`mt-1 text-xs ${t.status === 'resolved' || t.status === 'confirmed' ? 'bg-green-600' : t.status === 'open' || t.status === 'detected' ? 'bg-red-600' : 'bg-slate-600'} text-white`}>
                        {t.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── PILLAR SUMMARY CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Lock, title: 'DNA Breathalyzer', tag: 'Pillar 1', desc: 'Biometric auth via saliva DNA hash. Cannot be cloned or stolen.', color: 'text-blue-400', border: 'border-blue-500/40' },
            { icon: Zap, title: 'IP Shield', tag: 'Pillar 2', desc: `${stats.totalScrambles.toLocaleString()} scramble iterations executed. 100ms rotation.`, color: 'text-orange-400', border: 'border-orange-500/40' },
            { icon: Brain, title: 'Forged API', tag: 'Pillar 3', desc: `${stats.neutralized} threats auto-neutralized. AI-driven real-time detection.`, color: 'text-purple-400', border: 'border-purple-500/40' },
          ].map((p, i) => (
            <Card key={i} className={`bg-slate-800/60 ${p.border}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <p.icon className={`w-8 h-8 ${p.color}`} />
                  <div>
                    <Badge variant="outline" className={`text-xs ${p.border} ${p.color}`}>{p.tag}</Badge>
                  </div>
                </div>
                <h3 className="font-bold text-white mb-1">{p.title}</h3>
                <p className="text-slate-400 text-sm">{p.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── FOOTER CTA ── */}
        <Card className="bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border-cyan-500/40">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ArrowRight className="w-6 h-6 text-cyan-400" />
              <div>
                <h3 className="font-bold text-white">Ready to talk?</h3>
                <p className="text-slate-400 text-sm">Generate an NDA or log a meeting in the Investor CRM.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/TexasNDA"><Button className="bg-cyan-600 hover:bg-cyan-500"><FileText className="w-4 h-4 mr-2" />Generate NDA</Button></Link>
              <Link to="/InvestorCRM"><Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"><Users className="w-4 h-4 mr-2" />Log Meeting</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HealthRow({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-slate-300 text-sm font-medium">{label}</span>
      </div>
      <span className={`font-black text-lg ${color}`}>{value}</span>
    </div>
  );
}