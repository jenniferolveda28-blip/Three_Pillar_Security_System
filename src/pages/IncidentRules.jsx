import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Shield, Loader2, RefreshCw, Plus, Power, Bell } from 'lucide-react';

export default function IncidentRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ rule_name: '', trigger_type: 'fraud', min_severity: 'high', notify_email: '', notify_sms: '', actions: ['notify_email'] });

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.IncidentRule.list('-created_date', 50);
      setRules(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const triggerTypes = ['credential_abuse', 'fraud', 'unauthorized_access', 'data_breach', 'malicious_intent', 'pattern_anomaly', 'identity_theft'];
  const severities = ['low', 'medium', 'high', 'critical', 'emergency'];
  const actionOptions = ['notify_email', 'notify_sms', 'block_ip', 'revoke_credentials', 'isolate_account', 'escalate'];

  const severityVariant = { low: 'secondary', medium: 'secondary', high: 'destructive', critical: 'destructive', emergency: 'destructive' };

  const toggleActive = async (rule) => {
    await base44.entities.IncidentRule.update(rule.id, { is_active: !rule.is_active });
    load();
  };

  const deleteRule = async (id) => {
    await base44.entities.IncidentRule.delete(id);
    load();
  };

  const toggleAction = (action) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.includes(action) ? prev.actions.filter(a => a !== action) : [...prev.actions, action],
    }));
  };

  const submitForm = async () => {
    if (!formData.rule_name.trim()) return;
    await base44.entities.IncidentRule.create({
      rule_name: formData.rule_name,
      trigger_type: formData.trigger_type,
      min_severity: formData.min_severity,
      notify_email: formData.notify_email || undefined,
      notify_sms: formData.notify_sms || undefined,
      actions: formData.actions,
      is_active: true,
    });
    setShowForm(false);
    setFormData({ rule_name: '', trigger_type: 'fraud', min_severity: 'high', notify_email: '', notify_sms: '', actions: ['notify_email'] });
    load();
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Incident Rules Manager</h1>
              <p className="text-slate-400 text-sm">Define rules that trigger notifications based on anomaly severity</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
            </Button>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4" /> New Rule
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Total Rules</p><p className="text-3xl font-bold text-cyan-400 mt-1">{rules.length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Active</p><p className="text-3xl font-bold text-green-400 mt-1">{rules.filter(r => r.is_active).length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Disabled</p><p className="text-3xl font-bold text-slate-400 mt-1">{rules.filter(r => !r.is_active).length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Total Triggers</p><p className="text-3xl font-bold text-orange-400 mt-1">{rules.reduce((a, r) => a + (r.execution_count || 0), 0)}</p></CardContent></Card>
        </div>

        {showForm && (
          <Card className="bg-slate-900/60 border-cyan-500/40 mb-6">
            <CardHeader><CardTitle className="text-white">Create New Incident Rule</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="text-slate-300">Rule Name</Label><Input value={formData.rule_name} onChange={(e) => setFormData(prev => ({ ...prev, rule_name: e.target.value }))} placeholder="e.g. High Severity Fraud Alert" className="bg-slate-950/50 border-slate-700 text-white mt-1" /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label className="text-slate-300">Trigger Type</Label>
                  <Select value={formData.trigger_type} onValueChange={(v) => setFormData(prev => ({ ...prev, trigger_type: v }))}>
                    <SelectTrigger className="bg-slate-950/50 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{triggerTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-slate-300">Min Severity</Label>
                  <Select value={formData.min_severity} onValueChange={(v) => setFormData(prev => ({ ...prev, min_severity: v }))}>
                    <SelectTrigger className="bg-slate-950/50 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{severities.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label className="text-slate-300">Notify Email</Label><Input value={formData.notify_email} onChange={(e) => setFormData(prev => ({ ...prev, notify_email: e.target.value }))} placeholder="admin@example.com" className="bg-slate-950/50 border-slate-700 text-white mt-1" /></div>
                <div><Label className="text-slate-300">Notify SMS</Label><Input value={formData.notify_sms} onChange={(e) => setFormData(prev => ({ ...prev, notify_sms: e.target.value }))} placeholder="+1-555-0100" className="bg-slate-950/50 border-slate-700 text-white mt-1" /></div>
              </div>
              <div>
                <Label className="text-slate-300">Actions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {actionOptions.map(a => (
                    <button key={a} type="button" onClick={() => toggleAction(a)} className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${formData.actions.includes(a) ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-950/50 border-slate-700 text-slate-400 hover:border-slate-600'}`}>{a.replace(/_/g, ' ')}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={submitForm}><Plus className="w-4 h-4" /> Create Rule</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
        ) : rules.length === 0 ? (
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="py-16 text-center text-slate-500">No incident rules defined. Click "New Rule" to create one.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rules.map(rule => (
              <Card key={rule.id} className={`bg-slate-900/60 border-slate-700 ${!rule.is_active ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div><CardTitle className="text-white text-base">{rule.rule_name}</CardTitle><p className="text-slate-400 text-xs mt-1 capitalize">Trigger: {rule.trigger_type?.replace(/_/g, ' ')}</p></div>
                    <Badge variant={severityVariant[rule.min_severity]} className="capitalize">{rule.min_severity}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rule.actions && rule.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1">{rule.actions.map((a, i) => <Badge key={i} variant="outline" className="text-xs text-slate-400 capitalize">{a.replace(/_/g, ' ')}</Badge>)}</div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1"><Bell className="w-3 h-3 text-slate-500" /><span className="text-slate-500">Email:</span> <span className="text-slate-300 truncate">{rule.notify_email || '—'}</span></div>
                    <div><span className="text-slate-500">Triggered:</span> <span className="text-slate-300">{rule.execution_count || 0}×</span></div>
                  </div>
                  {rule.last_triggered && <p className="text-xs text-slate-500">Last triggered: {new Date(rule.last_triggered).toLocaleString()}</p>}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => toggleActive(rule)}><Power className="w-4 h-4" /> {rule.is_active ? 'Disable' : 'Enable'}</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteRule(rule.id)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}