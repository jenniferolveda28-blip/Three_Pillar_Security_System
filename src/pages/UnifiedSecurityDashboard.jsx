import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Zap, Clock, CheckCircle, XCircle, Activity, Filter, ChevronDown } from 'lucide-react';
import PrintReportButton from '../components/PrintReportButton';
import { format, formatDistanceToNow } from 'date-fns';

const SEV_COLOR = {
  low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-300 border-red-500/30',
  emergency: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

const STATUS_ICON = {
  detected: <Clock className="w-3 h-3 text-slate-400" />,
  investigating: <Activity className="w-3 h-3 text-orange-400 animate-pulse" />,
  confirmed_threat: <XCircle className="w-3 h-3 text-red-400" />,
  false_positive: <CheckCircle className="w-3 h-3 text-slate-400" />,
  resolved: <CheckCircle className="w-3 h-3 text-green-400" />,
};

const NEUTRALIZE_ACTIONS = {
  detected: { label: 'Quarantine', next: 'investigating', color: 'bg-orange-600 hover:bg-orange-700' },
  investigating: { label: 'Confirm Threat', next: 'confirmed_threat', color: 'bg-red-600 hover:bg-red-700' },
  confirmed_threat: { label: 'Resolve', next: 'resolved', color: 'bg-green-600 hover:bg-green-700' },
};

function TimelineEvent({ event }) {
  const isAnomaly = event.source === 'anomaly';
  const isAlert = event.source === 'alert';
  const isScramble = event.source === 'scramble';
  const isLog = event.source === 'log';

  const dotColor = isAnomaly ? 'bg-orange-400' : isAlert ? 'bg-red-400' : isScramble ? 'bg-yellow-400' : 'bg-blue-400';
  const lineColor = isAnomaly ? 'border-orange-800/40' : isAlert ? 'border-red-800/40' : isScramble ? 'border-yellow-800/40' : 'border-blue-800/40';

  return (
    <div className={`flex gap-3 py-2.5 border-b ${lineColor} last:border-0`}>
      <div className="flex flex-col items-center mt-1.5 flex-shrink-0">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${isAnomaly ? 'bg-orange-500/15 text-orange-300' : isAlert ? 'bg-red-500/15 text-red-300' : isScramble ? 'bg-yellow-500/15 text-yellow-300' : 'bg-blue-500/15 text-blue-300'}`}>
            {isAnomaly ? 'ANOMALY' : isAlert ? 'ALERT' : isScramble ? 'SCRAMBLE' : 'LOG'}
          </span>
          <span className="text-slate-300 text-sm truncate">{event.title}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-slate-500 text-xs">{event.time ? formatDistanceToNow(new Date(event.time), { addSuffix: true }) : ''}</span>
          {event.severity && <Badge className={`text-xs py-0 ${SEV_COLOR[event.severity] || SEV_COLOR.medium}`}>{event.severity}</Badge>}
          {event.detail && <span className="text-slate-500 text-xs truncate">{event.detail}</span>}
        </div>
      </div>
    </div>
  );
}

export default function UnifiedSecurityDashboard() {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [timelineLimit, setTimelineLimit] = useState(100);
  const qc = useQueryClient();

  const { data: anomalies = [] } = useQuery({ queryKey: ['usd-anomalies'], queryFn: () => base44.entities.BehaviorAnomaly.list('-created_date', 200), refetchInterval: 5000 });
  const { data: alerts = [] } = useQuery({ queryKey: ['usd-alerts'], queryFn: () => base44.entities.CriminalActivityAlert.list('-created_date', 200), refetchInterval: 5000 });
  const { data: sessions = [] } = useQuery({ queryKey: ['usd-sessions'], queryFn: () => base44.entities.ScramblingSession.list('-created_date', 500), refetchInterval: 10000 });
  const { data: logs = [] } = useQuery({ queryKey: ['usd-logs'], queryFn: () => base44.entities.SecurityLog.list('-created_date', 500), refetchInterval: 10000 });

  const updateAnomaly = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BehaviorAnomaly.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usd-anomalies'] }),
  });

  const updateAlert = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CriminalActivityAlert.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usd-alerts'] }),
  });

  // Filtered active anomalies
  const activeAnomalies = anomalies.filter(a => {
    const status = a.data?.status || a.status;
    const sev = a.data?.severity || a.severity;
    if (['resolved', 'false_positive'].includes(status)) return false;
    if (severityFilter !== 'all' && sev !== severityFilter) return false;
    return true;
  });

  // Filtered active alerts
  const activeAlerts = alerts.filter(a => {
    const status = a.data?.status || a.status;
    const sev = a.data?.severity || a.severity;
    if (['resolved', 'false_positive'].includes(status)) return false;
    if (severityFilter !== 'all' && sev !== severityFilter) return false;
    return true;
  });

  // Build unified timeline from all sources
  const timelineEvents = [
    ...anomalies.map(a => ({
      source: 'anomaly',
      time: a.created_date,
      title: `${(a.data?.anomaly_type || '').replace(/_/g, ' ')} — ${a.data?.user_identifier || 'Unknown'}`,
      severity: a.data?.severity,
      detail: `Deviation: ${a.data?.deviation_score || 0}/100`,
      id: a.id,
    })),
    ...alerts.map(a => ({
      source: 'alert',
      time: a.created_date,
      title: `${(a.data?.alert_type || '').replace(/_/g, ' ')} — ${a.data?.user_identifier || 'Unknown'}`,
      severity: a.data?.severity,
      detail: a.data?.auto_blocked ? '🔒 Auto-blocked' : '',
      id: a.id,
    })),
    ...sessions.map(s => ({
      source: 'scramble',
      time: s.data?.last_scramble || s.created_date,
      title: `Scramble: ${(s.data?.scramble_type || '').replace(/_/g, ' ')}`,
      severity: null,
      detail: `Iterations: ${s.data?.iterations || 0} | Protection: ${s.data?.protection_score || 0}%`,
      id: s.id,
    })),
    ...logs.map(l => ({
      source: 'log',
      time: l.created_date,
      title: `${(l.data?.event_type || '').replace(/_/g, ' ')}`,
      severity: l.data?.threat_level !== 'none' ? l.data?.threat_level : null,
      detail: l.data?.details?.substring(0, 60) || '',
      id: l.id,
    })),
  ]
    .filter(e => e.time)
    .filter(e => timelineFilter === 'all' || e.source === timelineFilter)
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, timelineLimit);

  // Stats
  const criticalActive = activeAnomalies.filter(a => a.data?.severity === 'critical').length + activeAlerts.filter(a => a.data?.severity === 'critical' || a.data?.severity === 'emergency').length;
  const quarantined = activeAnomalies.filter(a => a.data?.status === 'investigating').length;
  const autoBlocked = alerts.filter(a => a.data?.auto_blocked).length;
  const totalTimeline = timelineEvents.length;

  const handleNeutralizeAnomaly = (anomaly) => {
    const status = anomaly.data?.status;
    const action = NEUTRALIZE_ACTIONS[status];
    if (!action) return;
    updateAnomaly.mutate({ id: anomaly.id, data: { status: action.next } });
  };

  const handleNeutralizeAlert = (alert) => {
    updateAlert.mutate({ id: alert.id, data: { status: 'resolved', auto_blocked: true } });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Unified Security Dashboard</h1>
              <p className="text-slate-400 text-sm">All active anomalies, neutralization status & full event timeline</p>
            </div>
          </div>
          <PrintReportButton
            reportTitle="Unified Security Dashboard Report"
            subtitle="Active anomalies, neutralization actions & complete security event timeline"
            filename="unified-security-dashboard-{date}.pdf"
            sections={[
              { heading: 'DASHBOARD SUMMARY', rows: [['Active Anomalies', activeAnomalies.length], ['Active Alerts', activeAlerts.length], ['Critical/Emergency', criticalActive], ['Auto-Quarantined', quarantined], ['Auto-Blocked', autoBlocked], ['Timeline Events Tracked', logs.length + sessions.length + anomalies.length + alerts.length]] },
              { heading: 'ACTIVE ANOMALIES', body: activeAnomalies.length > 0 ? activeAnomalies.map(a => `• [${(a.data?.severity || 'medium').toUpperCase()}] ${a.data?.user_identifier || 'Unknown'} — ${(a.data?.anomaly_type || '').replace(/_/g, ' ')} — Status: ${a.data?.status} — Deviation: ${a.data?.deviation_score || 0}/100`).join('\n') : 'No active anomalies.' },
              { heading: 'ACTIVE ALERTS', body: activeAlerts.length > 0 ? activeAlerts.map(a => `• [${(a.data?.severity || 'medium').toUpperCase()}] ${a.data?.alert_type?.replace(/_/g, ' ') || 'Unknown'} — ${a.data?.user_identifier || 'Unknown'} — Auto-Blocked: ${a.data?.auto_blocked ? 'YES' : 'NO'}`).join('\n') : 'No active alerts.' },
              { heading: 'RECENT TIMELINE (Last 50 Events)', body: timelineEvents.slice(0, 50).map(e => `[${e.time ? format(new Date(e.time), 'MM/dd HH:mm:ss') : 'N/A'}] [${e.source.toUpperCase()}] ${e.title}${e.detail ? ' — ' + e.detail : ''}`).join('\n') || 'No events.' },
            ]}
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Anomalies', value: activeAnomalies.length, color: 'text-orange-400', bg: 'border-orange-500/30' },
            { label: 'Active Alerts', value: activeAlerts.length, color: 'text-red-400', bg: 'border-red-500/30' },
            { label: 'Critical / Emergency', value: criticalActive, color: 'text-pink-400', bg: 'border-pink-500/30' },
            { label: 'Auto-Blocked Incidents', value: autoBlocked, color: 'text-green-400', bg: 'border-green-500/30' },
          ].map((s, i) => (
            <Card key={i} className={`bg-slate-800/60 border ${s.bg}`}>
              <CardContent className="p-5">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-slate-400 text-sm mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Active Anomalies Panel */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-slate-200 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" /> Active Anomalies
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={severityFilter}
                  onChange={e => setSeverityFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-600 text-slate-300 text-xs rounded px-2 py-1"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {activeAnomalies.length === 0 && (
                <div className="text-center text-slate-500 py-12 bg-slate-800/40 rounded-xl border border-slate-700">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500/40" />
                  <p>No active anomalies — system clean.</p>
                </div>
              )}
              {activeAnomalies.map(a => {
                const status = a.data?.status || 'detected';
                const action = NEUTRALIZE_ACTIONS[status];
                return (
                  <Card key={a.id} className={`border transition-all ${status === 'investigating' ? 'border-orange-500/40 bg-orange-900/10' : status === 'confirmed_threat' ? 'border-red-500/40 bg-red-900/10' : 'border-slate-700 bg-slate-800/40'}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge className={`text-xs ${SEV_COLOR[a.data?.severity] || SEV_COLOR.medium}`}>{a.data?.severity}</Badge>
                            <div className="flex items-center gap-1">
                              {STATUS_ICON[status]}
                              <span className="text-slate-400 text-xs">{status?.replace(/_/g, ' ')}</span>
                            </div>
                          </div>
                          <p className="text-slate-300 text-sm font-medium truncate">{a.data?.user_identifier || 'Unknown'}</p>
                          <p className="text-slate-500 text-xs">{(a.data?.anomaly_type || '').replace(/_/g, ' ')} — Deviation: {a.data?.deviation_score || 0}/100</p>
                          {a.data?.ai_reasoning && <p className="text-slate-600 text-xs mt-1 italic truncate">{a.data.ai_reasoning}</p>}
                        </div>
                        {action && (
                          <Button
                            size="sm"
                            className={`${action.color} text-white text-xs flex-shrink-0`}
                            onClick={() => handleNeutralizeAnomaly(a)}
                            disabled={updateAnomaly.isPending}
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            {action.label}
                          </Button>
                        )}
                      </div>
                      <p className="text-slate-600 text-xs mt-1">{a.created_date ? formatDistanceToNow(new Date(a.created_date), { addSuffix: true }) : ''}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Active Alerts Panel */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-slate-200 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" /> Active Criminal Alerts
              </h2>
            </div>
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {activeAlerts.length === 0 && (
                <div className="text-center text-slate-500 py-12 bg-slate-800/40 rounded-xl border border-slate-700">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500/40" />
                  <p>No active criminal alerts.</p>
                </div>
              )}
              {activeAlerts.map(a => (
                <Card key={a.id} className="border border-red-500/20 bg-red-900/5">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={`text-xs ${SEV_COLOR[a.data?.severity] || SEV_COLOR.medium}`}>{a.data?.severity}</Badge>
                          {a.data?.auto_blocked && <Badge className="text-xs bg-green-500/20 text-green-300">🔒 Blocked</Badge>}
                          <span className="text-slate-400 text-xs">{(a.data?.status || 'open').replace(/_/g, ' ')}</span>
                        </div>
                        <p className="text-slate-300 text-sm font-medium">{(a.data?.alert_type || '').replace(/_/g, ' ')}</p>
                        <p className="text-slate-500 text-xs truncate">{a.data?.user_identifier || 'Unknown'} {a.data?.ip_address ? `— ${a.data.ip_address}` : ''}</p>
                        {a.data?.confidence_score && <p className="text-slate-600 text-xs mt-0.5">Confidence: {a.data.confidence_score}%</p>}
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs flex-shrink-0"
                        onClick={() => handleNeutralizeAlert(a)}
                        disabled={updateAlert.isPending}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolve
                      </Button>
                    </div>
                    <p className="text-slate-600 text-xs mt-1">{a.created_date ? formatDistanceToNow(new Date(a.created_date), { addSuffix: true }) : ''}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Unified Timeline */}
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Security Event Timeline
                <Badge className="bg-slate-700 text-slate-300 ml-1">{timelineEvents.length} events</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <select
                  value={timelineFilter}
                  onChange={e => setTimelineFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-600 text-slate-300 text-xs rounded px-2 py-1"
                >
                  <option value="all">All Sources</option>
                  <option value="anomaly">Anomalies</option>
                  <option value="alert">Alerts</option>
                  <option value="scramble">Scrambles</option>
                  <option value="log">Logs</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 text-xs mt-2">
              {[['anomaly', 'bg-orange-400', 'Anomaly'], ['alert', 'bg-red-400', 'Alert'], ['scramble', 'bg-yellow-400', 'Scramble'], ['log', 'bg-blue-400', 'Log']].map(([type, dot, label]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${dot}`} />
                  <span className="text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="max-h-[600px] overflow-y-auto">
              {timelineEvents.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-12">No security events recorded yet.</p>
              ) : (
                timelineEvents.map((e, i) => <TimelineEvent key={`${e.source}-${e.id}-${i}`} event={e} />)
              )}
            </div>
            {(logs.length + sessions.length + anomalies.length + alerts.length) > timelineLimit && (
              <div className="text-center mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 text-xs"
                  onClick={() => setTimelineLimit(prev => prev + 500)}
                >
                  <ChevronDown className="w-3 h-3 mr-1" /> Load more events
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}