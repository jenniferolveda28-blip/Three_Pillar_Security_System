import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Search, AlertTriangle, CheckCircle, XCircle, MapPin, Globe } from "lucide-react";

export default function AuditTrailViewer() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['auditTrail'],
    queryFn: () => base44.entities.AuditTrail.list('-created_date', 100),
  });

  const actionIcons = {
    login: Globe,
    api_call: FileText,
    key_rotation: FileText,
    biometric_verify: CheckCircle,
    account_link: CheckCircle,
    permission_change: AlertTriangle,
    data_access: FileText,
    config_change: AlertTriangle,
  };

  const filteredLogs = auditLogs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action_type?.toLowerCase().includes(searchLower) ||
      log.user_identifier?.toLowerCase().includes(searchLower) ||
      log.resource_type?.toLowerCase().includes(searchLower) ||
      log.ip_address?.toLowerCase().includes(searchLower)
    );
  });

  const highRiskLogs = auditLogs.filter(log => log.risk_score > 70).length;
  const anomalies = auditLogs.filter(log => log.anomaly_detected).length;
  const failedActions = auditLogs.filter(log => !log.success).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Complete Audit Trail
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="destructive">{highRiskLogs} High Risk</Badge>
            <Badge variant="outline">{anomalies} Anomalies</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search logs by action, user, resource, or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {filteredLogs.map((log) => {
              const Icon = actionIcons[log.action_type] || FileText;
              
              return (
                <div 
                  key={log.id}
                  className={`p-4 rounded-lg border-2 ${
                    log.risk_score > 70 ? 'border-red-200 bg-red-50' :
                    log.anomaly_detected ? 'border-yellow-200 bg-yellow-50' :
                    !log.success ? 'border-orange-200 bg-orange-50' :
                    'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">
                        {log.action_type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      {log.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    {log.risk_score > 0 && (
                      <Badge variant={log.risk_score > 70 ? 'destructive' : 'outline'}>
                        Risk: {log.risk_score}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-2">
                    <div>
                      <span className="font-medium">User:</span> {log.user_identifier}
                    </div>
                    {log.resource_type && (
                      <div>
                        <span className="font-medium">Resource:</span> {log.resource_type}
                      </div>
                    )}
                    {log.ip_address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {log.ip_address}
                      </div>
                    )}
                    {log.geolocation && (
                      <div>
                        <span className="font-medium">Location:</span> {log.geolocation.city || 'Unknown'}
                      </div>
                    )}
                  </div>

                  {log.failure_reason && (
                    <p className="text-sm text-red-700 mb-2">
                      ❌ Failure: {log.failure_reason}
                    </p>
                  )}

                  {log.anomaly_detected && (
                    <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-100 rounded px-2 py-1">
                      <AlertTriangle className="w-4 h-4" />
                      Anomalous behavior detected
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(log.created_date).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}