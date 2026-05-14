import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Database, Shield, AlertTriangle, CheckCircle2, XCircle, ArrowLeft, Download } from 'lucide-react';
import PrintReportButton from '../components/PrintReportButton';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function SystemDiagnostics() {
  const [testComplete, setTestComplete] = useState(false);

  // Fetch all entity data for diagnostics
  const { data: universes = [] } = useQuery({
    queryKey: ['diag-universes'],
    queryFn: () => base44.entities.Universe.list(),
  });

  const { data: securityLogs = [] } = useQuery({
    queryKey: ['diag-logs'],
    queryFn: () => base44.entities.SecurityLog.list(),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['diag-alerts'],
    queryFn: () => base44.entities.CriminalActivityAlert.list(),
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['diag-metrics'],
    queryFn: () => base44.entities.AnalyticsMetric.list(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['diag-sessions'],
    queryFn: () => base44.entities.ScramblingSession.list(),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['diag-roles'],
    queryFn: () => base44.entities.Role.list(),
  });

  const { data: correlations = [] } = useQuery({
    queryKey: ['diag-correlations'],
    queryFn: () => base44.entities.ThreatCorrelation.list(),
  });

  const { data: anomalies = [] } = useQuery({
    queryKey: ['diag-anomalies'],
    queryFn: () => base44.entities.BehaviorAnomaly.list(),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['diag-reports'],
    queryFn: () => base44.entities.SecurityReport.list(),
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['diag-requests'],
    queryFn: () => base44.entities.UniversalRequest.list(),
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['diag-tokens'],
    queryFn: () => base44.entities.HardwareToken.list(),
  });

  // Calculate diagnostics
  const diagnostics = {
    universes: {
      total: universes.length,
      active: universes.filter(u => u.status === 'active').length,
      degraded: universes.filter(u => u.status === 'degraded').length,
      offline: universes.filter(u => u.status === 'offline').length,
      avgSuccessRate: universes.length > 0 ? (universes.reduce((sum, u) => sum + (u.success_rate || 0), 0) / universes.length).toFixed(1) : 0
    },
    security: {
      totalLogs: securityLogs.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency').length,
      highAlerts: alerts.filter(a => a.severity === 'high').length,
      autoBlocked: alerts.filter(a => a.auto_blocked).length,
      threatLevels: {
        critical: securityLogs.filter(l => l.threat_level === 'critical').length,
        high: securityLogs.filter(l => l.threat_level === 'high').length,
        medium: securityLogs.filter(l => l.threat_level === 'medium').length,
        low: securityLogs.filter(l => l.threat_level === 'low').length,
        none: securityLogs.filter(l => l.threat_level === 'none').length
      }
    },
    authentication: {
      totalTokens: tokens.length,
      activeTokens: tokens.filter(t => t.is_active).length,
      failedAttempts: tokens.reduce((sum, t) => sum + (t.failed_attempts || 0), 0),
      authMetrics: metrics.filter(m => m.metric_type === 'auth_attempt').length,
      successfulAuth: metrics.filter(m => m.metric_type === 'auth_attempt' && m.success).length,
      failedAuth: metrics.filter(m => m.metric_type === 'auth_attempt' && !m.success).length
    },
    scrambling: {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.status === 'active').length,
      totalIterations: sessions.reduce((sum, s) => sum + (s.iterations || 0), 0),
      avgProtection: sessions.length > 0 ? (sessions.reduce((sum, s) => sum + (s.protection_score || 0), 0) / sessions.length).toFixed(1) : 0
    },
    ai: {
      attackChains: correlations.length,
      activeChains: correlations.filter(c => c.status === 'active').length,
      anomalies: anomalies.length,
      detectedAnomalies: anomalies.filter(a => a.status === 'detected').length,
      confirmedThreats: anomalies.filter(a => a.status === 'confirmed_threat').length
    },
    rbac: {
      totalRoles: roles.length,
      systemRoles: roles.filter(r => r.is_system_role).length,
      customRoles: roles.filter(r => !r.is_system_role).length
    },
    reporting: {
      totalReports: reports.length,
      activeReports: reports.filter(r => r.is_active).length,
      generatedReports: reports.filter(r => r.last_run).length
    },
    performance: {
      totalRequests: requests.length,
      successfulRequests: requests.filter(r => r.status === 'success').length,
      failedRequests: requests.filter(r => r.status === 'failed').length,
      avgLatency: requests.length > 0 ? (requests.reduce((sum, r) => sum + (r.latency_ms || 0), 0) / requests.length).toFixed(0) : 0
    }
  };

  const systemHealth = {
    status: diagnostics.security.criticalAlerts === 0 && diagnostics.universes.active > 0 ? 'healthy' : 
            diagnostics.security.criticalAlerts > 0 ? 'critical' : 'warning',
    score: Math.round(
      (diagnostics.universes.avgSuccessRate * 0.3) +
      (diagnostics.scrambling.avgProtection * 0.3) +
      ((diagnostics.security.criticalAlerts === 0 ? 100 : 0) * 0.4)
    )
  };

  const generateReport = () => {
    const reportContent = `
FORGED API SYSTEM DIAGNOSTICS REPORT
Generated: ${new Date().toLocaleString()}
Database Mode: ${testComplete ? 'Test Database' : 'Production Database'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYSTEM HEALTH OVERVIEW
Status: ${systemHealth.status.toUpperCase()}
Health Score: ${systemHealth.score}/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. API UNIVERSES (Forged API Gateway)
   • Total Universes: ${diagnostics.universes.total}
   • Active: ${diagnostics.universes.active}
   • Degraded: ${diagnostics.universes.degraded}
   • Offline: ${diagnostics.universes.offline}
   • Average Success Rate: ${diagnostics.universes.avgSuccessRate}%

2. SECURITY INFRASTRUCTURE
   • Total Security Logs: ${diagnostics.security.totalLogs}
   • Critical Alerts: ${diagnostics.security.criticalAlerts}
   • High Priority Alerts: ${diagnostics.security.highAlerts}
   • Auto-blocked Threats: ${diagnostics.security.autoBlocked}
   
   Threat Distribution:
   • Critical: ${diagnostics.security.threatLevels.critical}
   • High: ${diagnostics.security.threatLevels.high}
   • Medium: ${diagnostics.security.threatLevels.medium}
   • Low: ${diagnostics.security.threatLevels.low}
   • None: ${diagnostics.security.threatLevels.none}

3. BIOVERIFY (DNA Authentication System)
   • Total Hardware Tokens: ${diagnostics.authentication.totalTokens}
   • Active Tokens: ${diagnostics.authentication.activeTokens}
   • Total Failed Attempts: ${diagnostics.authentication.failedAttempts}
   • Authentication Attempts: ${diagnostics.authentication.authMetrics}
   • Successful: ${diagnostics.authentication.successfulAuth}
   • Failed: ${diagnostics.authentication.failedAuth}

4. DYNAMIC SCRAMBLING SYSTEM (IP Shield)
   • Active Scrambling Sessions: ${diagnostics.scrambling.activeSessions}/${diagnostics.scrambling.totalSessions}
   • Total Scramble Iterations: ${diagnostics.scrambling.totalIterations}
   • Average Protection Score: ${diagnostics.scrambling.avgProtection}%

5. AI THREAT INTELLIGENCE
   • Attack Chain Correlations: ${diagnostics.ai.attackChains}
   • Active Attack Chains: ${diagnostics.ai.activeChains}
   • Behavioral Anomalies: ${diagnostics.ai.anomalies}
   • Detected Anomalies: ${diagnostics.ai.detectedAnomalies}
   • Confirmed Threats: ${diagnostics.ai.confirmedThreats}

6. ROLE-BASED ACCESS CONTROL (RBAC)
   • Total Roles: ${diagnostics.rbac.totalRoles}
   • System Roles: ${diagnostics.rbac.systemRoles}
   • Custom Roles: ${diagnostics.rbac.customRoles}

7. AUTOMATED REPORTING
   • Total Reports: ${diagnostics.reporting.totalReports}
   • Active Schedules: ${diagnostics.reporting.activeReports}
   • Generated Reports: ${diagnostics.reporting.generatedReports}

8. PERFORMANCE METRICS
   • Total API Requests: ${diagnostics.performance.totalRequests}
   • Successful: ${diagnostics.performance.successfulRequests}
   • Failed: ${diagnostics.performance.failedRequests}
   • Average Latency: ${diagnostics.performance.avgLatency}ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYSTEM STATUS: ${systemHealth.status === 'healthy' ? '✓ ALL SYSTEMS OPERATIONAL' : 
                systemHealth.status === 'critical' ? '⚠ CRITICAL ALERTS ACTIVE' : '⚠ WARNINGS DETECTED'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-diagnostics-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Dashboard')}>
                <Button variant="outline" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/50">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold gradient-text">System Diagnostics</h1>
                  <p className="text-slate-400">Complete system health analysis and data verification</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <PrintReportButton
                reportTitle="System Diagnostics Report"
                subtitle="Complete system health analysis across all modules"
                filename="system-diagnostics-{date}.pdf"
                sections={[
                  { heading: 'SYSTEM HEALTH OVERVIEW', rows: [['System Status', systemHealth.status.toUpperCase()], ['Health Score', `${systemHealth.score}/100`]] },
                  { heading: 'API UNIVERSES', rows: [['Total', diagnostics.universes.total], ['Active', diagnostics.universes.active], ['Degraded', diagnostics.universes.degraded], ['Offline', diagnostics.universes.offline], ['Avg Success Rate', `${diagnostics.universes.avgSuccessRate}%`]] },
                  { heading: 'SECURITY INFRASTRUCTURE', rows: [['Total Logs', diagnostics.security.totalLogs], ['Critical Alerts', diagnostics.security.criticalAlerts], ['High Alerts', diagnostics.security.highAlerts], ['Auto-Blocked', diagnostics.security.autoBlocked], ['Critical Threats', diagnostics.security.threatLevels.critical], ['High Threats', diagnostics.security.threatLevels.high]] },
                  { heading: 'BIOVERIFY AUTHENTICATION', rows: [['Total Tokens', diagnostics.authentication.totalTokens], ['Active Tokens', diagnostics.authentication.activeTokens], ['Auth Attempts', diagnostics.authentication.authMetrics], ['Successful Auth', diagnostics.authentication.successfulAuth], ['Failed Auth', diagnostics.authentication.failedAuth]] },
                  { heading: 'IP SHIELD (SCRAMBLING)', rows: [['Active Sessions', diagnostics.scrambling.activeSessions], ['Total Sessions', diagnostics.scrambling.totalSessions], ['Total Iterations', diagnostics.scrambling.totalIterations], ['Avg Protection Score', `${diagnostics.scrambling.avgProtection}%`]] },
                  { heading: 'AI THREAT INTELLIGENCE', rows: [['Attack Chains', diagnostics.ai.attackChains], ['Active Chains', diagnostics.ai.activeChains], ['Anomalies', diagnostics.ai.anomalies], ['Detected', diagnostics.ai.detectedAnomalies], ['Confirmed Threats', diagnostics.ai.confirmedThreats]] },
                  { heading: 'PERFORMANCE', rows: [['Total Requests', diagnostics.performance.totalRequests], ['Successful', diagnostics.performance.successfulRequests], ['Failed', diagnostics.performance.failedRequests], ['Avg Latency', `${diagnostics.performance.avgLatency}ms`]] },
                  { heading: 'ACCESS CONTROL & REPORTING', rows: [['Total Roles', diagnostics.rbac.totalRoles], ['System Roles', diagnostics.rbac.systemRoles], ['Custom Roles', diagnostics.rbac.customRoles], ['Total Reports', diagnostics.reporting.totalReports], ['Active Schedules', diagnostics.reporting.activeReports]] },
                ]}
              />
              <Button onClick={generateReport} className="bg-emerald-600 hover:bg-emerald-700">
                <Download className="w-4 h-4 mr-2" />
                Download .TXT
              </Button>
            </div>
          </div>

          {/* System Health */}
          <Card className={`mb-6 ${systemHealth.status === 'healthy' ? 'border-emerald-500 bg-emerald-500/10' : 
                                    systemHealth.status === 'critical' ? 'border-red-500 bg-red-500/10' : 
                                    'border-amber-500 bg-amber-500/10'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {systemHealth.status === 'healthy' ? <CheckCircle2 className="w-12 h-12 text-emerald-400" /> :
                   systemHealth.status === 'critical' ? <XCircle className="w-12 h-12 text-red-400" /> :
                   <AlertTriangle className="w-12 h-12 text-amber-400" />}
                  <div>
                    <h2 className="text-2xl font-bold text-slate-100">System Status: {systemHealth.status.toUpperCase()}</h2>
                    <p className="text-slate-300">Health Score: {systemHealth.score}/100</p>
                  </div>
                </div>
                <Badge className={`text-lg px-4 py-2 ${
                  systemHealth.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' :
                  systemHealth.status === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                  'bg-amber-500/20 text-amber-400 border-amber-500/50'
                }`}>
                  {systemHealth.status === 'healthy' ? 'ALL SYSTEMS OPERATIONAL' :
                   systemHealth.status === 'critical' ? 'CRITICAL ALERTS ACTIVE' :
                   'WARNINGS DETECTED'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Diagnostics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* API Universes */}
            <Card className="multi-layer-card card-layer-auth border">
              <CardHeader>
                <CardTitle className="text-slate-100">API Universes</CardTitle>
                <CardDescription className="text-slate-400">Forged API Gateway Status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total:</span>
                  <span className="text-slate-200 font-semibold">{diagnostics.universes.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Active:</span>
                  <span className="text-emerald-400 font-semibold">{diagnostics.universes.active}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Degraded:</span>
                  <span className="text-amber-400 font-semibold">{diagnostics.universes.degraded}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Avg Success Rate:</span>
                  <span className="text-cyan-400 font-semibold">{diagnostics.universes.avgSuccessRate}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="multi-layer-card card-layer-threat border">
              <CardHeader>
                <CardTitle className="text-slate-100">Security Infrastructure</CardTitle>
                <CardDescription className="text-slate-400">Threat Detection & Monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Logs:</span>
                  <span className="text-slate-200 font-semibold">{diagnostics.security.totalLogs}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Critical Alerts:</span>
                  <span className="text-red-400 font-semibold">{diagnostics.security.criticalAlerts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">High Alerts:</span>
                  <span className="text-orange-400 font-semibold">{diagnostics.security.highAlerts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Auto-blocked:</span>
                  <span className="text-emerald-400 font-semibold">{diagnostics.security.autoBlocked}</span>
                </div>
              </CardContent>
            </Card>

            {/* BioVerify */}
            <Card className="multi-layer-card card-layer-data border">
              <CardHeader>
                <CardTitle className="text-slate-100">BioVerify</CardTitle>
                <CardDescription className="text-slate-400">DNA Authentication System</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Hardware Tokens:</span>
                  <span className="text-slate-200 font-semibold">{diagnostics.authentication.totalTokens}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Active:</span>
                  <span className="text-emerald-400 font-semibold">{diagnostics.authentication.activeTokens}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Successful Auth:</span>
                  <span className="text-emerald-400 font-semibold">{diagnostics.authentication.successfulAuth}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Failed Auth:</span>
                  <span className="text-red-400 font-semibold">{diagnostics.authentication.failedAuth}</span>
                </div>
              </CardContent>
            </Card>

            {/* Dynamic Scrambler */}
            <Card className="multi-layer-card card-layer-scramble border">
              <CardHeader>
                <CardTitle className="text-slate-100">IP Shield</CardTitle>
                <CardDescription className="text-slate-400">Dynamic Scrambling System</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Active Sessions:</span>
                  <span className="text-slate-200 font-semibold">{diagnostics.scrambling.activeSessions}/{diagnostics.scrambling.totalSessions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Iterations:</span>
                  <span className="text-violet-400 font-semibold">{diagnostics.scrambling.totalIterations.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Avg Protection:</span>
                  <span className="text-emerald-400 font-semibold">{diagnostics.scrambling.avgProtection}%</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Threat Intelligence */}
            <Card className="multi-layer-card card-layer-monitoring border">
              <CardHeader>
                <CardTitle className="text-slate-100">AI Threat Intelligence</CardTitle>
                <CardDescription className="text-slate-400">Advanced Threat Analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Attack Chains:</span>
                  <span className="text-slate-200 font-semibold">{diagnostics.ai.attackChains}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Active Chains:</span>
                  <span className="text-red-400 font-semibold">{diagnostics.ai.activeChains}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Anomalies:</span>
                  <span className="text-amber-400 font-semibold">{diagnostics.ai.anomalies}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Confirmed Threats:</span>
                  <span className="text-red-400 font-semibold">{diagnostics.ai.confirmedThreats}</span>
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card className="multi-layer-card card-layer-auth border">
              <CardHeader>
                <CardTitle className="text-slate-100">Performance Metrics</CardTitle>
                <CardDescription className="text-slate-400">System Performance Analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Requests:</span>
                  <span className="text-slate-200 font-semibold">{diagnostics.performance.totalRequests}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Successful:</span>
                  <span className="text-emerald-400 font-semibold">{diagnostics.performance.successfulRequests}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Failed:</span>
                  <span className="text-red-400 font-semibold">{diagnostics.performance.failedRequests}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Avg Latency:</span>
                  <span className="text-cyan-400 font-semibold">{diagnostics.performance.avgLatency}ms</span>
                </div>
              </CardContent>
            </Card>

            {/* RBAC */}
            <Card className="multi-layer-card card-layer-monitoring border">
              <CardHeader>
                <CardTitle className="text-slate-100">Access Control (RBAC)</CardTitle>
                <CardDescription className="text-slate-400">Role & Permission Management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Roles:</span>
                  <span className="text-slate-200 font-semibold">{diagnostics.rbac.totalRoles}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">System Roles:</span>
                  <span className="text-violet-400 font-semibold">{diagnostics.rbac.systemRoles}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Custom Roles:</span>
                  <span className="text-cyan-400 font-semibold">{diagnostics.rbac.customRoles}</span>
                </div>
              </CardContent>
            </Card>

            {/* Reporting */}
            <Card className="multi-layer-card card-layer-data border">
              <CardHeader>
                <CardTitle className="text-slate-100">Automated Reporting</CardTitle>
                <CardDescription className="text-slate-400">Security Report Generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Reports:</span>
                  <span className="text-slate-200 font-semibold">{diagnostics.reporting.totalReports}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Active Schedules:</span>
                  <span className="text-emerald-400 font-semibold">{diagnostics.reporting.activeReports}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Generated:</span>
                  <span className="text-cyan-400 font-semibold">{diagnostics.reporting.generatedReports}</span>
                </div>
              </CardContent>
            </Card>

            {/* Database Status */}
            <Card className="multi-layer-card card-layer-threat border">
              <CardHeader>
                <CardTitle className="text-slate-100">Database Status</CardTitle>
                <CardDescription className="text-slate-400">Data Integrity Check</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-slate-200">Test Database Active</span>
                </div>
                <div className="bg-slate-800/50 rounded p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Universes:</span>
                    <span className="text-emerald-400">✓ {diagnostics.universes.total} records</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Security Logs:</span>
                    <span className="text-emerald-400">✓ {diagnostics.security.totalLogs} records</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Alerts:</span>
                    <span className="text-emerald-400">✓ {alerts.length} records</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">AI Correlations:</span>
                    <span className="text-emerald-400">✓ {diagnostics.ai.attackChains} records</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}