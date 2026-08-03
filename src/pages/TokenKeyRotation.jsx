import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeyRound, RefreshCw } from 'lucide-react';

const statusStyle = {
  active: 'border-emerald-600/50 text-emerald-300',
  paused: 'border-amber-600/50 text-amber-300',
  completed: 'border-blue-600/50 text-blue-300'
};

export default function TokenKeyRotation() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['tokenKeyRotation'],
    queryFn: () => base44.entities.ScramblingSession.list('-last_scramble', 50)
  });
  const active = data.filter(s => s.status === 'active');
  const current = active[0];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><KeyRound className="w-7 h-7 text-cyan-400" /> CipherPass Key Rotation</h1>
        <p className="text-slate-400 mt-1">History and current status of CipherPass key rotations — Moving Target Defense monitoring.</p>
      </div>
      {current && (
        <Card className="bg-slate-900/60 border-cyan-700/40">
          <CardContent className="pt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><div className="text-xs text-slate-500 uppercase">Current Cycle</div><div className="text-white font-medium">{(current.scramble_type || '').replace(/_/g, ' ')}</div></div>
            <div><div className="text-xs text-slate-500 uppercase">Interval</div><div className="text-white font-medium">{current.scramble_interval_seconds}s</div></div>
            <div><div className="text-xs text-slate-500 uppercase">Iterations</div><div className="text-white font-medium">{current.iterations || 0}</div></div>
            <div><div className="text-xs text-slate-500 uppercase">Protection Score</div><div className="text-emerald-400 font-medium">{current.protection_score ?? '—'}/100</div></div>
          </CardContent>
        </Card>
      )}
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader><CardTitle className="text-white flex items-center gap-2"><RefreshCw className="w-4 h-4 text-cyan-400" /> Rotation History</CardTitle></CardHeader>
        <CardContent>
          {isLoading && <p className="text-slate-500">Loading…</p>}
          {!isLoading && data.length === 0 && <p className="text-slate-500">No rotation cycles recorded.</p>}
          <div className="space-y-3 max-h-[480px] overflow-y-auto">
            {data.map(s => (
              <div key={s.id} className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-white text-sm font-medium">{(s.scramble_type || '').replace(/_/g, ' ')}</div>
                  <div className="text-xs text-slate-500">Iterations: {s.iterations || 0} · Complexity: {s.complexity_level ?? '—'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{s.last_scramble ? new Date(s.last_scramble).toLocaleString() : '—'}</span>
                  <Badge variant="outline" className={statusStyle[s.status] || 'border-slate-600 text-slate-300'}>{s.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}