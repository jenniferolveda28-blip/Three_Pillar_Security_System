import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Clock, BellRing } from 'lucide-react';

const statusStyle = {
  opt_out_sent: 'border-blue-600/50 text-blue-300',
  pending_verification: 'border-amber-600/50 text-amber-300',
  scrubbed: 'border-emerald-600/50 text-emerald-300',
  escalated: 'border-red-600/50 text-red-300',
  discovered: 'border-slate-600 text-slate-300'
};

export default function BrokerRequestManager() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ['brokerRequests'],
    queryFn: () => base44.entities.ExposureRecord.filter({ status: 'opt_out_sent' }, '-opt_out_sent_date', 100)
  });
  const update = useMutation({
    mutationFn: ({ id, ...patch }) => base44.entities.ExposureRecord.update(id, patch),
    onSuccess: () => { toast({ title: 'Request updated' }); qc.invalidateQueries({ queryKey: ['brokerRequests'] }); },
    onError: (e) => toast({ variant: 'destructive', title: 'Update failed', description: e.message })
  });
  const now = Date.now();
  const daysSince = (d) => d ? Math.floor((now - new Date(d).getTime()) / 86400000) : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Mail className="w-7 h-7 text-cyan-400" /> Broker Request Manager</h1>
        <p className="text-slate-400 mt-1">Active removal requests sent to data brokers — status, timestamps, and follow-up reminders.</p>
      </div>
      <div className="space-y-3">
        {isLoading && <p className="text-slate-500">Loading requests…</p>}
        {!isLoading && data.length === 0 && <p className="text-slate-500">No active removal requests.</p>}
        {data.map(e => {
          const sentDays = daysSince(e.opt_out_sent_date);
          const overdue = sentDays != null && sentDays > 14;
          return (
            <Card key={e.id} className={`bg-slate-900/60 ${overdue ? 'border-amber-600/40' : 'border-slate-700'}`}>
              <CardContent className="pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white font-medium flex items-center gap-2">{e.broker_name}
                      {overdue && <Badge variant="outline" className="border-amber-600/50 text-amber-300"><BellRing className="w-3 h-3 mr-1" />Follow-up due</Badge>}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{(e.exposure_type || '').replace(/_/g, ' ')} · {e.user_email}</div>
                    {e.listing_url && <a href={e.listing_url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:underline">View listing</a>}
                  </div>
                  <Badge variant="outline" className={statusStyle[e.status] || 'border-slate-600 text-slate-300'}>{e.status.replace(/_/g, ' ')}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-xs">
                  <div className="flex items-center gap-1 text-slate-400"><Clock className="w-3 h-3" /> Sent: {e.opt_out_sent_date ? new Date(e.opt_out_sent_date).toLocaleDateString() : '—'}{sentDays != null && ` (${sentDays}d ago)`}</div>
                  <div className="flex items-center gap-1 text-slate-400">Last verified: {e.last_verified ? new Date(e.last_verified).toLocaleDateString() : 'never'}</div>
                  <div className="text-slate-400">Method: {(e.removal_method || '').replace(/_/g, ' ')}</div>
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  <Button size="sm" variant="outline" className="border-slate-700 text-slate-200" disabled={update.isPending} onClick={() => update.mutate({ id: e.id, status: 'pending_verification', last_verified: new Date().toISOString() })}>Mark Verified</Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" disabled={update.isPending} onClick={() => update.mutate({ id: e.id, status: 'scrubbed', scrubbed_date: new Date().toISOString() })}>Confirm Scrubbed</Button>
                  <Button size="sm" variant="outline" className="border-red-700/50 text-red-300" disabled={update.isPending} onClick={() => update.mutate({ id: e.id, status: 'escalated' })}>Escalate</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}