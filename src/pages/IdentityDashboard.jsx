import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radar, ShieldCheck, TrendingDown, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function IdentityDashboard() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['identityDashboard', 'exposures'],
    queryFn: () => base44.entities.ExposureRecord.list('-created_date', 500)
  });
  const scrubbed = data.filter(e => e.status === 'scrubbed');
  const active = data.filter(e => ['discovered', 'opt_out_sent', 'pending_verification', 'escalated'].includes(e.status));
  const recentRemovals = useMemo(() => scrubbed.slice(0, 6), [scrubbed]);
  const byType = useMemo(() => {
    const map = {};
    data.forEach(e => { const t = (e.exposure_type || 'unknown').replace('pii_', ''); map[t] = (map[t] || 0) + 1; });
    return Object.entries(map).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [data]);
  const safetyScore = data.length ? Math.round((scrubbed.length / data.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Activity className="w-7 h-7 text-cyan-400" /> Identity Dashboard</h1>
        <p className="text-slate-400 mt-1">High-level view of PII exposure counts and recent removal successes.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-5 flex items-center gap-3"><div className="p-3 rounded-lg bg-red-600/20"><Radar className="w-5 h-5 text-red-400" /></div><div><div className="text-2xl font-bold text-white">{active.length}</div><div className="text-xs text-slate-400 uppercase">Active Exposures</div></div></CardContent></Card>
        <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-5 flex items-center gap-3"><div className="p-3 rounded-lg bg-emerald-600/20"><ShieldCheck className="w-5 h-5 text-emerald-400" /></div><div><div className="text-2xl font-bold text-white">{scrubbed.length}</div><div className="text-xs text-slate-400 uppercase">Removed</div></div></CardContent></Card>
        <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-5"><div className="text-2xl font-bold text-white">{data.length}</div><div className="text-xs text-slate-400 uppercase">Total Findings</div></CardContent></Card>
        <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-5 flex items-center gap-3"><div className="p-3 rounded-lg bg-cyan-600/20"><TrendingDown className="w-5 h-5 text-cyan-400" /></div><div><div className="text-2xl font-bold text-white">{safetyScore}%</div><div className="text-xs text-slate-400 uppercase">Safety Score</div></div></CardContent></Card>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900/60 border-slate-700">
          <CardContent className="pt-5">
            <h2 className="text-white font-semibold mb-3">Exposures by Type</h2>
            {!isLoading && byType.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={byType}>
                  <XAxis dataKey="type" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-500">No data.</p>}
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 border-slate-700">
          <CardContent className="pt-5">
            <h2 className="text-white font-semibold mb-3">Recent Removal Successes</h2>
            <div className="space-y-2 max-h-[240px] overflow-y-auto">
              {recentRemovals.length === 0 && <p className="text-slate-500">No removals yet.</p>}
              {recentRemovals.map(e => (
                <div key={e.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div><div className="text-white text-sm">{e.broker_name}</div><div className="text-xs text-slate-500">{(e.exposure_type || '').replace('pii_', '').replace(/_/g, ' ')}</div></div>
                  <Badge variant="outline" className="border-emerald-600/50 text-emerald-300">scrubbed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}