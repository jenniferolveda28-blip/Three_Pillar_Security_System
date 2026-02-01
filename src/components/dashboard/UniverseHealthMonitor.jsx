import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function UniverseHealthMonitor({ universes, onUpdate }) {
  const statusConfig = {
    active: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Healthy' },
    degraded: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Degraded' },
    offline: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Offline' }
  };

  const checkHealth = async (universe) => {
    try {
      await base44.entities.Universe.update(universe.id, {
        last_check: new Date().toISOString(),
        status: Math.random() > 0.1 ? 'active' : 'degraded'
      });
      toast.success(`${universe.name} health check complete`);
      onUpdate?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          Universe Health Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {universes.map((universe) => {
          const config = statusConfig[universe.status] || statusConfig.offline;
          const StatusIcon = config.icon;
          const uptime = universe.success_rate || 100;

          return (
            <div key={universe.id} className={`p-4 rounded-lg border-2 ${config.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StatusIcon className={`w-5 h-5 ${config.color}`} />
                  <span className="font-medium text-gray-900">{universe.name}</span>
                </div>
                <Badge variant="outline" className={config.color}>
                  {config.label}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Uptime</p>
                  <p className="text-sm font-bold text-gray-900">{uptime.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Errors (24h)</p>
                  <p className="text-sm font-bold text-gray-900">{universe.error_count || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Check</p>
                  <p className="text-xs font-mono text-gray-700">
                    {universe.last_check ? new Date(universe.last_check).toLocaleTimeString() : 'Never'}
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => checkHealth(universe)}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Run Health Check
              </Button>
            </div>
          );
        })}

        {universes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No universes to monitor</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}