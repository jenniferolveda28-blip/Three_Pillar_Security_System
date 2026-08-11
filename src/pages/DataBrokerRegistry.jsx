import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Database, Search, ExternalLink, ShieldOff } from 'lucide-react';

const scanStyle = {
  monitored: 'border-emerald-600/50 text-emerald-300',
  scanning: 'border-blue-600/50 text-blue-300',
  paused: 'border-amber-600/50 text-amber-300',
  blocked: 'border-red-600/50 text-red-300',
  error: 'border-red-600/50 text-red-300'
};
const riskStyle = {
  low: 'border-slate-600 text-slate-300',
  medium: 'border-blue-600/50 text-blue-300',
  high: 'border-amber-600/50 text-amber-300',
  critical: 'border-red-600/50 text-red-300'
};
const methodLabel = {
  automated_opt_out: 'Automated Opt-Out',
  manual_form: 'Manual Form',
  email_request: 'Email Request',
  mail_request: 'Mail Request',
  legal_request: 'Legal Request'
};

export default function DataBrokerRegistry() {
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data = [], isLoading } = useQuery({
    queryKey: ['dataBrokerRegistry'],
    queryFn: () => base44.entities.DataBroker.list('-exposure_count', 200)
  });
  const filtered = data.filter(b => {
    const matchQ = (b.broker_name || '').toLowerCase().includes(q.toLowerCase()) ||
      (b.broker_url || '').toLowerCase().includes(q.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.scan_status === statusFilter;
    return matchQ && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Database className="w-7 h-7 text-cyan-400" /> Data Broker Registry</h1>
        <p className="text-slate-400 mt-1">Complete registry of tracked data brokers, removal protocols, and manual intervention links.</p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search brokers…" className="pl-9 bg-slate-950 border-slate-700 text-white w-72" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2 text-sm">
          <option value="all">All Statuses</option>
          <option value="monitored">Monitored</option>
          <option value="scanning">Scanning</option>
          <option value="paused">Paused</option>
          <option value="blocked">Blocked</option>
          <option value="error">Error</option>
        </select>
      </div>
      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="pt-5">
          {isLoading ? <p className="text-slate-500 py-8 text-center">Loading registry…</p> :
           filtered.length === 0 ? <p className="text-slate-500 py-8 text-center">No brokers found.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-left">
                    <th className="pb-3 pr-4">Broker</th>
                    <th className="pb-3 pr-4">Scan Status</th>
                    <th className="pb-3 pr-4">Risk</th>
                    <th className="pb-3 pr-4">Exposures</th>
                    <th className="pb-3 pr-4">Removal Protocol</th>
                    <th className="pb-3 pr-4">Manual Action</th>
                    <th className="pb-3 pr-4">Last Scan</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="py-3 pr-4">
                        <div className="text-white font-medium">{b.broker_name}</div>
                        {b.broker_url && <a href={b.broker_url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" />Visit site</a>}
                      </td>
                      <td className="py-3 pr-4"><Badge variant="outline" className={scanStyle[b.scan_status] || 'border-slate-600 text-slate-300'}>{b.scan_status}</Badge></td>
                      <td className="py-3 pr-4"><Badge variant="outline" className={riskStyle[b.risk_level] || 'border-slate-600 text-slate-300'}>{b.risk_level}</Badge></td>
                      <td className="py-3 pr-4 text-slate-200">{b.exposure_count || 0}</td>
                      <td className="py-3 pr-4 text-slate-300">{methodLabel[b.removal_method] || b.removal_method}</td>
                      <td className="py-3 pr-4">
                        {b.opt_out_url ? (
                          <a href={b.opt_out_url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1"><ShieldOff className="w-3 h-3" />Open opt-out</a>
                        ) : <span className="text-slate-600 text-xs">—</span>}
                      </td>
                      <td className="py-3 pr-4 text-slate-500 text-xs whitespace-nowrap">{b.last_scan_date ? new Date(b.last_scan_date).toLocaleString() : 'never'}</td>
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