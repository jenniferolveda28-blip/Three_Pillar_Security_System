import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  Watch,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Battery,
  Wifi,
  WifiOff,
  Clock,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Never used';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'Never used';
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return 'Just now';
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

function evaluateTokenHealth(token) {
  const issues = [];
  const battery = token.battery_level ?? 100;
  const failed = token.failed_attempts ?? 0;
  const sync = token.sync_status || 'synced';

  if (!token.is_active) issues.push('Inactive');
  if (sync === 'error') issues.push('Sync error');
  else if (sync === 'offline') issues.push('Offline');
  if (battery <= 20) issues.push(`Low battery (${battery}%)`);
  if (failed > 0) issues.push(`${failed}/3 failed auths`);

  if (!token.is_active || sync === 'error' || failed >= 3 || battery <= 10) {
    return { status: 'critical', label: 'Needs Attention', issues };
  }
  if (issues.length > 0) {
    return { status: 'warning', label: 'Needs Attention', issues };
  }
  return { status: 'healthy', label: 'Healthy', issues: [] };
}

export default function UserHelixTokenStatusView() {
  const { user } = useAuth();

  const { data: tokens = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['helixVerifyTokenHealth', user?.id, user?.role],
    queryFn: async () => {
      const res =
        user?.role === 'admin'
          ? await base44.entities.HelixVerifyToken.list('-created_date', 50)
          : await base44.entities.HelixVerifyToken.filter(
              { created_by_id: user?.id },
              '-created_date',
              50
            );
      return Array.isArray(res) ? res : res?.items || [];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const evaluatedTokens = tokens.map((token) => ({
    token,
    health: evaluateTokenHealth(token),
  }));

  const activeCount = tokens.filter((t) => t.is_active).length;
  const healthyCount = evaluatedTokens.filter((t) => t.health.status === 'healthy').length;
  const attentionCount = evaluatedTokens.length - healthyCount;

  return (
    <div className="multi-layer-card card-layer-auth rounded-xl p-5 border mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <Watch className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              HelixVerify Token Health & Active Status
            </h3>
            <p className="text-xs text-slate-400">
              Live overview of registered tokens, recent usage, sync state, and device readiness
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            {activeCount} Active
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {healthyCount} Healthy
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              attentionCount > 0
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-slate-800/60 text-slate-400 border-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {attentionCount} Needs Attention
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors disabled:opacity-50"
            title="Refresh token status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-sm">
          <div className="w-5 h-5 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />
          <span>Loading HelixVerify tokens…</span>
        </div>
      ) : evaluatedTokens.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center">
          <Watch className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-medium">No HelixVerify tokens found</p>
          <p className="text-xs text-slate-500 mt-1">
            Enroll or activate a HelixVerify token to monitor its live usage health here.
          </p>
          <Link
            to="/token-enrollment"
            className="inline-block mt-3 text-xs font-medium text-cyan-400 hover:text-cyan-300"
          >
            Enroll a HelixVerify token →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {evaluatedTokens.map(({ token, health }) => {
            const battery = token.battery_level ?? 100;
            const sync = token.sync_status || 'synced';
            const failed = token.failed_attempts ?? 0;

            const borderClass =
              health.status === 'critical'
                ? 'border-red-500/40 bg-red-950/15'
                : health.status === 'warning'
                ? 'border-amber-500/40 bg-amber-950/15'
                : 'border-slate-700/80 bg-slate-900/50';

            const HealthIcon =
              health.status === 'critical'
                ? XCircle
                : health.status === 'warning'
                ? AlertTriangle
                : CheckCircle2;

            const healthBadgeClass =
              health.status === 'critical'
                ? 'border-red-500/50 text-red-300 bg-red-500/10'
                : health.status === 'warning'
                ? 'border-amber-500/50 text-amber-300 bg-amber-500/10'
                : 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10';

            const batteryColor =
              battery > 60
                ? 'text-emerald-400'
                : battery > 20
                ? 'text-amber-400'
                : 'text-red-400';

            const syncColor =
              sync === 'synced'
                ? 'text-emerald-400'
                : sync === 'syncing'
                ? 'text-cyan-400'
                : sync === 'offline'
                ? 'text-amber-400'
                : 'text-red-400';

            return (
              <div
                key={token.id}
                className={`rounded-lg border p-3.5 transition-colors ${borderClass}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          token.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                        }`}
                      />
                      <p className="text-sm font-semibold text-white truncate">
                        {token.device_name}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 font-mono truncate pl-4">
                      {token.device_id}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      variant="outline"
                      className={
                        token.is_active
                          ? 'border-cyan-500/40 text-cyan-300 text-[11px] px-2 py-0'
                          : 'border-slate-600 text-slate-400 text-[11px] px-2 py-0'
                      }
                    >
                      {token.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[11px] px-2 py-0 flex items-center gap-1 ${healthBadgeClass}`}
                    >
                      <HealthIcon className="w-3 h-3" />
                      {health.label}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-400">Used:</span>
                    <span className="truncate font-medium">
                      {formatRelativeTime(token.last_used)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {sync === 'offline' || sync === 'error' ? (
                      <WifiOff className={`w-3.5 h-3.5 shrink-0 ${syncColor}`} />
                    ) : (
                      <Wifi className={`w-3.5 h-3.5 shrink-0 ${syncColor}`} />
                    )}
                    <span className="text-slate-400">Sync:</span>
                    <span className={`capitalize font-medium ${syncColor}`}>{sync}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Battery className={`w-3.5 h-3.5 shrink-0 ${batteryColor}`} />
                    <span className="text-slate-400">Battery:</span>
                    <span className={`font-medium ${batteryColor}`}>{battery}%</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <ShieldAlert
                      className={`w-3.5 h-3.5 shrink-0 ${
                        failed > 0 ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="text-slate-400">Failed:</span>
                    <span
                      className={`font-medium ${
                        failed >= 3
                          ? 'text-red-400'
                          : failed > 0
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {failed}/3
                    </span>
                  </div>
                </div>

                {health.issues.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {health.issues.map((issue) => (
                      <span
                        key={issue}
                        className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <Link
          to="/bioverify-hardware-status"
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Full hardware diagnostics →
        </Link>
        <Link
          to="/token-management"
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          Manage tokens →
        </Link>
      </div>
    </div>
  );
}