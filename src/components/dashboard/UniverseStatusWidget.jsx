import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Globe, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UniverseStatusWidget() {
  const { data: universes = [], isLoading } = useQuery({
    queryKey: ['universeStatusWidget'],
    queryFn: () => base44.entities.Universe.list('-created_date', 100),
    refetchInterval: 30000,
  });

  const active = universes.filter(u => u.status === 'active').length;
  const degraded = universes.filter(u => u.status === 'degraded').length;
  const offline = universes.filter(u => u.status === 'offline').length;

  const statusIcon = { active: CheckCircle, degraded: AlertTriangle, offline: XCircle };
  const statusColor = { active: 'text-green-400', degraded: 'text-orange-400', offline: 'text-red-400' };
  const dotColor = { active: 'bg-green-400', degraded: 'bg-orange-400', offline: 'bg-red-400' };

  return (
    <div className="multi-layer-card card-layer-monitoring rounded-xl p-5 border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400 glow-pulse" />
          <h3 className="text-sm font-semibold text-white">Universe Health</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span><span className="text-slate-400">{active}</span></span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span><span className="text-slate-400">{degraded}</span></span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span><span className="text-slate-400">{offline}</span></span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div></div>
      ) : universes.length === 0 ? (
        <p className="text-slate-500 text-xs text-center py-3">No universes connected</p>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {universes.map(u => {
            const Icon = statusIcon[u.status] || XCircle;
            return (
              <Link key={u.id} to="/system-health" className="flex items-center justify-between py-1 px-2 rounded hover:bg-slate-800/50 transition-colors group">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${statusColor[u.status]}`} />
                  <span className="text-xs text-slate-300 truncate group-hover:text-white">{u.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {u.success_rate != null && <span className="text-xs text-slate-500">{u.success_rate}%</span>}
                  <span className={`w-2 h-2 rounded-full ${dotColor[u.status]} ${u.status === 'active' ? 'animate-pulse' : ''}`}></span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Link to="/system-health" className="block mt-3 text-center text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
        View full system health →
      </Link>
    </div>
  );
}