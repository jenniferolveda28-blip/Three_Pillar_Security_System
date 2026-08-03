import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, ShieldCheck, ListChecks } from 'lucide-react';

export default function ThreatRemediationQueue() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const exposures = useQuery({
    queryKey: ['remediationQueue', 'exposures'],
    queryFn: () => base44.entities.ExposureRecord.filter({ status: 'opt_out_sent' }, '-created_date', 100)
  });
  const alerts = useQuery({
    queryKey: ['remediationQueue', 'alerts'],
    queryFn: () => base44.entities.CriminalActivityAlert.filter({ status: 'open' }, '-created_date', 50)
  });
  const ex = exposures.data || [];
  const al = alerts.data || [];

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ExposureRecord.update(id, { status }),
    onSuccess: () => { toast({ title: 'Status updated' }); qc.invalidateQueries({ queryKey: ['remediationQueue'] }); },
    onError: (e) => toast({ variant: 'destructive', title: 'Update failed', description: e.message })
  });
  const resolveAlert = useMutation({
    mutationFn: ({ id }) => base44.entities.CriminalActivityAlert.update(id, { status: 'resolved' }),
    onSuccess: () => { toast({ title: 'Alert resolved' }); qc.invalidateQueries({ queryKey: ['remediationQueue'] }); },
    onError: (e) => toast({ variant: 'destructive', title: 'Update failed', description: e.message })
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><ListChecks className="w-7 h-7 text-cyan-400" /> Threat Remediation Queue</h1>
        <p className="text-slate-400 mt-1">Pending PII removal requests and security remediation tasks. Manually override or update status.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900/60 border-slate-700">
          <CardContent className="pt-5">
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-cyan-400" /> PII Removal Requests ({ex.length})</h2>
            <div className="space-y-3 max-h-[480px] overflow-y-auto">
              {ex.length === 0 && <p className="text-slate-500 text-sm">No pending removal requests.</p>}
              {ex.map(e => (
                <div key={e.id} className="border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-white text-sm font-medium">{e.broker_name}</div>
                    <Badge variant="outline" className="border-amber-600/50 text-amber-300">{e.status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <div className="text-xs text-slate-500">{(e.exposure_type || '').replace(/_/g, ' ')} · {e.user_email}</div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-200" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: e.id, status: 'pending_verification' })}>Mark Sent</Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: e.id, status: 'scrubbed' })}>Verify Scrubbed</Button>
                    <Button size="sm" variant="outline" className="border-red-700/50 text-red-300" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: e.id, status: 'escalated' })}>Escalate</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 border-slate-700">
          <CardContent className="pt-5">
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /> Open Security Alerts ({al.length})</h2>
            <div className="space-y-3 max-h-[480px] overflow-y-auto">
              {al.length === 0 && <p className="text-slate-500 text-sm">No open alerts.</p>}
              {al.map(a => (
                <div key={a.id} className="border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-white text-sm font-medium">{a.alert_type.replace(/_/g, ' ')}</div>
                    <Badge variant="outline" className={a.severity === 'critical' ? 'border-red-600/50 text-red-300' : a.severity === 'high' ? 'border-amber-600/50 text-amber-300' : 'border-slate-600 text-slate-300'}>{a.severity}</Badge>
                  </div>
                  {a.user_identifier && <div className="text-xs text-slate-500">{a.user_identifier}</div>}
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" disabled={resolveAlert.isPending} onClick={() => resolveAlert.mutate({ id: a.id })}>Mark Resolved</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}