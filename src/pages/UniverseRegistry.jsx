import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Globe, Activity, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  active: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/50' },
  degraded: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/50' },
  offline: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/50' },
};

export default function UniverseRegistry() {
  const { data: universes = [], isLoading } = useQuery({
    queryKey: ['universesRegistry'],
    queryFn: () => base44.entities.Universe.list('-created_date', 100),
  });

  if (isLoading) return <div className="p-8 text-slate-400">Loading universes…</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Globe className="w-8 h-8 text-cyan-400" /> Universe Registry
        </h1>
        <p className="text-slate-400 mt-1">All connected API Universes and their configuration</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Registered Universes ({universes.length})</CardTitle></CardHeader>
        <CardContent>
          {universes.length === 0 ? (
            <p className="text-slate-500 py-4">No universes registered.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left py-3 px-2">Name</th>
                    <th className="text-left py-3 px-2">Base URL</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2">Auth</th>
                    <th className="text-right py-3 px-2">Errors (24h)</th>
                    <th className="text-right py-3 px-2">Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {universes.map(u => {
                    const cfg = statusConfig[u.status] || statusConfig.active;
                    const StatusIcon = cfg.icon;
                    return (
                      <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                        <td className="py-3 px-2">
                          <div className="text-white font-medium">{u.name}</div>
                          <div className="text-xs text-slate-500">{u.capabilities?.join(', ')}</div>
                        </td>
                        <td className="py-3 px-2 text-cyan-400 font-mono text-xs">{u.base_url}</td>
                        <td className="py-3 px-2">
                          <Badge className={cfg.bg + ' ' + cfg.color}>
                            <StatusIcon className="w-3 h-3 mr-1" /> {u.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-slate-300">{u.auth_type}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={u.error_count > 0 ? 'text-amber-400 font-bold' : 'text-slate-300'}>{u.error_count || 0}</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={u.success_rate >= 95 ? 'text-emerald-400' : u.success_rate >= 80 ? 'text-amber-400' : 'text-red-400'}>
                            {u.success_rate || 100}%
                          </span>
                        </td>
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