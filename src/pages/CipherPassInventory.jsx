import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Key, Search, Server } from 'lucide-react';

const statusStyle = {
  active: 'border-emerald-600/50 text-emerald-300',
  expiring_soon: 'border-amber-600/50 text-amber-300',
  expired: 'border-red-600/50 text-red-300',
  revoked: 'border-slate-600 text-slate-400'
};

export default function CipherPassInventory() {
  const [q, setQ] = useState('');
  const { data: keys = [], isLoading } = useQuery({ queryKey: ['cipherInventory'], queryFn: () => base44.entities.CipherPass.list('-created_date', 200) });

  const filtered = keys.filter(k => (k.key_name || '').toLowerCase().includes(q.toLowerCase()) || (k.endpoint_group_id || '').toLowerCase().includes(q.toLowerCase()));
  const active = keys.filter(k => k.status === 'active');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Key className="w-8 h-8 text-cyan-400" /> CipherPass Key Inventory</h1>
        <p className="text-slate-400 mt-1">All active CipherPass keys, rotation schedules, and system assignment status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6"><p className="text-sm text-slate-400">Total Keys</p><p className="text-2xl font-bold text-white">{keys.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6"><p className="text-sm text-slate-400">Active</p><p className="text-2xl font-bold text-green-400">{active.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6"><p className="text-sm text-slate-400">Expiring Soon</p><p className="text-2xl font-bold text-amber-400">{keys.filter(k => k.status === 'expiring_soon').length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6"><p className="text-sm text-slate-400">Expired / Revoked</p><p className="text-2xl font-bold text-red-400">{keys.filter(k => k.status === 'expired' || k.status === 'revoked').length}</p></CardContent></Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-white font-semibold">Active Key Inventory</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search keys…" className="pl-9 bg-slate-950 border-slate-700 text-white w-64" />
            </div>
          </div>
          {isLoading ? <p className="text-slate-500 py-8 text-center">Loading inventory…</p> :
           filtered.length === 0 ? <p className="text-slate-500 py-8 text-center">No keys found.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700 text-slate-400 text-left">
                  <th className="pb-3 pr-4">Key Name</th><th className="pb-3 pr-4">Assigned System</th><th className="pb-3 pr-4">Status</th><th className="pb-3 pr-4">Rotation Interval</th><th className="pb-3 pr-4">Last Rotated</th><th className="pb-3 pr-4">Expires</th><th className="pb-3 pr-4">Usage</th>
                </tr></thead>
                <tbody>
                  {filtered.map(k => {
                    const intervalDays = k.rotation_interval ? Math.round(k.rotation_interval / 86400) : 0;
                    return (
                      <tr key={k.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                        <td className="py-3 pr-4 text-white"><span className="flex items-center gap-2"><Key className="w-3 h-3 text-cyan-400" />{k.key_name || 'Unnamed'}</span></td>
                        <td className="py-3 pr-4 text-slate-300"><span className="flex items-center gap-1"><Server className="w-3 h-3 text-slate-500" />{k.endpoint_group_id || '—'}</span></td>
                        <td className="py-3 pr-4"><Badge variant="outline" className={statusStyle[k.status] || 'border-slate-600 text-slate-300'}>{k.status?.replace(/_/g, ' ')}</Badge></td>
                        <td className="py-3 pr-4 text-slate-300">{intervalDays >= 1 ? `${intervalDays}d` : `${k.rotation_interval || 0}s`}</td>
                        <td className="py-3 pr-4 text-slate-500 text-xs">{k.last_rotated ? new Date(k.last_rotated).toLocaleDateString() : '—'}</td>
                        <td className="py-3 pr-4 text-slate-500 text-xs">{k.expires_at ? new Date(k.expires_at).toLocaleDateString() : '—'}</td>
                        <td className="py-3 pr-4 text-slate-300">{k.usage_count || 0}</td>
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