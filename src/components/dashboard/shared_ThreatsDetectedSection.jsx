import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PrintReportButton from '../PrintReportButton';
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Radar,
  FileText,
  RefreshCw,
  Clock,
  CheckCircle2,
  Send,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const SEVERITY_CONFIG = {
  critical: {
    label: 'Critical',
    order: 4,
    badge: 'bg-red-500/20 text-red-300 border-red-500/50',
    dot: 'bg-red-500 animate-pulse',
    border: 'border-red-500/40 bg-red-950/20',
  },
  high: {
    label: 'High',
    order: 3,
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
    dot: 'bg-orange-400',
    border: 'border-orange-500/35 bg-orange-950/15',
  },
  medium: {
    label: 'Medium',
    order: 2,
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    dot: 'bg-amber-400',
    border: 'border-amber-500/30 bg-amber-950/10',
  },
  low: {
    label: 'Low',
    order: 1,
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    dot: 'bg-blue-400',
    border: 'border-slate-700/80 bg-slate-900/50',
  },
};

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Recent';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'Recent';
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return 'Just now';
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SharedThreatsDetectedSection({
  securityLogs = [],
  universes = [],
  requests = [],
  hardwareTokens = [],
}) {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [reportResult, setReportResult] = useState(null);

  const {
    data: criminalAlerts = [],
    isLoading: loadingAlerts,
    refetch: refetchAlerts,
    isFetching: fetchingAlerts,
  } = useQuery({
    queryKey: ['dashboardCriminalAlerts'],
    queryFn: async () => {
      const res = await base44.entities.CriminalActivityAlert.list('-created_date', 30);
      return Array.isArray(res) ? res : res?.items || [];
    },
    refetchInterval: 30000,
  });

  const {
    data: anomalies = [],
    isLoading: loadingAnomalies,
    refetch: refetchAnomalies,
  } = useQuery({
    queryKey: ['dashboardBehaviorAnomalies'],
    queryFn: async () => {
      const res = await base44.entities.BehaviorAnomaly.list('-created_date', 30);
      return Array.isArray(res) ? res : res?.items || [];
    },
    refetchInterval: 30000,
  });

  const {
    data: correlations = [],
    refetch: refetchCorrelations,
  } = useQuery({
    queryKey: ['dashboardThreatCorrelations'],
    queryFn: async () => {
      const res = await base44.entities.ThreatCorrelation.list('-created_date', 20);
      return Array.isArray(res) ? res : res?.items || [];
    },
    refetchInterval: 30000,
  });

  const unifiedThreats = useMemo(() => {
    const items = [];

    criminalAlerts.forEach((a) => {
      const sev =
        a.severity === 'emergency'
          ? 'critical'
          : SEVERITY_CONFIG[a.severity]
          ? a.severity
          : 'high';
      items.push({
        id: `alert-${a.id}`,
        title: (a.alert_type || 'security_threat').replace(/_/g, ' '),
        source: 'Threat Alert',
        severity: sev,
        status: a.auto_blocked ? 'Auto-Blocked' : a.status || 'Open',
        actor: a.user_identifier || a.ip_address || 'External source',
        description:
          Array.isArray(a.indicators) && a.indicators.length > 0
            ? a.indicators.join(' • ')
            : `Confidence ${a.confidence_score ?? 90}% — ${a.status || 'active'} threat alert`,
        timestamp: a.detection_timestamp || a.created_date,
      });
    });

    anomalies.forEach((an) => {
      const sev = SEVERITY_CONFIG[an.severity] ? an.severity : 'medium';
      items.push({
        id: `anomaly-${an.id}`,
        title: (an.anomaly_type || 'behavior_anomaly').replace(/_/g, ' '),
        source: 'Behavior Anomaly',
        severity: sev,
        status: an.status || 'Detected',
        actor: an.user_identifier || 'Monitored session',
        description:
          an.ai_reasoning ||
          an.description ||
          `Behavioral deviation score: ${an.deviation_score ?? 75}/100`,
        timestamp: an.detection_timestamp || an.created_date,
      });
    });

    correlations.forEach((c) => {
      const sev = SEVERITY_CONFIG[c.severity] ? c.severity : 'high';
      items.push({
        id: `corr-${c.id}`,
        title: c.attack_chain_name || 'Correlated Attack Pattern',
        source: 'Correlation Engine',
        severity: sev,
        status: c.status || 'Active',
        actor: c.kill_chain_stage || 'Multi-vector',
        description:
          c.mitigation_steps?.[0] ||
          `Correlated threat pattern (${c.confidence_score ?? 88}% confidence)`,
        timestamp: c.created_date,
      });
    });

    securityLogs
      .filter(
        (l) =>
          l.event_type === 'access_denied' ||
          l.event_type === 'suspicious_activity' ||
          l.event_type === 'token_activation_failure' ||
          l.success === false ||
          l.threat_level === 'high' ||
          l.threat_level === 'critical' ||
          l.threat_level === 'medium'
      )
      .forEach((l) => {
        const rawSev =
          l.threat_level && l.threat_level !== 'none'
            ? l.threat_level
            : l.event_type === 'token_activation_failure' || l.event_type === 'access_denied'
            ? 'high'
            : 'medium';
        const sev = SEVERITY_CONFIG[rawSev] ? rawSev : 'medium';
        items.push({
          id: `log-${l.id}`,
          title: (l.event_type || 'security_event').replace(/_/g, ' '),
          source: 'Security Log',
          severity: sev,
          status: l.success === false ? 'Blocked' : 'Flagged',
          actor: l.ip_address || 'Gateway Monitor',
          description: l.details || 'Unauthorized access or suspicious activity recorded.',
          timestamp: l.created_date,
        });
      });

    return items.sort(
      (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
  }, [criminalAlerts, anomalies, correlations, securityLogs]);

  const counts = useMemo(() => {
    return {
      critical: unifiedThreats.filter((t) => t.severity === 'critical').length,
      high: unifiedThreats.filter((t) => t.severity === 'high').length,
      medium: unifiedThreats.filter((t) => t.severity === 'medium').length,
      low: unifiedThreats.filter((t) => t.severity === 'low').length,
    };
  }, [unifiedThreats]);

  const weeklyMetrics = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentThreats = unifiedThreats.filter(
      (t) => !t.timestamp || new Date(t.timestamp).getTime() >= weekAgo
    );
    const weekLogs = securityLogs.filter(
      (l) => !l.created_date || new Date(l.created_date).getTime() >= weekAgo
    );
    const blockedCount = weekLogs.filter(
      (l) => l.event_type === 'access_denied' || l.success === false
    ).length;
    const tokenFailures = weekLogs.filter(
      (l) => l.event_type === 'token_activation_failure'
    ).length;
    const activeUniverses = universes.filter((u) => u.status === 'active').length;
    const successfulReqs = requests.filter((r) => r.status === 'success').length;
    const apiSuccessRate = requests.length
      ? ((successfulReqs / requests.length) * 100).toFixed(1)
      : '100.0';

    return {
      totalThreats7d: recentThreats.length,
      criticalHigh7d: recentThreats.filter(
        (t) => t.severity === 'critical' || t.severity === 'high'
      ).length,
      totalLogs7d: weekLogs.length,
      blockedCount,
      tokenFailures,
      activeUniverses,
      apiSuccessRate,
      activeTokens: hardwareTokens.length,
    };
  }, [unifiedThreats, securityLogs, universes, requests, hardwareTokens]);

  const filteredThreats =
    severityFilter === 'all'
      ? unifiedThreats.slice(0, 9)
      : unifiedThreats.filter((t) => t.severity === severityFilter).slice(0, 9);

  const handleRefreshAll = () => {
    refetchAlerts();
    refetchAnomalies();
    refetchCorrelations();
  };

  const handleGenerateWeeklyReport = async () => {
    setSendingReport(true);
    setReportResult(null);
    try {
      const res = await base44.functions.invoke('generateWeeklyThreatReport', {});
      setReportResult(res.data);
    } catch (err) {
      setReportResult({ error: err.message || 'Could not generate report' });
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <div className="multi-layer-card card-layer-threat rounded-xl p-5 border mb-8">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/40">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">Threats Detected</h3>
              <Badge
                variant="outline"
                className="border-red-500/40 text-red-300 bg-red-500/10 text-xs"
              >
                {unifiedThreats.length} Total
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Real-time threat detections, severity classifications, and weekly security activity review
            </p>
          </div>
        </div>

        {/* Severity Filter Pills & Report Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSeverityFilter('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              severityFilter === 'all'
                ? 'bg-slate-200 text-slate-900 border-white'
                : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            All ({unifiedThreats.length})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('critical')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              severityFilter === 'critical'
                ? 'bg-red-500 text-white border-red-400'
                : 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            {counts.critical} Critical
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('high')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              severityFilter === 'high'
                ? 'bg-orange-500 text-white border-orange-400'
                : 'bg-orange-500/10 text-orange-300 border-orange-500/30 hover:bg-orange-500/20'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            {counts.high} High
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('medium')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              severityFilter === 'medium'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {counts.medium} Medium
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('low')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              severityFilter === 'low'
                ? 'bg-blue-500 text-white border-blue-400'
                : 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            {counts.low} Low
          </button>

          <Button
            type="button"
            size="sm"
            onClick={() => setShowWeeklyReport((prev) => !prev)}
            className="h-7 px-3 text-xs bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Weekly Summary Report
            {showWeeklyReport ? (
              <ChevronUp className="w-3.5 h-3.5 ml-1" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
            )}
          </Button>

          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={fetchingAlerts}
            className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Refresh detected threats"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetchingAlerts ? 'animate-spin text-red-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expandable Weekly Threat & System Activity Summary Report Panel */}
      {showWeeklyReport && (
        <div className="mb-5 rounded-xl border border-cyan-500/40 bg-slate-950/80 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">
                  Weekly Threat & System Activity Summary Report (Last 7 Days)
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Consolidated 7-day review of detected threats, blocked access attempts, token health, and API routing performance
              </p>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleGenerateWeeklyReport}
                disabled={sendingReport}
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {sendingReport ? 'Generating & Emailing…' : 'Generate & Email Weekly Report'}
              </Button>
              <PrintReportButton
                reportTitle="Reclaim Me — Weekly Threat & System Activity Summary Report"
                subtitle="7-Day Security Performance, Threat Detections & Moving-Target Defense Review"
                filename="weekly-threat-activity-summary-{date}.pdf"
                sections={[
                  {
                    heading: '7-DAY THREAT & SECURITY PERFORMANCE METRICS',
                    rows: [
                      ['Total Threats Detected (7d)', weeklyMetrics.totalThreats7d],
                      ['Critical & High Severity Threats', weeklyMetrics.criticalHigh7d],
                      ['Security Log Events Analyzed', weeklyMetrics.totalLogs7d],
                      ['Blocked / Unauthorized Access Attempts', weeklyMetrics.blockedCount],
                      ['HelixVerify Token Activation Failures', weeklyMetrics.tokenFailures],
                      ['Active HelixVerify Hardware Tokens', weeklyMetrics.activeTokens],
                      ['Active API Universes', weeklyMetrics.activeUniverses],
                      ['API Gateway Success Rate', `${weeklyMetrics.apiSuccessRate}%`],
                    ],
                  },
                  {
                    heading: 'MOST RECENT DETECTED THREATS BY SEVERITY',
                    rows: unifiedThreats.slice(0, 12).map((t) => [
                      `[${t.severity.toUpperCase()}] ${t.title} (${t.source})`,
                      `${t.status} — ${t.actor} — ${t.description}`,
                    ]),
                  },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3">
              <p className="text-[11px] text-slate-400">Threats Detected (7d)</p>
              <p className="text-xl font-bold text-red-400 mt-0.5">
                {weeklyMetrics.totalThreats7d}
              </p>
              <p className="text-[11px] text-slate-500">
                {weeklyMetrics.criticalHigh7d} critical / high severity
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3">
              <p className="text-[11px] text-slate-400">Blocked Access Attempts</p>
              <p className="text-xl font-bold text-amber-400 mt-0.5">
                {weeklyMetrics.blockedCount}
              </p>
              <p className="text-[11px] text-slate-500">
                {weeklyMetrics.tokenFailures} token activation failures
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3">
              <p className="text-[11px] text-slate-400">System Log Activity (7d)</p>
              <p className="text-xl font-bold text-cyan-400 mt-0.5">
                {weeklyMetrics.totalLogs7d}
              </p>
              <p className="text-[11px] text-slate-500">
                {weeklyMetrics.activeTokens} active HelixVerify tokens
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3">
              <p className="text-[11px] text-slate-400">Gateway Performance</p>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">
                {weeklyMetrics.apiSuccessRate}%
              </p>
              <p className="text-[11px] text-slate-500">
                {weeklyMetrics.activeUniverses} active API universes
              </p>
            </div>
          </div>

          {reportResult && (
            <div
              className={`rounded-lg p-3 text-xs flex items-center justify-between flex-wrap gap-2 border ${
                reportResult.error
                  ? 'bg-red-950/40 border-red-500/40 text-red-300'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <span>
                {reportResult.error
                  ? `Report error: ${reportResult.error}`
                  : `Weekly report generated and logged${
                      reportResult.email_sent ? ` • Emailed to ${reportResult.recipient}` : ''
                    }.`}
              </span>
              {reportResult.file_url && (
                <a
                  href={reportResult.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Open Generated PDF →
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recent Threats Grid */}
      {loadingAlerts && loadingAnomalies ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-sm">
          <div className="w-5 h-5 border-2 border-slate-700 border-t-red-400 rounded-full animate-spin" />
          <span>Scanning recent threat activity…</span>
        </div>
      ) : filteredThreats.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm text-slate-200 font-medium">
            No threats matching the selected severity filter
          </p>
          <p className="text-xs text-slate-500 mt-1">
            All monitored endpoints, HelixVerify tokens, and behavioral baselines are clear.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredThreats.map((threat) => {
            const cfg = SEVERITY_CONFIG[threat.severity] || SEVERITY_CONFIG.medium;
            return (
              <div
                key={threat.id}
                className={`rounded-lg border p-3.5 transition-colors flex flex-col justify-between ${cfg.border}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                        <p className="text-sm font-semibold text-white capitalize truncate">
                          {threat.title}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-4 truncate">
                        {threat.source} • {threat.actor}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[11px] px-2 py-0 shrink-0 uppercase font-semibold ${cfg.badge}`}
                    >
                      {cfg.label}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                    {threat.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(threat.timestamp)}
                  </span>
                  <span className="font-medium text-slate-300 capitalize">
                    {threat.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Links */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-4">
          <Link
            to="/ThreatSummary"
            className="text-red-400 hover:text-red-300 transition-colors font-medium"
          >
            Full Threat Summary →
          </Link>
          <Link
            to="/alert-feed"
            className="text-amber-300 hover:text-amber-200 transition-colors"
          >
            Live Alert Feed →
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setShowWeeklyReport(true)}
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          View 7-Day Security Performance Report →
        </button>
      </div>
    </div>
  );
}