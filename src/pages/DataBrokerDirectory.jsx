import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Database, Search, ExternalLink } from 'lucide-react';

const scanStatusStyle = {
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

export default function DataBrokerDirectory() {
  const [q, setQ] = useState('');
  const { data = [], isLoading } = useQuery({
    queryKey: ['dataBrokers'],
    queryFn: () => base44.entities.DataBroker.list('-exposure_count', 100)
  });
  const filtered = data.filter(b =>
    b.broker_name?.toLowerCase().includes(q.toLowerCase()) ||
    (b.data_types_exposed || []).join(' ').toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Database className="w-7 h-7 text-cyan-400" /> Data Broker Directory</h1>
          <p className="text-slate-400 mt-1">Monitored data brokers, current scan status, and known removal protocols.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search brokers…" className="pl-9 bg-slate-950 border-slate-700 text-white w-72" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <p className="text-slate-500">Loading brokers…</p>}
        {!isLoading && filtered.length === 0 && <p className="text-slate-500">No brokers found.</p>}
        {filtered.map(b => (
          <Card key={b.id} className="bg-slate-900/60 border-slate-700">
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-white font-semibold truncate">{b.broker_name}</div>
                  {b.broker_url && <a href={b.broker_url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 truncate"><ExternalLink className="w-3 h-3 shrink-0" />{b.broker_url}</a>}
                </div>
                <Badge variant="outline" className={scanStatusStyle[b.scan_status] || 'border-slate-600 text-slate-300'}>{b.scan_status}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={riskStyle[b.risk_level] || 'border-slate-600 text-slate-300'}>{b.risk_level} risk</Badge>
                <Badge variant="outline" className="border-slate-600 text-slate-300">{b.exposure_count || 0} exposures</Badge>
              </div>
              <div className="text-xs text-slate-400"><span className="text-slate-500">Removal:</span> {(b.removal_method || '').replace(/_/g, ' ')}</div>
              {b.opt_out_url && (
                <a href={b.opt_out_url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Opt-out form</a>
              )}
              {b.data_types_exposed?.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {b.data_types_exposed.map((t, i) => <Badge key={i} variant="outline" className="border-slate-700 text-slate-400 text-[10px]">{t.replace('pii_', '')}</Badge>)}
                </div>
              )}
              <div className="text-xs text-slate-500 pt-1 border-t border-slate-800">Last scan: {b.last_scan_date ? new Date(b.last_scan_date).toLocaleString() : 'never'}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}