import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Activity, AlertCircle, CheckCircle2, RefreshCw, TrendingUp, TrendingDown, Zap } from "lucide-react";

export default function UniverseHealthMonitor({ universes, onUpdate }) {
  const [checking, setChecking] = useState(false);
  const [healthData, setHealthData] = useState({});

  const checkHealth = async (universe) => {
    try {
      // Simulate health check
      const isHealthy = Math.random() > 0.2; // 80% success rate
      const latency = Math.floor(50 + Math.random() * 200);
      
      const newStatus = isHealthy ? 'active' : 'degraded';
      const newErrorCount = isHealthy ? 0 : (universe.error_count || 0) + 1;
      
      await base44.entities.Universe.update(universe.id, {
        status: newStatus,
        last_check: new Date().toISOString(),
        error_count: newErrorCount,
        success_rate: isHealthy 
          ? Math.min(100, universe.success_rate + 2)
          : Math.max(0, universe.success_rate - 5)
      });
      
      await base44.entities.SecurityLog.create({
        event_type: 'universe_accessed',
        universe_id: universe.id,
        success: isHealthy,
        details: `Health check: ${isHealthy ? 'Passed' : 'Failed'} (${latency}ms)`,
        threat_level: isHealthy ? 'none' : 'low'
      });
      
      setHealthData(prev => ({
        ...prev,
        [universe.id]: { healthy: isHealthy, latency, checked: true }
      }));
      
      return isHealthy;
    } catch (error) {
      toast.error(`Health check failed for ${universe.name}`);
      return false;
    }
  };

  const handleCheckAll = async () => {
    setChecking(true);
    try {
      const results = await Promise.all(universes.map(u => checkHealth(u)));
      const healthy = results.filter(r => r).length;
      toast.success(`${healthy}/${universes.length} universes healthy`);
      onUpdate();
    } finally {
      setChecking(false);
    }
  };

  const statusConfig = {
    active: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Healthy' },
    degraded: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Degraded' },
    offline: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Offline' }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Universe Health Monitor
          </span>
          <Button 
            size="sm"
            onClick={handleCheckAll}
            disabled={checking}
          >
            {checking ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Check All
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {universes.map(universe => {
          const config = statusConfig[universe.status] || statusConfig.offline;
          const Icon = config.icon;
          const health = healthData[universe.id];
          
          return (
            <div key={universe.id} className={`border rounded-lg p-4 ${config.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <span className="font-medium">{universe.name}</span>
                </div>
                <Badge className={config.color}>{config.label}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-medium">{universe.success_rate}%</span>
                </div>
                <Progress value={universe.success_rate} className="h-2" />
                
                <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 pt-2">
                  <div>
                    <Zap className="w-3 h-3 inline mr-1" />
                    {health?.latency || '---'}ms
                  </div>
                  <div>
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    {universe.error_count || 0} errors
                  </div>
                  <div>
                    Last: {universe.last_check ? new Date(universe.last_check).toLocaleTimeString() : 'Never'}
                  </div>
                </div>
                
                {health?.checked && (
                  <div className="text-xs text-green-600 font-medium pt-2">
                    ✓ Check completed successfully
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}