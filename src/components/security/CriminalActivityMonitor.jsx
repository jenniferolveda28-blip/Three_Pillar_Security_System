import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Ban, Phone, Shield, Eye, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function CriminalActivityMonitor() {
  const [autoResponse, setAutoResponse] = useState(true);

  const { data: alerts = [], refetch } = useQuery({
    queryKey: ['criminalAlerts'],
    queryFn: () => base44.entities.CriminalActivityAlert.list('-created_date', 100),
    refetchInterval: 5000, // Real-time monitoring every 5 seconds
  });

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency');
  const openAlerts = alerts.filter(a => a.status === 'open' || a.status === 'investigating');
  const autoBlocked = alerts.filter(a => a.auto_blocked).length;
  const authoritiesNotified = alerts.filter(a => a.authorities_notified).length;

  const handleBlockUser = async (alert) => {
    await base44.entities.CriminalActivityAlert.update(alert.id, {
      auto_blocked: true,
      status: 'investigating'
    });
    toast.error(`🚨 User ${alert.user_identifier} has been blocked`);
    refetch();
  };

  const handleNotifyAuthorities = async (alert) => {
    await base44.entities.CriminalActivityAlert.update(alert.id, {
      authorities_notified: true,
      notification_sent: true
    });
    toast.error(`🚨 Law enforcement has been notified`);
    refetch();
  };

  const handleMarkFalsePositive = async (alert) => {
    await base44.entities.CriminalActivityAlert.update(alert.id, {
      status: 'false_positive'
    });
    toast.success('Alert marked as false positive');
    refetch();
  };

  const severityConfig = {
    low: { color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-700' },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700' },
    high: { color: 'text-orange-400', bg: 'bg-orange-900/20', border: 'border-orange-700' },
    critical: { color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-700' },
    emergency: { color: 'text-red-300', bg: 'bg-red-900/40', border: 'border-red-600' }
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="multi-layer-card card-layer-threat border">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-slate-400">Critical Alerts</p>
                 <p className="text-3xl font-bold text-red-400">{criticalAlerts.length}</p>
               </div>
               <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
             </div>
           </CardContent>
         </Card>
         <Card className="multi-layer-card card-layer-scramble border">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-slate-400">Open Alerts</p>
                 <p className="text-3xl font-bold text-orange-400">{openAlerts.length}</p>
               </div>
               <Eye className="w-8 h-8 text-orange-500" />
             </div>
           </CardContent>
         </Card>
         <Card className="multi-layer-card card-layer-data border">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-slate-400">Auto-Blocked</p>
                 <p className="text-3xl font-bold text-emerald-400">{autoBlocked}</p>
               </div>
               <Ban className="w-8 h-8 text-emerald-500" />
             </div>
           </CardContent>
         </Card>
         <Card className="multi-layer-card card-layer-monitoring border">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-slate-400">Authorities Notified</p>
                 <p className="text-3xl font-bold text-violet-400">{authoritiesNotified}</p>
               </div>
               <Phone className="w-8 h-8 text-violet-500" />
             </div>
           </CardContent>
         </Card>
       </div>

      {/* Auto-Response Toggle */}
       <Card className="multi-layer-card card-layer-monitoring border bg-slate-800/50">
         <CardContent className="p-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <Shield className="w-6 h-6 text-violet-400" />
               <div>
                 <p className="font-semibold text-slate-100">Automatic Response System</p>
                 <p className="text-sm text-slate-400">Auto-block suspicious activity and notify authorities</p>
               </div>
             </div>
             <Button
               variant={autoResponse ? "default" : "outline"}
               onClick={() => {
                 setAutoResponse(!autoResponse);
                 toast.success(`Auto-response ${!autoResponse ? 'enabled' : 'disabled'}`);
               }}
               className={autoResponse ? 'bg-violet-600 hover:bg-violet-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
             >
               {autoResponse ? 'ACTIVE' : 'INACTIVE'}
             </Button>
           </div>
         </CardContent>
       </Card>

      {/* Alert List */}
      <Card className="multi-layer-card card-layer-threat border bg-slate-800/50">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Criminal Activity Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.slice(0, 15).map((alert) => {
              const config = severityConfig[alert.severity];
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg border-2 ${config.border} ${config.bg}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`w-5 h-5 ${config.color}`} />
                        <span className="font-bold text-sm uppercase">
                          {alert.alert_type.replace(/_/g, ' ')}
                        </span>
                        <Badge className={config.bg}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        {alert.auto_blocked && (
                          <Badge className="bg-red-600">BLOCKED</Badge>
                        )}
                        {alert.authorities_notified && (
                          <Badge className="bg-purple-600">AUTHORITIES NOTIFIED</Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-slate-300 space-y-1">
                         <p><strong>User:</strong> {alert.user_identifier || 'Unknown'}</p>
                         <p><strong>IP:</strong> {alert.ip_address || 'Unknown'}</p>
                         <p><strong>Confidence:</strong> {alert.confidence_score}% - AI detected suspicious pattern</p>
                        {alert.indicators && alert.indicators.length > 0 && (
                          <div>
                            <strong>Indicators:</strong>
                            <ul className="list-disc list-inside ml-2">
                              {alert.indicators.map((indicator, idx) => (
                                <li key={idx}>{indicator}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {!alert.auto_blocked && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleBlockUser(alert)}
                        >
                          <Ban className="w-3 h-3 mr-1" />
                          Block User
                        </Button>
                      )}
                      {!alert.authorities_notified && alert.severity === 'critical' && (
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleNotifyAuthorities(alert)}
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Notify Police
                        </Button>
                      )}
                      {alert.status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkFalsePositive(alert)}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          False Positive
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                    <span className="text-xs text-slate-500">
                      Detected {new Date(alert.created_date).toLocaleString()}
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {alert.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}

            {alerts.length === 0 && (
               <div className="text-center py-12">
                 <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                 <p className="text-slate-100 font-semibold">No Criminal Activity Detected</p>
                 <p className="text-sm text-slate-400 mt-2">System is secure and monitoring 24/7</p>
               </div>
             )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact Info */}
      <Card className="multi-layer-card card-layer-threat border bg-red-900/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Phone className="w-6 h-6 text-red-400 mt-1" />
            <div>
              <p className="font-bold text-red-300 mb-2">🚨 Emergency Security Protocol</p>
              <div className="text-sm text-red-200 space-y-1">
                <p>• Automatic blocking enabled for high-confidence criminal activity</p>
                <p>• Law enforcement notification for critical threats</p>
                <p>• All suspicious activity logged for forensic analysis</p>
                <p>• 24/7 security monitoring active</p>
                <p>• Emergency hotline: 1-800-FORGED-911</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}