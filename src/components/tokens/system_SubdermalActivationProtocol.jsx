import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  UserCheck,
  AlertTriangle,
  Cpu,
  Dna,
  FileCheck2,
  XCircle,
} from 'lucide-react';

const PROTOCOL_GATES = [
  {
    step: 'Gate 1',
    title: 'Zero-Trust Inert State (RF Read-Lock)',
    desc: 'Subdermal chip ships and implants in a cryptographically locked state. Near-field / telemetry reads return null while unidentified.',
    icon: Lock,
  },
  {
    step: 'Gate 2',
    title: 'CLIA DNA Hash Binding (≥ 95% Confidence)',
    desc: 'Biological saliva/blood sample hash must match the registrant profile before any commissioning key can be staged.',
    icon: Dna,
  },
  {
    step: 'Gate 3',
    title: 'Mandatory Manual Identity Check',
    desc: 'An authorized verifier must manually inspect government photo ID, clinical enrollment dossier, and live physical presence.',
    icon: UserCheck,
  },
  {
    step: 'Gate 4',
    title: 'Read-Lock Release & Commissioning',
    desc: 'Only when all checks pass is the RF read-lock released. Any failed or premature attempt logs a Token Activation Failure and locks for manual intervention.',
    icon: ShieldCheck,
  },
];

export default function SystemSubdermalActivationProtocol() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [selectedRegId, setSelectedRegId] = useState('');
  const [chipSerial, setChipSerial] = useState('HLXV-SUB-9042');
  const [holderEmail, setHolderEmail] = useState(user?.email || '');
  const [verifierEmail, setVerifierEmail] = useState(user?.email || '');
  const [dossierRef, setDossierRef] = useState('');
  const [dnaConfidence, setDnaConfidence] = useState(98);
  const [govIdChecked, setGovIdChecked] = useState(false);
  const [livePresenceChecked, setLivePresenceChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const { data: registrations = [] } = useQuery({
    queryKey: ['bioVerifyRegs'],
    queryFn: () => base44.entities.HelixVerifyRegistration.list('-created_date', 100),
  });

  const { data: failureLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['tokenActivationFailureLogs'],
    queryFn: async () => {
      const res = await base44.entities.SecurityLog.filter(
        { event_type: 'token_activation_failure' },
        '-created_date',
        30
      );
      return Array.isArray(res) ? res : res?.items || [];
    },
    refetchInterval: 15000,
  });

  const handleSelectRegistration = (regId) => {
    setSelectedRegId(regId);
    const found = registrations.find((r) => r.id === regId);
    if (found) {
      setChipSerial(found.token_serial || '');
      setHolderEmail(found.registered_by_email || user?.email || '');
      setDnaConfidence(found.biometric_confidence ?? 98);
      setDossierRef(found.identity_document_ref || '');
      setGovIdChecked(Boolean(found.manual_identity_verified));
      setLivePresenceChecked(Boolean(found.manual_identity_verified));
    }
  };

  const logActivationFailure = async (serial, email, reason) => {
    await base44.entities.SecurityLog.create({
      event_type: 'token_activation_failure',
      success: false,
      threat_level: 'high',
      ip_address: 'subdermal-commissioning-gate',
      details: `Token Activation Failure [${serial}] for ${email || 'unidentified subject'}: ${reason} — Chip remains RF Read-Locked. Manual intervention required.`,
    });

    if (selectedRegId && user?.role === 'admin') {
      const current = registrations.find((r) => r.id === selectedRegId);
      await base44.entities.HelixVerifyRegistration.update(selectedRegId, {
        form_factor: 'subdermal_chip',
        registration_status: 'manual_review_required',
        manual_identity_verified: false,
        rf_read_lock_engaged: true,
        manual_intervention_required: true,
        activation_failure_count: (current?.activation_failure_count || 0) + 1,
        last_failure_reason: reason,
      });
    }

    qc.invalidateQueries({ queryKey: ['tokenActivationFailureLogs'] });
    qc.invalidateQueries({ queryKey: ['bioVerifyRegs'] });
    qc.invalidateQueries({ queryKey: ['securityLogs'] });
    qc.invalidateQueries({ queryKey: ['secMonitorLogs'] });
  };

  const handleAttemptActivation = async () => {
    if (!chipSerial.trim()) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const missingChecks = [];
      if (!govIdChecked) missingChecks.push('Government ID & Dossier not manually verified');
      if (!livePresenceChecked) missingChecks.push('Live physical presence attestation missing');
      if (!dossierRef.trim()) missingChecks.push('Identity Document / Dossier Reference missing');
      if (!verifierEmail.trim()) missingChecks.push('Authorized Verifier email missing');
      if (Number(dnaConfidence) < 95) {
        missingChecks.push(`DNA match confidence (${dnaConfidence}%) below 95% threshold`);
      }

      if (missingChecks.length > 0) {
        const reason = missingChecks.join('; ');
        await logActivationFailure(chipSerial.trim(), holderEmail.trim() || user?.email, reason);
        setFeedback({
          type: 'error',
          title: 'Token Activation Failure Logged — Manual Intervention Required',
          message: `Subdermal chip ${chipSerial.trim()} remains RF Read-Locked and cannot be read or used. Failure reason: ${reason}.`,
        });
        return;
      }

      // All manual identity & biometric checks passed
      if (selectedRegId && user?.role === 'admin') {
        await base44.entities.HelixVerifyRegistration.update(selectedRegId, {
          form_factor: 'subdermal_chip',
          registration_status: 'activated',
          biometric_confidence: Number(dnaConfidence),
          manual_identity_verified: true,
          identity_verifier_email: verifierEmail.trim(),
          identity_document_ref: dossierRef.trim(),
          rf_read_lock_engaged: false,
          manual_intervention_required: false,
          activation_date: new Date().toISOString(),
        });
      }

      // Create or update active HelixVerifyToken record with RF read-lock released
      const existingTokens = await base44.entities.HelixVerifyToken.filter({
        device_id: chipSerial.trim(),
      });
      const tokenList = Array.isArray(existingTokens)
        ? existingTokens
        : existingTokens?.items || [];

      if (tokenList.length > 0) {
        await base44.entities.HelixVerifyToken.update(tokenList[0].id, {
          form_factor: 'subdermal_chip',
          is_active: true,
          manual_identity_verified: true,
          rf_read_locked: false,
          failed_attempts: 0,
          sync_status: 'synced',
          last_sync_date: new Date().toISOString(),
          last_used: new Date().toISOString(),
        });
      } else {
        await base44.entities.HelixVerifyToken.create({
          device_name: `HelixVerify Subdermal (${chipSerial.trim()})`,
          device_id: chipSerial.trim(),
          form_factor: 'subdermal_chip',
          secret_key: `SUBDERMAL-VERIFIED-${Date.now()}`,
          current_code: String(Math.floor(100000 + Math.random() * 900000)),
          last_code_generated: new Date().toISOString(),
          is_active: true,
          manual_identity_verified: true,
          rf_read_locked: false,
          failed_attempts: 0,
          battery_level: 100,
          sync_status: 'synced',
          last_sync_date: new Date().toISOString(),
          last_used: new Date().toISOString(),
          firmware_version: 'v3.2-subdermal-guard',
          description: `Activated after manual identity check (${dossierRef.trim()}) by ${verifierEmail.trim()}`,
        });
      }

      if (user?.role === 'admin') {
        await base44.entities.SecurityLog.create({
          event_type: 'dna_verified',
          success: true,
          threat_level: 'none',
          ip_address: 'subdermal-commissioning-gate',
          details: `Subdermal HelixVerify chip [${chipSerial.trim()}] activated after manual identity check (Ref: ${dossierRef.trim()}, Verifier: ${verifierEmail.trim()}). RF read-lock released.`,
        });
      }

      qc.invalidateQueries({ queryKey: ['bioVerifyRegs'] });
      qc.invalidateQueries({ queryKey: ['helixVerifyTokenHealth'] });
      qc.invalidateQueries({ queryKey: ['hardwareTokens'] });
      qc.invalidateQueries({ queryKey: ['securityLogs'] });

      setFeedback({
        type: 'success',
        title: 'Manual Identity Verified — Subdermal Chip Activated',
        message: `Chip ${chipSerial.trim()} passed manual identity verification (Ref: ${dossierRef.trim()}). RF read-lock released and token is now active.`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTriggerUnverifiedReadAttempt = async () => {
    if (!chipSerial.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const reason =
        'Unauthorized read/activation attempt before manual identity check completion';
      await logActivationFailure(
        chipSerial.trim(),
        holderEmail.trim() || user?.email,
        reason
      );

      // Also ensure any matching token in HelixVerifyToken is locked & RF read-locked
      const existingTokens = await base44.entities.HelixVerifyToken.filter({
        device_id: chipSerial.trim(),
      });
      const tokenList = Array.isArray(existingTokens)
        ? existingTokens
        : existingTokens?.items || [];
      if (tokenList.length > 0) {
        await base44.entities.HelixVerifyToken.update(tokenList[0].id, {
          is_active: false,
          manual_identity_verified: false,
          rf_read_locked: true,
          failed_attempts: Math.min(3, (tokenList[0].failed_attempts || 0) + 1),
          sync_status: 'error',
        });
      }

      qc.invalidateQueries({ queryKey: ['helixVerifyTokenHealth'] });
      setFeedback({
        type: 'error',
        title: 'Token Activation Failure Logged — Chip Locked',
        message: `Unverified read/activation attempt on ${chipSerial.trim()} was blocked. RF Read-Lock remains engaged and a Token Activation Failure event was recorded for manual intervention.`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const allChecksReady =
    govIdChecked &&
    livePresenceChecked &&
    Boolean(dossierRef.trim()) &&
    Boolean(verifierEmail.trim()) &&
    Number(dnaConfidence) >= 95;

  return (
    <div className="space-y-6">
      {/* Formal Protocol Architecture Banner */}
      <Card className="bg-slate-900/80 border-cyan-500/40">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <CardTitle className="text-white text-xl">
                  Subdermal HelixVerify Formal Activation Protocol
                </CardTitle>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Enforces hardware RF read-lock so a subdermal chip cannot be read or used until manual identity verification and DNA binding both succeed.
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                allChecksReady
                  ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10 self-start md:self-auto'
                  : 'border-amber-500/50 text-amber-300 bg-amber-500/10 self-start md:self-auto'
              }
            >
              {allChecksReady ? (
                <span className="flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5" /> Identity Verified — Ready to Commission
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> RF Read-Lock Engaged (Unreadable Until Identified)
                </span>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {PROTOCOL_GATES.map((gate) => {
              const Icon = gate.icon;
              return (
                <div
                  key={gate.step}
                  className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-cyan-400">
                      {gate.step}
                    </span>
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">{gate.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{gate.desc}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Identity Check & Commissioning Gate */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <FileCheck2 className="w-5 h-5 text-cyan-400" />
              Manual Identity Verification & Chip Activation Gate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {registrations.length > 0 && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Load Existing Enrollment Record (Optional)
                </label>
                <select
                  value={selectedRegId}
                  onChange={(e) => handleSelectRegistration(e.target.value)}
                  className="w-full rounded-md bg-slate-950 border border-slate-700 text-white text-sm px-3 py-2"
                >
                  <option value="">— Enter new or select enrollment record —</option>
                  {registrations.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.token_serial} ({r.registered_by_email}) — {r.registration_status}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Subdermal Chip Serial</label>
                <Input
                  value={chipSerial}
                  onChange={(e) => setChipSerial(e.target.value)}
                  placeholder="HLXV-SUB-XXXX"
                  className="bg-slate-950 border-slate-700 text-white mt-1 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Enrolled Subject Email</label>
                <Input
                  value={holderEmail}
                  onChange={(e) => setHolderEmail(e.target.value)}
                  placeholder="owner@example.com"
                  className="bg-slate-950 border-slate-700 text-white mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">
                  Authorized Identity Verifier Email
                </label>
                <Input
                  value={verifierEmail}
                  onChange={(e) => setVerifierEmail(e.target.value)}
                  placeholder="verifier@reclaimme.security"
                  className="bg-slate-950 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">
                  Gov ID & Dossier Verification Ref
                </label>
                <Input
                  value={dossierRef}
                  onChange={(e) => setDossierRef(e.target.value)}
                  placeholder="ID-VER-2026-8841"
                  className="bg-slate-950 border-slate-700 text-white mt-1 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">CLIA DNA Sample Match Confidence (%)</span>
                <span
                  className={
                    Number(dnaConfidence) >= 95
                      ? 'text-emerald-400 font-semibold'
                      : 'text-red-400 font-semibold'
                  }
                >
                  {dnaConfidence}% {Number(dnaConfidence) >= 95 ? '(Pass)' : '(Below 95% Minimum)'}
                </span>
              </div>
              <Input
                type="number"
                min={0}
                max={100}
                value={dnaConfidence}
                onChange={(e) => setDnaConfidence(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2.5 rounded-lg bg-slate-950/80 p-3.5 border border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Mandatory Manual Identity Check Attestations
              </p>
              <label className="flex items-start gap-2.5 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={govIdChecked}
                  onChange={(e) => setGovIdChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-600"
                />
                <span>
                  I have manually verified the subject’s government-issued photo ID and matched it against their signed DNA enrollment record.
                </span>
              </label>
              <label className="flex items-start gap-2.5 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={livePresenceChecked}
                  onChange={(e) => setLivePresenceChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-600"
                />
                <span>
                  I confirm live, uncoerced physical presence of the identified owner prior to releasing the subdermal chip RF read-lock.
                </span>
              </label>
            </div>

            {feedback && (
              <div
                className={`p-3.5 rounded-lg border text-xs space-y-1 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-red-950/40 border-red-500/50 text-red-200'
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5">
                  {feedback.type === 'success' ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{feedback.title}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{feedback.message}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <Button
                type="button"
                onClick={handleAttemptActivation}
                disabled={submitting || !chipSerial.trim()}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                {submitting ? 'Verifying Gate…' : 'Verify Identity & Activate Subdermal Chip'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleTriggerUnverifiedReadAttempt}
                disabled={submitting || !chipSerial.trim()}
                className="border-red-500/50 text-red-300 hover:bg-red-500/10"
              >
                <AlertTriangle className="w-4 h-4 mr-1.5" />
                Test Unverified Activation Failure
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Token Activation Failure Event Log */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                Token Activation Failure Log
              </CardTitle>
              <Badge
                variant="outline"
                className="border-red-500/50 text-red-300 bg-red-500/10"
              >
                {failureLogs.length} Failures Logged
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Every failed or unverified subdermal activation attempt is recorded as a{' '}
              <span className="font-mono text-red-300">token_activation_failure</span> event requiring manual intervention.
            </p>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <p className="text-slate-500 text-sm py-6 text-center">
                Loading activation failure events…
              </p>
            ) : failureLogs.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-700 rounded-lg bg-slate-900/40">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-slate-300 font-medium">
                  No token activation failures recorded
                </p>
                <p className="text-xs text-slate-500 mt-1 px-4">
                  Any activation attempt without completed manual identity verification will be blocked and logged here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {failureLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-red-950/20 border border-red-500/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-300">
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        TOKEN ACTIVATION FAILURE
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="border-amber-500/50 text-amber-300 bg-amber-500/10 text-[10px] px-1.5 py-0"
                        >
                          Manual Intervention Required
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-red-500/50 text-red-300 bg-red-500/10 text-[10px] px-1.5 py-0 uppercase"
                        >
                          {log.threat_level || 'high'}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{log.details}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Gate: {log.ip_address || 'subdermal-commissioning-gate'}</span>
                      <span>
                        {log.created_date
                          ? new Date(log.created_date).toLocaleString()
                          : 'Just now'}
                      </span>
                    </div>
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