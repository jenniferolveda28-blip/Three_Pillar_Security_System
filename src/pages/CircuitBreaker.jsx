import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Loader2, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CircuitBreaker() {
  const [universes, setUniverses] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [u, m] = await Promise.all([
        base44.entities.Universe.list('-created_date', 50),
        base44.entities.AnalyticsMetric.list('-created_date', 100),
      ]);
      setUniverses(u);
      setMetrics(m);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const errorThreshold = 10;
  const tripped = universes.filter(u => (u.error_count || 0) >= errorThreshold || u.status === 'offline');
  const warning = universes.filter(u => (u.error_count || 0) >= errorThreshold / 2 && (u.error_count || 0) < errorThreshold);
  const healthy = universes.filter(u => (u.error_count || 0) < errorThreshold / 2 && u.status !== 'offline');

  const errorMetricsByUniverse = {};
  metrics.filter(m => m.metric_type === 'error' || (m.metric_type === 'api_call' && !m.success)).forEach(m => {
    const key = m.universe_id || m.endpoint || 'unknown';
    errorMetricsByUniverse[key] = (errorMetricsByUniverse[key] || 0) + 1;
  });

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-orange-400" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Circuit Breaker Status</h1>
              <p className="text-slate-400 text-sm">Endpoints tripped or blocked due to error thresholds</p>
            </div>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-red-500/40"><CardContent className="pt-6"><div className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-red-400" /><p className="text-slate-400 text-xs uppercase">Tripped</p></div><p className="text-3xl font-bold text-red-400 mt-1">{tripped.length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-orange-500/40"><CardContent className="pt-6"><div className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-orange-400" /><p className="text-slate-400 text-xs uppercase">Warning</p></div><p className="text-3xl font-bold text-orange-400 mt-1">{warning.length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-green-500/40"><CardContent className="pt-6"><div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-400" /><p className="text-slate-400 text-xs uppercase">Healthy</p></div><p className="text-3xl font-bold text-green-400 mt-1">{healthy.length}</p></CardContent></Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
        ) : (
          <div className="space-y-6">
            {tripped.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-red-400 mb-3">Tripped / Blocked</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {tripped.map(u => (
                    <Card key={u.id} className="bg-slate-900/60 border-red-500/40">
                      <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-white text-base">{u.name}</CardTitle><Badge variant="destructive">TRIPPED</Badge></div></CardHeader>
                      <CardContent>
                        <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Errors (24h)</span><span className="text-red-400">{u.error_count || 0} / {errorThreshold}</span></div>
                        <Progress value={Math.min(100, ((u.error_count || 0) / errorThreshold) * 100)} className="h-2" />
                        <p className="text-xs text-slate-500 mt-2">{u.base_url}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {warning.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-orange-400 mb-3">Approaching Threshold</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {warning.map(u => (
                    <Card key={u.id} className="bg-slate-900/60 border-orange-500/40">
                      <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-white text-base">{u.name}</CardTitle><Badge variant="secondary">WARNING</Badge></div></CardHeader>
                      <CardContent>
                        <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Errors (24h)</span><span className="text-orange-400">{u.error_count || 0} / {errorThreshold}</span></div>
                        <Progress value={Math.min(100, ((u.error_count || 0) / errorThreshold) * 100)} className="h-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {healthy.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-green-400 mb-3">Healthy</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {healthy.map(u => (
                    <Card key={u.id} className="bg-slate-900/60 border-green-500/20">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between"><p className="text-white text-sm font-medium">{u.name}</p><ShieldCheck className="w-4 h-4 text-green-400" /></div>
                        <p className="text-xs text-slate-500 mt-1">{u.error_count || 0} errors · {u.success_rate || 100}% success</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}