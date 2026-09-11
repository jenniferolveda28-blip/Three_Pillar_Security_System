import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock, AlertTriangle, ArrowLeft, Mail, Send, CalendarClock, CheckCircle2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

const DEFAULT_RETENTION_DAYS = 90;
const WARNING_WINDOW_DAYS = 14;

export default function SystemDestructionMonitor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sendingId, setSendingId] = useState(null);

  const { data: samples = [], isLoading } = useQuery({
    queryKey: ['system_DnaSample', 'destruction-monitor'],
    queryFn: () => base44.entities.system_DnaSample.list('-received_date', 200),
  });

  const sendReminder = useMutation({
    mutationFn: async (s) => {
      const expires = getExpiry(s);
      const daysLeft = Math.ceil(moment(expires).diff(moment(), 'days', true));
      const subject = `Action required: your biological sample nearing mandatory destruction`;
      const body = `Hello ${s.submitter_name},\n\n` +
        `This is a courtesy notice from the platform. The biological identity data associated with sample ${s.sample_id} is nearing its mandatory retention expiry.\n\n` +
        `Destruction date: ${moment(expires).format('MMMM D, YYYY')} (${daysLeft} day(s) remaining)\n\n` +
        `Under our Data Destruction Policy and Texas genetic privacy law, your stored genetic hash will be permanently destroyed on or after this date unless you renew consent.\n\n` +
        `If you wish to extend retention, withdraw consent early, or request immediate destruction, please contact us via the platform.\n\n` +
        `— Platform Privacy Team`;
      return base44.integrations.Core.SendEmail({ to: s.submitter_email, subject, body });
    },
    onMutate: (s) => setSendingId(s.id),
    onSuccess: () => {
      toast({ title: 'Reminder sent', description: 'Destruction reminder email dispatched.' });
    },
    onError: (e) => {
      toast({ variant: 'destructive', title: 'Email failed', description: e?.message || 'Could not send reminder. Note: reaching non-registered addresses requires a custom domain on a paid plan.' });
    },
    onSettled: () => setSendingId(null),
  });

  const enriched = useMemo(() => {
    return samples
      .filter((s) => s.status !== 'destroyed' && s.received_date)
      .map((s) => {
        const expires = getExpiry(s);
        const daysLeft = Math.ceil(moment(expires).diff(moment(), 'days', true));
        return { ...s, expires, daysLeft };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [samples]);

  const dueSoon = enriched.filter((s) => s.daysLeft <= WARNING_WINDOW_DAYS && s.daysLeft > 0);
  const overdue = enriched.filter((s) => s.daysLeft <= 0);
  const safe = enriched.filter((s) => s.daysLeft > WARNING_WINDOW_DAYS);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-cyan-400 shrink-0"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="min-w-0">
            <h1 className="text-lg font-bold flex items-center gap-2"><CalendarClock className="w-5 h-5 text-amber-400" /> Destruction Timeline Monitor</h1>
            <p className="text-xs text-slate-500">Track biological samples nearing mandatory retention expiry</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Automation note */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-900/40 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-slate-300">
            <p className="font-medium">Automated scheduled reminders require a Builder+ upgrade.</p>
            <p className="text-slate-500 text-xs mt-1">
              This monitor flags samples nearing destruction in real time and lets you send reminder emails manually.
              Fully automated scheduled email dispatch needs a backend function + scheduled automation, which requires upgrading your plan.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Overdue" value={overdue.length} icon={AlertTriangle} cls="text-rose-400 border-rose-500/30" />
          <StatCard label="Due ≤ 14 days" value={dueSoon.length} icon={Clock} cls="text-amber-400 border-amber-500/30" />
          <StatCard label="Within retention" value={safe.length} icon={CheckCircle2} cls="text-emerald-400 border-emerald-500/30" />
          <StatCard label="Retention period" value={`${DEFAULT_RETENTION_DAYS}d`} icon={CalendarClock} cls="text-cyan-400 border-cyan-500/30" />
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-slate-500">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-amber-400 rounded-full animate-spin mx-auto mb-3" />
            Loading samples…
          </div>
        ) : enriched.length === 0 ? (
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="py-16 text-center">
              <CalendarClock className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400">No active samples with a retention timeline yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overdue */}
            {overdue.length > 0 && (
              <Section title="Overdue — Destroy Now" icon={AlertTriangle} color="rose">
                {overdue.map((s) => <SampleRow key={s.id} s={s} tone="rose" onSend={() => sendReminder.mutate(s)} sending={sendingId === s.id} />)}
              </Section>
            )}

            {/* Due soon */}
            {dueSoon.length > 0 && (
              <Section title={`Due in ≤ ${WARNING_WINDOW_DAYS} days`} icon={Clock} color="amber">
                {dueSoon.map((s) => <SampleRow key={s.id} s={s} tone="amber" onSend={() => sendReminder.mutate(s)} sending={sendingId === s.id} />)}
              </Section>
            )}

            {/* Safe */}
            {safe.length > 0 && (
              <Section title="Within Retention" icon={CheckCircle2} color="emerald">
                {safe.slice(0, 12).map((s) => <SampleRow key={s.id} s={s} tone="emerald" onSend={() => sendReminder.mutate(s)} sending={sendingId === s.id} />)}
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getExpiry(s) {
  if (s.retention_expires_date) return s.retention_expires_date;
  return moment(s.received_date).add(DEFAULT_RETENTION_DAYS, 'days').toISOString();
}

function StatCard({ label, value, icon: Icon, cls }) {
  return (
    <Card className={`bg-slate-900/50 border ${cls}`}>
      <CardContent className="pt-4 pb-4 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-[11px] text-slate-500 uppercase tracking-wide">{label}</p>
        </div>
        <Icon className={`w-6 h-6 ${cls.split(' ')[0]}`} />
      </CardContent>
    </Card>
  );
}

const toneMap = {
  rose: { bar: 'bg-rose-500', badge: 'border-rose-500/40 bg-rose-500/10 text-rose-300', heading: 'text-rose-400' },
  amber: { bar: 'bg-amber-500', badge: 'border-amber-500/40 bg-amber-500/10 text-amber-300', heading: 'text-amber-400' },
  emerald: { bar: 'bg-emerald-500', badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', heading: 'text-emerald-400' },
};

function SampleRow({ s, tone, onSend, sending }) {
  const t = toneMap[tone];
  return (
    <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
      <div className={`h-0.5 ${t.bar}`} />
      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-semibold text-sm">{s.sample_id}</span>
              <Badge variant="outline" className={`h-5 text-[10px] py-0 ${t.badge}`}>
                {s.daysLeft <= 0 ? 'Overdue' : `${s.daysLeft}d left`}
              </Badge>
            </div>
            <p className="text-sm text-slate-300 mt-0.5">{s.submitter_name}</p>
            {s.submitter_email && <p className="text-xs text-slate-500">{s.submitter_email}</p>}
          </div>
          <div className="flex flex-col sm:items-end gap-1 text-xs text-slate-500">
            <span>Received: {moment(s.received_date).format('MMM D, YYYY')}</span>
            <span className={tone === 'rose' ? 'text-rose-400 font-medium' : tone === 'amber' ? 'text-amber-400 font-medium' : 'text-slate-400'}>
              Expires: {moment(s.expires).format('MMM D, YYYY')}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={onSend}
              disabled={sending || !s.submitter_email}
              className="border-slate-700 text-slate-300 h-7 mt-1"
            >
              {sending ? <Clock className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1" />}
              {sending ? 'Sending…' : 'Send Reminder'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Section({ title, icon: Icon, color, children }) {
  const t = toneMap[color] || toneMap.emerald;
  return (
    <div>
      <h2 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${t.heading}`}>
        <Icon className="w-4 h-4" /> {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}