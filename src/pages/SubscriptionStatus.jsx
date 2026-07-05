import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubscriptionStatus() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Subscription.list('-created_date', 50);
      setSubs(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const planColors = { basic: 'secondary', pro: 'default', enterprise: 'default' };
  const statusColors = { active: 'default', expired: 'destructive', suspended: 'destructive', cancelled: 'destructive' };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Subscription Overview</h1>
              <p className="text-slate-400 text-sm">Active subscriptions, API limits, and expiration dates</p>
            </div>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Subscriptions', value: subs.length, color: 'text-cyan-400' },
            { label: 'Active', value: subs.filter(s => s.status === 'active').length, color: 'text-green-400' },
            { label: 'Expired/Suspended', value: subs.filter(s => s.status !== 'active').length, color: 'text-red-400' },
            { label: 'Enterprise Plans', value: subs.filter(s => s.plan_type === 'enterprise').length, color: 'text-purple-400' },
          ].map(s => (
            <Card key={s.label} className="bg-slate-900/60 border-slate-700">
              <CardContent className="pt-6">
                <p className="text-slate-400 text-xs uppercase tracking-wider">{s.label}</p>
                <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
        ) : subs.length === 0 ? (
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="py-16 text-center text-slate-500">No subscriptions found.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {subs.map(s => {
              const used = s.api_calls_used || 0;
              const limit = s.api_calls_limit || 0;
              const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
              return (
                <Card key={s.id} className="bg-slate-900/60 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">{s.token_serial}</CardTitle>
                        <p className="text-slate-400 text-xs mt-1">{s.user_email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={planColors[s.plan_type]} className="capitalize">{s.plan_type}</Badge>
                        <Badge variant={statusColors[s.status]} className="capitalize">{s.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>API Usage</span>
                        <span>{used.toLocaleString()} / {limit.toLocaleString()}</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-500">Start:</span> <span className="text-slate-300">{s.start_date ? new Date(s.start_date).toLocaleDateString() : '—'}</span></div>
                      <div><span className="text-slate-500">Expires:</span> <span className="text-slate-300">{s.end_date ? new Date(s.end_date).toLocaleDateString() : '—'}</span></div>
                      <div><span className="text-slate-500">Auto-renew:</span> <span className="text-slate-300">{s.auto_renew ? 'Yes' : 'No'}</span></div>
                      <div><span className="text-slate-500">Linked Accts Limit:</span> <span className="text-slate-300">{s.linked_accounts_limit ?? '—'}</span></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}