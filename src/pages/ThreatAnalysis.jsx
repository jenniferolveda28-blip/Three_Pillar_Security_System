import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, AlertTriangle, Activity, TrendingUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import ThreatIntelligenceFeed from '../components/threat/ThreatIntelligenceFeed';
import SuspiciousActivityPattern from '../components/threat/SuspiciousActivityPattern';
import ThreatEventDetail from '../components/threat/ThreatEventDetail';

export default function ThreatAnalysis() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { data: securityLogs = [] } = useQuery({
    queryKey: ['securityLogs'],
    queryFn: () => base44.entities.SecurityLog.list('-created_date', 100),
    refetchInterval: 3000
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['criminalAlerts'],
    queryFn: () => base44.entities.CriminalActivityAlert.list('-created_date', 50),
    refetchInterval: 3000
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['analyticsMetrics'],
    queryFn: () => base44.entities.AnalyticsMetric.list('-created_date', 200),
    refetchInterval: 5000
  });

  // Calculate threat statistics
  const criticalThreats = alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency').length;
  const activeInvestigations = alerts.filter(a => a.status === 'investigating' || a.status === 'open').length;
  const suspiciousLogs = securityLogs.filter(l => l.threat_level === 'high' || l.threat_level === 'critical').length;
  const failedAuthAttempts = metrics.filter(m => m.metric_type === 'auth_attempt' && !m.success).length;

  return (
    <div>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Dashboard')}>
                <Button variant="outline" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg shadow-red-500/50">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold gradient-text">Threat Analysis</h1>
                  <p className="text-slate-400">Real-time security intelligence and threat monitoring</p>
                </div>
              </div>
            </div>
          </div>

          {/* Threat Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="multi-layer-card card-layer-threat rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Critical Threats</p>
                  <p className="text-3xl font-bold text-red-400">{criticalThreats}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-500/50 glow-pulse" />
              </div>
            </div>
            <div className="multi-layer-card card-layer-scramble rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Investigations</p>
                  <p className="text-3xl font-bold text-amber-400">{activeInvestigations}</p>
                </div>
                <Activity className="w-10 h-10 text-amber-500/50 glow-pulse" />
              </div>
            </div>
            <div className="multi-layer-card card-layer-monitoring rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Suspicious Events</p>
                  <p className="text-3xl font-bold text-violet-400">{suspiciousLogs}</p>
                </div>
                <Shield className="w-10 h-10 text-violet-500/50 glow-pulse" />
              </div>
            </div>
            <div className="multi-layer-card card-layer-data rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Failed Auth</p>
                  <p className="text-3xl font-bold text-emerald-400">{failedAuthAttempts}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-emerald-500/50 glow-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {selectedEvent ? (
          <ThreatEventDetail 
            event={selectedEvent} 
            onClose={() => setSelectedEvent(null)}
            alerts={alerts}
            logs={securityLogs}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ThreatIntelligenceFeed 
                alerts={alerts}
                logs={securityLogs}
                onEventClick={setSelectedEvent}
              />
            </div>
            <div className="space-y-6">
              <SuspiciousActivityPattern 
                metrics={metrics}
                logs={securityLogs}
                alerts={alerts}
                onEventClick={setSelectedEvent}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}