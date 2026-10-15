import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import {
  ShieldAlert, ShieldCheck, CheckSquare, Activity, AlertTriangle,
  FileWarning, Send, RefreshCw, Lock, Dna, CheckCircle2, Info
} from "lucide-react";

const CHECKLIST_ITEMS = [
  {
    id: 'rebind_helix_token',
    title: '1. Lock Stolen Device & Re-Bind HelixVerify Token',
    desc: 'Revoke any lost hardware or phone session so stolen devices cannot pass verification, and bind a replacement token to your genetic hash.'
  },
  {
    id: 'rotate_cipherpass_keys',
    title: '2. Force CipherPass Gateway Rotation',
    desc: 'Trigger immediate key rotation across linked accounts (Google, email, cloud photos) to invalidate any session cookies captured on the lost device.'
  },
  {
    id: 'scrub_data_brokers',
    title: '3. Scrub Exposed Data-Broker Listings',
    desc: 'Send automated opt-out requests for exposed addresses, phone numbers, and relatives so attackers cannot answer knowledge-based recovery questions.'
  },
  {
    id: 'freeze_credit_bureaus',
    title: '4. Place Fraud Alerts & Credit Freezes',
    desc: 'Contact major credit bureaus (Equifax, Experian, TransUnion) directly to freeze new credit lines while your identity recovery case is active.'
  },
  {
    id: 'log_compromise_case',
    title: '5. Submit Compromised-Identity Case Below',
    desc: 'Record the incident in Reclaim Me to escalate active broker exposures and create an auditable recovery case file.'
  }
];

const COMPROMISE_TYPES = {
  stolen_device_lockout: 'Stolen Phone / Device Account Lockout',
  account_takeover: 'Unauthorized Account Takeover',
  data_broker_impersonation: 'Data-Broker Doxxing / Impersonation',
  unauthorized_financial_activity: 'Suspected Financial / Credit Fraud',
  credential_leak: 'Leaked Credentials / Dark Web Exposure',
  other: 'Other Identity Compromise'
};

export default function UserIdentityTheftProtection({ user, exposureRecords = [], onExposuresUpdated }) {
  const { toast } = useToast();
  const [checkedSteps, setCheckedSteps] = useState(['rebind_helix_token']);
  const [reports, setReports] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    compromise_type: 'stolen_device_lockout',
    severity: 'high',
    affected_accounts: '',
    incident_date: new Date().toISOString().split('T')[0],
    summary: '',
    auto_scrub_triggered: true
  });

  const loadReports = useCallback(async () => {
    if (!user?.email) return;
    const { items } = await base44.entities.user_IdentityCompromiseReport.filter(
      { reporter_email: user.email },
      { sort: '-created_date', limit: 20 }
    );
    setReports(items || []);
  }, [user?.email]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const toggleStep = (id) => {
    setCheckedSteps((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!form.summary.trim()) {
      toast({ title: 'Please describe what happened', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const created = await base44.entities.user_IdentityCompromiseReport.create({
        reporter_email: user?.email || 'anonymous@reclaimme.local',
        reporter_name: user?.full_name || 'Reclaim Me User',
        compromise_type: form.compromise_type,
        severity: form.severity,
        affected_accounts: form.affected_accounts,
        incident_date: form.incident_date,
        summary: form.summary,
        checklist_completed_steps: checkedSteps,
        auto_scrub_triggered: form.auto_scrub_triggered,
        status: 'submitted'
      });

      // Log security event
      await base44.entities.SecurityLog.create({
        event_type: 'suspicious_activity',
        success: true,
        threat_level: form.severity === 'critical' ? 'critical' : 'high',
        details: `Compromised-identity case submitted (${COMPROMISE_TYPES[form.compromise_type]}): ${form.affected_accounts || 'General account recovery'}`
      });

      // If auto-scrub is enabled, escalate any discovered broker exposures to opt_out_sent
      const discovered = exposureRecords.filter((r) => r.status === 'discovered' || r.status === 're_listed');
      if (form.auto_scrub_triggered && discovered.length > 0) {
        const now = new Date().toISOString();
        await Promise.all(
          discovered.map((r) =>
            base44.entities.ExposureRecord.update(r.id, {
              status: 'opt_out_sent',
              opt_out_sent_date: now,
              removal_method: 'automated_opt_out',
              notes: `Auto-escalated via Compromised Identity Report #${created.id?.slice(-6) || 'case'}`
            })
          )
        );
        if (onExposuresUpdated) onExposuresUpdated();
      }

      if (!checkedSteps.includes('log_compromise_case')) {
        setCheckedSteps((prev) => [...prev, 'log_compromise_case']);
      }

      setForm((prev) => ({ ...prev, affected_accounts: '', summary: '' }));
      await loadReports();
      toast({
        title: 'Compromised-Identity Case Recorded',
        description: form.auto_scrub_triggered && discovered.length > 0
          ? `Case logged and ${discovered.length} broker exposure(s) automatically queued for opt-out.`
          : 'Your report has been logged for recovery follow-up.'
      });
    } catch (err) {
      toast({ title: 'Could not submit report', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const discoveredCount = exposureRecords.filter((r) => r.status === 'discovered' || r.status === 're_listed').length;
  const completionPct = Math.round((checkedSteps.length / CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="space-y-6 my-8">
      {/* 1. Protection Overview & Active Monitoring Status */}
      <Card className="bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-cyan-950/30 border-cyan-500/30">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Identity Theft Protection & Active Monitoring
            </CardTitle>
            <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/40 w-fit">
              <Activity className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
              Active Broker Watch Enabled
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-300">
          <p className="leading-relaxed">
            When a phone is stolen or an account is locked, attackers and automated recovery barriers use your exposed personal details against you. <strong className="text-white">Exposure Shield</strong> pairs continuous data-broker scrubbing with <strong className="text-cyan-300">HelixVerify DNA identity anchoring</strong> so you can prove who you are without relying on a missing phone.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase mb-1">
                <Dna className="w-4 h-4" /> What We Protect
              </div>
              <p className="text-xs text-slate-400">
                Binds account recovery to your HelixVerify genetic hash and scrubs leaked PII (addresses, phones, relatives) from people-search sites.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase mb-1">
                <Activity className="w-4 h-4" /> Active Monitoring
              </div>
              <p className="text-xs text-slate-400">
                Tracks {exposureRecords.length} broker listing(s) in real time ({discoveredCount} needing opt-out) and alerts you if scrubbed records are re-listed.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase mb-1">
                <Info className="w-4 h-4" /> Scope & Transparency
              </div>
              <p className="text-xs text-slate-400">
                In-app reports create an internal recovery case and trigger broker opt-outs; external credit freezes or police reports must be filed directly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Action Checklist & 3. Compromised-Identity Reporting Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Checklist */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-400" />
                Identity Recovery Action Checklist
              </CardTitle>
              <span className="text-xs font-mono text-amber-400">
                {checkedSteps.length}/{CHECKLIST_ITEMS.length} Completed ({completionPct}%)
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {CHECKLIST_ITEMS.map((step) => {
              const checked = checkedSteps.includes(step.id);
              return (
                <div
                  key={step.id}
                  onClick={() => toggleStep(step.id)}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer flex items-start gap-3 ${
                    checked
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleStep(step.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className={`text-xs font-semibold ${checked ? 'text-emerald-300 line-through' : 'text-slate-200'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Compromised-Identity Report Form */}
        <Card className="bg-slate-900/50 border-red-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-red-400" />
              Report Compromised Identity or Account Lockout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReport} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Incident Type</label>
                  <Select
                    value={form.compromise_type}
                    onValueChange={(v) => setForm({ ...form, compromise_type: v })}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(COMPROMISE_TYPES).map(([k, label]) => (
                        <SelectItem key={k} value={k}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Severity</label>
                  <Select
                    value={form.severity}
                    onValueChange={(v) => setForm({ ...form, severity: v })}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medium">Medium — Suspicious Activity</SelectItem>
                      <SelectItem value="high">High — Locked Out / Stolen Phone</SelectItem>
                      <SelectItem value="critical">Critical — Active Impersonation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Affected Accounts / Services</label>
                  <Input
                    value={form.affected_accounts}
                    onChange={(e) => setForm({ ...form, affected_accounts: e.target.value })}
                    placeholder="e.g., Google Account, Family Photos, Email"
                    className="bg-slate-950 border-slate-700 text-slate-200 h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Incident Date</label>
                  <Input
                    type="date"
                    value={form.incident_date}
                    onChange={(e) => setForm({ ...form, incident_date: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-slate-200 h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">What Happened & What Needs Recovery *</label>
                <Textarea
                  rows={3}
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Describe the stolen device, locked account, or exposed personal data..."
                  className="bg-slate-950 border-slate-700 text-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="auto_scrub"
                  checked={form.auto_scrub_triggered}
                  onCheckedChange={(v) => setForm({ ...form, auto_scrub_triggered: !!v })}
                />
                <label htmlFor="auto_scrub" className="text-xs text-slate-300 cursor-pointer">
                  Automatically send opt-out requests for all {discoveredCount} discovered data-broker exposure(s)
                </label>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold"
              >
                {submitting ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Recording Case...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Submit Compromised-Identity Report</>
                )}
              </Button>
            </form>

            {/* Recent Submitted Cases */}
            {reports.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Your Recorded Cases ({reports.length})
                </p>
                {reports.slice(0, 3).map((rep) => (
                  <div key={rep.id} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        {COMPROMISE_TYPES[rep.compromise_type] || rep.compromise_type}
                        {rep.affected_accounts ? ` · ${rep.affected_accounts}` : ''}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{rep.summary}</p>
                    </div>
                    <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 text-[10px] shrink-0">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {rep.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}