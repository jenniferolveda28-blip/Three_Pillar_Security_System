import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ListChecks, Search, ExternalLink, Clock, Send, ShieldCheck, AlertTriangle } from 'lucide-react';

const PENDING_STATUSES = ['discovered', 'opt_out_sent', 'pending_verification', 'escalated', 're_listed'];

const statusStyle = {
  discovered: 'border-blue-600/50 text-blue-300',
  opt_out_sent: 'border-amber-600/50 text-amber-300',
  pending_verification: 'border-purple-600/50 text-purple-300',
  escalated: 'border-red-600/50 text-red-300',
  re_listed: 'border-orange-600/50 text-orange-300'
};

export default function PendingRemovalDashboard() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data = [], isLoading } = useQuery({
    queryKey: ['pendingRemovals'],
    queryFn: () => base44.entities.ExposureRecord.list('-created_date', 200)
  });

  const pending = (data || []).filter(e => PENDING_STATUSES.includes(e.status));
  const filtered = pending.filter(e =>
    (!q || (e.broker_name || '').toLowerCase().includes(q.toLowerCase()) || (e.user_email || '').toLowerCase().includes(q.toLowerCase())) &&
    (statusFilter === 'all' || e.status === statusFilter)
  );

  const byStatus = PENDING_STATUSES.reduce((acc, s) => { acc[s] = pending.filter(e => e.status === s).length; return acc; }, {});
  const byBroker = {};
  pending.forEach(e => { byBroker[e.broker_name] = (byBroker[e.broker_name] || 0) + 1; });
  const topBrokers = Object.entries(byBroker).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const updateStatus = useMutation({
    mutationFn: ({ id, status, extra }) => base44.entities.ExposureRecord.update(id, { status, ...(extra || {}) }),
    onSuccess: () => { toast({ title: 'Task updated' }); qc.invalidateQueries({ queryKey: ['pendingRemovals'] }); },
    onError: (e) => toast({ variant: 'destructive', title: 'Update failed', description: e.message })
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><ListChecks className="w-7 h-7 text-cyan-400" /> Pending Removal Dashboard</h1>
        <p className="text-slate-400 mt-1">Every data-broker PII removal task currently in flight — exactly what's being handled right now.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-5"><div className="text-xs text-slate-500 uppercase">Total Pending</div><div className="text-2xl font-bold text-white">{pending.length}</div></CardContent></Card>
        <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-5"><div className="text-xs text-slate-500 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Discovered</div><div className="text-2xl font-bold text-blue-300">{byStatus.discovered || 0}</div></CardContent></Card>
        <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-5"><div className="text-xs text-slate-500 uppercase flex items-center gap-1"><Send className="w-3 h-3" /> Opt-Out Sent</div><div className="text-2xl font-bold text-amber-300">{byStatus.opt_out_sent || 0}</div></CardContent></Card>
        <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-5"><div className="text-xs text-slate-500 uppercase flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Pending Verification</div><div className="text-2xl font-bold text-purple-300">{byStatus.pending_verification || 0}</div></CardContent></Card>
        <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-5"><div className="text-xs text-slate-500 uppercase flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Escalated</div><div className="text-2xl font-bold text-red-300">{(byStatus.escalated || 0) + (byStatus.re_listed || 0)}</div></CardContent></Card>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search broker or user email…" className="pl-9 bg-slate-950 border-slate-700 text-white" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-950 border border-slate-700 text-white rounded-md h-9 px-3">
          <option value="all">All pending statuses</option>
          {PENDING_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {topBrokers.length > 0 && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardContent className="pt-5">
            <div className="text-white font-medium mb-3">Most Active Brokers</div>
            <div className="flex flex-wrap gap-2">
              {topBrokers.map(([name, count]) => (
                <Badge key={name} variant="outline" className="border-slate-600 text-slate-300">{name}: {count}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="pt-5">
          <h2 className="text-white font-semibold mb-3">Removal Tasks ({filtered.length})</h2>
          {isLoading && <p className="text-slate-500">Loading tasks…</p>}
          {!isLoading && filtered.length === 0 && <p className="text-slate-500">No pending removal tasks. 🎉</p>}
          <div className="space-y-3">
            {filtered.map(e => (
              <div key={e.id} className="border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-white font-medium">{e.broker_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{(e.exposure_type || '').replace(/_/g, ' ')} · {e.user_email}</div>
                  </div>
                  <Badge variant="outline" className={statusStyle[e.status] || 'border-slate-600 text-slate-300'}>{(e.status || '').replace(/_/g, ' ')}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                  {e.discovery_date && <span>Discovered: {new Date(e.discovery_date).toLocaleDateString()}</span>}
                  {e.opt_out_sent_date && <span>Sent: {new Date(e.opt_out_sent_date).toLocaleDateString()}</span>}
                  {e.risk_score != null && <span>Risk: {e.risk_score}/100</span>}
                  {e.listing_url && <a href={e.listing_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Listing</a>}
                </div>
                <div className="flex gap-2 flex-wrap pt-1">
                  {e.status === 'discovered' && (
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-500" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: e.id, status: 'opt_out_sent', extra: { opt_out_sent_date: new Date().toISOString() } })}>Mark Opt-Out Sent</Button>
                  )}
                  {e.status === 'opt_out_sent' && (
                    <Button size="sm" variant="outline" className="border-purple-600/50 text-purple-300" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: e.id, status: 'pending_verification' })}>Mark Pending Verification</Button>
                  )}
                  {e.status === 'pending_verification' && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: e.id, status: 'scrubbed', extra: { scrubbed_date: new Date().toISOString() } })}>Verify Scrubbed</Button>
                  )}
                  <Button size="sm" variant="outline" className="border-red-700/50 text-red-300" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: e.id, status: 'escalated' })}>Escalate</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}