import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CreditCard, Save, X, Edit3, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

const planColors = {
  basic: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
  pro: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
  enterprise: 'bg-violet-500/20 text-violet-400 border-violet-500/50',
};

const statusColors = {
  active: 'bg-green-500/20 text-green-400 border-green-500/50',
  expired: 'bg-red-500/20 text-red-400 border-red-500/50',
  suspended: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
};

export default function SubscriptionManagement() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data: subs = [], isLoading } = useQuery({
    queryKey: ['subscriptionsAdmin'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Subscription.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['subscriptionsAdmin']); setEditingId(null); },
  });

  const startEdit = (s) => {
    setEditingId(s.id);
    const endDate = s.end_date ? new Date(s.end_date).toISOString().slice(0, 10) : '';
    setEditForm({ plan_type: s.plan_type, api_calls_limit: s.api_calls_limit, end_date: endDate, auto_renew: s.auto_renew, status: s.status });
  };

  if (isLoading) return <div className="p-8 text-slate-400">Loading subscriptions…</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-cyan-400" /> Subscription Management
        </h1>
        <p className="text-slate-400 mt-1">Manage subscription plans, API limits, and renewal dates</p>
      </div>

      {subs.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="py-12 text-center text-slate-500">No subscriptions found.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {subs.map(s => {
            const usagePct = s.api_calls_limit ? Math.min(100, ((s.api_calls_used || 0) / s.api_calls_limit) * 100) : 0;
            return (
              <Card key={s.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{s.user_email || 'Unknown'}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={planColors[s.plan_type] || planColors.basic}>{s.plan_type}</Badge>
                      <Badge className={statusColors[s.status] || statusColors.active}>{s.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-slate-400">Token: <span className="text-slate-300">{s.token_serial || '—'}</span></div>

                  {editingId === s.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-slate-400 mb-1 block">Plan Type</label>
                        <select value={editForm.plan_type} onChange={e => setEditForm({ ...editForm, plan_type: e.target.value })} className="bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm w-full">
                          <option value="basic">Basic</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-1 block">API Calls Limit</label>
                        <Input type="number" value={editForm.api_calls_limit || ''} onChange={e => setEditForm({ ...editForm, api_calls_limit: parseInt(e.target.value) || 0 })} className="bg-slate-900 border-slate-700 text-white" />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-1 block">End Date</label>
                        <Input type="date" value={editForm.end_date} onChange={e => setEditForm({ ...editForm, end_date: e.target.value })} className="bg-slate-900 border-slate-700 text-white" />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-1 block">Status</label>
                        <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm w-full">
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                          <option value="suspended">Suspended</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={editForm.auto_renew} onChange={e => setEditForm({ ...editForm, auto_renew: e.target.checked })} id="autorenew" className="rounded" />
                        <label htmlFor="autorenew" className="text-sm text-slate-300">Auto-renew</label>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => updateMutation.mutate({ id: s.id, data: { ...editForm, end_date: editForm.end_date ? new Date(editForm.end_date).toISOString() : null } })} disabled={updateMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700">
                          <Save className="w-4 h-4 mr-2" /> {updateMutation.isPending ? 'Saving…' : 'Save'}
                        </Button>
                        <Button onClick={() => setEditingId(null)} variant="outline" className="border-slate-700 text-slate-300"><X className="w-4 h-4 mr-2" /> Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">API Usage</span>
                          <span className="text-slate-300">{s.api_calls_used || 0} / {s.api_calls_limit || '∞'}</span>
                        </div>
                        <Progress value={usagePct} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><p className="text-slate-400">End Date</p><p className="text-slate-200">{s.end_date ? new Date(s.end_date).toLocaleDateString() : '—'}</p></div>
                        <div><p className="text-slate-400">Auto-Renew</p><p className={s.auto_renew ? 'text-green-400' : 'text-slate-500'}>{s.auto_renew ? 'Yes' : 'No'}</p></div>
                      </div>
                      <Button onClick={() => startEdit(s)} variant="outline" className="border-slate-700 text-slate-300"><Edit3 className="w-4 h-4 mr-2" /> Edit Subscription</Button>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}