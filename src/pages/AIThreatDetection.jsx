import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Brain, Shield, Activity, AlertTriangle } from 'lucide-react';
import PrintReportButton from '../components/PrintReportButton';
import RealTimeThreatDetector from '../components/threat/RealTimeThreatDetector';
import ThreatIntelligenceFeed from '../components/threat/ThreatIntelligenceFeed';
import SuspiciousActivityPattern from '../components/threat/SuspiciousActivityPattern';
import ThreatEventDetail from '../components/threat/ThreatEventDetail';
import BehaviorAnomalyDetector from '../components/ai/BehaviorAnomalyDetector';
import ThreatCorrelationEngine from '../components/ai/ThreatCorrelationEngine';

export default function AIThreatDetection() {
    const [activeTab, setActiveTab] = useState('realtime');
    const [selectedThreat, setSelectedThreat] = useState(null);

    const { data: securityLogs = [] } = useQuery({
        queryKey: ['securityLogs'],
        queryFn: () => base44.entities.SecurityLog.list('-created_date', 100),
        refetchInterval: 5000
    });

    const { data: anomalies = [] } = useQuery({
        queryKey: ['behaviorAnomalies'],
        queryFn: () => base44.entities.BehaviorAnomaly.filter({ status: 'detected' }),
        refetchInterval: 5000
    });

    const { data: correlations = [] } = useQuery({
        queryKey: ['threatCorrelations'],
        queryFn: () => base44.entities.ThreatCorrelation.filter({ status: 'active' }),
        refetchInterval: 5000
    });

    const { data: alerts = [] } = useQuery({
        queryKey: ['criminalActivityAlerts'],
        queryFn: () => base44.entities.CriminalActivityAlert.filter({ status: 'open' }),
        refetchInterval: 5000
    });

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link to={createPageUrl('Dashboard')}>
                        <Button variant="outline" className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>

                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg shadow-red-500/50">
                                <Brain className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold gradient-text">AI Threat Detection</h1>
                                <p className="text-slate-400">Machine learning-powered security monitoring and anomaly detection</p>
                            </div>
                        </div>
                        <PrintReportButton
                            reportTitle="AI Threat Detection Report"
                            subtitle="Real-time ML-powered security monitoring snapshot"
                            filename="ai-threat-detection-{date}.pdf"
                            sections={[
                                { heading: 'DETECTION OVERVIEW', rows: [['Security Logs', securityLogs.length], ['Open Behavior Anomalies', anomalies.length], ['Active Attack Correlations', correlations.length], ['Open Criminal Alerts', alerts.length]] },
                                { heading: 'RECENT SECURITY LOGS', body: securityLogs.slice(0, 10).map(l => `• [${(l.data?.threat_level || l.threat_level || 'none').toUpperCase()}] ${(l.data?.event_type || l.event_type || '').replace(/_/g, ' ')} — IP: ${l.data?.ip_address || l.ip_address || 'N/A'} — ${l.data?.success !== false ? 'SUCCESS' : 'FAILED'}`).join('\n') || 'No logs.' },
                                { heading: 'OPEN ALERTS', body: alerts.slice(0, 8).map(a => `• [${(a.data?.severity || a.severity || '').toUpperCase()}] ${(a.data?.alert_type || a.alert_type || '').replace(/_/g, ' ')} — User: ${a.data?.user_identifier || a.user_identifier || 'N/A'} — Auto-blocked: ${a.data?.auto_blocked ? 'YES' : 'NO'}`).join('\n') || 'No open alerts.' },
                                { heading: 'DETECTION METHODOLOGY', body: 'Real-Time Detection: Every API call and auth event is processed through a multi-layer ML pipeline that checks against known attack signatures and behavioral baselines.\n\nAnomaly Detection: 47 behavioral features are tracked per user. Deviations beyond 2 standard deviations trigger automated investigation.\n\nIntelligence Feed: Threat data is cross-referenced with global attack pattern databases updated in real-time.' },
                            ]}
                        />
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                        <TabsTrigger value="realtime" className="flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Real-Time Detection
                        </TabsTrigger>
                        <TabsTrigger value="anomalies" className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Behavior Anomalies
                        </TabsTrigger>
                        <TabsTrigger value="intelligence" className="flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            Threat Intelligence
                        </TabsTrigger>
                        <TabsTrigger value="patterns" className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Attack Patterns
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="realtime" className="space-y-6">
                        <RealTimeThreatDetector 
                            logs={securityLogs} 
                            alerts={alerts}
                            onThreatClick={setSelectedThreat}
                        />
                        {selectedThreat && (
                            <ThreatEventDetail 
                                threat={selectedThreat} 
                                onClose={() => setSelectedThreat(null)}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="anomalies" className="space-y-6">
                        <BehaviorAnomalyDetector anomalies={anomalies} />
                        <ThreatCorrelationEngine correlations={correlations} />
                    </TabsContent>

                    <TabsContent value="intelligence" className="space-y-6">
                        <ThreatIntelligenceFeed alerts={alerts} logs={securityLogs} />
                    </TabsContent>

                    <TabsContent value="patterns" className="space-y-6">
                        <SuspiciousActivityPattern logs={securityLogs} anomalies={anomalies} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}