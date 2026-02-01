import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Zap, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UniverseCard({ universe }) {
  const statusConfig = {
    active: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50", border: "border-green-200" },
    degraded: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-50", border: "border-yellow-200" },
    offline: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" }
  };

  const config = statusConfig[universe.status || 'active'];
  const StatusIcon = config.icon;

  return (
    <Card className={cn("hover:shadow-lg transition-all cursor-pointer", config.border, "border-2")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bg)}>
              <Globe className={cn("w-5 h-5", config.color)} />
            </div>
            <div>
              <CardTitle className="text-lg">{universe.name}</CardTitle>
              <p className="text-xs text-gray-500 mt-1">{universe.description}</p>
            </div>
          </div>
          <StatusIcon className={cn("w-5 h-5", config.color)} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {universe.capabilities?.map((cap, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {cap}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Success Rate</span>
          </div>
          <span className="font-semibold">{universe.success_rate || 100}%</span>
        </div>

        {universe.error_count > 0 && (
          <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
            <AlertCircle className="w-3 h-3" />
            {universe.error_count} errors in last 24h
          </div>
        )}

        <div className="text-xs text-gray-400 pt-2 border-t">
          Auth: <span className="font-medium">{universe.auth_type || 'none'}</span>
        </div>
      </CardContent>
    </Card>
  );
}