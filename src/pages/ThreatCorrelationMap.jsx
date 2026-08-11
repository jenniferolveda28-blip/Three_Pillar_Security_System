import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, AlertTriangle, Shield, GitBranch } from 'lucide-react';

const sevStyle = {
  low: 'border-blue-600/50 text-blue-300',
  medium: 'border-amber-600/50 text-amber-300',
  high: 'border-orange-600/50 text-orange-300',
  critical: 'border-red-600/50 text-red-300'
};
const statusStyle = {
  active: 'border-red-600/50 text-red-300',
  investigating: 'border-amber-600/50 text-amber-300',
  mitigated: 'border-emerald-600/50 text-emerald-300',
  false_positive: 'border-slate-600 text-slate-400'
};

export default function ThreatCorrelationMap() {
  const { data: correlations = [], isLoading } = useQuery({ queryKey: ['threatCorrMap'], queryFn: () => base44.entities.ThreatCorrelation.list('-created_date', 100) });
  const [selectedId, setSelectedId] = useState(null);
  const selected = correlations.find(c => c.id === selectedId) || correlations[0];

  if (isLoading) return <div className="p-8 text-slate-400">Loading threat correlation map…</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Network className="w-8 h-8 text-cyan-400" /> Threat Correlation Map</h1>
        <p className="text-slate-400 mt-1">How detected events relate to attack chains and their current severity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6"><p className="text-sm text-slate-400">Total Correlations</p><p className="text-2xl font-bold text-white">{correlations.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6"><p className="text-sm text-slate-400">Active Chains</p><p className="text-2xl font-bold text-red-400">{correlations.filter(c => c.status === 'active').length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6"><p className="text-sm text-slate-400">Investigating</p><p className="text-2xl font-bold text-amber-400">{correlations.filter(c => c.status === 'investigating').length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6"><p className="text-sm text-slate-400">Mitigated</p><p className="text-2xl font-bold text-green-400">{correlations.filter(c => c.status === 'mitigated').length}</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-1">
          <CardHeader><CardTitle className="text-white">Correlations</CardTitle></CardHeader>
          <CardContent>
            {correlations.length === 0 ? <p className="text-slate-500 text-center py-4">No correlations detected.</p> : (
              <div className="space-y-2 max-h-[28rem] overflow-y-auto">
                {correlations.map(c => (
                  <button key={c.id} onClick={() => setSelectedId(c.id)} className={`w-full text-left p-3 rounded-lg border transition-colors ${selected?.id === c.id ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white truncate">{c.attack_chain_name}</span>
                      <Badge variant="outline" className={sevStyle[c.severity]}>{c.severity}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Badge variant="outline" className={statusStyle[c.status]}>{c.status?.replace(/_/g, ' ')}</Badge>
                      {c.confidence_score != null && <span>{Math.round(c.confidence_score)}% conf.</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><GitBranch className="w-5 h-5 text-cyan-400" /> Attack Chain Detail</CardTitle></CardHeader>
          <CardContent>
            {!selected ? <p className="text-slate-500 text-center py-8">Select a correlation to view its attack chain.</p> : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg text-white font-semibold">{selected.attack_chain_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={sevStyle[selected.severity]}>{selected.severity} severity</Badge>
                    <Badge variant="outline" className={statusStyle[selected.status]}>{selected.status?.replace(/_/g, ' ')}</Badge>
                    {selected.confidence_score != null && <span className="text-xs text-slate-500">Confidence {Math.round(selected.confidence_score)}%</span>}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-2">ATTACK CHAIN STAGES</p>
                  {selected.attack_stages?.length > 0 ? (
                    <div className="space-y-2">
                      {selected.attack_stages.map((stage, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xs text-red-300 shrink-0">{i + 1}</div>
                          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex-1">
                            <p className="text-sm text-white">{stage.stage_name || stage.name || `Stage ${i + 1}`}</p>
                            <p className="text-xs text-slate-400 mt-1">{stage.description || stage.detail || JSON.stringify(stage)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-slate-500 text-sm">No stage detail recorded.</p>}
                </div>

                {selected.ai_analysis && (
                  <div><p className="text-xs text-slate-500 mb-1">AI ANALYSIS</p><p className="text-sm text-slate-300 p-3 rounded-lg bg-slate-900/50 border border-slate-800">{selected.ai_analysis}</p></div>
                )}

                {selected.recommended_actions?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Shield className="w-3 h-3" /> RECOMMENDED ACTIONS</p>
                    <ul className="space-y-1">
                      {selected.recommended_actions.map((a, i) => <li key={i} className="text-sm text-slate-300 flex items-start gap-2"><AlertTriangle className="w-3 h-3 text-amber-400 mt-1 shrink-0" />{a}</li>)}
                    </ul>
                  </div>
                )}

                {selected.affected_systems?.length > 0 && (
                  <div><p className="text-xs text-slate-500 mb-1">AFFECTED SYSTEMS</p><div className="flex flex-wrap gap-1">{selected.affected_systems.map((s, i) => <Badge key={i} variant="outline" className="border-slate-700 text-slate-300">{s}</Badge>)}</div></div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}