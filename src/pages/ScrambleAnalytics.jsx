import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Activity, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ScrambleAnalytics() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['scrambleAnalytics'],
    queryFn: () => base44.entities.ScramblingSession.list('-created_date', 50),
  });

  const sorted = [...sessions].reverse();
  const chartData = sorted.map(s => ({
    name: s.scramble_type?.replace(/_/g, ' ').substring(0, 12) || 'Session',
    iterations: s.iterations || 0,
    protection: s.protection_score || 100,
    complexity: s.complexity_level || 100,
    interval: s.scramble_interval_seconds || 0.01,
  }));

  const totalIterations = sessions.reduce((s, x) => s + (x.iterations || 0), 0);
  const avgProtection = sessions.length ? (sessions.reduce((s, x) => s + (x.protection_score || 0), 0) / sessions.length).toFixed(1) : 0;
  const compliant = sessions.filter(s => (s.scramble_interval_seconds || 5) <= 0.01).length;

  if (isLoading) return <div className="p-8 text-slate-400">Loading scramble analytics…</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-amber-400" /> Scramble Analytics
        </h1>
        <p className="text-slate-400 mt-1">Graphical performance of the 0.01-second scrambling interval over time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Active Sessions</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-white">{sessions.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-amber-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">Total Iterations</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-400">{totalIterations.toLocaleString()}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-emerald-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm text-emerald-400">Avg Protection</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-emerald-400">{avgProtection}%</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-cyan-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm text-cyan-400">0.01s Compliant</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-cyan-400">{compliant}/{sessions.length}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-cyan-400" /> Protection Score Over Time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-20} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Line type="monotone" dataKey="protection" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="complexity" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Zap className="w-5 h-5 text-amber-400" /> Iterations per Session</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Bar dataKey="iterations" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Scramble Interval Consistency</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-20} textAnchor="end" height={60} />
              <YAxis domain={[0, 0.1]} stroke="#94a3b8" unit="s" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Line type="monotone" dataKey="interval" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}