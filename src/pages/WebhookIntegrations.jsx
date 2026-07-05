import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Webhook, Plus, Trash2, Power, X, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const availableEvents = [
  'security.alert', 'security.anomaly', 'security.breach',
  'token.registered', 'token.revoked', 'token.failed_auth',
  'subscription.created', 'subscription.expired', 'subscription.updated',
  'key.rotated', 'key.expired', 'scramble.completed',
  'user.login', 'user.logout', 'user.access_denied',
];

export default function WebhookIntegrations() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ webhook_name: '', target_url: '', secret_token: '', event_types: [] });

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhookEndpoints'],
    queryFn: () => base44.entities.WebhookEndpoint.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WebhookEndpoint.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['webhookEndpoints']); setShowForm(false); setForm({ webhook_name: '', target_url: '', secret_token: '', event_types: [] }); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.WebhookEndpoint.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries(['webhookEndpoints']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WebhookEndpoint.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['webhookEndpoints']),
  });

  const toggleEvent = (event) => {
    const events = form.event_types || [];
    setForm({ ...form, event_types: events.includes(event) ? events.filter(e => e !== event) : [...events, event] });
  };

  if (isLoading) return <div className="p-8 text-slate-400">Loading webhooks…</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Webhook className="w-8 h-8 text-cyan-400" /> Webhook Integrations
          </h1>
          <p className="text-slate-400 mt-1">Push status updates and alerts to external third-party tools</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-cyan-600 hover:bg-cyan-700">
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancel' : 'Add Webhook'}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white">New Webhook Endpoint</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Webhook Name</label>
                <Input value={form.webhook_name} onChange={e => setForm({ ...form, webhook_name: e.target.value })} placeholder="e.g. Slack Alerts" className="bg-slate-900 border-slate-700 text-white" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Target URL</label>
                <Input value={form.target_url} onChange={e => setForm({ ...form, target_url: e.target.value })} placeholder="https://hooks.example.com/…" className="bg-slate-900 border-slate-700 text-white" />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Secret Token (optional)</label>
              <Input value={form.secret_token} onChange={e => setForm({ ...form, secret_token: e.target.value })} placeholder="Verification token" className="bg-slate-900 border-slate-700 text-white" />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Subscribed Events</label>
              <div className="flex flex-wrap gap-2">
                {availableEvents.map(ev => (
                  <button key={ev} type="button" onClick={() => toggleEvent(ev)}
                    className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${(form.event_types || []).includes(ev) ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-slate-900 text-slate-500 border-slate-700'}`}>
                    {ev}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={() => createMutation.mutate(form)} disabled={!form.webhook_name || !form.target_url || createMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700">
              <Save className="w-4 h-4 mr-2" /> {createMutation.isPending ? 'Creating…' : 'Create Webhook'}
            </Button>
          </CardContent>
        </Card>
      )}

      {webhooks.length === 0 && !showForm ? (
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="py-12 text-center text-slate-500">No webhooks configured. Click "Add Webhook" to create one.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {webhooks.map(w => (
            <Card key={w.id} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Webhook className="w-5 h-5 text-cyan-400" /> {w.webhook_name}
                  </CardTitle>
                  <Badge className={w.is_active ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-slate-500/20 text-slate-400 border-slate-500/50'}>
                    {w.is_active ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-slate-400 break-all">URL: <span className="text-slate-300">{w.target_url}</span></div>
                {w.secret_token && <div className="text-sm text-slate-400">Secret: <span className="text-slate-500 font-mono">••••••••</span></div>}
                <div>
                  <p className="text-xs text-slate-400 mb-1">Subscribed Events</p>
                  <div className="flex flex-wrap gap-1">
                    {(w.event_types || []).map(ev => <Badge key={ev} className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">{ev}</Badge>)}
                    {(!w.event_types || w.event_types.length === 0) && <span className="text-slate-500 text-xs">None</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Triggered: {w.trigger_count || 0}×</span>
                  {w.last_triggered && <span>Last: {new Date(w.last_triggered).toLocaleString()}</span>}
                  {w.last_response_status && <span>HTTP {w.last_response_status}</span>}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => toggleMutation.mutate({ id: w.id, is_active: !w.is_active })} variant="outline" size="sm" className="border-slate-700 text-slate-300">
                    <Power className="w-3 h-3 mr-1" /> {w.is_active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button onClick={() => deleteMutation.mutate(w.id)} variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}