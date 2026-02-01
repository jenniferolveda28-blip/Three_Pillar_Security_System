import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Zap, Lock, Activity } from 'lucide-react';

export default function APIThreatMonitor({ requestMetrics }) {
  const [threatLevel, setThreatLevel] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // Security thresholds
  const THRESHOLDS = {
    requestsPerMinute: 100,
    avgLatency: 2000,
    errorRate: 15,
    criticalThreatLevel: 85
  };

  useEffect(() => {
    // Calculate threat level based on metrics
    let threat = 0;

    if (requestMetrics) {
      // Requests per minute calculation
      const rpm = requestMetrics.recentRequests || 0;
      threat += (rpm / THRESHOLDS.requestsPerMinute) * 30;

      // Latency calculation
      const latency = requestMetrics.avgLatency || 0;
      threat += (latency / THRESHOLDS.avgLatency) * 30;

      // Error rate calculation
      const errors = requestMetrics.errorRate || 0;
      threat += (errors / THRESHOLDS.errorRate) * 40;
    }

    threat = Math.min(threat, 100);
    setThreatLevel(threat);

    // Auto-block if critical
    if (threat >= THRESHOLDS.criticalThreatLevel) {
      setIsBlocked(true);
      setAlerts([
        ...alerts,
        {
          time: new Date().toLocaleTimeString(),
          message: '🚨 CRITICAL: API threat detected. Auto-blocking activated.',
          severity: 'critical'
        }
      ].slice(-5));
    }
  }, [requestMetrics]);

  const getThreatColor = () => {
    if (threatLevel >= 85) return 'bg-red-500';
    if (threatLevel >= 60) return 'bg-orange-500';
    if (threatLevel >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getThreatText = () => {
    if (threatLevel >= 85) return 'CRITICAL';
    if (threatLevel >= 60) return 'HIGH';
    if (threatLevel >= 40) return 'MEDIUM';
    return 'LOW';
  };

  return (
    <Card className="multi-layer-card card-layer-threat rounded-xl border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-red-500" />
            API Threat Monitor
          </div>
          {isBlocked && (
            <Badge className="bg-red-600 text-white animate-pulse">
              <Lock className="w-3 h-3 mr-1" />
              BLOCKED
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Threat Level Gauge */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-300">Threat Level</span>
            <span className={`text-2xl font-bold ${getThreatColor() === 'bg-red-500' ? 'text-red-500' : getThreatColor() === 'bg-orange-500' ? 'text-orange-500' : getThreatColor() === 'bg-yellow-500' ? 'text-yellow-500' : 'text-green-500'}`}>
              {threatLevel.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getThreatColor()}`}
              style={{ width: `${threatLevel}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">{getThreatText()} threat level</p>
        </div>

        {/* Metric Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-800/50 rounded p-2">
            <p className="text-slate-400 text-xs">Requests/min</p>
            <p className="text-cyan-400 font-semibold">{requestMetrics?.recentRequests || 0}</p>
          </div>
          <div className="bg-slate-800/50 rounded p-2">
            <p className="text-slate-400 text-xs">Avg Latency</p>
            <p className="text-cyan-400 font-semibold">{requestMetrics?.avgLatency || 0}ms</p>
          </div>
          <div className="bg-slate-800/50 rounded p-2">
            <p className="text-slate-400 text-xs">Error Rate</p>
            <p className="text-red-400 font-semibold">{requestMetrics?.errorRate || 0}%</p>
          </div>
          <div className="bg-slate-800/50 rounded p-2">
            <p className="text-slate-400 text-xs">Status</p>
            <p className={isBlocked ? "text-red-400 font-semibold" : "text-green-400 font-semibold"}>
              {isBlocked ? "BLOCKED" : "ACTIVE"}
            </p>
          </div>
        </div>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Recent Alerts
            </p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`text-xs p-2 rounded ${
                    alert.severity === 'critical'
                      ? 'bg-red-900/30 text-red-300'
                      : 'bg-yellow-900/30 text-yellow-300'
                  }`}
                >
                  <span className="text-slate-400">{alert.time}</span> {alert.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning Message */}
        {threatLevel >= 60 && (
          <div className="bg-orange-900/30 border border-orange-600/50 rounded p-3 text-sm text-orange-300">
            ⚠️ API security threshold approaching. Reduce request volume or latency will spike.
          </div>
        )}

        {isBlocked && (
          <div className="bg-red-900/30 border border-red-600/50 rounded p-3 text-sm text-red-300">
            🚨 API access blocked due to critical threat. Auto-generated security report has been logged. Contact admin.
          </div>
        )}
      </CardContent>
    </Card>
  );
}