import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle } from "lucide-react";

export default function RateLimitStatus() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: rateLogs = [] } = useQuery({
    queryKey: ['rateLimitLogs', user?.email],
    queryFn: async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      return base44.entities.RateLimitLog.filter({
        created_by: user?.email,
      });
    },
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentLogs = rateLogs.filter(log => new Date(log.created_date).getTime() > oneHourAgo);
  
  const totalRequests = recentLogs.reduce((sum, log) => sum + (log.requests_count || 1), 0);
  const userLimit = user?.role === 'admin' ? 1000 : 100;
  const percentUsed = (totalRequests / userLimit) * 100;
  const hasExceeded = recentLogs.some(log => log.limit_exceeded);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Activity className="w-5 h-5 text-cyan-400" />
          Rate Limit Status
          {hasExceeded ? (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/50 ml-auto">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Limit Exceeded
            </Badge>
          ) : percentUsed > 80 ? (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 ml-auto">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Warning
            </Badge>
          ) : (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 ml-auto">
              <CheckCircle className="w-3 h-3 mr-1" />
              Healthy
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Current Usage</span>
            <span className="text-slate-100 font-semibold">
              {totalRequests} / {userLimit} requests
            </span>
          </div>
          <Progress 
            value={Math.min(percentUsed, 100)} 
            className={`h-2 ${percentUsed > 90 ? 'bg-red-900' : percentUsed > 80 ? 'bg-yellow-900' : 'bg-slate-700'}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <p className="text-slate-500 text-xs">Role</p>
            <p className="text-slate-100 font-semibold capitalize">{user?.role || 'user'}</p>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <p className="text-slate-500 text-xs">Remaining</p>
            <p className="text-cyan-400 font-semibold">{Math.max(0, userLimit - totalRequests)}</p>
          </div>
        </div>

        <div className="p-3 bg-slate-900/50 rounded-lg">
          <p className="text-xs text-slate-500 mb-1">Window resets in</p>
          <p className="text-sm text-slate-300">
            {Math.floor((60 - ((Date.now() / 1000 / 60) % 60)))} minutes
          </p>
        </div>

        {percentUsed > 80 && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-xs text-yellow-500">
              ⚠️ You're approaching your rate limit. Consider upgrading or waiting for the window to reset.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}