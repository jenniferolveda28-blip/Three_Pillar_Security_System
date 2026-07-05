import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gauge, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RateLimits() {
  const [subs, setSubs] = useState([]);
  const [universes, setUniverses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, u] = await Promise.all([
        base44.entities.Subscription.list('-created_date', 50),
        base44.entities.Universe.list('-created_date', 50),
      ]);
      setSubs(s);
      setUniverses(u);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const chartData = subs.slice(0, 10).map(s => ({ name: s.token_serial?.slice(0, 8) || 'N/A', used: s.api_calls_used || 0, limit: s.api_calls_limit || 0 }));

  const nearLimitCount = subs.filter(s => {
    const limit = s.api_calls_limit || 0;
    const used = s.api_calls_used || 0;
    const pct = limit > 0 ? (used / limit) * 100 : 0;
    return pct >= 80;
  }).length;

  const exceededCount = subs.filter(s => s.api_calls_limit > 0 && (s.api_calls_used || 0) >= s.api_calls_limit).length;

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Gauge className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Rate Limit Dashboard</h1>
              <p className="text-slate-400 text-sm">API call limit proximity for each subscription</p>
            </div>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Subscriptions</p><p className="text-3xl font-bold text-cyan-400 mt-1">{subs.length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Near Limit</p><p className="text-3xl font-bold text-orange-400 mt-1">{nearLimitCount}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Exceeded</p><p className="text-3xl font-bold text-red-400 mt-1">{exceededCount}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Connected Universes</p><p className="text-3xl font-bold text-purple-400 mt-1">{universes.length}</p></CardContent></Card>
        </div>

        {chartData.length > 0 && (
          <Card className="bg-slate-900/60 border-slate-700 mb-8">
            <CardHeader><CardTitle className="text-white">Usage vs Limit by Token</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Bar dataKey="used" name="Used" fill="#06b6d4" />
                  <Bar dataKey="limit" name="Limit" fill="#334155" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
        ) : subs.length === 0 ? (
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="py-16 text-center text-slate-500">No subscriptions to monitor.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {subs.map(s => {
              const used = s.api_calls_used || 0;
              const limit = s.api_calls_limit || 0;
              const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
              const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-orange-500' : 'bg-cyan-500';
              return (
                <Card key={s.id} className="bg-slate-900/60 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div><CardTitle className="text-white text-sm">{s.token_serial}</CardTitle><p className="text-slate-400 text-xs">{s.user_email}</p></div>
                      <Badge variant="secondary" className="capitalize">{s.plan_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{used.toLocaleString()} / {limit.toLocaleString()} calls</span><span className={pct >= 80 ? 'text-orange-400' : 'text-slate-300'}>{pct.toFixed(1)}%</span></div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden"><div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} /></div>
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