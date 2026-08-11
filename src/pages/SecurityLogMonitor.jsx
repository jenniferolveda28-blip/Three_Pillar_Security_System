import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Key, Activity, AlertTriangle, RefreshCw } from 'lucide-react';

const threatColors = {
  none: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  critical: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export default function SecurityLogMonitor() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { data: logs = [], isLoading: logsLoading } = useQuery({ queryKey: ['secMonitorLogs'], queryFn: () => base44.entities.SecurityLog.list('-created_date', 100), refetchInterval: 10000 });
  const { data: anomalies = [], isLoading: anomLoading } = useQuery({ queryKey: ['secMonitorAnom'], queryFn: () => base44.entities.BehaviorAnomaly.list('-created_date', 50), refetchInterval: 10000 });

  useEffect(() => { setLastRefresh(new Date()); }, [logs, anomalies]);

  const isLoading = logsLoading || anomLoading;
  if (isLoading) return <div className="p-8 text-slate-400">Loading live monitor…</div>;

  const rotations = logs.filter(l => l.event_type === 'key_rotation');
  const anomaliesActive = anomalies.filter(a => a.status === 'detected' || a.status === 'investigating');
  const critical = logs.filter(l => l.threat_level === 'critical').length + anomalies.filter(a => a.severity === 'critical').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Monitor className="w-8 h-8 text-cyan-400" /> Security Log Monitor</h1>
          <p className="text-slate-400 mt-1">Live view of system access, CipherPass rotations, and anomaly alerts</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400"><RefreshCw className="w-3 h-3 animate-spin" /> Live · updated {lastRefresh.toLocaleTimeString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-slate-400">Access Events</p><p className="text-2xl font-bold text-white">{logs.length}</p></div><Activity className="w-8 h-8 text-cyan-500/50" /></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-slate-400">Key Rotations</p><p className="text-2xl font-bold text-violet-400">{rotations.length}</p></div><Key className="w-8 h-8 text-violet-500/50" /></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-slate-400">Active Anomalies</p><p className="text-2xl font-bold text-amber-400">{anomaliesActive.length}</p></div><AlertTriangle className="w-8 h-8 text-amber-500/50" /></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-slate-400">Critical</p><p className="text-2xl font-bold text-red-400">{critical}</p></div><AlertTriangle className="w-8 h-8 text-red-500/50" /></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Key className="w-5 h-5 text-violet-400" /> CipherPass Rotations</CardTitle></CardHeader>
          <CardContent>
            {rotations.length === 0 ? <p className="text-slate-500 text-center py-4">No rotations logged.</p> : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {rotations.slice(0, 30).map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{r.details || 'Key rotation event'}</p>
                      <p className="text-xs text-slate-500">{r.ip_address || '—'} · {new Date(r.created_date).toLocaleString()}</p>
                    </div>
                    <Badge className={threatColors[r.threat_level] || threatColors.none}>{r.threat_level}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-400" /> Anomaly Alerts</CardTitle></CardHeader>
          <CardContent>
            {anomaliesActive.length === 0 ? <p className="text-slate-500 text-center py-4">No active anomalies.</p> : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {anomaliesActive.slice(0, 30).map(a => (
                  <div key={a.id} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{a.anomaly_type?.replace(/_/g, ' ')}</span>
                      <Badge className={a.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/50' : a.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-amber-500/20 text-amber-400 border-amber-500/50'}>{a.severity}</Badge>
                    </div>
                    <p className="text-xs text-slate-400">{a.user_identifier || 'Unknown'} · {new Date(a.created_date).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-400" /> Recent System Access</CardTitle></CardHeader>
        <CardContent>
          {logs.length === 0 ? <p className="text-slate-500 text-center py-4">No access events.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700 text-slate-400 text-left">
                  <th className="pb-2 pr-4">Time</th><th className="pb-2 pr-4">Event</th><th className="pb-2 pr-4">IP</th><th className="pb-2 pr-4">Threat</th><th className="pb-2 pr-4">Status</th>
                </tr></thead>
                <tbody>
                  {logs.slice(0, 50).map(l => (
                    <tr key={l.id} className="border-b border-slate-800">
                      <td className="py-2 pr-4 text-slate-500 text-xs whitespace-nowrap">{new Date(l.created_date).toLocaleString()}</td>
                      <td className="py-2 pr-4 text-slate-200">{l.event_type?.replace(/_/g, ' ')}</td>
                      <td className="py-2 pr-4 text-slate-500 text-xs">{l.ip_address || '—'}</td>
                      <td className="py-2 pr-4"><Badge className={threatColors[l.threat_level] || threatColors.none}>{l.threat_level}</Badge></td>
                      <td className="py-2 pr-4">{l.success !== false ? <span className="text-green-400 text-xs">✓</span> : <span className="text-red-400 text-xs">✗</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}