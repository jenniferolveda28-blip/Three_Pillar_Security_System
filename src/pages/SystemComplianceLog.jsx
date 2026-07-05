import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ScrollText, Search, ShieldAlert, ShieldCheck, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const threatColors = {
  none: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  critical: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export default function SystemComplianceLog() {
  const [search, setSearch] = useState('');
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['complianceLogs'],
    queryFn: () => base44.entities.SecurityLog.list('-created_date', 200),
  });

  const filtered = logs.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return l.event_type?.toLowerCase().includes(q) || l.details?.toLowerCase().includes(q) || l.ip_address?.includes(q);
  });

  if (isLoading) return <div className="p-8 text-slate-400">Loading compliance log…</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ScrollText className="w-8 h-8 text-cyan-400" /> System Compliance Log
        </h1>
        <p className="text-slate-400 mt-1">Comprehensive audit trail of all critical system activities and security events</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events, IPs, details…" className="pl-9 bg-slate-800/50 border-slate-700 text-white" />
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Security Events ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? <p className="text-slate-500 py-4">No log entries found.</p> : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filtered.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="mt-0.5">
                    {log.success ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-cyan-400 border-cyan-500/50">{log.event_type?.replace(/_/g, ' ')}</Badge>
                      {log.threat_level && log.threat_level !== 'none' && (
                        <Badge className={threatColors[log.threat_level] || threatColors.medium}>{log.threat_level}</Badge>
                      )}
                      <span className="text-xs text-slate-500">{log.created_date ? new Date(log.created_date).toLocaleString() : ''}</span>
                    </div>
                    {log.details && <p className="text-sm text-slate-300 mt-1">{log.details}</p>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      {log.ip_address && <span>IP: {log.ip_address}</span>}
                      {log.universe_id && <span>Universe: {log.universe_id}</span>}
                      {log.dna_hash && <span className="font-mono">DNA: {log.dna_hash.substring(0, 12)}…</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}