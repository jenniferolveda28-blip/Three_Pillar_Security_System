import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Fingerprint, Dna, Wind, Cpu, ShieldCheck, CheckCircle2,
  Loader2, KeyRound, Lock, ScanLine, User, Mail, MapPin, Calendar
} from "lucide-react";
import { useToast } from '@/components/ui/use-toast';

const STEPS = [
  { id: 'identity', label: 'Identity', icon: User },
  { id: 'hardware', label: 'Hardware Binding', icon: Cpu },
  { id: 'sampling', label: 'Biometric Sampling', icon: Dna },
  { id: 'verification', label: 'Verification', icon: ShieldCheck }
];

export default function SelfCertificationForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    birth_year: '',
    location: '',
    token_serial: '',
    dna_sample: false,
    breath_sample: false,
    consent: false
  });

  // Simulated hashing progress
  const [hashProgress, setHashProgress] = useState(0);
  const [hashing, setHashing] = useState(false);

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const canProceed = () => {
    if (step === 0) return formData.full_name && formData.email && formData.birth_year && formData.location;
    if (step === 1) return formData.token_serial && formData.token_serial.length >= 6;
    if (step === 2) return formData.dna_sample && formData.breath_sample && formData.consent;
    return true;
  };

  const simulateHashing = async () => {
    setHashing(true);
    setHashProgress(0);
    for (let i = 0; i <= 100; i += 10) {
      setHashProgress(i);
      await new Promise(r => setTimeout(r, 120));
    }
    setHashing(false);
  };

  const handleNext = async () => {
    if (step === 2 && !hashing && hashProgress === 0) {
      await simulateHashing();
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Generate a simulated DNA hash
      const dnaHash = 'BVFY-' + Math.random().toString(36).substring(2, 18).toUpperCase();

      await base44.entities.TokenRegistration.create({
        token_serial: formData.token_serial,
        registered_by_email: formData.email,
        registration_status: 'dna_verified',
        dna_hash: dnaHash,
        biometric_confidence: 97,
        registration_date: new Date().toISOString(),
        verification_method: 'dna_saliva',
        device_info: {
          full_name: formData.full_name,
          birth_year: formData.birth_year,
          location: formData.location,
          self_certified: true
        }
      });

      setCompleted(true);
      toast({
        title: "Enrollment complete",
        description: `BioVerify token registered with DNA hash ${dnaHash.substring(0, 12)}...`
      });
    } catch (err) {
      toast({ title: "Enrollment failed", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setCompleted(false);
    setStep(0);
    setHashProgress(0);
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      birth_year: '',
      location: '',
      token_serial: '',
      dna_sample: false,
      breath_sample: false,
      consent: false
    });
  };

  if (completed) {
    return (
      <div className="min-h-screen text-slate-100 p-4 md:p-8 max-w-2xl mx-auto flex items-center justify-center">
        <Card className="bg-slate-900/60 border-emerald-500/40 w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Enrollment Successful</h2>
            <p className="text-slate-400 text-sm mb-6">
              Your BioVerify token has been securely registered. The system now recognizes your physical
              token, your DNA hash, and your liveness profile as a single, bound identity.
            </p>
            <div className="bg-slate-800/60 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <Lock className="w-3 h-3" />
                <span className="font-mono">SECURE REGISTRATION RECEIPT</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Registrant:</span><span className="text-slate-200">{formData.full_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Token Serial:</span><span className="text-slate-200 font-mono">{formData.token_serial}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Confidence Score:</span><span className="text-emerald-400">97%</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Method:</span><span className="text-slate-200">DNA Saliva + Breath Liveness</span></div>
              </div>
            </div>
            <Button onClick={reset} variant="outline" className="border-slate-600 text-slate-300">
              Run Another Enrollment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 mb-4">
          <ScanLine className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-mono text-slate-400 tracking-wider">SELF-CERTIFICATION · PROTOTYPE</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">BioVerify Enrollment</h1>
        <p className="text-slate-400 text-sm">Simulated registration flow for testing the BioVerify token enrollment pipeline.</p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => {
          const StepIcon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isActive ? 'bg-cyan-500/20 border-cyan-400' :
                  isDone ? 'bg-emerald-500/20 border-emerald-400' :
                  'bg-slate-800 border-slate-700'
                }`}>
                  {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> :
                   <StepIcon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />}
                </div>
                <span className={`text-xs ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-emerald-500/40' : 'bg-slate-700'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            {(() => {
              const Icon = STEPS[step].icon;
              return <Icon className="w-5 h-5 text-cyan-400" />;
            })()}
            {STEPS[step].label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div>
                <Label className="text-slate-300">Full Legal Name</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => update('full_name', e.target.value)}
                  placeholder="Jane Q. Public"
                  className="bg-slate-800 border-slate-600 text-slate-100 mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">Email Address</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="jane@example.com"
                  className="bg-slate-800 border-slate-600 text-slate-100 mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Birth Year</Label>
                  <Input
                    value={formData.birth_year}
                    onChange={(e) => update('birth_year', e.target.value)}
                    placeholder="1985"
                    className="bg-slate-800 border-slate-600 text-slate-100 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => update('location', e.target.value)}
                    placeholder="Austin, TX"
                    className="bg-slate-800 border-slate-600 text-slate-100 mt-1"
                  />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-sm text-slate-400">
                Enter the serial number printed on your BioVerify hardware token. This binds your identity
                to a specific physical device.
              </p>
              <div>
                <Label className="text-slate-300">Token Serial Number</Label>
                <div className="flex items-center gap-2 mt-1">
                  <KeyRound className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <Input
                    value={formData.token_serial}
                    onChange={(e) => update('token_serial', e.target.value.toUpperCase())}
                    placeholder="BVFY-XXXX-XXXX"
                    className="bg-slate-800 border-slate-600 text-slate-100 font-mono"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Minimum 6 characters. Found on the back of your token.</p>
              </div>
              <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Cpu className="w-4 h-4" />
                  <span>The serial is cryptographically unique and cannot be cloned or duplicated.</span>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-slate-400">
                Simulate collecting your biometric sample. In production, this step uses a saliva swab
                and a breath/liveness sensor.
              </p>

              {/* DNA Sample Toggle */}
              <div
                onClick={() => update('dna_sample', !formData.dna_sample)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${formData.dna_sample ? 'bg-purple-500/10 border-purple-500/40' : 'bg-slate-800/40 border-slate-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Dna className={`w-6 h-6 ${formData.dna_sample ? 'text-purple-400' : 'text-slate-500'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-200">Saliva DNA Sample</p>
                    <p className="text-xs text-slate-500">Click to simulate cheek swab collection</p>
                  </div>
                  {formData.dna_sample && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </div>
              </div>

              {/* Breath Sample Toggle */}
              <div
                onClick={() => update('breath_sample', !formData.breath_sample)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${formData.breath_sample ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-slate-800/40 border-slate-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Wind className={`w-6 h-6 ${formData.breath_sample ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-200">Breath / Liveness Check</p>
                    <p className="text-xs text-slate-500">Click to simulate breathing into the sensor</p>
                  </div>
                  {formData.breath_sample && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </div>
              </div>

              {/* Hashing Progress */}
              {formData.dna_sample && formData.breath_sample && (
                <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-mono text-slate-500 uppercase">One-Way DNA Hashing</span>
                  </div>
                  {hashing ? (
                    <>
                      <Progress value={hashProgress} className="h-2 bg-slate-900 mb-2" />
                      <p className="text-xs text-cyan-400 font-mono">Hashing DNA sample... {hashProgress}%</p>
                    </>
                  ) : hashProgress === 100 ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <p className="text-xs text-emerald-400 font-mono">DNA hash generated. Original sample discarded.</p>
                    </div>
                  ) : (
                    <Button size="sm" onClick={simulateHashing} className="bg-purple-600 hover:bg-purple-500">
                      <Fingerprint className="w-4 h-4 mr-1" /> Generate DNA Hash
                    </Button>
                  )}
                </div>
              )}

              {/* Consent */}
              <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${formData.consent ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-800/40 border-slate-700'}`}>
                <input
                  type="checkbox"
                  checked={formData.consent}
                  onChange={(e) => update('consent', e.target.checked)}
                  className="mt-1 w-4 h-4 accent-emerald-500"
                />
                <span className="text-sm text-slate-300">
                  I consent to my DNA being converted to an irreversible hash for identity verification.
                  I understand my raw genetic data is never stored.
                </span>
              </label>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-sm text-slate-400">
                Review your enrollment details. The system will bind your hardware token, DNA hash, and
                liveness profile into a single verified identity.
              </p>
              <div className="space-y-3 bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-300">{formData.full_name} · {formData.email}</span>
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center gap-3">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-slate-300 font-mono">{formData.token_serial}</span>
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center gap-3">
                  <Dna className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-300">DNA Hash Generated · Breath Verified</span>
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">Confidence Score: 97% · Ready to activate</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0 || submitting}
          className="border-slate-600 text-slate-300"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed() || hashing || submitting}
          className="bg-cyan-600 hover:bg-cyan-500 text-white"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
          {step === STEPS.length - 1 ? (submitting ? 'Registering...' : 'Complete Enrollment') : 'Continue'}
        </Button>
      </div>
    </div>
  );
}