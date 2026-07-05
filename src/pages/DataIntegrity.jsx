import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, Loader2, RefreshCw, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DataIntegrity() {
  const [requests, setRequests] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [r, m] = await Promise.all([
        base44.entities.UniversalRequest.list('-created_date', 50),
        base44.entities.AnalyticsMetric.list('-created_date', 100),
      ]);
      setRequests(r);
      setMetrics(m);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const successCount = requests.filter(r => r.status === 'success').length;
  const failedCount = requests.filter(r => r.status === 'failed').length;
  const totalCount = requests.length || 1;
  const successRate = (successCount / totalCount) * 100;

  const withReasoning = requests.filter(r => r.ai_reasoning);
  const avgConfidence = withReasoning.length > 0
    ? withReasoning.reduce((a, r) => {
        const m = r.ai_reasoning?.match(/(\d+)/);
        return a + (m ? parseInt(m[1]) : 75);
      }, 0) / withReasoning.length
    : 0;

  const trendData = requests.slice(0, 15).reverse().map((r, i) => ({
    name: `${i + 1}`,
    success: r.status === 'success' ? 100 : 0,
    latency: r.latency_ms || 0,
  }));

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-green-400" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Data Integrity Monitor</h1>
              <p className="text-slate-400 text-sm">Request success rates and AI reasoning confidence</p>
            </div>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Success Rate</p><p className="text-3xl font-bold text-green-400 mt-1">{successRate.toFixed(1)}%</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Total Requests</p><p className="text-3xl font-bold text-cyan-400 mt-1">{requests.length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Failures</p><p className="text-3xl font-bold text-red-400 mt-1">{failedCount}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><div className="flex items-center gap-1"><Brain className="w-4 h-4 text-purple-400" /><p className="text-slate-400 text-xs uppercase">AI Confidence</p></div><p className="text-3xl font-bold text-purple-400 mt-1">{avgConfidence.toFixed(0)}%</p></CardContent></Card>
        </div>

        {trendData.length > 0 && (
          <Card className="bg-slate-900/60 border-slate-700 mb-8">
            <CardHeader><CardTitle className="text-white">Request Integrity Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
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
            {requests.slice(0, 20).map(r => (
              <Card key={r.id} className="bg-slate-900/60 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white text-sm font-medium truncate flex-1">{r.intent}</p>
                    <Badge variant={r.status === 'success' ? 'default' : 'destructive'} className="capitalize ml-2">{r.status}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div><span className="text-slate-500">Routed:</span> <span className="text-cyan-400">{r.routed_to || '—'}</span></div>
                    <div><span className="text-slate-500">Latency:</span> <span className="text-slate-300">{r.latency_ms || 0}ms</span></div>
                    <div><span className="text-slate-500">Fallback:</span> <span className={r.fallback_used ? 'text-orange-400' : 'text-slate-300'}>{r.fallback_used ? 'Yes' : 'No'}</span></div>
                  </div>
                  {r.ai_reasoning && (
                    <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-800">
                      <Brain className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-slate-500 italic">{r.ai_reasoning}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}