import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Zap, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UniverseCard({ universe }) {
  const statusConfig = {
    active: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-900/30", border: "border-emerald-700", accent: "emerald" },
    degraded: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-900/30", border: "border-amber-700", accent: "amber" },
    offline: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-900/30", border: "border-red-700", accent: "red" }
  };

  const config = statusConfig[universe.status || 'active'];
  const StatusIcon = config.icon;

  return (
    <Card className={cn("multi-layer-card transition-all cursor-pointer border", config.border, "hover:shadow-lg hover:shadow-cyan-500/20")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bg)}>
              <Globe className={cn("w-5 h-5", config.color)} />
            </div>
            <div>
              <CardTitle className="text-slate-100">{universe.name}</CardTitle>
              <p className="text-xs text-slate-400 mt-1">{universe.description}</p>
            </div>
          </div>
          <StatusIcon className={cn("w-5 h-5", config.color)} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {universe.capabilities?.map((cap, idx) => (
            <Badge key={idx} className="bg-slate-700 text-slate-300 border-slate-600 text-xs">
              {cap}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm bg-slate-900/50 p-2 rounded">
          <div className="flex items-center gap-2">
            <Zap className={cn("w-4 h-4", config.color)} />
            <span className="text-slate-300">Success Rate</span>
          </div>
          <span className="font-semibold text-slate-100">{universe.success_rate || 100}%</span>
        </div>

        {universe.error_count > 0 && (
          <div className={cn("flex items-center gap-2 text-xs px-2 py-1 rounded border", config.bg, config.border)}>
            <AlertCircle className={cn("w-3 h-3", config.color)} />
            <span className={config.color}>{universe.error_count} errors in last 24h</span>
          </div>
        )}

        <div className="text-xs text-slate-400 pt-2 border-t border-slate-700">
          Auth: <span className="font-medium text-slate-300">{universe.auth_type || 'none'}</span>
        </div>
      </CardContent>
    </Card>
  );
}