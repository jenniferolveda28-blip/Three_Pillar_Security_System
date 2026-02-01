import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, AlertCircle } from "lucide-react";

export default function RateLimitMonitor({ universes, requests }) {
  const getLimits = (universeName) => {
    const universeRequests = requests.filter(r => r.routed_to === universeName);
    const recentRequests = universeRequests.filter(r => {
      const requestTime = new Date(r.created_date);
      const oneHourAgo = new Date(Date.now() - 3600000);
      return requestTime > oneHourAgo;
    });

    return {
      hourly: { used: recentRequests.length, limit: 100 },
      daily: { used: universeRequests.length, limit: 1000 }
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          Rate Limit Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {universes.slice(0, 5).map((universe) => {
          const limits = getLimits(universe.name);
          const hourlyPercent = (limits.hourly.used / limits.hourly.limit) * 100;
          const dailyPercent = (limits.daily.used / limits.daily.limit) * 100;

          return (
            <div key={universe.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{universe.name}</span>
                {hourlyPercent > 80 && (
                  <Badge variant="outline" className="text-orange-600 text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Near Limit
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Hourly: {limits.hourly.used}/{limits.hourly.limit}</span>
                  <span>{Math.round(hourlyPercent)}%</span>
                </div>
                <Progress value={hourlyPercent} className="h-1" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Daily: {limits.daily.used}/{limits.daily.limit}</span>
                  <span>{Math.round(dailyPercent)}%</span>
                </div>
                <Progress value={dailyPercent} className="h-1" />
              </div>
            </div>
          );
        })}

        {universes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No active universes to monitor</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}