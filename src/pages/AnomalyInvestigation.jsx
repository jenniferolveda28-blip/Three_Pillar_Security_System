import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, CheckCircle, XCircle, User, Clock, Monitor, Activity } from 'lucide-react';
import { format } from 'date-fns';

const severityColor = { low: 'bg-blue-500/20 text-blue-300 border-blue-500/30', medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', high: 'bg-orange-500/20 text-orange-300 border-orange-500/30', critical: 'bg-red-500/20 text-red-300 border-red-500/30' };

export default function AnomalyInvestigation() {
  const [selected, setSelected] = useState(null);
  const qc = useQueryClient();

  const { data: anomalies = [] } = useQuery({
    queryKey: ['anomalies-inv'],
    queryFn: () => base44.entities.BehaviorAnomaly.list('-created_date', 50),
    refetchInterval: 8000,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['logs-inv'],
    queryFn: () => base44.entities.SecurityLog.list('-created_date', 50),
    enabled: !!selected,
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['tokens-inv'],
    queryFn: () => base44.entities.HardwareToken.list('-created_date', 20),
    enabled: !!selected,
  });

  const updateAnomaly = useMutation({
    mutationFn: ({ id, status }) => base44.entities.BehaviorAnomaly.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['anomalies-inv'] }),
  });

  const userLogs = selected ? logs.filter(l => l.data?.ip_address || l.data?.dna_hash).slice(0, 10) : [];
  const userTokens = tokens.slice(0, 3);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Anomaly Investigation</h1>
            <p className="text-slate-400 text-sm">Forensic side-by-side analysis — confirm threats or clear false positives</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Anomaly List */}
          <div className="space-y-3">
            <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">Detected Anomalies ({anomalies.length})</h2>
            {anomalies.map(a => (
              <div
                key={a.id}
                onClick={() => setSelected(a)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${selected?.id === a.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={severityColor[a.data?.severity] || severityColor.medium}>{a.data?.severity}</Badge>
                  <span className="text-xs text-slate-500">{a.data?.status}</span>
                </div>
                <p className="text-white text-sm font-medium truncate">{a.data?.user_identifier || 'Unknown User'}</p>
                <p className="text-slate-400 text-xs mt-1 truncate">{(a.data?.anomaly_type || '').replace(/_/g, ' ')}</p>
                <p className="text-slate-600 text-xs mt-1">{a.created_date ? format(new Date(a.created_date), 'MMM d, HH:mm') : ''}</p>
              </div>
            ))}
            {anomalies.length === 0 && <p className="text-slate-500 text-sm">No anomalies detected.</p>}
          </div>

          {/* Right: Investigation Panel */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="space-y-4">
                {/* Header */}
                <Card className="bg-slate-800/60 border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                        {(selected.data?.anomaly_type || '').replace(/_/g, ' ')}
                      </CardTitle>
                      <Badge className={severityColor[selected.data?.severity] || severityColor.medium}>{selected.data?.severity?.toUpperCase()}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">User</p>
                        <p className="text-white font-mono">{selected.data?.user_identifier}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Deviation Score</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-700 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${selected.data?.deviation_score || 0}%` }} />
                          </div>
                          <span className="text-red-400 font-bold">{selected.data?.deviation_score || 0}</span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-slate-400">AI Reasoning</p>
                        <p className="text-slate-300 mt-1 text-xs leading-relaxed">{selected.data?.ai_reasoning || 'No AI reasoning available.'}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => updateAnomaly.mutate({ id: selected.id, status: 'confirmed_threat' })}
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Confirm Threat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-400 hover:bg-green-600/10"
                        onClick={() => updateAnomaly.mutate({ id: selected.id, status: 'false_positive' })}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Mark False Positive
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                        onClick={() => updateAnomaly.mutate({ id: selected.id, status: 'investigating' })}
                      >
                        Investigating
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Side by side: Logs vs Devices */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-slate-800/60 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" /> Recent Security Logs
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {userLogs.length === 0 && <p className="text-slate-500 text-xs">No recent logs found.</p>}
                      {userLogs.map((log, i) => (
                        <div key={i} className="bg-slate-900/50 rounded-lg p-3 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-medium ${log.data?.success ? 'text-green-400' : 'text-red-400'}`}>
                              {(log.data?.event_type || '').replace(/_/g, ' ')}
                            </span>
                            <Badge className={`text-xs ${log.data?.threat_level === 'none' ? 'bg-slate-700 text-slate-400' : 'bg-red-500/20 text-red-300'}`}>
                              {log.data?.threat_level}
                            </Badge>
                          </div>
                          <p className="text-slate-400">IP: {log.data?.ip_address || 'N/A'}</p>
                          <p className="text-slate-500">{log.created_date ? format(new Date(log.created_date), 'MMM d, HH:mm:ss') : ''}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/60 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-purple-400" /> Device Fingerprints
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {userTokens.length === 0 && <p className="text-slate-500 text-xs">No devices registered.</p>}
                      {userTokens.map((t, i) => (
                        <div key={i} className="bg-slate-900/50 rounded-lg p-3 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium">{t.data?.device_name}</span>
                            <Badge className={t.data?.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                              {t.data?.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-slate-400 font-mono">ID: {t.data?.device_id?.substring(0, 16)}...</p>
                          <p className="text-slate-400">Failed attempts: <span className={t.data?.failed_attempts > 0 ? 'text-red-400' : 'text-green-400'}>{t.data?.failed_attempts || 0}</span></p>
                          <p className="text-slate-500">Last used: {t.data?.last_used ? format(new Date(t.data.last_used), 'MMM d, HH:mm') : 'Never'}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Baseline vs Anomalous behavior */}
                {(selected.data?.baseline_behavior || selected.data?.anomalous_behavior) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-green-900/20 border-green-800/40">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-green-300 text-sm">✓ Baseline Behavior</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-green-200 text-xs whitespace-pre-wrap">{JSON.stringify(selected.data?.baseline_behavior || {}, null, 2)}</pre>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-900/20 border-red-800/40">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-red-300 text-sm">⚠ Anomalous Behavior</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-red-200 text-xs whitespace-pre-wrap">{JSON.stringify(selected.data?.anomalous_behavior || {}, null, 2)}</pre>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 bg-slate-800/40 rounded-xl border border-slate-700 text-slate-500">
                <AlertTriangle className="w-12 h-12 mb-3 opacity-40" />
                <p>Select an anomaly to begin investigation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}