import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Map, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statusColors = {
  active: 'bg-green-500/20 text-green-400 border-green-500/50',
  degraded: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  offline: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export default function UniverseLatency() {
  const { data: universes = [], isLoading } = useQuery({
    queryKey: ['universesLatency'],
    queryFn: () => base44.entities.Universe.list('-created_date', 100),
  });

  if (isLoading) return <div className="p-8 text-slate-400">Loading universe latency data…</div>;

  const chartData = universes.map(u => ({
    name: u.name || 'Unknown',
    success_rate: u.success_rate ?? 100,
    errors: u.error_count || 0,
    status: u.status,
  }));

  const avgSuccessRate = universes.length > 0 ? Math.round(universes.reduce((sum, u) => sum + (u.success_rate || 0), 0) / universes.length) : 0;
  const totalErrors = universes.reduce((sum, u) => sum + (u.error_count || 0), 0);
  const activeCount = universes.filter(u => u.status === 'active').length;
  const degradedCount = universes.filter(u => u.status === 'degraded').length;
  const offlineCount = universes.filter(u => u.status === 'offline').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Map className="w-8 h-8 text-cyan-400" /> Universe Latency Map
        </h1>
        <p className="text-slate-400 mt-1">Track latency and performance across all API universes for routing optimization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Avg Success Rate</p>
            <p className={`text-2xl font-bold ${avgSuccessRate >= 90 ? 'text-green-400' : avgSuccessRate >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{avgSuccessRate}%</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Total Errors (24h)</p>
            <p className="text-2xl font-bold text-red-400">{totalErrors}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Active Universes</p>
            <p className="text-2xl font-bold text-green-400">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Degraded / Offline</p>
            <p className="text-2xl font-bold text-amber-400">{degradedCount + offlineCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-400" /> Success Rate by Universe</CardTitle></CardHeader>
        <CardContent>
          {chartData.length === 0 ? <p className="text-slate-500 text-center py-8">No universes registered.</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={12} unit="%" />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={120} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Bar dataKey="success_rate" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.success_rate >= 90 ? '#10b981' : entry.success_rate >= 70 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white flex items-center gap-2"><Zap className="w-5 h-5 text-cyan-400" /> Universe Details</CardTitle></CardHeader>
        <CardContent>
          {universes.length === 0 ? <p className="text-slate-500 text-center py-4">No universes found.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-left">
                    <th className="pb-3 pr-4">Universe</th>
                    <th className="pb-3 pr-4">Base URL</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Success Rate</th>
                    <th className="pb-3 pr-4">Errors (24h)</th>
                    <th className="pb-3 pr-4">Last Check</th>
                  </tr>
                </thead>
                <tbody>
                  {universes.map(u => (
                    <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-900/50">
                      <td className="py-3 pr-4 text-slate-200 font-medium">{u.name || '—'}</td>
                      <td className="py-3 pr-4 text-slate-400 text-xs max-w-xs truncate">{u.base_url || '—'}</td>
                      <td className="py-3 pr-4"><Badge className={statusColors[u.status] || statusColors.active}>{u.status}</Badge></td>
                      <td className="py-3 pr-4">
                        <span className={u.success_rate >= 90 ? 'text-green-400' : u.success_rate >= 70 ? 'text-amber-400' : 'text-red-400'}>{u.success_rate ?? 100}%</span>
                      </td>
                      <td className="py-3 pr-4"><span className={u.error_count > 5 ? 'text-red-400' : 'text-slate-300'}>{u.error_count || 0}</span></td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">{u.last_check ? new Date(u.last_check).toLocaleString() : 'Never'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}