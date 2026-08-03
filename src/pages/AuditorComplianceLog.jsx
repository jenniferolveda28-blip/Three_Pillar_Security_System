import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollText, Search } from 'lucide-react';

export default function AuditorComplianceLog() {
  const [q, setQ] = useState('');
  const { data = [], isLoading } = useQuery({
    queryKey: ['auditorComplianceLog'],
    queryFn: () => base44.entities.AuditorAccessLog.list('-access_time', 200)
  });
  const filtered = data.filter(l =>
    !q || l.auditor_email?.toLowerCase().includes(q.toLowerCase()) || l.action?.toLowerCase().includes(q.toLowerCase()) || l.records_requested?.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><ScrollText className="w-7 h-7 text-cyan-400" /> Auditor Compliance Log</h1>
        <p className="text-slate-400 mt-1">Every auditor access — timestamp, credentials used, and records requested.</p>
      </div>
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search auditor, action, or records…" className="pl-9 bg-slate-950 border-slate-700 text-white" />
      </div>
      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="pt-5">
          {isLoading && <p className="text-slate-500">Loading log…</p>}
          {!isLoading && filtered.length === 0 && <p className="text-slate-500">No access logs recorded.</p>}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.map(l => (
              <div key={l.id} className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">{l.auditor_email}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {l.action || 'access'} · {l.credentials_used || 'warrant'} · {l.records_requested || '—'}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-400">{l.access_time ? new Date(l.access_time).toLocaleString() : '—'}</div>
                  <Badge variant="outline" className={l.success === false ? 'border-red-600/50 text-red-300' : 'border-emerald-600/50 text-emerald-300'}>{l.success === false ? 'denied' : 'ok'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}