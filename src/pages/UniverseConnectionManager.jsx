import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Network, Search, Activity, AlertCircle, CheckCircle2, Globe } from 'lucide-react';

const statusStyle = {
  active: 'border-emerald-600/50 text-emerald-300',
  degraded: 'border-amber-600/50 text-amber-300',
  offline: 'border-red-600/50 text-red-300'
};

export default function UniverseConnectionManager() {
  const [q, setQ] = useState('');
  const { data: universes = [], isLoading } = useQuery({ queryKey: ['universeManager'], queryFn: () => base44.entities.Universe.list('-created_date', 200) });

  const filtered = universes.filter(u => (u.name || '').toLowerCase().includes(q.toLowerCase()) || (u.base_url || '').toLowerCase().includes(q.toLowerCase()));
  const active = universes.filter(u => u.status === 'active').length;
  const degraded = universes.filter(u => u.status === 'degraded').length;
  const offline = universes.filter(u => u.status === 'offline').length;
  const avgSuccess = universes.length > 0 ? Math.round(universes.reduce((s, u) => s + (u.success_rate || 0), 0) / universes.length) : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Network className="w-8 h-8 text-cyan-400" /> Universe Connection Manager</h1>
        <p className="text-slate-400 mt-1">Status, response health, and connectivity of all connected external Universe APIs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-slate-400">Connected</p><p className="text-2xl font-bold text-white">{universes.length}</p></div><Globe className="w-8 h-8 text-cyan-500/50" /></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-slate-400">Active</p><p className="text-2xl font-bold text-green-400">{active}</p></div><CheckCircle2 className="w-8 h-8 text-green-500/50" /></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-slate-400">Degraded / Offline</p><p className="text-2xl font-bold text-amber-400">{degraded + offline}</p></div><AlertCircle className="w-8 h-8 text-amber-500/50" /></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-slate-400">Avg Success Rate</p><p className="text-2xl font-bold text-cyan-400">{avgSuccess}%</p></div><Activity className="w-8 h-8 text-cyan-500/50" /></CardContent></Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-white font-semibold">Universe Connections</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search universes…" className="pl-9 bg-slate-950 border-slate-700 text-white w-64" />
            </div>
          </div>
          {isLoading ? <p className="text-slate-500 py-8 text-center">Loading connections…</p> :
           filtered.length === 0 ? <p className="text-slate-500 py-8 text-center">No universes found.</p> : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(u => (
                <Card key={u.id} className="bg-slate-900/50 border-slate-800">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-white font-semibold truncate flex items-center gap-2"><Globe className="w-4 h-4 text-cyan-400 shrink-0" />{u.name}</div>
                        {u.base_url && <a href={u.base_url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:underline truncate block">{u.base_url}</a>}
                      </div>
                      <Badge variant="outline" className={statusStyle[u.status] || 'border-slate-600 text-slate-300'}>{u.status}</Badge>
                    </div>
                    {u.description && <p className="text-xs text-slate-400 line-clamp-2">{u.description}</p>}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-slate-800/50"><p className="text-slate-500">Success rate</p><p className="text-white font-medium">{u.success_rate ?? 100}%</p></div>
                      <div className="p-2 rounded bg-slate-800/50"><p className="text-slate-500">Errors (24h)</p><p className={`font-medium ${u.error_count > 0 ? 'text-amber-400' : 'text-white'}`}>{u.error_count || 0}</p></div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">{u.auth_type || 'none'}</Badge>
                      {(u.capabilities || []).slice(0, 3).map((c, i) => <Badge key={i} variant="outline" className="border-slate-700 text-slate-400 text-[10px]">{c}</Badge>)}
                    </div>
                    <div className="text-xs text-slate-500 pt-1 border-t border-slate-800">Last check: {u.last_check ? new Date(u.last_check).toLocaleString() : 'never'}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}