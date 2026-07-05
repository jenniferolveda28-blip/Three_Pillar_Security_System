import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, ShieldCheck, ShieldAlert, Clock, AlertTriangle, Cpu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const statusBadge = (token) => {
  if (!token.is_active) return <Badge variant="destructive">Inactive</Badge>;
  if (token.failed_attempts >= 3) return <Badge variant="destructive">Locked</Badge>;
  return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">Active</Badge>;
};

export default function HardwareHealth() {
  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ['hardwareTokensHealth'],
    queryFn: () => base44.entities.HardwareToken.list('-created_date', 100),
  });

  const active = tokens.filter(t => t.is_active && t.failed_attempts < 3);
  const locked = tokens.filter(t => !t.is_active || t.failed_attempts >= 3);
  const totalFails = tokens.reduce((s, t) => s + (t.failed_attempts || 0), 0);

  if (isLoading) return <div className="p-8 text-slate-400">Loading hardware tokens…</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Cpu className="w-8 h-8 text-cyan-400" /> Hardware Health
        </h1>
        <p className="text-slate-400 mt-1">Status of all registered BioVerify hardware tokens</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Total Devices</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-white">{tokens.length}</p></CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-emerald-500/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-emerald-400 flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Active</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-400">{active.length}</p></CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-red-500/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-red-400 flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> Locked</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-400">{locked.length}</p></CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-amber-500/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Failed Attempts</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-400">{totalFails}</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.length === 0 && <p className="text-slate-500 col-span-full">No hardware tokens registered.</p>}
        {tokens.map(token => (
          <Card key={token.id} className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2"><Shield className="w-5 h-5 text-cyan-400" /> {token.device_name}</CardTitle>
                {statusBadge(token)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Device ID</span><span className="text-slate-200 font-mono text-xs">{token.device_id}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Last Used</span>
                <span className="text-slate-200">{token.last_used ? new Date(token.last_used).toLocaleString() : 'Never'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Failed Attempts</span>
                <span className={token.failed_attempts >= 3 ? 'text-red-400 font-bold' : 'text-slate-200'}>{token.failed_attempts || 0} / 3</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}