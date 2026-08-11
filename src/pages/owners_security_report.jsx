import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/RoleGuard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users, AlertTriangle, Webhook, BarChart3,
  MessageSquareWarning, Gavel, Activity, Scale
} from 'lucide-react';

// OWNER-ONLY — do not surface any section here in user_security_report.jsx
const StatCard = ({ icon: Icon, label, value, accent }) => (
  <Card className="bg-slate-900/60 border-slate-700">
    <CardContent className="pt-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${accent}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
      </div>
    </CardContent>
  </Card>
);

const Section = ({ icon: Icon, title, children }) => (
  <Card className="bg-slate-900/60 border-slate-700">
    <CardHeader className="flex flex-row items-center gap-2 pb-2">
      <Icon className="w-4 h-4 text-cyan-400" />
      <CardTitle className="text-white text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export default function OwnersSecurityReport() {
  const investors = useQuery({
    queryKey: ['owner-report', 'investorMeetings'],
    queryFn: () => base44.entities.InvestorMeeting.list('-created_date', 50)
  });
  const warrants = useQuery({
    queryKey: ['owner-report', 'auditorWarrants'],
    queryFn: () => base44.entities.AuditorAccessPass.list('-created_date', 50)
  });
  const incidentRules = useQuery({
    queryKey: ['owner-report', 'incidentRules'],
    queryFn: () => base44.entities.IncidentRule.list('-created_date', 50)
  });
  const webhooks = useQuery({
    queryKey: ['owner-report', 'webhooks'],
    queryFn: () => base44.entities.WebhookEndpoint.list('-created_date', 50)
  });
  const analytics = useQuery({
    queryKey: ['owner-report', 'analytics'],
    queryFn: () => base44.entities.AnalyticsMetric.list('-created_date', 20)
  });
  const complaints = useQuery({
    queryKey: ['owner-report', 'complaints'],
    queryFn: () => base44.entities.AuditFeedback.list('-created_date', 50)
  });
  const logs = useQuery({
    queryKey: ['owner-report', 'securityLogs'],
    queryFn: () => base44.entities.SecurityLog.list('-created_date', 20)
  });

  const iv = investors.data || [];
  const w = warrants.data || [];
  const ir = incidentRules.data || [];
  const wh = webhooks.data || [];
  const an = analytics.data || [];
  const cp = complaints.data || [];

  return (
    <RoleGuard allow={['admin', 'owner']}>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Owner Security Report</h1>
          <p className="text-slate-400 mt-1">
            Owner-only console: investor pipeline, warrants, incident rules, webhooks, analytics &amp; complaint queue.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Investor Meetings" value={iv.length} accent="bg-blue-600/30" />
          <StatCard icon={Gavel} label="Auditor Warrants" value={w.length} accent="bg-purple-600/30" />
          <StatCard icon={AlertTriangle} label="Incident Rules" value={ir.filter(r => r.is_active).length} accent="bg-amber-600/30" />
          <StatCard icon={MessageSquareWarning} label="Open Complaints" value={cp.filter(c => c.status !== 'resolved').length} accent="bg-red-600/30" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Section icon={Users} title="Investor Interactions">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {iv.length === 0 && <p className="text-slate-500 text-sm">No investor meetings recorded.</p>}
              {iv.slice(0, 8).map(m => (
                <div key={m.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <div className="text-white text-sm font-medium">{m.investor_name}</div>
                    <div className="text-xs text-slate-500">{m.company} · {m.meeting_date}</div>
                  </div>
                  <Badge variant="outline" className="border-slate-600 text-slate-300">{m.status}</Badge>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Scale} title="Legal / NDA Pipeline">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {iv.filter(m => ['NDA Sent', 'Meeting Scheduled', 'Negotiating'].includes(m.status)).length === 0 &&
                <p className="text-slate-500 text-sm">No active NDA/legal workflows.</p>}
              {iv.filter(m => ['NDA Sent', 'Meeting Scheduled', 'Negotiating'].includes(m.status)).slice(0, 8).map(m => (
                <div key={m.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-white text-sm">{m.investor_name}</div>
                  <Badge variant="outline" className="border-amber-600/50 text-amber-300">{m.status}</Badge>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Gavel} title="Auditor Warrants Issued">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {w.length === 0 && <p className="text-slate-500 text-sm">No warrants issued.</p>}
              {w.slice(0, 8).map(p => (
                <div key={p.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <div className="text-white text-sm">{p.first_name} {p.last_name}</div>
                    <div className="text-xs text-slate-500">{p.auditor_email}</div>
                  </div>
                  <Badge variant="outline" className={
                    p.status === 'active' ? 'border-emerald-600/50 text-emerald-300' :
                    'border-slate-600 text-slate-400'
                  }>{p.status}</Badge>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={AlertTriangle} title="Incident Rules Config">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {ir.length === 0 && <p className="text-slate-500 text-sm">No incident rules configured.</p>}
              {ir.slice(0, 8).map(r => (
                <div key={r.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-white text-sm">{r.rule_name}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-slate-600 text-slate-300">{r.min_severity}</Badge>
                    {r.is_active
                      ? <Badge className="bg-emerald-600/30 text-emerald-200">on</Badge>
                      : <Badge variant="outline" className="border-slate-600 text-slate-500">off</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Webhook} title="Webhook Endpoints Config">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {wh.length === 0 && <p className="text-slate-500 text-sm">No webhooks configured.</p>}
              {wh.slice(0, 8).map(wb => (
                <div key={wb.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-white text-sm truncate max-w-[200px]">{wb.webhook_name}</div>
                  <Badge variant="outline" className={
                    wb.is_active ? 'border-emerald-600/50 text-emerald-300' : 'border-slate-600 text-slate-500'
                  }>{wb.is_active ? 'active' : 'paused'}</Badge>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={BarChart3} title="Business Analytics (Recent)">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {an.length === 0 && <p className="text-slate-500 text-sm">No analytics events.</p>}
              {an.slice(0, 8).map(a => (
                <div key={a.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-white text-sm">{a.metric_type}</div>
                  <Badge variant="outline" className={
                    a.success ? 'border-emerald-600/50 text-emerald-300' : 'border-red-600/50 text-red-300'
                  }>{a.success ? 'ok' : 'fail'}</Badge>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Activity} title="Integration Activity (Workspace)">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(logs.data || []).length === 0 && <p className="text-slate-500 text-sm">No integration events logged.</p>}
              {(logs.data || []).slice(0, 8).map(l => (
                <div key={l.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-white text-sm">{l.event_type}</div>
                  <Badge variant="outline" className="border-slate-600 text-slate-300">{l.threat_level}</Badge>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={MessageSquareWarning} title="Complaint Queue">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {cp.length === 0 && <p className="text-slate-500 text-sm">No complaints submitted.</p>}
              {cp.slice(0, 8).map(c => (
                <div key={c.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-white text-sm truncate max-w-[200px]">{c.observation}</div>
                  <Badge variant="outline" className={
                    c.status === 'resolved' ? 'border-emerald-600/50 text-emerald-300' :
                    c.status === 'reviewed' ? 'border-blue-600/50 text-blue-300' :
                    'border-amber-600/50 text-amber-300'
                  }>{c.status}</Badge>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </RoleGuard>
  );
}