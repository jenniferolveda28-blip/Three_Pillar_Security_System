import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, MapPin, Globe } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SuspiciousActivityPattern({ metrics = [], logs = [], alerts = [], onEventClick }) {
  // Analyze patterns
  const patterns = useMemo(() => {
    // Failed auth attempts over time
    const failedAuthByHour = {};
    metrics.filter(m => m.metric_type === 'auth_attempt' && !m.success).forEach(m => {
      const hour = new Date(m.created_date).getHours();
      failedAuthByHour[hour] = (failedAuthByHour[hour] || 0) + 1;
    });

    const authTimelineData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      failures: failedAuthByHour[i] || 0
    }));

    // Most targeted endpoints
    const endpointCounts = {};
    metrics.filter(m => m.status_code >= 400).forEach(m => {
      if (m.endpoint) {
        endpointCounts[m.endpoint] = (endpointCounts[m.endpoint] || 0) + 1;
      }
    });

    const topTargetedEndpoints = Object.entries(endpointCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([endpoint, count]) => ({ endpoint, count }));

    // Geographic anomalies (from logs)
    const ipCounts = {};
    logs.forEach(log => {
      if (log.ip_address && log.threat_level !== 'none') {
        ipCounts[log.ip_address] = (ipCounts[log.ip_address] || 0) + 1;
      }
    });

    const suspiciousIPs = Object.entries(ipCounts)
      .filter(([, count]) => count > 3)
      .map(([ip, count]) => ({ ip, count }));

    return {
      authTimelineData,
      topTargetedEndpoints,
      suspiciousIPs,
      totalFailedAuth: Object.values(failedAuthByHour).reduce((a, b) => a + b, 0),
      peakHour: Object.entries(failedAuthByHour).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
    };
  }, [metrics, logs]);

  return (
    <div className="space-y-6">
      {/* Pattern Summary */}
      <Card className="multi-layer-card card-layer-scramble border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Activity Patterns
          </CardTitle>
          <CardDescription className="text-slate-400">Behavioral analysis and anomaly detection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-amber-500/20">
              <p className="text-xs text-slate-400">Failed Auth (24h)</p>
              <p className="text-2xl font-bold text-amber-400">{patterns.totalFailedAuth}</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-amber-500/20">
              <p className="text-xs text-slate-400">Peak Hour</p>
              <p className="text-2xl font-bold text-amber-400">{patterns.peakHour}:00</p>
            </div>
          </div>

          {/* Timeline Chart */}
          <div>
            <p className="text-sm font-semibold text-slate-300 mb-2">Failed Authentication Timeline</p>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={patterns.authTimelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#94a3b8" style={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#cbd5e1' }}
                />
                <Line type="monotone" dataKey="failures" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Targeted Endpoints */}
      {patterns.topTargetedEndpoints.length > 0 && (
        <Card className="multi-layer-card card-layer-monitoring border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <AlertTriangle className="w-5 h-5 text-violet-400" />
              Most Targeted Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={patterns.topTargetedEndpoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="endpoint" stroke="#94a3b8" style={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#cbd5e1' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Suspicious IPs */}
      {patterns.suspiciousIPs.length > 0 && (
        <Card className="multi-layer-card card-layer-data border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Globe className="w-5 h-5 text-emerald-400" />
              Suspicious IP Addresses
            </CardTitle>
            <CardDescription className="text-slate-400">Repeated threat activity detected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {patterns.suspiciousIPs.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-slate-300 font-mono">{item.ip}</span>
                </div>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/50">
                  {item.count} events
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}