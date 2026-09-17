import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dna, ArrowLeft, ArrowRight, CheckCircle2, Droplet, Syringe, Scissors,
  ShieldCheck, FileLock2, Lock, Mail, Ban, CalendarClock, PenLine, X
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const STEPS = [
  { key: 'overview', label: 'Overview' },
  { key: 'collection', label: 'Collection' },
  { key: 'storage', label: 'Long-Term Storage' },
  { key: 'usage', label: 'Specific Usage' },
  { key: 'sign', label: 'Review & Sign' },
];

const SAMPLE_TYPES = [
  { value: 'saliva', label: 'Saliva', icon: Droplet, detail: 'Non-invasive cheek swab or saliva tube. Most common.' },
  { value: 'blood', label: 'Blood', icon: Syringe, detail: 'Finger-prick card. Highest marker yield.' },
  { value: 'hair', label: 'Hair', icon: Scissors, detail: 'Hair follicle sample with root intact.' },
];

const RETENTION_OPTIONS = [
  { value: '90_days', label: '90 Days', detail: 'Standard default. Shortest retention window.' },
  { value: '1_year', label: '1 Year', detail: 'Extended authentication convenience.' },
  { value: '3_years', label: '3 Years', detail: 'Long-term binding without re-enrollment.' },
  { value: 'indefinite_renewal', label: 'Indefinite (Annual Renewal)', detail: 'Continues until withdrawn; requires annual re-consent.' },
];

export default function SharedDnaEnrollment() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [data, setData] = useState({
    enroll_name: '',
    enroll_email: '',
    sample_type: 'saliva',
    retention_period: '90_days',
    consent_collection: false,
    consent_storage: false,
    consent_usage: false,
    consent_gina_acknowledged: false,
    signature: '',
  });

  const createMutation = useMutation({
    mutationFn: (payload) => base44.entities.system_DnaEnrollment.create({
      ...payload,
      enrollment_date: new Date().toISOString(),
      status: 'pending',
    }),
    onSuccess: () => {
      setDone(true);
      toast({ title: 'Enrollment submitted', description: 'Your consent record has been saved.' });
    },
    onError: (e) => toast({
      variant: 'destructive',
      title: 'Enrollment failed',
      description: e?.message || 'Could not save your enrollment.',
    }),
  });

  const canAdvance = () => {
    if (step === 0) return !!data.enroll_name && !!data.enroll_email;
    if (step === 1) return data.consent_collection;
    if (step === 2) return data.consent_storage;
    if (step === 3) return data.consent_usage && data.consent_gina_acknowledged;
    if (step === 4) return data.enroll_name && data.enroll_email && data.signature === data.enroll_name;
    return false;
  };

  const submit = () => {
    if (data.signature !== data.enroll_name) {
      toast({ variant: 'destructive', title: 'Signature mismatch', description: 'Your typed signature must match your full name.' });
      return;
    }
    createMutation.mutate(data);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        <Card className="max-w-lg w-full bg-slate-900/50 border-emerald-900/40">
          <CardContent className="pt-10 pb-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold">Enrollment Confirmed</h2>
            <p className="text-slate-400 text-sm mt-2">
              Thank you, {data.enroll_name.split(' ')[0]}. Your consent record is saved and a collection
              kit will be shipped to your address on file. A confirmation email will be sent to{' '}
              <span className="text-slate-300">{data.enroll_email}</span>.
            </p>
            <div className="mt-6 flex gap-2 justify-center">
              <Link to="/destruction-policy"><Button variant="outline" className="border-slate-700 text-slate-300">View Destruction Policy</Button></Link>
              <Link to="/"><Button className="bg-cyan-600 hover:bg-cyan-500">Back to Dashboard</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-cyan-400 shrink-0"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2"><Dna className="w-5 h-5 text-cyan-400" /> DNA Identity Enrollment</h1>
            <p className="text-xs text-slate-500">Guided consent flow · {STEPS[step].label}</p>
          </div>
        </div>
        {/* Stepper */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-4">
          <ol className="flex items-center justify-between gap-1">
            {STEPS.map((s, i) => {
              const state = i < step ? 'done' : i === step ? 'current' : 'todo';
              return (
                <li key={s.key} className="flex items-center gap-1 flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold border ${
                      state === 'done' ? 'bg-cyan-600 border-cyan-600 text-white' :
                      state === 'current' ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300' :
                      'bg-slate-900 border-slate-700 text-slate-500'
                    }`}>
                      {state === 'done' ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-[9px] sm:text-[10px] hidden sm:block ${state === 'todo' ? 'text-slate-600' : 'text-slate-400'}`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 rounded ${i < step ? 'bg-cyan-600' : 'bg-slate-800'}`} />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {step === 0 && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>How DNA Enrollment Works</CardTitle>
              <CardDescription>Before providing consent, please review what enrollment involves.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                {[
                  { icon: Mail, t: 'Request a kit', d: 'After consent, a collection kit is shipped to your address.' },
                  { icon: Dna, t: 'Collect & return sample', d: 'Follow kit instructions, then ship to our CLIA-certified lab.' },
                  { icon: FileLock2, t: 'Hash generated', d: 'The lab extracts a marker profile and destroys raw material.' },
                  { icon: Lock, t: 'Token bound', d: 'The genetic hash is bound to your hardware token for authentication.' },
                ].map((row) => (
                  <div key={row.t} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                      <row.icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{row.t}</p>
                      <p className="text-xs text-slate-500">{row.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <Label className="mb-2">Your details</Label>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input placeholder="Full legal name" value={data.enroll_name} onChange={(e) => setData({ ...data, enroll_name: e.target.value })} className="bg-slate-950 border-slate-700" />
                  <Input type="email" placeholder="Email address" value={data.enroll_email} onChange={(e) => setData({ ...data, enroll_email: e.target.value })} className="bg-slate-950 border-slate-700" />
                </div>
              </div>
              <div>
                <Label className="mb-2">Preferred sample type</Label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {SAMPLE_TYPES.map((st) => {
                    const Icon = st.icon;
                    const selected = data.sample_type === st.value;
                    return (
                      <button key={st.value} type="button" onClick={() => setData({ ...data, sample_type: st.value })}
                        className={`text-left p-3 rounded-lg border transition-colors ${selected ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-950 hover:border-slate-600'}`}>
                        <Icon className={`w-5 h-5 mb-2 ${selected ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <p className="text-sm font-medium">{st.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{st.detail}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <ConsentCard
            stepLabel="Consent 1 of 3"
            icon={Dna}
            title="Consent to Collect a Biological Sample"
            summary="I authorize the platform to collect a biological sample from me for the sole purpose of identity verification."
            terms={[
              `A biological sample (${data.sample_type}) will be collected via an authorized kit shipped to my address.`,
              'Collection is performed by me, at home, following the kit instructions — no in-person clinical visit is required.',
              'The sample is shipped directly to a CLIA-certified laboratory and is never processed on my device or inside the app.',
              'I may withdraw this consent at any time before the lab completes processing, with no penalty.',
              'Collection poses minimal physical risk and is performed only with my voluntary participation.',
            ]}
            checked={data.consent_collection}
            onChange={(v) => setData({ ...data, consent_collection: v })}
          />
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-cyan-400 uppercase tracking-wide">
                  <FileLock2 className="w-3.5 h-3.5" /> Consent 2 of 3 · Long-Term Storage
                </div>
                <CardTitle className="flex items-center gap-2"><FileLock2 className="w-5 h-5 text-cyan-400" /> Consent to Long-Term Storage</CardTitle>
                <CardDescription>I authorize the platform to store a cryptographic hash of my genetic marker profile for the retention period I choose below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Retention selector */}
                <div>
                  <Label className="mb-2 flex items-center gap-2"><CalendarClock className="w-4 h-4 text-amber-400" /> Choose your retention period</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {RETENTION_OPTIONS.map((r) => {
                      const selected = data.retention_period === r.value;
                      return (
                        <button key={r.value} type="button" onClick={() => setData({ ...data, retention_period: r.value })}
                          className={`text-left p-3 rounded-lg border transition-colors ${selected ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 bg-slate-950 hover:border-slate-600'}`}>
                          <p className={`text-sm font-medium ${selected ? 'text-amber-300' : 'text-slate-200'}`}>{r.label}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{r.detail}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    'Raw biological material is destroyed at the lab immediately after marker extraction.',
                    'Only a one-way SHA-256 hash of the marker profile is stored — it cannot be reversed into my genome.',
                    'Storage occurs only for the retention period selected above; "indefinite" requires annual re-consent or it auto-destroys.',
                    'I may request full destruction of the stored hash at any time before expiry, and a Certificate of Destruction will be issued.',
                    'All stored hashes are encrypted at rest and access is immutably logged.',
                  ].map((t, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-cyan-500 mt-1.5 w-1 h-1 rounded-full bg-cyan-500 shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-3 pt-3 border-t border-slate-800">
                  <Checkbox id="consent_storage" checked={data.consent_storage} onCheckedChange={(v) => setData({ ...data, consent_storage: v })} className="mt-0.5 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600" />
                  <label htmlFor="consent_storage" className="text-sm text-slate-300 cursor-pointer">
                    I consent to long-term storage of my genetic hash under the <span className="text-amber-300 font-medium">{RETENTION_OPTIONS.find((r) => r.value === data.retention_period)?.label}</span> retention period I selected.
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-cyan-400 uppercase tracking-wide">
                  <Lock className="w-3.5 h-3.5" /> Consent 3 of 3 · Specific Usage
                </div>
                <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-cyan-400" /> Consent to Specific Usage</CardTitle>
                <CardDescription>I authorize the stored genetic hash to be used only for the specific purpose below — and nothing else.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Authorized */}
                <div className="rounded-lg border border-emerald-900/40 bg-emerald-500/5 p-4">
                  <p className="text-xs font-semibold text-emerald-300 mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> AUTHORIZED USE</p>
                  <p className="text-sm text-slate-300">Verifying my identity at the moment I authenticate with the bound hardware token.</p>
                </div>
                {/* Prohibited */}
                <div className="rounded-lg border border-rose-900/40 bg-rose-500/5 p-4">
                  <p className="text-xs font-semibold text-rose-300 mb-2 flex items-center gap-1.5"><Ban className="w-3.5 h-3.5" /> EXPLICITLY PROHIBITED</p>
                  <ul className="space-y-1.5 text-sm text-slate-400">
                    {['Research, ancestry, or trait analysis', 'Sale or sharing with data brokers', 'Disclosure to employers or health/life insurers (GINA)', 'Marketing, advertising, or profiling', 'Any secondary purpose beyond identity authentication'].map((p) => (
                      <li key={p} className="flex items-start gap-2"><X className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" /> {p}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
                  <Checkbox id="consent_usage" checked={data.consent_usage} onCheckedChange={(v) => setData({ ...data, consent_usage: v })} className="mt-0.5 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600" />
                  <label htmlFor="consent_usage" className="text-sm text-slate-300 cursor-pointer">
                    I consent to use of my genetic hash strictly for identity authentication and acknowledge the prohibited uses listed above.
                  </label>
                </div>
              </CardContent>
            </Card>

            <ConsentCard
              stepLabel="Legal Acknowledgement"
              icon={ShieldCheck}
              title="GINA Acknowledgement & Right of Withdrawal"
              summary="I acknowledge my protections under the Genetic Information Nondiscrimination Act and my right to withdraw."
              terms={[
                'GINA prohibits employers (15+ employees) and health insurers from using my genetic information against me.',
                'Texas state law grants me the right to request destruction of my genetic data at any time.',
                'I may withdraw any of the three consents above at any time; withdrawal triggers destruction of the stored hash within 30 days.',
                'I confirm I have read and understand the Data Destruction Policy.',
              ]}
              checked={data.consent_gina_acknowledged}
              onChange={(v) => setData({ ...data, consent_gina_acknowledged: v })}
            />
          </div>
        )}

        {step === 4 && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PenLine className="w-5 h-5 text-cyan-400" /> Review & Sign</CardTitle>
              <CardDescription>Confirm your consent choices and provide your electronic signature to finalize enrollment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Field label="Name" value={data.enroll_name} />
                <Field label="Email" value={data.enroll_email} />
                <Field label="Sample type" value={SAMPLE_TYPES.find((s) => s.value === data.sample_type)?.label} />
                <Field label="Retention period" value={RETENTION_OPTIONS.find((r) => r.value === data.retention_period)?.label} />
                <Field label="Collection consent" value={data.consent_collection ? 'Granted' : 'Not granted'} ok={data.consent_collection} />
                <Field label="Storage consent" value={data.consent_storage ? 'Granted' : 'Not granted'} ok={data.consent_storage} />
                <Field label="Usage consent" value={data.consent_usage ? 'Granted' : 'Not granted'} ok={data.consent_usage} />
                <Field label="GINA acknowledged" value={data.consent_gina_acknowledged ? 'Yes' : 'No'} ok={data.consent_gina_acknowledged} />
              </div>
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <Label>Electronic signature (type your full legal name)</Label>
                <Input
                  value={data.signature}
                  onChange={(e) => setData({ ...data, signature: e.target.value })}
                  placeholder={data.enroll_name}
                  className="bg-slate-950 border-slate-700 font-mono"
                />
                {data.signature && data.signature !== data.enroll_name && (
                  <p className="text-xs text-amber-400">Signature must exactly match your full name.</p>
                )}
                <p className="text-[11px] text-slate-500">
                  By signing, you confirm that all consents above were given freely and you agree to be bound by them under the platform's Data Destruction Policy.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="border-slate-700 text-slate-300">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => canAdvance() && setStep((s) => s + 1)} disabled={!canAdvance()} className="bg-cyan-600 hover:bg-cyan-500">
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={!canAdvance() || createMutation.isPending} className="bg-emerald-600 hover:bg-emerald-500">
              {createMutation.isPending ? 'Submitting…' : 'Submit Enrollment'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ConsentCard({ stepLabel, icon: Icon, title, summary, terms, checked, onChange }) {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-cyan-400 uppercase tracking-wide">
          <Icon className="w-3.5 h-3.5" /> {stepLabel}
        </div>
        <CardTitle className="flex items-center gap-2"><Icon className="w-5 h-5 text-cyan-400" /> {title}</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {terms.map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
              <span className="text-cyan-500 mt-1.5 w-1 h-1 rounded-full bg-cyan-500 shrink-0" />
              <span>{t}</span>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-3 pt-3 border-t border-slate-800">
          <Checkbox id={title} checked={checked} onCheckedChange={onChange} className="mt-0.5 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600" />
          <label htmlFor={title} className="text-sm text-slate-300 cursor-pointer">
            I have read and agree to the above terms.
          </label>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value, ok }) {
  return (
    <div className="rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2">
      <p className="text-[11px] text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-sm ${ok === true ? 'text-emerald-300' : ok === false ? 'text-rose-300' : 'text-slate-200'}`}>{value || '—'}</p>
    </div>
  );
}