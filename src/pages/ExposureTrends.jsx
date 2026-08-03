import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, BarChart3, Gauge } from 'lucide-react';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

export default function ExposureTrends() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['exposureTrends'],
    queryFn: () => base44.entities.ExposureRecord.list('-created_date', 500)
  });

  const statusBreakdown = useMemo(() => {
    const map = {};
    data.forEach(e => { map[e.status] = (map[e.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  }, [data]);

  const brokerFrequency = useMemo(() => {
    const map = {};
    data.forEach(e => { map[e.broker_name] = (map[e.broker_name] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [data]);

  const scrubbed = data.filter(e => e.status === 'scrubbed').length;
  const total = data.length;
  const successRate = total ? Math.round((scrubbed / total) * 100) : 0;
  const avgRemediationDays = useMemo(() => {
    const done = data.filter(e => e.status === 'scrubbed' && e.opt_out_sent_date && e.scrubbed_date);
    if (!done.length) return 0;
    const ms = done.reduce((s, e) => s + (new Date(e.scrubbed_date) - new Date(e.opt_out_sent_date)), 0) / done.length;
    return (ms / 86400000).toFixed(1);
  }, [data]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><TrendingUp className="w-7 h-7 text-cyan-400" /> Exposure Trends</h1>
        <p className="text-slate-400 mt-1">Removal success rates, most frequent brokers, and remediation speed.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-5"><div className="text-sm text-slate-400">Removal Success Rate</div><div className="text-3xl font-bold text-emerald-400 mt-1">{successRate}%</div><div className="text-xs text-slate-500">{scrubbed} of {total} scrubbed</div></CardContent></Card>
        <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-5"><div className="text-sm text-slate-400">Avg Remediation Time</div><div className="text-3xl font-bold text-cyan-400 mt-1">{avgRemediationDays}d</div><div className="text-xs text-slate-500">opt-out → verified</div></CardContent></Card>
        <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-5"><div className="text-sm text-slate-400">Total Findings Tracked</div><div className="text-3xl font-bold text-white mt-1">{total}</div><div className="text-xs text-slate-500">across all brokers</div></CardContent></Card>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Gauge className="w-4 h-4 text-cyan-400" /> Removal Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <p className="text-slate-500">Loading…</p> : statusBreakdown.length === 0 ? <p className="text-slate-500">No data.</p> : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {statusBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                  <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-400" /> Most Frequent Brokers</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <p className="text-slate-500">Loading…</p> : brokerFrequency.length === 0 ? <p className="text-slate-500">No data.</p> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={brokerFrequency} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={120} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}