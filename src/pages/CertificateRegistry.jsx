import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Search, ExternalLink } from 'lucide-react';

const statusStyle = {
  issued: 'border-emerald-600/50 text-emerald-300',
  verified: 'border-blue-600/50 text-blue-300',
  expired: 'border-amber-600/50 text-amber-300',
  revoked: 'border-red-600/50 text-red-300'
};

export default function CertificateRegistry() {
  const [q, setQ] = useState('');
  const [audFilter, setAudFilter] = useState('');
  const { data = [], isLoading } = useQuery({
    queryKey: ['identityCertificates'],
    queryFn: () => base44.entities.IdentityCertificate.list('-created_date', 100)
  });
  const auditors = [...new Set(data.map(c => c.auditor_email).filter(Boolean))];
  const filtered = data.filter(c =>
    (!q || c.certificate_name?.toLowerCase().includes(q.toLowerCase()) || c.token_serial?.toLowerCase().includes(q.toLowerCase())) &&
    (!audFilter || c.auditor_email === audFilter)
  );
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><FileText className="w-7 h-7 text-cyan-400" /> Certificate Registry</h1>
        <p className="text-slate-400 mt-1">All generated Identity Certificates. Search, filter by auditor, and open the Drive file.</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search certificate or token serial…" className="pl-9 bg-slate-950 border-slate-700 text-white" />
        </div>
        <select value={audFilter} onChange={e => setAudFilter(e.target.value)} className="bg-slate-950 border border-slate-700 text-white rounded-md h-9 px-3">
          <option value="">All auditors</option>
          {auditors.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <p className="text-slate-500">Loading certificates…</p>}
        {!isLoading && filtered.length === 0 && <p className="text-slate-500">No certificates found.</p>}
        {filtered.map(c => (
          <Card key={c.id} className="bg-slate-900/60 border-slate-700">
            <CardContent className="pt-5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="text-white font-medium truncate">{c.certificate_name}</div>
                <Badge variant="outline" className={statusStyle[c.status] || 'border-slate-600 text-slate-300'}>{c.status}</Badge>
              </div>
              <div className="text-xs text-slate-500">Auditor: {c.auditor_email || '—'}</div>
              <div className="text-xs text-slate-500">Token: {c.token_serial || '—'}</div>
              <div className="text-xs text-slate-500">Generated: {c.generated_date ? new Date(c.generated_date).toLocaleDateString() : '—'}</div>
              {c.drive_file_url && (
                <a href={c.drive_file_url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 pt-1 border-t border-slate-800">
                  <ExternalLink className="w-3 h-3" /> Open in Google Drive
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}