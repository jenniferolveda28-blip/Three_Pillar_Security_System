import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { History, Search, Clock, ShieldCheck, ShieldX } from 'lucide-react';

export default function AuditorAccessLogs() {
  const [q, setQ] = useState('');
  const { data: logs = [], isLoading } = useQuery({ queryKey: ['auditorAccessLogs'], queryFn: () => base44.entities.AuditorAccessLog.list('-access_time', 200) });

  const filtered = logs.filter(l =>
    (l.auditor_email || '').toLowerCase().includes(q.toLowerCase()) ||
    (l.action || '').toLowerCase().includes(q.toLowerCase()) ||
    (l.records_requested || '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><History className="w-8 h-8 text-cyan-400" /> Auditor Access Logs</h1>
        <p className="text-slate-400 mt-1">Chronological log of all actions taken by auditors using the universal login account</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="text-sm text-slate-400">{filtered.length} access events</div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search auditor, action, or record…" className="pl-9 bg-slate-950 border-slate-700 text-white w-80" />
            </div>
          </div>
          {isLoading ? <p className="text-slate-500 py-8 text-center">Loading access logs…</p> :
           filtered.length === 0 ? <p className="text-slate-500 py-8 text-center">No auditor access logs found.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700 text-slate-400 text-left">
                  <th className="pb-3 pr-4">Access Time</th><th className="pb-3 pr-4">Auditor Email</th><th className="pb-3 pr-4">Action</th><th className="pb-3 pr-4">Records Requested</th><th className="pb-3 pr-4">Credential</th><th className="pb-3 pr-4">IP</th><th className="pb-3 pr-4">Result</th>
                </tr></thead>
                <tbody>
                  {filtered.map(l => (
                    <tr key={l.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="py-3 pr-4 text-slate-500 text-xs whitespace-nowrap"><Clock className="w-3 h-3 inline mr-1" />{l.access_time ? new Date(l.access_time).toLocaleString() : '—'}</td>
                      <td className="py-3 pr-4 text-slate-200">{l.auditor_email}</td>
                      <td className="py-3 pr-4 text-slate-300 capitalize">{l.action || '—'}</td>
                      <td className="py-3 pr-4 text-slate-400 max-w-xs truncate">{l.records_requested || '—'}</td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">{l.credentials_used || '—'}</td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">{l.ip_address || '—'}</td>
                      <td className="py-3 pr-4">{l.success !== false ? <span className="text-green-400 text-xs flex items-center gap-1"><ShieldCheck className="w-3 h-3" />Permitted</span> : <span className="text-red-400 text-xs flex items-center gap-1"><ShieldX className="w-3 h-3" />Denied</span>}</td>
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