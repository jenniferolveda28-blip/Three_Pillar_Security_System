import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Lock, ShieldCheck, UserCog, KeyRound, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AuditAccessControl() {
  const { data: logs = [], isLoading: loadingL } = useQuery({
    queryKey: ['auditAccessLogs'],
    queryFn: () => base44.entities.SecurityLog.filter({ event_type: 'suspicious_activity' }, '-created_date', 100),
  });
  const { data: users = [], isLoading: loadingU } = useQuery({
    queryKey: ['auditUsers'],
    queryFn: () => base44.entities.User.list(),
  });

  const isLoading = loadingL || loadingU;
  if (isLoading) return <div className="p-8 text-slate-400">Loading access control…</div>;

  const auditLogs = logs.filter(l => l.details?.includes('AUDIT_MODE_BYPASS_'));
  const admins = users.filter(u => u.role === 'admin');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Lock className="w-8 h-8 text-purple-400" /> Audit Access Control
        </h1>
        <p className="text-slate-400 mt-1">Manage audit access levels and authorized demonstration accounts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Total Accounts</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-white">{users.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-purple-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm text-purple-400">Admins</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-purple-400">{admins.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-amber-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">Audit Bypass Events</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-400">{auditLogs.length}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><UserCog className="w-5 h-5 text-cyan-400" /> Authorized Accounts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {users.length === 0 && <p className="text-slate-500">No registered users.</p>}
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${u.role === 'admin' ? 'bg-purple-500/20' : 'bg-slate-700'}`}>
                    <KeyRound className={`w-4 h-4 ${u.role === 'admin' ? 'text-purple-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{u.full_name || u.email}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>
                <Badge className={u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-slate-500/20 text-slate-400 border-slate-500/50'}>
                  {u.role || 'user'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Eye className="w-5 h-5 text-amber-400" /> Recent Audit Bypass Events</CardTitle></CardHeader>
          <CardContent>
            {auditLogs.length === 0 ? <p className="text-slate-500">No audit bypass events recorded.</p> : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-amber-400 border-amber-500/50">Bypass</Badge>
                      <span className="text-xs text-slate-500">{log.created_date ? new Date(log.created_date).toLocaleString() : ''}</span>
                    </div>
                    <p className="text-sm text-slate-300">{log.details}</p>
                    {log.ip_address && <p className="text-xs text-slate-500 mt-1">IP: {log.ip_address}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}