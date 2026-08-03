import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/RoleGuard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import {
  Watch, KeyRound, Link2, ShieldAlert, Radar, FileSearch,
  ScrollText, MessageSquareWarning
} from 'lucide-react';

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

export default function UserSecurityReport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [complaint, setComplaint] = useState('');

  const devices = useQuery({
    queryKey: ['user-report', 'hardwareTokens'],
    queryFn: () => base44.entities.BioVerifyToken.list('-created_date', 20)
  });
  const rotations = useQuery({
    queryKey: ['user-report', 'scramblingSessions'],
    queryFn: () => base44.entities.ScramblingSession.list('-created_date', 10)
  });
  const linked = useQuery({
    queryKey: ['user-report', 'linkedAccounts'],
    queryFn: () => base44.entities.BioVerifyLinkedAccount.list('-created_date', 20)
  });
  const threats = useQuery({
    queryKey: ['user-report', 'threatCorrelations'],
    queryFn: () => base44.entities.ThreatCorrelation.list('-created_date', 10)
  });
  const exposures = useQuery({
    queryKey: ['user-report', 'exposureFindings'],
    queryFn: () => base44.entities.ExposureRecord.list('-created_date', 50)
  });
  const logs = useQuery({
    queryKey: ['user-report', 'securityLogs'],
    queryFn: () => base44.entities.SecurityLog.list('-created_date', 20)
  });

  const dv = devices.data || [];
  const ro = rotations.data || [];
  const la = linked.data || [];
  const th = threats.data || [];
  const ex = exposures.data || [];
  const lg = logs.data || [];
  const removals = ex.filter(e => ['opt_out_sent', 'pending_verification'].includes(e.status));

  const submitComplaint = useMutation({
    mutationFn: (observation) =>
      base44.entities.AuditFeedback.create({
        auditor_email: user?.email || 'user',
        observation,
        category: 'general',
        severity: 'medium',
        status: 'submitted'
      }),
    onSuccess: () => {
      toast({ title: 'Complaint submitted', description: 'The owner team will review your report.' });
      setComplaint('');
      qc.invalidateQueries({ queryKey: ['user-report'] });
    },
    onError: (e) => toast({ variant: 'destructive', title: 'Submission failed', description: e.message })
  });

  return (
    <RoleGuard allow={['admin', 'owner', 'user', 'auditor']}>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Security Report</h1>
          <p className="text-slate-400 mt-1">
            BioVerify device, CipherPass rotation, linked accounts, threats, exposure findings &amp; removal requests for your account.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Watch} label="BioVerify Devices" value={dv.filter(d => d.is_active).length} accent="bg-cyan-600/30" />
          <StatCard icon={KeyRound} label="Active Rotations" value={ro.filter(r => r.status === 'active').length} accent="bg-amber-600/30" />
          <StatCard icon={Link2} label="Linked Accounts" value={la.length} accent="bg-blue-600/30" />
          <StatCard icon={Radar} label="Exposure Findings" value={ex.length} accent="bg-red-600/30" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Section icon={Watch} title="BioVerify Device Status">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {dv.length === 0 && <p className="text-slate-500 text-sm">No BioVerify devices registered.</p>}
              {dv.slice(0, 8).map(d => (
                <div key={d.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <div className="text-white text-sm font-medium">{d.device_name}</div>
                    <div className="text-xs text-slate-500">{d.device_id}</div>
                  </div>
                  <Badge variant="outline" className={d.is_active ? 'border-emerald-600/50 text-emerald-300' : 'border-slate-600 text-slate-500'}>
                    {d.is_active ? 'active' : 'inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={KeyRound} title="CipherPass Rotation Health">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {ro.length === 0 && <p className="text-slate-500 text-sm">No rotation cycles recorded.</p>}
              {ro.slice(0, 8).map(r => (
                <div key={r.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-white text-sm">{r.scramble_type}</div>
                  <Badge variant="outline" className={
                    r.status === 'active' ? 'border-emerald-600/50 text-emerald-300' :
                    r.status === 'completed' ? 'border-blue-600/50 text-blue-300' :
                    'border-amber-600/50 text-amber-300'
                  }>{r.status}</Badge>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Link2} title="Linked Accounts">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {la.length === 0 && <p className="text-slate-500 text-sm">No linked accounts.</p>}
              {la.slice(0, 8).map(a => (
                <div key={a.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <div className="text-white text-sm">{a.account_provider}</div>
                    <div className="text-xs text-slate-500">{a.account_identifier}</div>
                  </div>
                  <Badge variant="outline" className={
                    a.status === 'active' ? 'border-emerald-600/50 text-emerald-300' : 'border-amber-600/50 text-amber-300'
                  }>{a.status}</Badge>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={ShieldAlert} title="Threat Correlations">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {th.length === 0 && <p className="text-slate-500 text-sm">No threat correlations on your account.</p>}
              {th.slice(0, 8).map(t => (
                <div key={t.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-white text-sm truncate max-w-[220px]">{t.attack_chain_name}</div>
                  <Badge variant="outline" className={
                    t.severity === 'critical' ? 'border-red-600/50 text-red-300' :
                    t.severity === 'high' ? 'border-amber-600/50 text-amber-300' :
                    'border-slate-600 text-slate-300'
                  }>{t.severity}</Badge>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Radar} title="Exposure Findings">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {ex.length === 0 && <p className="text-slate-500 text-sm">No exposure findings recorded.</p>}
              {ex.slice(0, 8).map(e => (
                <div key={e.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <div className="text-white text-sm">{e.broker_name}</div>
                    <div className="text-xs text-slate-500">{(e.exposure_type || '').replace(/_/g, ' ')}</div>
                  </div>
                  <Badge variant="outline" className={
                    e.status === 'scrubbed' ? 'border-emerald-600/50 text-emerald-300' :
                    e.status === 'discovered' ? 'border-red-600/50 text-red-300' :
                    'border-amber-600/50 text-amber-300'
                  }>{e.status}</Badge>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={FileSearch} title="Removal Requests">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {removals.length === 0 && <p className="text-slate-500 text-sm">No active removal requests.</p>}
              {removals.slice(0, 8).map(e => (
                <div key={e.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-white text-sm">{e.broker_name}</div>
                  <Badge variant="outline" className="border-amber-600/50 text-amber-300">{e.status}</Badge>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={ScrollText} title="Your Security Event Log">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {lg.length === 0 && <p className="text-slate-500 text-sm">No security events logged.</p>}
              {lg.slice(0, 8).map(l => (
                <div key={l.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-white text-sm">{l.event_type}</div>
                  <Badge variant="outline" className={
                    l.success ? 'border-emerald-600/50 text-emerald-300' : 'border-red-600/50 text-red-300'
                  }>{l.success ? 'ok' : 'denied'}</Badge>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={MessageSquareWarning} title="Submit a Complaint">
            <div className="space-y-3">
              <Textarea
                placeholder="Describe the issue you want the owner team to review…"
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                rows={4}
                className="bg-slate-950 border-slate-700 text-white"
              />
              <Button
                disabled={!complaint.trim() || submitComplaint.isPending}
                onClick={() => submitComplaint.mutate(complaint.trim())}
                className="bg-cyan-600 hover:bg-cyan-500"
              >
                {submitComplaint.isPending ? 'Submitting…' : 'Submit Complaint'}
              </Button>
            </div>
          </Section>
        </div>
      </div>
    </RoleGuard>
  );
}