import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, ShieldCheck, Lock, Link2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  active: { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' },
  locked: { bg: 'bg-red-500/20 text-red-400 border-red-500/50' },
  recovered: { bg: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
  pending: { bg: 'bg-amber-500/20 text-amber-400 border-amber-500/50' },
};

export default function AccountManagement() {
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['managedAccounts'],
    queryFn: () => base44.entities.LinkedAccount.list('-created_date', 100),
  });

  if (isLoading) return <div className="p-8 text-slate-400">Loading accounts…</div>;

  const active = accounts.filter(a => a.status === 'active');
  const locked = accounts.filter(a => a.status === 'locked');
  const pending = accounts.filter(a => a.status === 'pending');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-cyan-400" /> Account Management
        </h1>
        <p className="text-slate-400 mt-1">All registered accounts and their verification status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Total Accounts</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-white">{accounts.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-emerald-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Active</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-emerald-400">{active.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-red-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm text-red-400 flex items-center gap-1"><Lock className="w-4 h-4" /> Locked</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-400">{locked.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-amber-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-400">{pending.length}</p></CardContent></Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Registered Accounts ({accounts.length})</CardTitle></CardHeader>
        <CardContent>
          {accounts.length === 0 ? <p className="text-slate-500 py-4">No accounts registered.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left py-3 px-2">Provider</th>
                    <th className="text-left py-3 px-2">Account</th>
                    <th className="text-left py-3 px-2">Type</th>
                    <th className="text-left py-3 px-2">Token Serial</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-right py-3 px-2">Recovery Attempts</th>
                    <th className="text-left py-3 px-2">Last Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(a => {
                    const cfg = statusConfig[a.status] || statusConfig.pending;
                    return (
                      <tr key={a.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                        <td className="py-3 px-2"><span className="text-white font-medium flex items-center gap-1"><Link2 className="w-3 h-3 text-cyan-400" /> {a.account_provider}</span></td>
                        <td className="py-3 px-2 text-slate-300">{a.account_identifier}</td>
                        <td className="py-3 px-2"><Badge variant="outline" className="text-slate-400">{a.account_type}</Badge></td>
                        <td className="py-3 px-2 text-xs font-mono text-slate-400">{a.token_serial}</td>
                        <td className="py-3 px-2"><Badge className={cfg.bg}>{a.status}</Badge></td>
                        <td className="py-3 px-2 text-right text-slate-300">{a.recovery_attempts || 0}</td>
                        <td className="py-3 px-2 text-xs text-slate-400">{a.last_verified ? new Date(a.last_verified).toLocaleString() : 'Never'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}