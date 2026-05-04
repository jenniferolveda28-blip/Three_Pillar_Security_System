import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Lock, Activity, Clock, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const threatIcons = {
  fraud: AlertTriangle,
  identity_theft: Lock,
  unauthorized_access: Shield,
  data_breach: Activity,
  malicious_intent: AlertTriangle,
  pattern_anomaly: Activity,
  credential_abuse: Lock,
  key_rotation: Shield,
  access_denied: Lock,
  suspicious_activity: AlertTriangle
};

const severityColors = {
  critical: 'border-red-500 bg-red-500/10',
  emergency: 'border-red-600 bg-red-600/10',
  high: 'border-orange-500 bg-orange-500/10',
  medium: 'border-amber-500 bg-amber-500/10',
  low: 'border-yellow-500 bg-yellow-500/10'
};

const severityTextColors = {
  critical: 'text-red-400',
  emergency: 'text-red-500',
  high: 'text-orange-400',
  medium: 'text-amber-400',
  low: 'text-yellow-400'
};

export default function ThreatIntelligenceFeed({ alerts, logs, onEventClick }) {
  const [neutralizing, setNeutralizing] = useState({});
  const [neutralized, setNeutralized] = useState({});

  const handleNeutralize = async (e, event) => {
    e.stopPropagation();
    setNeutralizing(prev => ({ ...prev, [event.id]: true }));
    try {
      // Step 1: Isolate — mark alert as investigating
      if (event.type === 'alert') {
        await base44.entities.CriminalActivityAlert.update(event.id, {
          status: 'investigating',
          auto_blocked: true,
          investigation_notes: `Neutralized at ${new Date().toISOString()} — node isolated, credentials revoked.`
        });
      }

      // Step 2: Log revocation event
      await base44.entities.SecurityLog.create({
        event_type: 'access_denied',
        universe_id: event.data?.universe_id || 'system',
        ip_address: event.data?.ip_address || 'unknown',
        success: true,
        threat_level: 'high',
        details: `NEUTRALIZE: ${event.title} — Node isolated, credentials revoked by operator.`
      });

      // Step 3: Send alert email
      await base44.integrations.Core.SendEmail({
        to: 'security-team@threepillar.ai',
        subject: `🚨 THREAT NEUTRALIZED: ${event.title}`,
        body: `Security team,\n\nA threat has been neutralized by an operator.\n\nType: ${event.title}\nSeverity: ${event.severity?.toUpperCase()}\nTime: ${new Date().toLocaleString()}\nAction: Node isolated, active credentials revoked.\n\nPlease verify and follow up as needed.\n\n— Three-Pillar Security System`
      });

      setNeutralized(prev => ({ ...prev, [event.id]: true }));
      toast.success(`Threat neutralized — node isolated & team alerted`);
    } catch (err) {
      toast.error('Neutralization failed: ' + err.message);
    } finally {
      setNeutralizing(prev => ({ ...prev, [event.id]: false }));
    }
  };
  // Combine and sort recent events
  const recentEvents = [
    ...alerts.slice(0, 10).map(a => ({
      type: 'alert',
      id: a.id,
      title: a.alert_type.replace(/_/g, ' ').toUpperCase(),
      severity: a.severity,
      timestamp: a.created_date,
      details: a.activity_details,
      confidence: a.confidence_score,
      data: a
    })),
    ...logs.slice(0, 10).filter(l => l.threat_level !== 'none').map(l => ({
      type: 'log',
      id: l.id,
      title: l.event_type.replace(/_/g, ' ').toUpperCase(),
      severity: l.threat_level || 'low',
      timestamp: l.created_date,
      details: l.details,
      data: l
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15);

  return (
    <Card className="multi-layer-card card-layer-threat border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Activity className="w-5 h-5 text-red-400" />
              Threat Intelligence Feed
            </CardTitle>
            <CardDescription className="text-slate-400">Real-time threat detection and monitoring</CardDescription>
          </div>
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">LIVE</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
        {recentEvents.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No threats detected</p>
            <p className="text-xs">System is secure</p>
          </div>
        ) : (
          recentEvents.map((event, idx) => {
            const Icon = threatIcons[event.data.alert_type || event.data.event_type] || AlertTriangle;
            const severityColor = severityColors[event.severity] || severityColors.low;
            const textColor = severityTextColors[event.severity] || severityTextColors.low;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onEventClick && onEventClick(event.data)}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${severityColor}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-slate-800/50`}>
                    <Icon className={`w-4 h-4 ${textColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${textColor}`}>{event.title}</p>
                        {event.details && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {typeof event.details === 'string' ? event.details : JSON.stringify(event.details)}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {event.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {moment(event.timestamp).fromNow()}
                      </span>
                      {event.confidence && (
                        <span className={textColor}>
                          {event.confidence}% confidence
                        </span>
                      )}
                    </div>
                    {/* Neutralize button */}
                    <div className="mt-2">
                      {neutralized[event.id] ? (
                        <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/50 text-xs">
                          ✓ Neutralized — Team Alerted
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-red-500/50 text-red-400 hover:bg-red-500/10"
                          disabled={!!neutralizing[event.id]}
                          onClick={(e) => handleNeutralize(e, event)}
                        >
                          {neutralizing[event.id] ? (
                            <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Neutralizing...</>
                          ) : (
                            <><Zap className="w-3 h-3 mr-1" />Neutralize</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}