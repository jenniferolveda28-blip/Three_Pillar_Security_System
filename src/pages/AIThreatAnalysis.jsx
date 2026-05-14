import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, ArrowLeft, Sparkles, Activity } from 'lucide-react';
import PrintReportButton from '../components/PrintReportButton';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import ThreatCorrelationEngine from '../components/ai/ThreatCorrelationEngine';
import AIThreatAssistant from '../components/ai/AIThreatAssistant';
import BehaviorAnomalyDetector from '../components/ai/BehaviorAnomalyDetector';

export default function AIThreatAnalysis() {
  const { data: correlations = [] } = useQuery({
    queryKey: ['threatCorrelations'],
    queryFn: () => base44.entities.ThreatCorrelation.list('-created_date', 50),
    refetchInterval: 5000
  });

  const { data: anomalies = [] } = useQuery({
    queryKey: ['behaviorAnomalies'],
    queryFn: () => base44.entities.BehaviorAnomaly.list('-created_date', 50),
    refetchInterval: 5000
  });

  const activeChains = correlations.filter(c => c.status === 'active').length;
  const detectedAnomalies = anomalies.filter(a => a.status === 'detected').length;

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
              <div className="p-3 bg-gradient-to-br from-pink-500 to-violet-600 rounded-xl shadow-lg shadow-pink-500/50">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text">AI Threat Intelligence</h1>
                <p className="text-slate-400">Advanced AI-powered threat correlation and behavioral analysis</p>
              </div>
            </div>
          </div>
          <PrintReportButton
            reportTitle="AI Threat Intelligence Report"
            subtitle="AI-powered threat correlation and behavioral anomaly analysis"
            filename="ai-threat-intelligence-{date}.pdf"
            sections={[
              { heading: 'LIVE THREAT METRICS', rows: [['Active Attack Chains', activeChains], ['Behavior Anomalies Detected', detectedAnomalies], ['Total Correlations', correlations.length], ['Total Anomalies Tracked', anomalies.length]] },
              { heading: 'ATTACK CHAIN CORRELATIONS', body: correlations.slice(0, 10).map(c => `• [${(c.data?.severity || c.severity || 'unknown').toUpperCase()}] ${c.data?.attack_chain_name || c.attack_chain_name || 'Unknown Chain'} — Status: ${c.data?.status || c.status} — Confidence: ${c.data?.confidence_score || c.confidence_score || 'N/A'}%`).join('\n') || 'No active correlations.' },
              { heading: 'BEHAVIOR ANOMALIES', body: anomalies.slice(0, 10).map(a => `• [${(a.data?.severity || a.severity || 'medium').toUpperCase()}] User: ${a.data?.user_identifier || a.user_identifier || 'Unknown'} — Type: ${(a.data?.anomaly_type || a.anomaly_type || '').replace(/_/g, ' ')} — Deviation: ${a.data?.deviation_score || a.deviation_score || 0}/100`).join('\n') || 'No anomalies detected.' },
              { heading: 'HOW AI THREAT CORRELATION WORKS', body: 'The AI engine continuously monitors all security events and uses machine learning to identify multi-stage attack patterns that would be invisible to traditional rule-based systems.\n\nCorrelation Engine: Connects disparate security events across time and users to identify attack chains.\nBehavior Baseline: Builds a unique behavioral fingerprint for every user and flags deviations automatically.\nConfidence Scoring: Each detection is rated 0-100% confidence to minimize false positives.' },
            ]}
          />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="multi-layer-card card-layer-threat rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active Attack Chains</p>
                  <p className="text-3xl font-bold text-red-400">{activeChains}</p>
                </div>
                <Sparkles className="w-10 h-10 text-red-500/50 glow-pulse" />
              </div>
            </div>
            <div className="multi-layer-card card-layer-scramble rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Behavior Anomalies</p>
                  <p className="text-3xl font-bold text-amber-400">{detectedAnomalies}</p>
                </div>
                <Activity className="w-10 h-10 text-amber-500/50 glow-pulse" />
              </div>
            </div>
            <div className="multi-layer-card card-layer-monitoring rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Correlations</p>
                  <p className="text-3xl font-bold text-violet-400">{correlations.length}</p>
                </div>
                <Brain className="w-10 h-10 text-violet-500/50 glow-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ThreatCorrelationEngine correlations={correlations} />
            </div>
            <div>
              <AIThreatAssistant />
            </div>
          </div>

          <BehaviorAnomalyDetector anomalies={anomalies} />
        </div>
      </div>
    </div>
  );
}