import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ConnectivityMap() {
  const [universes, setUniverses] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [u, m] = await Promise.all([
        base44.entities.Universe.list('-created_date', 50),
        base44.entities.AnalyticsMetric.list('-created_date', 100),
      ]);
      setUniverses(u);
      setMetrics(m);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const avgLatencyByUniverse = {};
  metrics.filter(m => m.metric_type === 'api_call' && m.latency_ms).forEach(m => {
    const key = m.universe_id || m.endpoint;
    if (!avgLatencyByUniverse[key]) avgLatencyByUniverse[key] = { total: 0, count: 0 };
    avgLatencyByUniverse[key].total += m.latency_ms;
    avgLatencyByUniverse[key].count++;
  });

  const getLatency = (u) => {
    const data = avgLatencyByUniverse[u.id] || avgLatencyByUniverse[u.name];
    if (!data || data.count === 0) return null;
    return Math.round(data.total / data.count);
  };

  const statusColor = { active: '#10b981', degraded: '#f59e0b', offline: '#ef4444' };
  const activeCount = universes.filter(u => u.status === 'active').length;

  // hub-and-spoke layout
  const centerX = 50, centerY = 50, radius = 35;
  const positions = universes.map((u, i) => {
    const angle = (i / Math.max(universes.length, 1)) * 2 * Math.PI - Math.PI / 2;
    return { u, x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
  });

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Network className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">System Connectivity Map</h1>
              <p className="text-slate-400 text-sm">Topology, status, and latency of all connected universes</p>
            </div>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Total Nodes</p><p className="text-3xl font-bold text-cyan-400 mt-1">{universes.length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Connected</p><p className="text-3xl font-bold text-green-400 mt-1">{activeCount}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Degraded</p><p className="text-3xl font-bold text-orange-400 mt-1">{universes.filter(u => u.status === 'degraded').length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Offline</p><p className="text-3xl font-bold text-red-400 mt-1">{universes.filter(u => u.status === 'offline').length}</p></CardContent></Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
        ) : universes.length === 0 ? (
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="py-16 text-center text-slate-500">No universes connected.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-900/60 border-slate-700 lg:col-span-2">
              <CardHeader><CardTitle className="text-white">Hub-and-Spoke Topology</CardTitle></CardHeader>
              <CardContent>
                <svg viewBox="0 0 100 100" className="w-full" style={{ maxHeight: '400px' }}>
                  {positions.map((p, i) => (
                    <line key={`line-${i}`} x1={centerX} y1={centerY} x2={p.x} y2={p.y} stroke={statusColor[p.u.status]} strokeWidth="0.3" strokeDasharray={p.u.status === 'offline' ? '1,1' : 'none'} opacity="0.6" />
                  ))}
                  <circle cx={centerX} cy={centerY} r="6" fill="#06b6d4" />
                  <text x={centerX} y={centerY + 0.8} textAnchor="middle" fill="#0f172a" fontSize="2" fontWeight="bold">HUB</text>
                  {positions.map((p, i) => (
                    <g key={`node-${i}`}>
                      <circle cx={p.x} cy={p.y} r="3" fill={statusColor[p.u.status]} className="glow-pulse" />
                      <text x={p.x} y={p.y + 5.5} textAnchor="middle" fill="#cbd5e1" fontSize="1.8">{p.u.name?.slice(0, 10)}</text>
                    </g>
                  ))}
                </svg>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader><CardTitle className="text-white">Node Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {universes.map(u => {
                  const latency = getLatency(u);
                  const Icon = u.status === 'active' ? Wifi : WifiOff;
                  return (
                    <div key={u.id} className="flex items-center justify-between border-b border-slate-800 pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: statusColor[u.status] }} />
                        <span className="text-sm text-slate-300">{u.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {latency !== null && <span className="text-xs text-slate-500">{latency}ms</span>}
                        <Badge variant={u.status === 'active' ? 'default' : u.status === 'degraded' ? 'secondary' : 'destructive'} className="capitalize text-xs">{u.status}</Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}