import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Search, ExternalLink, Share2, Copy, Mail } from 'lucide-react';

const statusStyle = {
  issued: 'border-emerald-600/50 text-emerald-300',
  verified: 'border-blue-600/50 text-blue-300',
  expired: 'border-amber-600/50 text-amber-300',
  revoked: 'border-red-600/50 text-red-300'
};

export default function AuditorCertificatePortal() {
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data = [], isLoading } = useQuery({
    queryKey: ['auditorCertificates'],
    queryFn: () => base44.entities.IdentityCertificate.list('-created_date', 200)
  });

  const certs = (data || []).filter(c =>
    (!q || (c.certificate_name || '').toLowerCase().includes(q.toLowerCase()) || (c.token_serial || '').toLowerCase().includes(q.toLowerCase()) || (c.auditor_email || '').toLowerCase().includes(q.toLowerCase())) &&
    (statusFilter === 'all' || c.status === statusFilter)
  );

  const copyLink = (url) => {
    if (!url) { toast({ variant: 'destructive', title: 'No Drive link available' }); return; }
    navigator.clipboard.writeText(url);
    toast({ title: 'Certificate link copied' });
  };

  const copySummary = (c) => {
    const text = `Identity Certificate\nName: ${c.certificate_name}\nAuditor: ${c.auditor_email || '—'}\nToken: ${c.token_serial || '—'}\nStatus: ${c.status}\nGenerated: ${c.generated_date ? new Date(c.generated_date).toLocaleDateString() : '—'}\nDrive: ${c.drive_file_url || '—'}`;
    navigator.clipboard.writeText(text);
    toast({ title: 'Certificate summary copied' });
  };

  const shareEmail = (c) => {
    const subject = encodeURIComponent(`Identity Certificate: ${c.certificate_name}`);
    const body = encodeURIComponent(`Identity Certificate details:\n\nName: ${c.certificate_name}\nAuditor: ${c.auditor_email || '—'}\nToken: ${c.token_serial || '—'}\nStatus: ${c.status}\nGenerated: ${c.generated_date ? new Date(c.generated_date).toLocaleDateString() : '—'}\nDrive link: ${c.drive_file_url || '—'}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Share2 className="w-7 h-7 text-cyan-400" /> Auditor Certificate Portal</h1>
        <p className="text-slate-400 mt-1">View and share Identity Certificates generated for security audits.</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search certificate, token, or auditor…" className="pl-9 bg-slate-950 border-slate-700 text-white" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-950 border border-slate-700 text-white rounded-md h-9 px-3">
          <option value="all">All statuses</option>
          <option value="issued">Issued</option>
          <option value="verified">Verified</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <p className="text-slate-500">Loading certificates…</p>}
        {!isLoading && certs.length === 0 && <p className="text-slate-500">No certificates found.</p>}
        {certs.map(c => (
          <Card key={c.id} className="bg-slate-900/60 border-slate-700">
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div className="text-white font-medium truncate">{c.certificate_name}</div>
                </div>
                <Badge variant="outline" className={statusStyle[c.status] || 'border-slate-600 text-slate-300'}>{c.status}</Badge>
              </div>
              <div className="space-y-1 text-xs text-slate-500">
                <div>Auditor: {c.auditor_email || '—'}</div>
                <div>Subject: {c.user_email || '—'}</div>
                <div>Token: {c.token_serial || '—'}</div>
                <div>Generated: {c.generated_date ? new Date(c.generated_date).toLocaleDateString() : '—'}</div>
              </div>
              {c.drive_file_url && (
                <a href={c.drive_file_url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 pt-1 border-t border-slate-800">
                  <ExternalLink className="w-3 h-3" /> Open in Google Drive
                </a>
              )}
              <div className="flex gap-2 flex-wrap pt-1">
                <Button size="sm" variant="outline" className="border-slate-700 text-slate-200" onClick={() => copyLink(c.drive_file_url)}><Copy className="w-3.5 h-3.5 mr-1" /> Link</Button>
                <Button size="sm" variant="outline" className="border-slate-700 text-slate-200" onClick={() => copySummary(c)}><FileText className="w-3.5 h-3.5 mr-1" /> Details</Button>
                <Button size="sm" variant="outline" className="border-slate-700 text-slate-200" onClick={() => shareEmail(c)}><Mail className="w-3.5 h-3.5 mr-1" /> Email</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}