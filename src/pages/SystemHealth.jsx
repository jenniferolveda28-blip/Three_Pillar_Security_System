import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Loader2, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SystemHealth() {
  const [universes, setUniverses] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [u, m] = await Promise.all([
        base44.entities.Universe.list('-created_date', 50),
        base44.entities.AnalyticsMetric.list('-created_date', 50),
      ]);
      setUniverses(u);
      setMetrics(m);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const statusIcon = { active: CheckCircle, degraded: AlertTriangle, offline: XCircle };
  const statusColor = { active: 'text-green-400', degraded: 'text-orange-400', offline: 'text-red-400' };
  const badgeVariant = { active: 'default', degraded: 'secondary', offline: 'destructive' };

  const activeCount = universes.filter(u => u.status === 'active').length;
  const degradedCount = universes.filter(u => u.status === 'degraded').length;
  const offlineCount = universes.filter(u => u.status === 'offline').length;
  const avgSuccess = universes.length ? universes.reduce((a, u) => a + (u.success_rate || 0), 0) / universes.length : 0;

  const chartData = universes.slice(0, 8).map(u => ({ name: u.name?.slice(0, 12), success: u.success_rate || 0, errors: u.error_count || 0 }));

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">System Health</h1>
              <p className="text-slate-400 text-sm">Real-time stability, uptime, and resource utilization</p>
            </div>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Active</p><p className="text-3xl font-bold text-green-400 mt-1">{activeCount}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Degraded</p><p className="text-3xl font-bold text-orange-400 mt-1">{degradedCount}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Offline</p><p className="text-3xl font-bold text-red-400 mt-1">{offlineCount}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Avg Success</p><p className="text-3xl font-bold text-cyan-400 mt-1">{avgSuccess.toFixed(1)}%</p></CardContent></Card>
        </div>

        {chartData.length > 0 && (
          <Card className="bg-slate-900/60 border-slate-700 mb-8">
            <CardHeader><CardTitle className="text-white">Universe Success Rates</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Bar dataKey="success" name="Success %" fill="#06b6d4" />
                  <Bar dataKey="errors" name="Errors" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {universes.map(u => {
              const Icon = statusIcon[u.status] || XCircle;
              return (
                <Card key={u.id} className="bg-slate-900/60 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${statusColor[u.status]}`} />
                        <div>
                          <CardTitle className="text-white text-base">{u.name}</CardTitle>
                          <p className="text-slate-400 text-xs">{u.base_url}</p>
                        </div>
                      </div>
                      <Badge variant={badgeVariant[u.status]} className="capitalize">{u.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Success Rate</span><span>{u.success_rate || 0}%</span></div>
                      <Progress value={u.success_rate || 0} className="h-2" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><span className="text-slate-500">Errors (24h):</span> <span className="text-slate-300">{u.error_count || 0}</span></div>
                      <div><span className="text-slate-500">Auth:</span> <span className="text-slate-300">{u.auth_type}</span></div>
                      <div><span className="text-slate-500">Last Check:</span> <span className="text-slate-300">{u.last_check ? new Date(u.last_check).toLocaleTimeString() : '—'}</span></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}