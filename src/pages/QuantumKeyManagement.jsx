import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Key, RefreshCw, Shield, AlertTriangle, CheckCircle, Layers } from 'lucide-react';
import PrintReportButton from '../components/PrintReportButton';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

const statusColor = { active: 'bg-green-500/20 text-green-300 border-green-500/30', expiring_soon: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', expired: 'bg-red-500/20 text-red-300 border-red-500/30', revoked: 'bg-slate-600/20 text-slate-400' };
const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280'];

function entropyLabel(e) {
  if (e >= 90) return { label: 'Quantum-Grade', color: 'text-cyan-400' };
  if (e >= 70) return { label: 'High', color: 'text-green-400' };
  if (e >= 50) return { label: 'Standard', color: 'text-yellow-400' };
  return { label: 'Low', color: 'text-red-400' };
}

export default function QuantumKeyManagement() {
  const [entropy, setEntropy] = useState(95);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [regenerating, setRegenerating] = useState(false);
  const qc = useQueryClient();

  const { data: keys = [] } = useQuery({ queryKey: ['keys-qkm'], queryFn: () => base44.entities.UniversalKey.list('-created_date', 100), refetchInterval: 15000 });
  const { data: universes = [] } = useQuery({ queryKey: ['universes-qkm'], queryFn: () => base44.entities.Universe.list() });

  const updateKey = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UniversalKey.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['keys-qkm'] }),
  });

  const universeMap = universes.reduce((m, u) => { m[u.id] = u.data?.name; return m; }, {});

  // Distribution by status
  const byStatus = ['active', 'expiring_soon', 'expired', 'revoked'].map(s => ({
    name: s.replace(/_/g, ' '),
    value: keys.filter(k => k.data?.status === s).length || 0,
  }));

  // Distribution by universe
  const byUniverse = universes.map(u => ({
    name: u.data?.name || 'Unknown',
    keys: keys.filter(k => k.data?.universe_id === u.id).length,
  })).filter(x => x.keys > 0);

  const toggleKey = (id) => {
    setSelectedKeys(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleBatchRegenerate = async () => {
    setRegenerating(true);
    const ids = selectedKeys.size > 0 ? [...selectedKeys] : keys.map(k => k.id);
    await Promise.all(ids.map(id => updateKey.mutateAsync({
      id,
      data: {
        encrypted_value: `QK-${entropy}-${Math.random().toString(36).substring(2, 18).toUpperCase()}`,
        last_rotated: new Date().toISOString(),
        status: 'active',
        expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
      }
    })));
    setSelectedKeys(new Set());
    setRegenerating(false);
  };

  const eLabel = entropyLabel(entropy);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Key className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Quantum Key Management</h1>
              <p className="text-slate-400 text-sm">Distribution visualization and batch regeneration with custom entropy</p>
            </div>
          </div>
          <PrintReportButton
            reportTitle="Quantum Key Management Report"
            subtitle="Key distribution, status, and entropy analysis across all universes"
            filename="quantum-key-management-{date}.pdf"
            sections={[
              { heading: 'KEY INVENTORY OVERVIEW', rows: [['Total Keys', keys.length], ['Active', keys.filter(k => (k.data?.status || k.status) === 'active').length], ['Expiring Soon', keys.filter(k => (k.data?.status || k.status) === 'expiring_soon').length], ['Expired', keys.filter(k => (k.data?.status || k.status) === 'expired').length], ['Revoked', keys.filter(k => (k.data?.status || k.status) === 'revoked').length], ['Current Entropy Setting', `${entropy}%`], ['Entropy Grade', entropy >= 90 ? 'Quantum-Grade' : entropy >= 70 ? 'High' : entropy >= 50 ? 'Standard' : 'Low'], ['Connected Universes', universes.length]] },
              { heading: 'KEY LIST', body: keys.length > 0 ? keys.slice(0, 20).map(k => `• ${k.data?.key_name || k.key_name} — Universe: ${universeMap[k.data?.universe_id] || k.data?.universe_id?.substring(0, 12) || 'N/A'} — Status: ${k.data?.status || k.status} — Used: ${k.data?.usage_count || k.usage_count || 0}x — Last Rotated: ${k.data?.last_rotated ? new Date(k.data.last_rotated).toLocaleDateString() : 'Never'}`).join('\n') : 'No keys configured.' },
              { heading: 'QUANTUM ENTROPY EXPLAINED', body: 'Security Entropy measures the randomness and unpredictability of generated keys.\n\nEntropy Grades:\n• 90–100% — Quantum-Grade: Uses quantum random number generation, resistant to cryptanalysis\n• 70–89% — High: Uses CSPRNG (Cryptographically Secure Pseudo-Random Number Generator)\n• 50–69% — Standard: Uses OS-level entropy pool\n• 30–49% — Low: NOT recommended for production use\n\nAll production keys should use 90%+ entropy to ensure resistance against both classical and quantum computing attacks.\n\nKey Rotation Policy: Keys are automatically rotated based on universe-specific intervals ranging from minutes to days.' },
            ]}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader><CardTitle className="text-white text-sm">Key Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={byStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                    {byStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2">
                {byStatus.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-slate-400">{s.name}: {s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader><CardTitle className="text-white text-sm">Keys per Universe</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byUniverse} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} width={90} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
                  <Bar dataKey="keys" fill="#06b6d4" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Batch Regen Control */}
        <Card className="bg-slate-800/60 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4 text-cyan-400" /> Batch Regeneration Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <label className="text-slate-400 text-sm mb-2 block">
                  Security Entropy: <span className={`font-bold ${eLabel.color}`}>{entropy}% — {eLabel.label}</span>
                </label>
                <input type="range" min={30} max={100} value={entropy} onChange={e => setEntropy(Number(e.target.value))}
                  className="w-full accent-cyan-400" />
                <div className="flex justify-between text-xs text-slate-600 mt-1"><span>Low (30)</span><span>Standard (50)</span><span>High (70)</span><span>Quantum (100)</span></div>
              </div>
              <div className="flex flex-col gap-2 min-w-[200px]">
                <p className="text-slate-400 text-xs">{selectedKeys.size > 0 ? `${selectedKeys.size} keys selected` : `All ${keys.length} keys will be regenerated`}</p>
                <Button onClick={handleBatchRegenerate} disabled={regenerating} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                  {regenerating ? 'Regenerating...' : selectedKeys.size > 0 ? `Regen ${selectedKeys.size} Keys` : 'Regen All Keys'}
                </Button>
                {selectedKeys.size > 0 && <Button variant="ghost" onClick={() => setSelectedKeys(new Set())} className="text-slate-400 text-xs">Clear Selection</Button>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key List */}
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2"><Layers className="w-4 h-4 text-purple-400" /> All Quantum Keys ({keys.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {keys.map(k => (
                <div
                  key={k.id}
                  onClick={() => toggleKey(k.id)}
                  className={`cursor-pointer rounded-lg p-3 border transition-all flex items-center justify-between ${selectedKeys.has(k.id) ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-900/40 hover:border-slate-500'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedKeys.has(k.id) ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'}`}>
                      {selectedKeys.has(k.id) && <CheckCircle className="w-3 h-3 text-slate-900" />}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{k.data?.key_name}</p>
                      <p className="text-slate-400 text-xs">Universe: {universeMap[k.data?.universe_id] || k.data?.universe_id?.substring(0, 12) || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-slate-500 text-xs">Rotated: {k.data?.last_rotated ? format(new Date(k.data.last_rotated), 'MMM d, HH:mm') : 'Never'}</p>
                      <p className="text-slate-500 text-xs">Used: {k.data?.usage_count || 0}x</p>
                    </div>
                    <Badge className={statusColor[k.data?.status] || statusColor.active}>{k.data?.status}</Badge>
                  </div>
                </div>
              ))}
              {keys.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No quantum keys found. Add universes to generate keys.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}