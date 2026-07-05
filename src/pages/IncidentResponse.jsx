import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Siren, Loader2, RefreshCw, CheckCircle, XOctagon } from 'lucide-react';

export default function IncidentResponse() {
  const [alerts, setAlerts] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [a, r] = await Promise.all([
        base44.entities.CriminalActivityAlert.list('-created_date', 50),
        base44.entities.IncidentRule.list('-created_date', 50),
      ]);
      setAlerts(a);
      setRules(r);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const severityVariant = { low: 'secondary', medium: 'secondary', high: 'destructive', critical: 'destructive', emergency: 'destructive' };
  const severityColor = { low: 'text-slate-400', medium: 'text-yellow-400', high: 'text-orange-400', critical: 'text-red-400', emergency: 'text-red-500' };
  const statusVariant = { open: 'destructive', investigating: 'secondary', confirmed: 'destructive', false_positive: 'secondary', resolved: 'default' };

  const acknowledge = async (id) => { await base44.entities.CriminalActivityAlert.update(id, { status: 'investigating' }); load(); };
  const resolve = async (id) => { await base44.entities.CriminalActivityAlert.update(id, { status: 'resolved' }); load(); };

  const openAlerts = alerts.filter(a => a.status === 'open' || a.status === 'investigating');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved' || a.status === 'false_positive');

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Siren className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Incident Response</h1>
              <p className="text-slate-400 text-sm">Active alerts, severity levels, and response tools</p>
            </div>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Open Alerts</p><p className="text-3xl font-bold text-red-400 mt-1">{openAlerts.length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Resolved</p><p className="text-3xl font-bold text-green-400 mt-1">{resolvedAlerts.length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Auto-Blocked</p><p className="text-3xl font-bold text-orange-400 mt-1">{alerts.filter(a => a.auto_blocked).length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Active Rules</p><p className="text-3xl font-bold text-cyan-400 mt-1">{rules.filter(r => r.is_active).length}</p></CardContent></Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-300">Active Alerts</h2>
            {openAlerts.length === 0 ? (
              <Card className="bg-slate-900/60 border-slate-700"><CardContent className="py-12 text-center text-slate-500">No active alerts. All clear.</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {openAlerts.map(a => (
                  <Card key={a.id} className="bg-slate-900/60 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white text-base capitalize">{a.alert_type?.replace(/_/g, ' ')}</CardTitle>
                          <p className="text-slate-400 text-xs mt-1">{a.user_identifier || a.ip_address || 'Unknown source'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={severityVariant[a.severity]} className={`capitalize ${severityColor[a.severity]}`}>{a.severity}</Badge>
                          <Badge variant={statusVariant[a.status]} className="capitalize">{a.status}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {a.indicators && a.indicators.length > 0 && (
                        <div className="flex flex-wrap gap-1">{a.indicators.map((ind, i) => <Badge key={i} variant="outline" className="text-xs text-slate-400">{ind}</Badge>)}</div>
                      )}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-slate-500">Confidence:</span> <span className="text-slate-300">{a.confidence_score || 0}%</span></div>
                        <div><span className="text-slate-500">Auto-Blocked:</span> <span className={a.auto_blocked ? 'text-orange-400' : 'text-slate-300'}>{a.auto_blocked ? 'Yes' : 'No'}</span></div>
                        <div><span className="text-slate-500">Authorities:</span> <span className={a.authorities_notified ? 'text-red-400' : 'text-slate-300'}>{a.authorities_notified ? 'Yes' : 'No'}</span></div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        {a.status === 'open' && <Button size="sm" variant="secondary" onClick={() => acknowledge(a.id)}><CheckCircle className="w-4 h-4" /> Acknowledge</Button>}
                        <Button size="sm" variant="default" onClick={() => resolve(a.id)}><XOctagon className="w-4 h-4" /> Resolve</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}