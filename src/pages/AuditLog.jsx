import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useGuestAuditor } from '@/lib/useGuestAuditor';
import AccessRestricted from '@/components/security/AccessRestricted';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ShieldAlert, ShieldCheck, Search, Download, ScrollText } from 'lucide-react';

const BYPASS_MARKER = 'AUDIT_MODE_BYPASS_';
const EMAIL_REGEX = /\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/;

function parseEntry(log) {
  const details = log.details || '';
  const action = details.includes('BYPASS_ENABLED') ? 'enabled' : 'disabled';
  const emailMatch = details.match(EMAIL_REGEX);
  const email = emailMatch ? emailMatch[1] : 'Unknown';
  return { ...log, parsedAction: action, parsedEmail: email };
}

export default function AuditLog() {
  const { isGuestAuditor } = useGuestAuditor();
  const [search, setSearch] = useState('');

  const { data: allLogs = [], isLoading } = useQuery({
    queryKey: ['auditBypassLogs'],
    queryFn: () => base44.entities.SecurityLog.filter({ details: { $regex: BYPASS_MARKER } }, '-created_date', 500),
  });

  const entries = useMemo(() => allLogs.map(parseEntry), [allLogs]);

  const filtered = useMemo(() => {
    if (!search) return entries;
    const q = search.toLowerCase();
    return entries.filter(e =>
      e.parsedEmail.toLowerCase().includes(q) ||
      e.parsedAction.toLowerCase().includes(q) ||
      (e.details || '').toLowerCase().includes(q)
    );
  }, [entries, search]);

  if (isGuestAuditor) return <AccessRestricted feature="Audit Bypass Log" />;

  const enableCount = entries.filter(e => e.parsedAction === 'enabled').length;
  const disableCount = entries.filter(e => e.parsedAction === 'disabled').length;

  const handleExport = () => {
    const csv = ['Timestamp,Auditor Email,Action,Threat Level'];
    filtered.forEach(e => {
      const ts = e.created_date ? new Date(e.created_date).toISOString() : '';
      csv.push([ts, e.parsedEmail, e.parsedAction, e.threat_level || 'none']
        .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-bypass-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
                <ScrollText className="w-6 h-6" />
                Audit Bypass Log
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Every time an auditor enabled or disabled the BioVerify authentication bypass.
              </p>
            </div>
          </div>
          <Button onClick={handleExport} variant="outline" disabled={!filtered.length}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-cyan-400">{entries.length}</div>
              <p className="text-sm text-slate-400 mt-1">Total Bypass Events</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-red-400">{enableCount}</div>
              <p className="text-sm text-slate-400 mt-1">Bypass Enabled</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-emerald-400">{disableCount}</div>
              <p className="text-sm text-slate-400 mt-1">Bypass Disabled</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by auditor email or action…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900/60 border-slate-700 text-white placeholder-slate-500"
          />
        </div>

        {/* Log table */}
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Bypass Event History</CardTitle>
            <CardDescription>Sorted by most recent first</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ScrollText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No audit bypass events recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-slate-700 text-slate-400">
                      <th className="py-3 px-2 font-medium">Timestamp</th>
                      <th className="py-3 px-2 font-medium">Auditor Email</th>
                      <th className="py-3 px-2 font-medium">Action</th>
                      <th className="py-3 px-2 font-medium">Threat Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((entry) => (
                      <tr key={entry.id} className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-2 text-slate-300 whitespace-nowrap">
                          {entry.created_date
                            ? new Date(entry.created_date).toLocaleString('en-US', {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                              })
                            : '—'}
                        </td>
                        <td className="py-3 px-2 text-slate-200 font-mono">{entry.parsedEmail}</td>
                        <td className="py-3 px-2">
                          {entry.parsedAction === 'enabled' ? (
                            <Badge variant="destructive" className="gap-1">
                              <ShieldAlert className="w-3 h-3" /> Enabled
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 border-emerald-600 text-emerald-400">
                              <ShieldCheck className="w-3 h-3" /> Disabled
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="capitalize">{entry.threat_level || 'none'}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}