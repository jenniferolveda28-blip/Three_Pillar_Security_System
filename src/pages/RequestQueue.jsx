import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListOrdered, Loader2, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RequestQueue() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.UniversalRequest.list('-created_date', 50);
      setRequests(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const statusVariant = { pending: 'secondary', routing: 'secondary', processing: 'secondary', success: 'default', failed: 'destructive', retry: 'destructive' };
  const statusColor = { pending: 'text-slate-400', routing: 'text-blue-400', processing: 'text-yellow-400', success: 'text-green-400', failed: 'text-red-400', retry: 'text-orange-400' };

  const pending = requests.filter(r => r.status === 'pending' || r.status === 'routing' || r.status === 'processing');
  const completed = requests.filter(r => r.status === 'success' || r.status === 'failed' || r.status === 'retry');

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ListOrdered className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">API Request Queue</h1>
              <p className="text-slate-400 text-sm">Pending requests, status, and target universe routing</p>
            </div>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">In Queue</p><p className="text-3xl font-bold text-yellow-400 mt-1">{pending.length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Completed</p><p className="text-3xl font-bold text-green-400 mt-1">{completed.length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Failures</p><p className="text-3xl font-bold text-red-400 mt-1">{requests.filter(r => r.status === 'failed').length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Fallbacks</p><p className="text-3xl font-bold text-orange-400 mt-1">{requests.filter(r => r.fallback_used).length}</p></CardContent></Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
        ) : requests.length === 0 ? (
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="py-16 text-center text-slate-500">No requests in the queue.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {requests.map(r => (
              <Card key={r.id} className="bg-slate-900/60 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{r.intent}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="text-slate-500">Routed to:</span>
                        <span className="text-cyan-400">{r.routed_to || 'Pending'}</span>
                        {r.fallback_used && <Badge variant="outline" className="text-orange-400 border-orange-500/40 text-xs">Fallback</Badge>}
                        {r.latency_ms && <span className="text-slate-500">· {r.latency_ms}ms</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <span className="capitalize text-slate-300">{r.status}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-cyan-400">{r.routed_to || '—'}</span>
                      </div>
                      <Badge variant={statusVariant[r.status]} className={`capitalize ${statusColor[r.status]}`}>{r.status}</Badge>
                    </div>
                  </div>
                  {r.ai_reasoning && <p className="text-xs text-slate-500 mt-2 italic truncate">AI: {r.ai_reasoning}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}