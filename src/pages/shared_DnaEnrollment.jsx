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
  ShieldCheck, FileLock2, Lock, Mail
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const STEPS = ['Overview', 'Collection Consent', 'Storage Consent', 'Usage Consent', 'Review & Sign'];

const SAMPLE_TYPES = [
  { value: 'saliva', label: 'Saliva', icon: Droplet, detail: 'Non-invasive cheek swab or saliva tube. Most common.' },
  { value: 'blood', label: 'Blood', icon: Syringe, detail: 'Finger-prick card. Highest marker yield.' },
  { value: 'hair', label: 'Hair', icon: Scissors, detail: 'Hair follicle sample with root intact.' },
];

export default function SharedDnaEnrollment() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [data, setData] = useState({
    enroll_name: '',
    enroll_email: '',
    sample_type: 'saliva',
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
    if (step === 0) return true;
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
              kit will be shipped to your address on file. You'll receive a confirmation email at{' '}
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
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-cyan-400 shrink-0"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2"><Dna className="w-5 h-5 text-cyan-400" /> DNA Identity Enrollment</h1>
            <p className="text-xs text-slate-500">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
        </div>
        {/* Progress */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-3 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-cyan-500' : 'bg-slate-800'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {step === 0 && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>How DNA Enrollment Works</CardTitle>
              <CardDescription>Before providing consent, please review what enrollment involves.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            icon={Dna}
            title="Consent to Collect"
            summary="I authorize the platform to collect a biological sample from me for the purpose of identity verification."
            terms={[
              'I understand a biological sample (saliva, blood, or hair) will be collected via an authorized kit.',
              'Collection is performed by me, at home, following the kit instructions — no in-person visit required.',
              'The sample is shipped directly to a CLIA-certified laboratory, never processed on-device or in-app.',
              'I may withdraw this consent at any time before the lab completes processing.',
            ]}
            checked={data.consent_collection}
            onChange={(v) => setData({ ...data, consent_collection: v })}
          />
        )}

        {step === 2 && (
          <ConsentCard
            icon={FileLock2}
            title="Consent to Store"
            summary="I authorize the platform to store a cryptographic hash derived from my genetic marker profile."
            terms={[
              'Raw biological material is destroyed at the lab after marker extraction.',
              'Only a one-way SHA-256 hash of the marker profile is stored — it cannot be reversed into my genome.',
              'The stored hash is retained no longer than 90 days by default, extendable only with renewed consent.',
              'I may request full destruction of the stored hash at any time.',
            ]}
            checked={data.consent_storage}
            onChange={(v) => setData({ ...data, consent_storage: v })}
          />
        )}

        {step === 3 && (
          <div className="space-y-4">
            <ConsentCard
              icon={Lock}
              title="Consent to Use"
              summary="I authorize the stored genetic hash to be used solely for verifying my identity during authentication."
              terms={[
                'The hash is used only to confirm my identity when I authenticate with the hardware token.',
                'My genetic data will never be used for research, sold, or shared with data brokers.',
                'Under GINA, my genetic information will not be disclosed to employers or health insurers.',
                'Every access to my identity record is logged and I am notified.',
              ]}
              checked={data.consent_usage}
              onChange={(v) => setData({ ...data, consent_usage: v })}
            />
            <ConsentCard
              icon={ShieldCheck}
              title="GINA Acknowledgement"
              summary="I acknowledge my protections under the Genetic Information Nondiscrimination Act."
              terms={[
                'I understand GINA prohibits employers and health insurers from using my genetic information against me.',
                'I understand Texas law grants me the right to request destruction of my genetic data at any time.',
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
              <CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-cyan-400" /> Review & Sign</CardTitle>
              <CardDescription>Confirm your details and provide your electronic signature.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Field label="Name" value={data.enroll_name} />
                <Field label="Email" value={data.enroll_email} />
                <Field label="Sample type" value={SAMPLE_TYPES.find((s) => s.value === data.sample_type)?.label} />
                <Field label="Collection consent" value={data.consent_collection ? 'Granted' : 'Not granted'} />
                <Field label="Storage consent" value={data.consent_storage ? 'Granted' : 'Not granted'} />
                <Field label="Usage consent" value={data.consent_usage ? 'Granted' : 'Not granted'} />
                <Field label="GINA acknowledged" value={data.consent_gina_acknowledged ? 'Yes' : 'No'} />
              </div>
              <div className="pt-2 border-t border-slate-800 space-y-2">
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="border-slate-700 text-slate-300"
          >
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

function ConsentCard({ icon: Icon, title, summary, terms, checked, onChange }) {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
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

function Field({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2">
      <p className="text-[11px] text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-slate-200">{value || '—'}</p>
    </div>
  );
}