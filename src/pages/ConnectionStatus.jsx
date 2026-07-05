import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Wifi, WifiOff, Activity, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ConnectionStatus() {
  const { data: universes = [], isLoading } = useQuery({
    queryKey: ['connectionStatus'],
    queryFn: () => base44.entities.Universe.list('-created_date', 100),
    refetchInterval: 5000,
  });

  if (isLoading) return <div className="p-8 text-slate-400">Loading connection status…</div>;

  const active = universes.filter(u => u.status === 'active');
  const degraded = universes.filter(u => u.status === 'degraded');
  const offline = universes.filter(u => u.status === 'offline');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-emerald-400" /> Connection Status
        </h1>
        <p className="text-slate-400 mt-1">Live status of all connected Universes and their response latency</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Total</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-white">{universes.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-emerald-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm text-emerald-400 flex items-center gap-1"><Wifi className="w-4 h-4" /> Active</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-emerald-400">{active.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-amber-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">Degraded</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-400">{degraded.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-red-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm text-red-400 flex items-center gap-1"><WifiOff className="w-4 h-4" /> Offline</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-400">{offline.length}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {universes.map(u => {
          const isActive = u.status === 'active';
          const pulseColor = isActive ? 'bg-emerald-400' : u.status === 'degraded' ? 'bg-amber-400' : 'bg-red-400';
          return (
            <Card key={u.id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Server className="w-5 h-5 text-cyan-400" />
                      <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${pulseColor} animate-pulse`}></span>
                    </div>
                    <span className="text-white font-medium">{u.name}</span>
                  </div>
                  <Badge className={isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : u.status === 'degraded' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}>
                    {u.status}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400 font-mono mb-3 truncate">{u.base_url}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Success Rate</span>
                  <span className={isActive ? 'text-emerald-400' : 'text-amber-400'}>{u.success_rate || 100}%</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-slate-400">Errors (24h)</span>
                  <span className={u.error_count > 0 ? 'text-amber-400' : 'text-slate-300'}>{u.error_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-slate-400">Last Check</span>
                  <span className="text-slate-300">{u.last_check ? new Date(u.last_check).toLocaleTimeString() : '—'}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}