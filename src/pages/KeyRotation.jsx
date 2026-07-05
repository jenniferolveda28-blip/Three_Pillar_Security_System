import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Key, RefreshCw, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const statusColors = {
  active: 'bg-green-500/20 text-green-400 border-green-500/50',
  expiring_soon: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  expired: 'bg-red-500/20 text-red-400 border-red-500/50',
  revoked: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
};

function timeUntil(dateStr) {
  if (!dateStr) return '—';
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return 'Today';
  return `in ${days} days`;
}

export default function KeyRotation() {
  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['universalKeysRotation'],
    queryFn: () => base44.entities.UniversalKey.list('-created_date', 100),
  });

  if (isLoading) return <div className="p-8 text-slate-400">Loading key rotation schedule…</div>;

  const sorted = [...keys].sort((a, b) => {
    const aDate = a.expires_at ? new Date(a.expires_at).getTime() : Infinity;
    const bDate = b.expires_at ? new Date(b.expires_at).getTime() : Infinity;
    return aDate - bDate;
  });

  const upcoming = sorted.filter(k => k.status === 'active' || k.status === 'expiring_soon');
  const past = sorted.filter(k => k.status === 'expired' || k.status === 'revoked');

  const expiringSoon = sorted.filter(k => k.status === 'expiring_soon').length;
  const expired = sorted.filter(k => k.status === 'expired').length;
  const active = sorted.filter(k => k.status === 'active').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Key className="w-8 h-8 text-cyan-400" /> Key Rotation Schedule
        </h1>
        <p className="text-slate-400 mt-1">Track upcoming and past API key rotations to maintain security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Total Keys</p>
            <p className="text-2xl font-bold text-white">{keys.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Active</p>
            <p className="text-2xl font-bold text-green-400">{active}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Expiring Soon</p>
            <p className="text-2xl font-bold text-amber-400">{expiringSoon}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Expired / Revoked</p>
            <p className="text-2xl font-bold text-red-400">{expired}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-cyan-400" /> Upcoming & Active Rotations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? <p className="text-slate-500 text-center py-8">No active keys.</p> : (
            <div className="space-y-4">
              {upcoming.map(k => {
                const rotationDays = k.rotation_interval ? Math.round(k.rotation_interval / 86400) : 0;
                const lastRotatedDate = k.last_rotated ? new Date(k.last_rotated) : null;
                const nextRotation = lastRotatedDate ? new Date(lastRotatedDate.getTime() + (k.rotation_interval || 86400) * 1000) : null;
                const timeToExpiry = k.expires_at ? (new Date(k.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24) : null;
                const urgency = timeToExpiry !== null ? (timeToExpiry < 1 ? 100 : timeToExpiry < 7 ? 75 : timeToExpiry < 30 ? 50 : 25) : 0;

                return (
                  <div key={k.id} className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Key className="w-5 h-5 text-cyan-400" />
                        <div>
                          <h3 className="text-white font-medium">{k.key_name || 'Unnamed Key'}</h3>
                          <p className="text-xs text-slate-500">Universe: {k.universe_id || '—'}</p>
                        </div>
                      </div>
                      <Badge className={statusColors[k.status] || statusColors.active}>{k.status?.replace(/_/g, ' ')}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs">Last Rotated</p>
                        <p className="text-slate-200">{k.last_rotated ? new Date(k.last_rotated).toLocaleDateString() : '—'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Next Rotation</p>
                        <p className="text-slate-200">{nextRotation ? nextRotation.toLocaleDateString() : '—'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Expires</p>
                        <p className={timeToExpiry !== null && timeToExpiry < 7 ? 'text-amber-400' : 'text-slate-200'}>
                          {k.expires_at ? new Date(k.expires_at).toLocaleDateString() : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Usage Count</p>
                        <p className="text-slate-200">{k.usage_count || 0}</p>
                      </div>
                    </div>
                    {timeToExpiry !== null && timeToExpiry < 30 && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 text-xs">
                          {timeToExpiry < 7 && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                          <span className="text-slate-400">Rotation urgency</span>
                          <span className={timeToExpiry < 1 ? 'text-red-400' : timeToExpiry < 7 ? 'text-amber-400' : 'text-slate-300'}>
                            {timeUntil(k.expires_at)}
                          </span>
                        </div>
                        <Progress value={urgency} className="h-1.5 mt-1" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {past.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" /> Past Rotations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {past.map(k => (
                <div key={k.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-300">{k.key_name || 'Unnamed Key'}</p>
                      <p className="text-xs text-slate-500">Last rotated: {k.last_rotated ? new Date(k.last_rotated).toLocaleDateString() : '—'}</p>
                    </div>
                  </div>
                  <Badge className={statusColors[k.status] || statusColors.expired}>{k.status?.replace(/_/g, ' ')}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}