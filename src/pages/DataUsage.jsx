import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function DataUsage() {
  const [subs, setSubs] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, m] = await Promise.all([
        base44.entities.Subscription.list('-created_date', 50),
        base44.entities.AnalyticsMetric.list('-created_date', 50),
      ]);
      setSubs(s);
      setMetrics(m);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const totalUsed = subs.reduce((a, s) => a + (s.api_calls_used || 0), 0);
  const totalLimit = subs.reduce((a, s) => a + (s.api_calls_limit || 0), 0);
  const overallPct = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;

  const usageByPlan = ['basic', 'pro', 'enterprise'].map(plan => {
    const planSubs = subs.filter(s => s.plan_type === plan);
    return { plan: plan.charAt(0).toUpperCase() + plan.slice(1), used: planSubs.reduce((a, s) => a + (s.api_calls_used || 0), 0), limit: planSubs.reduce((a, s) => a + (s.api_calls_limit || 0), 0) };
  });

  const recentMetrics = metrics.filter(m => m.metric_type === 'api_call').slice(0, 12).reverse();
  const trendData = recentMetrics.map((m, i) => ({ name: `${i + 1}`, latency: m.latency_ms || 0 }));

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Data Usage</h1>
              <p className="text-slate-400 text-sm">API call volumes, usage limits, and trends</p>
            </div>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Total API Calls</p><p className="text-3xl font-bold text-cyan-400 mt-1">{totalUsed.toLocaleString()}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Total Limit</p><p className="text-3xl font-bold text-slate-300 mt-1">{totalLimit.toLocaleString()}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Overall Usage</p><p className="text-3xl font-bold text-orange-400 mt-1">{overallPct.toFixed(1)}%</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Subscriptions</p><p className="text-3xl font-bold text-purple-400 mt-1">{subs.length}</p></CardContent></Card>
        </div>

        {usageByPlan.some(u => u.limit > 0) && (
          <Card className="bg-slate-900/60 border-slate-700 mb-8">
            <CardHeader><CardTitle className="text-white">Usage by Plan Type</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={usageByPlan}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="plan" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Bar dataKey="used" name="Used" fill="#06b6d4" />
                  <Bar dataKey="limit" name="Limit" fill="#334155" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {trendData.length > 0 && (
          <Card className="bg-slate-900/60 border-slate-700 mb-8">
            <CardHeader><CardTitle className="text-white">API Latency Trend (Recent Requests)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Line type="monotone" dataKey="latency" name="Latency (ms)" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {subs.map(s => {
              const used = s.api_calls_used || 0;
              const limit = s.api_calls_limit || 0;
              const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
              return (
                <Card key={s.id} className="bg-slate-900/60 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-sm">{s.token_serial}</CardTitle>
                      <div className="flex gap-2"><Badge variant="secondary" className="capitalize">{s.plan_type}</Badge><Badge variant={s.status === 'active' ? 'default' : 'destructive'} className="capitalize">{s.status}</Badge></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{used.toLocaleString()} / {limit.toLocaleString()} calls</span><span>{pct.toFixed(1)}%</span></div>
                    <Progress value={pct} className="h-2" />
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