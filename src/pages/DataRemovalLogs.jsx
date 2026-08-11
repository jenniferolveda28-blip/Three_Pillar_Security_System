import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eraser, Search, Clock, CheckCircle2 } from 'lucide-react';

const statusStyle = {
  scrubbed: 'border-emerald-600/50 text-emerald-300',
  opt_out_sent: 'border-blue-600/50 text-blue-300',
  pending_verification: 'border-amber-600/50 text-amber-300',
  discovered: 'border-slate-600 text-slate-300',
  re_listed: 'border-red-600/50 text-red-300',
  escalated: 'border-orange-600/50 text-orange-300'
};

export default function DataRemovalLogs() {
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data = [], isLoading } = useQuery({ queryKey: ['removalLogs'], queryFn: () => base44.entities.ExposureRecord.list('-discovery_date', 500) });

  const removalStages = ['opt_out_sent', 'pending_verification', 'scrubbed'];
  const logs = data
    .filter(r => removalStages.includes(r.status) || r.scrubbed_date || r.opt_out_sent_date)
    .map(r => ({ ...r, action_date: r.scrubbed_date || r.opt_out_sent_date || r.discovery_date }))
    .sort((a, b) => new Date(b.action_date || 0) - new Date(a.action_date || 0));

  const filtered = logs.filter(r => {
    const matchQ = !q || (r.broker_name || '').toLowerCase().includes(q.toLowerCase()) || (r.user_email || '').toLowerCase().includes(q.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchQ && matchStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Eraser className="w-8 h-8 text-cyan-400" /> Data Removal Logs</h1>
        <p className="text-slate-400 mt-1">Chronological history of completed PII data broker removal requests and status changes</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search broker or email…" className="pl-9 bg-slate-950 border-slate-700 text-white w-64" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2 text-sm">
          <option value="all">All Stages</option>
          <option value="opt_out_sent">Opt-Out Sent</option>
          <option value="pending_verification">Pending Verification</option>
          <option value="scrubbed">Scrubbed</option>
          <option value="re_listed">Re-Listed</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-5">
          {isLoading ? <p className="text-slate-500 py-8 text-center">Loading removal logs…</p> :
           filtered.length === 0 ? <p className="text-slate-500 py-8 text-center">No removal records found.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700 text-slate-400 text-left">
                  <th className="pb-3 pr-4">Date</th><th className="pb-3 pr-4">Broker</th><th className="pb-3 pr-4">User</th><th className="pb-3 pr-4">Exposure Type</th><th className="pb-3 pr-4">Status</th><th className="pb-3 pr-4">Method</th><th className="pb-3 pr-4">Confirmed</th>
                </tr></thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="py-3 pr-4 text-slate-300 whitespace-nowrap"><Clock className="w-3 h-3 inline mr-1 text-slate-500" />{r.action_date ? new Date(r.action_date).toLocaleString() : '—'}</td>
                      <td className="py-3 pr-4 text-white">{r.broker_name}</td>
                      <td className="py-3 pr-4 text-slate-400">{r.user_email}</td>
                      <td className="py-3 pr-4 text-slate-300">{r.exposure_type?.replace('pii_', '')}</td>
                      <td className="py-3 pr-4"><Badge variant="outline" className={statusStyle[r.status] || 'border-slate-600 text-slate-300'}>{r.status?.replace(/_/g, ' ')}</Badge></td>
                      <td className="py-3 pr-4 text-slate-400">{r.removal_method?.replace(/_/g, ' ') || '—'}</td>
                      <td className="py-3 pr-4">{r.scrubbed_date ? <span className="text-green-400 text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{new Date(r.scrubbed_date).toLocaleDateString()}</span> : <span className="text-slate-600 text-xs">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}