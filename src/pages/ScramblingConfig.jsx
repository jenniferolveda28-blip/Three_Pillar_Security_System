import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { SlidersHorizontal, Save, X, Activity, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const scrambleTypeLabels = {
  api_keys: 'API Keys',
  data_paths: 'Data Paths',
  execution_sequence: 'Execution Sequence',
  encryption_layer: 'Encryption Layer',
  full_system: 'Full System',
};

export default function ScramblingConfig() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['scramblingSessions'],
    queryFn: () => base44.entities.ScramblingSession.list('-created_date', 50),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScramblingSession.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['scramblingSessions']); setEditingId(null); },
  });

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditForm({ scramble_interval_seconds: s.scramble_interval_seconds, complexity_level: s.complexity_level, status: s.status, affected_systems: s.affected_systems || [] });
  };

  const toggleSystem = (system) => {
    const systems = editForm.affected_systems || [];
    setEditForm({ ...editForm, affected_systems: systems.includes(system) ? systems.filter(s => s !== system) : [...systems, system] });
  };

  if (isLoading) return <div className="p-8 text-slate-400">Loading scrambling configuration…</div>;

  const allSystems = ['auth_layer', 'data_vault', 'api_gateway', 'encryption_core', 'monitoring', 'key_store'];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <SlidersHorizontal className="w-8 h-8 text-cyan-400" /> Scrambling Configuration
        </h1>
        <p className="text-slate-400 mt-1">Manage scrambling intervals, complexity, and affected systems</p>
      </div>

      {sessions.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="py-12 text-center text-slate-500">No scrambling sessions configured.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sessions.map(s => (
            <Card key={s.id} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    {scrambleTypeLabels[s.scramble_type] || s.scramble_type}
                  </CardTitle>
                  <Badge className={s.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-slate-500/20 text-slate-400 border-slate-500/50'}>
                    {s.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingId === s.id ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-400 mb-1 block">Interval (seconds)</label>
                        <Input type="number" step="0.001" value={editForm.scramble_interval_seconds} onChange={e => setEditForm({ ...editForm, scramble_interval_seconds: parseFloat(e.target.value) })} className="bg-slate-900 border-slate-700 text-white" />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-1 block">Complexity (0-100)</label>
                        <Input type="number" min="0" max="100" value={editForm.complexity_level} onChange={e => setEditForm({ ...editForm, complexity_level: parseInt(e.target.value) })} className="bg-slate-900 border-slate-700 text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">Status</label>
                      <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm w-full">
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">Affected Systems</label>
                      <div className="flex flex-wrap gap-2">
                        {allSystems.map(sys => (
                          <button key={sys} type="button" onClick={() => toggleSystem(sys)}
                            className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${(editForm.affected_systems || []).includes(sys) ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-slate-900 text-slate-500 border-slate-700'}`}>
                            {sys}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => updateMutation.mutate({ id: s.id, data: editForm })} disabled={updateMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700">
                        <Save className="w-4 h-4 mr-2" /> {updateMutation.isPending ? 'Saving…' : 'Save'}
                      </Button>
                      <Button onClick={() => setEditingId(null)} variant="outline" className="border-slate-700 text-slate-300">
                        <X className="w-4 h-4 mr-2" /> Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Interval</p>
                        <p className="text-white font-medium">{s.scramble_interval_seconds}s</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Complexity</p>
                        <p className="text-white font-medium">{s.complexity_level}/100</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Iterations</p>
                        <p className="text-white font-medium">{s.iterations || 0}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Protection Score</p>
                        <p className="text-green-400 font-medium">{s.protection_score || 0}/100</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Affected Systems</p>
                      <div className="flex flex-wrap gap-2">
                        {(s.affected_systems || []).map(sys => (
                          <Badge key={sys} className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">{sys}</Badge>
                        ))}
                        {(!s.affected_systems || s.affected_systems.length === 0) && <span className="text-slate-500 text-sm">None configured</span>}
                      </div>
                    </div>
                    <Button onClick={() => startEdit(s)} variant="outline" className="border-slate-700 text-slate-300">
                      <SlidersHorizontal className="w-4 h-4 mr-2" /> Edit Configuration
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}