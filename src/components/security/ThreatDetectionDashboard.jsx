import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Lock, Zap, Eye, Ban, CheckCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThreatDetectionDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: threats = [], refetch } = useQuery({
    queryKey: ['threats'],
    queryFn: () => base44.entities.ThreatIntelligence.list('-created_date', 50),
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const severityConfig = {
    info: { icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    low: { icon: Shield, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
    medium: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    high: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
    critical: { icon: Ban, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  };

  const criticalThreats = threats.filter(t => t.severity === 'critical').length;
  const blockedThreats = threats.filter(t => t.blocked).length;
  const activeThreats = threats.filter(t => !t.blocked && !t.false_positive).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Threats</p>
                <p className="text-3xl font-bold text-red-600">{criticalThreats}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blocked</p>
                <p className="text-3xl font-bold text-green-600">{blockedThreats}</p>
              </div>
              <Ban className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Threats</p>
                <p className="text-3xl font-bold text-orange-600">{activeThreats}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Detected</p>
                <p className="text-3xl font-bold text-indigo-600">{threats.length}</p>
              </div>
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Threat List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Real-Time Threat Intelligence
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? '⏸ Pause' : '▶️ Auto-Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {threats.slice(0, 10).map((threat) => {
              const config = severityConfig[threat.severity];
              const Icon = config.icon;
              
              return (
                <div 
                  key={threat.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 ${config.border} ${config.bg}`}
                >
                  <Icon className={`w-6 h-6 ${config.color} mt-1`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{threat.threat_type.replace(/_/g, ' ').toUpperCase()}</p>
                        <p className="text-sm text-gray-600">Source: {threat.source_ip || 'Unknown'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={threat.blocked ? 'default' : 'destructive'}>
                          {threat.blocked ? 'BLOCKED' : 'ACTIVE'}
                        </Badge>
                        <Badge variant="outline">{threat.severity.toUpperCase()}</Badge>
                      </div>
                    </div>
                    {threat.attack_pattern && (
                      <p className="text-sm text-gray-700 mb-2">Pattern: {threat.attack_pattern}</p>
                    )}
                    {threat.mitigation_actions && threat.mitigation_actions.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        Mitigation: {threat.mitigation_actions.join(', ')}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Detected {new Date(threat.created_date).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            {threats.length === 0 && (
              <div className="text-center py-12">
                <Lock className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <p className="text-gray-600">No threats detected. System is secure! 🛡️</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}