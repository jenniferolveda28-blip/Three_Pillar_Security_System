import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShieldAlert, Brain, Radar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const severityColors = {
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  critical: 'bg-red-500/20 text-red-400 border-red-500/50',
  emergency: 'bg-red-600/30 text-red-300 border-red-600/50',
};

export default function ThreatSummary() {
  const { data: alerts = [], isLoading: la } = useQuery({ queryKey: ['threatAlerts'], queryFn: () => base44.entities.CriminalActivityAlert.list('-created_date', 50) });
  const { data: anomalies = [], isLoading: lb } = useQuery({ queryKey: ['threatAnomalies'], queryFn: () => base44.entities.BehaviorAnomaly.list('-created_date', 50) });
  const { data: correlations = [], isLoading: lc } = useQuery({ queryKey: ['threatCorrelations'], queryFn: () => base44.entities.ThreatCorrelation.list('-created_date', 50) });

  const isLoading = la || lb || lc;
  if (isLoading) return <div className="p-8 text-slate-400">Loading threat summary…</div>;

  const openAlerts = alerts.filter(a => a.status === 'open' || a.status === 'investigating');
  const confirmedAlerts = alerts.filter(a => a.status === 'confirmed');
  const activeAnomalies = anomalies.filter(a => a.status === 'detected' || a.status === 'investigating');
  const activeCorrelations = correlations.filter(c => c.status === 'active');

  const postureScore = Math.max(0, 100 - (confirmedAlerts.length * 15) - (activeAnomalies.length * 5) - (activeCorrelations.length * 10));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Radar className="w-8 h-8 text-red-400" /> Threat Summary
        </h1>
        <p className="text-slate-400 mt-1">Bird's-eye view of current system security posture</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Open Alerts</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-400">{openAlerts.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-red-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm text-red-400">Confirmed Threats</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-400">{confirmedAlerts.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-purple-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm text-purple-400">Active Anomalies</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-purple-400">{activeAnomalies.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-cyan-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm text-cyan-400">Security Posture</CardTitle></CardHeader><CardContent><p className={`text-2xl font-bold ${postureScore >= 80 ? 'text-emerald-400' : postureScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{postureScore}/100</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-red-400" /> Criminal Alerts</CardTitle></CardHeader>
          <CardContent>
            {alerts.length === 0 ? <p className="text-slate-500">No alerts detected.</p> : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {alerts.slice(0, 15).map(a => (
                  <div key={a.id} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium capitalize">{a.alert_type?.replace(/_/g, ' ')}</span>
                      <Badge className={severityColors[a.severity] || severityColors.medium}>{a.severity}</Badge>
                    </div>
                    {a.user_identifier && <p className="text-xs text-slate-400">User: {a.user_identifier}</p>}
                    {a.confidence_score != null && <p className="text-xs text-slate-500">Confidence: {a.confidence_score}%</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400" /> Behavior Anomalies</CardTitle></CardHeader>
          <CardContent>
            {anomalies.length === 0 ? <p className="text-slate-500">No anomalies detected.</p> : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {anomalies.slice(0, 15).map(a => (
                  <div key={a.id} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm capitalize">{a.anomaly_type?.replace(/_/g, ' ')}</span>
                      <Badge className={severityColors[a.severity] || severityColors.medium}>{a.severity}</Badge>
                    </div>
                    <p className="text-xs text-slate-400">{a.user_identifier}</p>
                    {a.deviation_score != null && <p className="text-xs text-slate-500">Deviation: {a.deviation_score}/100</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-amber-400" /> Threat Correlations</CardTitle></CardHeader>
          <CardContent>
            {correlations.length === 0 ? <p className="text-slate-500">No correlations detected.</p> : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {correlations.slice(0, 15).map(c => (
                  <div key={c.id} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium">{c.attack_chain_name}</span>
                      <Badge className={severityColors[c.severity] || severityColors.medium}>{c.severity}</Badge>
                    </div>
                    {c.confidence_score != null && <p className="text-xs text-slate-500">Confidence: {c.confidence_score}%</p>}
                    <p className="text-xs text-slate-400 mt-1">Status: {c.status}</p>
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