import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, FileText, ShieldAlert, Users, Download } from 'lucide-react';

export default function InvestorReportingHub() {
  const { data: reports = [], isLoading: repLoading } = useQuery({ queryKey: ['invReports'], queryFn: () => base44.entities.SecurityReport.list('-created_date', 100) });
  const { data: meetings = [], isLoading: meetLoading } = useQuery({ queryKey: ['invMeetingsHub'], queryFn: () => base44.entities.InvestorMeeting.list('-created_date', 100) });
  const { data: threats = [], isLoading: threatLoading } = useQuery({ queryKey: ['invThreats'], queryFn: () => base44.entities.ThreatCorrelation.list('-created_date', 100) });

  const isLoading = repLoading || meetLoading || threatLoading;
  if (isLoading) return <div className="p-8 text-slate-400">Loading investor reporting hub…</div>;

  const activeReports = reports.filter(r => r.is_active).length;
  const interested = meetings.filter(m => ['Interested', 'Negotiating', 'Meeting Scheduled'].includes(m.status)).length;
  const activeThreats = threats.filter(t => t.status === 'active' || t.status === 'investigating').length;
  const mitigated = threats.filter(t => t.status === 'mitigated').length;
  const protectionRate = threats.length > 0 ? Math.round((mitigated / threats.length) * 100) : 100;

  const sevData = Object.entries(threats.reduce((a, t) => { a[t.severity] = (a[t.severity] || 0) + 1; return a; }, {})).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><TrendingUp className="w-8 h-8 text-cyan-400" /> Investor Reporting Hub</h1>
        <p className="text-slate-400 mt-1">Standardized security performance reports, threat summaries, and historical protection metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-slate-400">Active Reports</p><p className="text-2xl font-bold text-white">{activeReports}</p></div><FileText className="w-8 h-8 text-cyan-500/50" /></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-slate-400">Engaged Investors</p><p className="text-2xl font-bold text-violet-400">{interested}</p></div><Users className="w-8 h-8 text-violet-500/50" /></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-slate-400">Protection Rate</p><p className="text-2xl font-bold text-green-400">{protectionRate}%</p></div><ShieldAlert className="w-8 h-8 text-green-500/50" /></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-slate-400">Active Threat Chains</p><p className="text-2xl font-bold text-amber-400">{activeThreats}</p></div><ShieldAlert className="w-8 h-8 text-amber-500/50" /></CardContent></Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Threat Severity Distribution</CardTitle></CardHeader>
        <CardContent>
          {sevData.length === 0 ? <p className="text-slate-500 text-center py-8">No threat data</p> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sevData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white">Standardized Reports</CardTitle></CardHeader>
          <CardContent>
            {reports.length === 0 ? <p className="text-slate-500 text-center py-4">No reports available.</p> : (
              <div className="space-y-2">
                {reports.slice(0, 10).map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{r.report_name}</p>
                      <p className="text-xs text-slate-500">{r.schedule_type} · last run {r.last_run ? new Date(r.last_run).toLocaleDateString() : '—'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={r.is_active ? 'border-emerald-600/50 text-emerald-300' : 'border-slate-600 text-slate-400'}>{r.is_active ? 'active' : 'inactive'}</Badge>
                      {r.file_url && <a href={r.file_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300"><Download className="w-4 h-4" /></a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white">Threat Summaries</CardTitle></CardHeader>
          <CardContent>
            {threats.length === 0 ? <p className="text-slate-500 text-center py-4">No threat correlations.</p> : (
              <div className="space-y-2">
                {threats.slice(0, 10).map(t => (
                  <div key={t.id} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{t.attack_chain_name}</span>
                      <Badge variant="outline" className={t.severity === 'critical' ? 'border-red-600/50 text-red-300' : t.severity === 'high' ? 'border-amber-600/50 text-amber-300' : 'border-blue-600/50 text-blue-300'}>{t.severity}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{t.ai_analysis || t.description || '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}