import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle2, XCircle, Activity } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function SecurityMonitor({ logs }) {
  const threatLevelConfig = {
    none: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50", label: "Secure" },
    low: { icon: Activity, color: "text-blue-500", bg: "bg-blue-50", label: "Normal" },
    medium: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-50", label: "Caution" },
    high: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50", label: "Warning" },
    critical: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", label: "Critical" }
  };

  const eventIcons = {
    key_rotation: RefreshCw,
    access_granted: CheckCircle2,
    access_denied: XCircle,
    fingerprint_verified: Shield,
    suspicious_activity: AlertTriangle,
    universe_accessed: Activity
  };

  const recentLogs = logs.slice(0, 10);
  const deniedCount = logs.filter(l => !l.success).length;
  const highThreatCount = logs.filter(l => ['high', 'critical'].includes(l.threat_level)).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Security Monitor
          </div>
          {highThreatCount > 0 && (
            <Badge variant="destructive">{highThreatCount} threats detected</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {deniedCount > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              ⚠️ {deniedCount} unauthorized access attempts blocked
            </p>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-auto">
          {recentLogs.map((log, idx) => {
            const config = threatLevelConfig[log.threat_level || 'none'];
            const EventIcon = eventIcons[log.event_type] || Activity;
            const ThreatIcon = config.icon;

            return (
              <div key={log.id || idx} className={cn("p-3 rounded-lg border", config.bg)}>
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <EventIcon className={cn("w-4 h-4", log.success ? "text-green-600" : "text-red-600")} />
                    <span className="text-sm font-medium">
                      {log.event_type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <ThreatIcon className={cn("w-4 h-4", config.color)} />
                </div>
                
                {log.details && (
                  <p className="text-xs text-gray-600 mb-2">{log.details}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{format(new Date(log.created_date), 'MMM d, HH:mm:ss')}</span>
                  {log.fingerprint_hash && (
                    <span className="font-mono">🔐 {log.fingerprint_hash.slice(0, 8)}...</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {recentLogs.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No security events yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const RefreshCw = ({ className }) => <div className={className}>🔄</div>;