import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Server, Wifi, WifiOff, AlertTriangle, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const statusConfig = {
  active: { icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/50', label: 'Healthy' },
  degraded: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/50', label: 'Degraded' },
  offline: { icon: WifiOff, color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/50', label: 'Offline' },
};

export default function APIGatewayHealth() {
  const { data: universes = [], isLoading } = useQuery({
    queryKey: ['gatewayHealth'],
    queryFn: () => base44.entities.Universe.list('-created_date', 100),
    refetchInterval: 10000,
  });

  if (isLoading) return <div className="p-8 text-slate-400">Loading gateway diagnostics…</div>;

  const healthy = universes.filter(u => u.status === 'active').length;
  const avgSuccess = universes.length ? (universes.reduce((s, u) => s + (u.success_rate || 100), 0) / universes.length).toFixed(1) : 100;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Server className="w-8 h-8 text-cyan-400" /> API Gateway Health
        </h1>
        <p className="text-slate-400 mt-1">Health, latency, and connection status for each external universe API</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Connected APIs</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-white">{universes.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-emerald-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm text-emerald-400">Healthy</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-emerald-400">{healthy}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-cyan-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm text-cyan-400">Avg Success Rate</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-cyan-400">{avgSuccess}%</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {universes.map(u => {
          const cfg = statusConfig[u.status] || statusConfig.active;
          const StatusIcon = cfg.icon;
          return (
            <Card key={u.id} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2"><Server className="w-5 h-5 text-cyan-400" /> {u.name}</CardTitle>
                  <Badge className={cfg.bg + ' ' + cfg.color}><StatusIcon className="w-3 h-3 mr-1" /> {cfg.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-slate-400 font-mono break-all">{u.base_url}</div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Success Rate</span>
                    <span className={u.success_rate >= 95 ? 'text-emerald-400' : u.success_rate >= 80 ? 'text-amber-400' : 'text-red-400'}>{u.success_rate || 100}%</span>
                  </div>
                  <Progress value={u.success_rate || 100} className="h-2" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex flex-col items-center p-2 rounded bg-slate-900/50">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mb-1" />
                    <span className="text-slate-400">Errors</span>
                    <span className="text-white font-bold">{u.error_count || 0}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded bg-slate-900/50">
                    <Activity className="w-4 h-4 text-cyan-400 mb-1" />
                    <span className="text-slate-400">Auth</span>
                    <span className="text-white text-xs">{u.auth_type}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded bg-slate-900/50">
                    <Clock className="w-4 h-4 text-purple-400 mb-1" />
                    <span className="text-slate-400">Last Check</span>
                    <span className="text-white text-xs">{u.last_check ? new Date(u.last_check).toLocaleTimeString() : '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}