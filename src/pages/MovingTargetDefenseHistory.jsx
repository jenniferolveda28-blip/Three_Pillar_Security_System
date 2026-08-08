import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, KeyRound, RefreshCw, Activity, Zap } from 'lucide-react';

const keyStatusStyle = {
  active: 'border-emerald-600/50 text-emerald-300',
  expiring_soon: 'border-amber-600/50 text-amber-300',
  expired: 'border-red-600/50 text-red-300',
  revoked: 'border-red-700/50 text-red-300'
};
const sessionStatusStyle = {
  active: 'border-emerald-600/50 text-emerald-300',
  paused: 'border-amber-600/50 text-amber-300',
  completed: 'border-blue-600/50 text-blue-300'
};

export default function MovingTargetDefenseHistory() {
  const keysQ = useQuery({
    queryKey: ['mtd', 'cipherpass'],
    queryFn: () => base44.entities.CipherPass.list('-last_rotated', 100)
  });
  const sessionsQ = useQuery({
    queryKey: ['mtd', 'scrambling'],
    queryFn: () => base44.entities.ScramblingSession.list('-last_scramble', 100)
  });

  const keys = keysQ.data || [];
  const sessions = sessionsQ.data || [];
  const activeKeys = keys.filter(k => k.status === 'active').length;
  const activeSessions = sessions.filter(s => s.status === 'active').length;
  const lastRotation = keys[0]?.last_rotated;
  const lastScramble = sessions[0]?.last_scramble;
  const avgProtection = sessions.length ? Math.round(sessions.reduce((a, s) => a + (s.protection_score ?? 0), 0) / sessions.length) : 0;
  const defenseActive = activeSessions > 0 && activeKeys > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Shield className="w-7 h-7 text-cyan-400" /> Moving Target Defense History</h1>
        <p className="text-slate-400 mt-1">CipherPass key rotations and system scrambling sessions — verify the moving target defense is actively running.</p>
      </div>

      <Card className={`bg-slate-900/60 border ${defenseActive ? 'border-emerald-600/50' : 'border-red-600/50'}`}>
        <CardContent className="pt-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Activity className={`w-7 h-7 ${defenseActive ? 'text-emerald-400' : 'text-red-400'}`} />
            <div>
              <div className="text-white font-medium text-lg">{defenseActive ? 'Moving Target Defense: ACTIVE' : 'Moving Target Defense: INACTIVE'}</div>
              <div className="text-xs text-slate-500">{activeSessions} active scrambling session(s) · {activeKeys} active CipherPass key(s)</div>
            </div>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center"><div className="text-xs text-slate-500 uppercase">Avg Protection</div><div className="text-2xl font-bold text-emerald-400">{avgProtection}/100</div></div>
            <div className="text-center"><div className="text-xs text-slate-500 uppercase">Last Scramble</div><div className="text-sm text-white">{lastScramble ? new Date(lastScramble).toLocaleString() : '—'}</div></div>
            <div className="text-center"><div className="text-xs text-slate-500 uppercase">Last Rotation</div><div className="text-sm text-white">{lastRotation ? new Date(lastRotation).toLocaleString() : '—'}</div></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><KeyRound className="w-4 h-4 text-cyan-400" /> CipherPass Key Rotations ({keys.length})</CardTitle></CardHeader>
          <CardContent>
            {keysQ.isLoading && <p className="text-slate-500">Loading…</p>}
            {!keysQ.isLoading && keys.length === 0 && <p className="text-slate-500">No key rotations recorded.</p>}
            <div className="space-y-3 max-h-[520px] overflow-y-auto">
              {keys.map(k => (
                <div key={k.id} className="border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="text-white text-sm font-medium">{k.key_name}</div>
                    <Badge variant="outline" className={keyStatusStyle[k.status] || 'border-slate-600 text-slate-300'}>{(k.status || '').replace(/_/g, ' ')}</Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Group: {k.endpoint_group_id || '—'} · Interval: {k.rotation_interval ? `${k.rotation_interval}s` : '—'} · Uses: {k.usage_count || 0}</div>
                  <div className="text-xs text-slate-500">Last rotated: {k.last_rotated ? new Date(k.last_rotated).toLocaleString() : '—'}</div>
                  {k.expires_at && <div className="text-xs text-amber-400/80">Expires: {new Date(k.expires_at).toLocaleString()}</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><RefreshCw className="w-4 h-4 text-cyan-400" /> Scrambling Sessions ({sessions.length})</CardTitle></CardHeader>
          <CardContent>
            {sessionsQ.isLoading && <p className="text-slate-500">Loading…</p>}
            {!sessionsQ.isLoading && sessions.length === 0 && <p className="text-slate-500">No scrambling sessions recorded.</p>}
            <div className="space-y-3 max-h-[520px] overflow-y-auto">
              {sessions.map(s => (
                <div key={s.id} className="border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="text-white text-sm font-medium flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> {(s.scramble_type || '').replace(/_/g, ' ')}</div>
                    <Badge variant="outline" className={sessionStatusStyle[s.status] || 'border-slate-600 text-slate-300'}>{s.status}</Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Iterations: {s.iterations || 0} · Complexity: {s.complexity_level ?? '—'} · Protection: {s.protection_score ?? '—'}/100</div>
                  <div className="text-xs text-slate-500">Last: {s.last_scramble ? new Date(s.last_scramble).toLocaleString() : '—'} · Next: {s.next_scramble ? new Date(s.next_scramble).toLocaleString() : '—'}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}