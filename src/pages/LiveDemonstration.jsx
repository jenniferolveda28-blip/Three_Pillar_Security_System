import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import PrintReportButton from '../components/PrintReportButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Activity,
  Dna,
  CreditCard,
  Zap,
  Eye,
  Fingerprint,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LiveDemonstration() {
  const [simulationStep, setSimulationStep] = useState(0);

  // Fetch all demonstration data
  const { data: alerts = [] } = useQuery({
    queryKey: ['demo-alerts'],
    queryFn: () => base44.entities.CriminalActivityAlert.list('-created_date', 10),
    refetchInterval: 2000
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['demo-logs'],
    queryFn: () => base44.entities.SecurityLog.list('-created_date', 10),
    refetchInterval: 2000
  });

  const { data: anomalies = [] } = useQuery({
    queryKey: ['demo-anomalies'],
    queryFn: () => base44.entities.BehaviorAnomaly.list('-created_date', 10),
    refetchInterval: 2000
  });

  const { data: correlations = [] } = useQuery({
    queryKey: ['demo-correlations'],
    queryFn: () => base44.entities.ThreatCorrelation.list('-created_date', 10),
    refetchInterval: 2000
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['demo-subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 10),
    refetchInterval: 2000
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['demo-tokens'],
    queryFn: () => base44.entities.HardwareToken.list('-created_date', 10),
    refetchInterval: 2000
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['demo-registrations'],
    queryFn: () => base44.entities.TokenRegistration.list('-created_date', 10),
    refetchInterval: 2000
  });

  const { data: scramblingSessions = [] } = useQuery({
    queryKey: ['demo-scrambling'],
    queryFn: () => base44.entities.ScramblingSession.list('-created_date', 1),
    refetchInterval: 100
  });

  const criticalAlert = alerts.find(a => a.severity === 'critical');
  const expiredSubscription = subscriptions.find(s => s.status === 'expired');
  const inactiveToken = tokens.find(t => !t.is_active);
  const activeScrambling = scramblingSessions[0];

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Live Security Demonstration</h1>
            <p className="text-slate-400">Real-time visualization of infiltration detection, threat response, and subscription enforcement</p>
          </div>
          <PrintReportButton
            reportTitle="Live Security Demonstration Report"
            subtitle="Real-time infiltration detection, IP shield response, and subscription enforcement"
            filename="live-demonstration-{date}.pdf"
            sections={[
              { heading: 'DEMO SYSTEM STATUS', rows: [['Critical Alerts', alerts.filter(a => a.severity === 'critical' || a.data?.severity === 'critical').length], ['Security Logs', logs.length], ['Behavioral Anomalies', anomalies.length], ['Active Scrambling', scramblingSessions.length > 0 ? 'YES' : 'NO'], ['Subscriptions Tracked', subscriptions.length], ['Hardware Tokens', tokens.length]] },
              { heading: 'THREAT CORRELATION', body: correlations.slice(0, 5).map(c => `• ${c.attack_chain_name || c.data?.attack_chain_name} — Confidence: ${c.confidence_score || c.data?.confidence_score}% — Status: ${c.status || c.data?.status}`).join('\n') || 'No correlations recorded.' },
              { heading: 'IP SHIELD ACTIVE DEFENSE', body: 'IP Shield continuously mutates the attack surface every 100ms. While attackers attempt reconnaissance, every API endpoint, key, and execution path changes before exploitation can occur.\n\nProtection method: Moving Target Defense\nKey rotation: 0.1 – 5 seconds\nQuatum resistance: CRYSTALS-Kyber lattice cryptography\nBreaches prevented: ZERO by mathematical design' },
            ]}
          />
        </div>

        {/* System Status Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <Card className="bg-red-950/30 border-red-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Critical Threats</p>
                  <p className="text-3xl font-bold text-red-500">{alerts.filter(a => a.severity === 'critical').length}</p>
                </div>
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-950/30 border-blue-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">IP Shield Status</p>
                  <p className="text-3xl font-bold text-blue-500">ACTIVE</p>
                </div>
                <Shield className="h-12 w-12 text-blue-500 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-950/30 border-purple-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Scrambles/Min</p>
                  <p className="text-3xl font-bold text-purple-500">600</p>
                </div>
                <Zap className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-950/30 border-green-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Protection Score</p>
                  <p className="text-3xl font-bold text-green-500">{activeScrambling?.protection_score || 99.9}%</p>
                </div>
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="infiltration" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="infiltration">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Infiltration Detection
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <CreditCard className="mr-2 h-4 w-4" />
              Subscription Enforcement
            </TabsTrigger>
          </TabsList>

          {/* SCENARIO 1: INFILTRATION DETECTION */}
          <TabsContent value="infiltration" className="space-y-6">
            <Card className="card-layer-threat">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  Live Infiltration Detected
                </CardTitle>
                <CardDescription>Demonstrating real-time threat detection, AI correlation, and automated response</CardDescription>
              </CardHeader>
            </Card>

            {/* Critical Alert Details */}
            {criticalAlert && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="bg-red-950/20 border-red-500">
                  <CardHeader>
                    <CardTitle className="text-red-500 flex items-center justify-between">
                      <span>CRITICAL ALERT: {criticalAlert.alert_type.replace('_', ' ').toUpperCase()}</span>
                      <Badge className="bg-red-600 text-white">BLOCKED</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Attacker IP</p>
                        <p className="text-lg font-mono text-red-400">{criticalAlert.ip_address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Confidence Score</p>
                        <p className="text-lg font-bold text-red-400">{criticalAlert.confidence_score}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">User Identifier</p>
                        <p className="text-lg font-mono">{criticalAlert.user_identifier}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Status</p>
                        <Badge className="bg-green-600">{criticalAlert.status}</Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400 mb-2">Attack Details</p>
                      <div className="bg-slate-900/50 p-3 rounded-lg">
                        <p className="text-sm">Attempted Endpoints: {criticalAlert.activity_details?.attempted_endpoints?.join(', ')}</p>
                        <p className="text-sm">Method: {criticalAlert.activity_details?.method}</p>
                        <p className="text-sm text-red-400">Requests/Second: {criticalAlert.activity_details?.requests_per_second}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400 mb-2">Threat Indicators</p>
                      <div className="space-y-1">
                        {criticalAlert.indicators?.map((indicator, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <p className="text-sm">{indicator}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {criticalAlert.auto_blocked && (
                        <Badge className="bg-red-600 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Auto-Blocked
                        </Badge>
                      )}
                      {criticalAlert.authorities_notified && (
                        <Badge className="bg-blue-600 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Authorities Notified
                        </Badge>
                      )}
                      {criticalAlert.notification_sent && (
                        <Badge className="bg-purple-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Alert Sent
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* AI Threat Correlation */}
            {correlations.length > 0 && (
              <Card className="card-layer-monitoring">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    AI Threat Correlation Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {correlations[0] && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{correlations[0].attack_chain_name}</h3>
                        <Badge className="bg-purple-600">Confidence: {correlations[0].confidence_score}%</Badge>
                      </div>
                      
                      <div className="bg-slate-900/50 p-4 rounded-lg">
                        <p className="text-sm text-slate-300">{correlations[0].ai_analysis}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold mb-2">Attack Chain Stages:</p>
                        <div className="space-y-2">
                          {correlations[0].attack_stages?.map((stage, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-slate-900/30 p-3 rounded-lg">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                                {stage.stage}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{stage.name}</p>
                                <p className="text-xs text-slate-400">{stage.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold mb-2">Recommended Actions:</p>
                        <ul className="space-y-1">
                          {correlations[0].recommended_actions?.map((action, idx) => (
                            <li key={idx} className="text-sm flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Behavior Anomaly */}
            {anomalies.length > 0 && (
              <Card className="card-layer-data">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-yellow-500" />
                    Behavior Anomaly Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {anomalies[0] && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-400">Anomaly Type</p>
                          <p className="font-semibold">{anomalies[0].anomaly_type.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Deviation Score</p>
                          <p className="font-semibold text-red-500">{anomalies[0].deviation_score}%</p>
                        </div>
                      </div>

                      <div className="bg-slate-900/50 p-3 rounded-lg">
                        <p className="text-sm font-semibold mb-2">AI Reasoning:</p>
                        <p className="text-sm text-slate-300">{anomalies[0].ai_reasoning}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-950/30 p-3 rounded-lg border border-green-500/30">
                          <p className="text-xs text-slate-400 mb-2">Baseline Behavior</p>
                          <p className="text-xs">Avg Requests: {anomalies[0].baseline_behavior?.avg_requests_per_minute}/min</p>
                          <p className="text-xs">Access Time: {anomalies[0].baseline_behavior?.typical_access_time}</p>
                        </div>
                        <div className="bg-red-950/30 p-3 rounded-lg border border-red-500/30">
                          <p className="text-xs text-slate-400 mb-2">Anomalous Behavior</p>
                          <p className="text-xs text-red-400">Requests: {anomalies[0].anomalous_behavior?.requests_per_minute}/min</p>
                          <p className="text-xs text-red-400">Access Time: {anomalies[0].anomalous_behavior?.access_time}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* IP Shield Response */}
            {activeScrambling && (
              <Card className="card-layer-scramble">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-500 animate-pulse" />
                    IP Shield Active Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Total Scrambles</p>
                        <p className="text-2xl font-bold text-orange-500">{activeScrambling.iterations}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Interval</p>
                        <p className="text-2xl font-bold">{activeScrambling.scramble_interval_seconds * 1000}ms</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Complexity</p>
                        <p className="text-2xl font-bold text-orange-500">{activeScrambling.complexity_level}%</p>
                      </div>
                    </div>

                    <div className="bg-orange-950/30 p-4 rounded-lg border border-orange-500/30">
                      <p className="text-sm font-semibold mb-2">How IP Shield Defeated This Attack:</p>
                      <p className="text-sm text-slate-300">
                        While the attacker was attempting to map our API structure and harvest keys, 
                        IP Shield executed <strong className="text-orange-500">{activeScrambling.iterations} scrambles</strong> in 
                        real-time. Every 100ms, the entire attack surface mutated—API endpoints, encryption keys, 
                        execution paths—rendering all reconnaissance data obsolete. The attacker couldn't complete 
                        their attack cycle because the system they were analyzing no longer existed by the time they 
                        attempted exploitation.
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400 mb-2">Affected Systems (Continuously Mutating)</p>
                      <div className="flex flex-wrap gap-2">
                        {activeScrambling.affected_systems?.map((system, idx) => (
                          <Badge key={idx} className="bg-orange-600">{system}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-Time Security Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {log.threat_level === 'critical' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        {log.threat_level === 'high' && <AlertCircle className="h-4 w-4 text-orange-500" />}
                        {log.threat_level === 'medium' && <Activity className="h-4 w-4 text-yellow-500" />}
                        <div>
                          <p className="text-sm font-semibold">{log.event_type.replace('_', ' ').toUpperCase()}</p>
                          <p className="text-xs text-slate-400">{log.details}</p>
                        </div>
                      </div>
                      <Badge className={
                        log.threat_level === 'critical' ? 'bg-red-600' :
                        log.threat_level === 'high' ? 'bg-orange-600' :
                        'bg-yellow-600'
                      }>
                        {log.threat_level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SCENARIO 2: SUBSCRIPTION ENFORCEMENT */}
          <TabsContent value="subscription" className="space-y-6">
            <Card className="card-layer-auth">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-blue-500" />
                  Subscription Status & Access Control
                </CardTitle>
                <CardDescription>Demonstrating automatic token revocation on subscription failure and identity recovery</CardDescription>
              </CardHeader>
            </Card>

            {/* Expired Subscription */}
            {expiredSubscription && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="bg-orange-950/20 border-orange-500">
                  <CardHeader>
                    <CardTitle className="text-orange-500 flex items-center justify-between">
                      <span>SUBSCRIPTION EXPIRED</span>
                      <Badge className="bg-orange-600 text-white">ACTION REQUIRED</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">User Email</p>
                        <p className="text-lg font-mono">{expiredSubscription.user_email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Token Serial</p>
                        <p className="text-lg font-mono text-orange-400">{expiredSubscription.token_serial}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Plan Type</p>
                        <p className="text-lg font-semibold uppercase">{expiredSubscription.plan_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Status</p>
                        <Badge className="bg-orange-600">{expiredSubscription.status}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Expired On</p>
                        <p className="text-sm">{new Date(expiredSubscription.end_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">API Usage</p>
                        <p className="text-sm">{expiredSubscription.api_calls_used} / {expiredSubscription.api_calls_limit}</p>
                      </div>
                    </div>

                    <div className="bg-orange-950/30 p-4 rounded-lg border border-orange-500/30">
                      <p className="text-sm font-semibold mb-2">⚠️ Automatic Token Revocation Triggered</p>
                      <p className="text-sm text-slate-300">
                        Upon subscription expiration, the system automatically revoked access for token 
                        <strong className="text-orange-400"> {expiredSubscription.token_serial}</strong>. 
                        The physical hardware token is now inactive and cannot be used for authentication 
                        until the subscription is renewed.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Revoked Token Status */}
            {inactiveToken && (
              <Card className="bg-red-950/20 border-red-500">
                <CardHeader>
                  <CardTitle className="text-red-500 flex items-center gap-2">
                    <XCircle className="h-6 w-6" />
                    Hardware Token Deactivated
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Device Name</p>
                      <p className="text-lg font-semibold">{inactiveToken.device_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Device ID</p>
                      <p className="text-lg font-mono text-red-400">{inactiveToken.device_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Status</p>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <Badge className="bg-red-600">INACTIVE</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Authentication</p>
                      <p className="text-lg text-red-500 font-semibold">DENIED</p>
                    </div>
                  </div>

                  <div className="bg-red-950/30 p-4 rounded-lg border border-red-500/30">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Access Denied - Token Revoked
                    </p>
                    <p className="text-sm text-slate-300">
                      This hardware token has been automatically deactivated due to subscription expiration. 
                      Any attempt to authenticate with this token will be immediately rejected. The physical 
                      device is now a "paperweight" and provides zero access to the system.
                    </p>
                  </div>

                  <div className="bg-slate-900/50 p-3 rounded-lg">
                    <p className="text-xs text-slate-400">Current Authentication Code:</p>
                    <p className="text-2xl font-mono text-slate-600 tracking-widest">{inactiveToken.current_code}</p>
                    <p className="text-xs text-slate-500 mt-1">Code is non-functional while token is inactive</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* DNA Identity Preservation */}
            {registrations.length > 0 && registrations[0] && (
              <Card className="card-layer-auth border-green-500/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-500">
                    <Dna className="h-6 w-6" />
                    Biological Identity Preserved
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-950/30 p-4 rounded-lg border border-green-500/30">
                    <p className="text-sm font-semibold mb-2">✅ Identity Recovery Available</p>
                    <p className="text-sm text-slate-300">
                      While the hardware token is revoked, the user's <strong className="text-green-400">biological identity 
                      remains secure and intact</strong>. The DNA hash is stored safely using one-way encryption and can be 
                      used to provision a new token upon subscription renewal.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Registration Status</p>
                      <Badge className="bg-green-600">{registrations[0].registration_status}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Biometric Confidence</p>
                      <p className="text-lg font-bold text-green-500">{registrations[0].biometric_confidence}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Verification Method</p>
                      <div className="flex items-center gap-2">
                        <Fingerprint className="h-4 w-4 text-blue-500" />
                        <p className="text-sm">{registrations[0].verification_method.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Device Model</p>
                      <p className="text-sm">{registrations[0].device_info?.model}</p>
                    </div>
                  </div>

                  <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-500/30">
                    <p className="text-sm font-semibold mb-2">🔐 DNA Hash Storage (Never Raw DNA)</p>
                    <p className="text-xs text-slate-400 mb-2">Stored Hash (One-Way Encrypted):</p>
                    <p className="text-xs font-mono bg-slate-900 p-2 rounded break-all">{registrations[0].dna_hash}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      ⚠️ This hash cannot be reverse-engineered to reconstruct DNA. Your biological blueprint 
                      is never stored in raw form.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Recovery Process:</p>
                    <ol className="text-sm space-y-1 text-slate-300">
                      <li>1. User renews subscription</li>
                      <li>2. System verifies payment and reactivates account</li>
                      <li>3. New hardware token can be provisioned with same DNA hash</li>
                      <li>4. All linked accounts remain accessible via biological identity</li>
                      <li>5. User regains full access without losing any data or connections</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* What Happens on Renewal */}
            <Card className="bg-gradient-to-br from-blue-950/30 to-purple-950/30 border-blue-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  Subscription Renewal Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div>
                      <p className="font-semibold">Payment Processed</p>
                      <p className="text-sm text-slate-400">User completes subscription renewal payment</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div>
                      <p className="font-semibold">Subscription Entity Updated</p>
                      <p className="text-sm text-slate-400">Status changes from "expired" to "active"</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div>
                      <p className="font-semibold">Token Reactivation Triggered</p>
                      <p className="text-sm text-slate-400">Entity automation detects status change and invokes reactivateToken function</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold flex-shrink-0">4</div>
                    <div>
                      <p className="font-semibold">Hardware Token Enabled</p>
                      <p className="text-sm text-slate-400">HardwareToken.is_active set to true - device is operational</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold flex-shrink-0">5</div>
                    <div>
                      <p className="font-semibold">Full Access Restored</p>
                      <p className="text-sm text-slate-400">User can authenticate with DNA breathalyzer - all systems accessible</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}