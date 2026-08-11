import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Fingerprint, Dna, ScanLine, CheckCircle2, Cpu, Activity } from 'lucide-react';

const steps = [
  { icon: Cpu, title: 'Unbox & Power On', desc: 'Power on the BioVerify token and confirm the OLED display activates with the device serial number visible.' },
  { icon: ScanLine, title: 'Register Serial', desc: 'Enter the token serial number printed on the device to begin the enrollment record.' },
  { icon: Dna, title: 'DNA / Biometric Capture', desc: 'Collect the saliva sample or backup biometric (fingerprint/facial) and submit for hashing. Confidence must be ≥ 95.' },
  { icon: Activity, title: 'Synchronize', desc: 'Hold the sync button for 3 seconds to pair with the cloud. Sync status must change to "synced".' },
  { icon: Fingerprint, title: 'Activate', desc: 'Complete a live validation code match. The registration status moves to "activated".' }
];
const statusStyle = {
  pending: 'border-amber-600/50 text-amber-300',
  dna_verified: 'border-blue-600/50 text-blue-300',
  activated: 'border-emerald-600/50 text-emerald-300',
  rejected: 'border-red-600/50 text-red-300'
};

export default function BioVerifyTokenEnrollment() {
  const qc = useQueryClient();
  const [serial, setSerial] = useState('');
  const [email, setEmail] = useState('');
  const { data: regs = [], isLoading } = useQuery({ queryKey: ['bioVerifyRegs'], queryFn: () => base44.entities.BioVerifyRegistration.list('-created_date', 100) });

  const createReg = useMutation({
    mutationFn: (data) => base44.entities.BioVerifyRegistration.create(data),
    onSuccess: () => { qc.invalidateQueries(['bioVerifyRegs']); setSerial(''); setEmail(''); }
  });

  const submit = () => {
    if (!serial || !email) return;
    createReg.mutate({ token_serial: serial, registered_by_email: email, registration_status: 'pending', verification_method: 'dna_saliva' });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Fingerprint className="w-7 h-7 text-cyan-400" /> BioVerify Token Enrollment</h1>
        <p className="text-slate-400 mt-1">Step-by-step hardware enrollment, synchronization, and biometric validation.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white">Enrollment Walkthrough</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center"><s.icon className="w-5 h-5 text-cyan-400" /></div>
                  {i < steps.length - 1 && <div className="w-px flex-1 bg-slate-700 my-1" />}
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2"><span className="text-xs text-slate-500">Step {i + 1}</span><h3 className="text-white font-medium">{s.title}</h3></div>
                  <p className="text-sm text-slate-400 mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle className="text-white">Start Enrollment Record</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-slate-400">Token Serial Number</label>
                <Input value={serial} onChange={e => setSerial(e.target.value)} placeholder="BV-XXXX-XXXX" className="bg-slate-950 border-slate-700 text-white mt-1" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Registrant Email</label>
                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="bg-slate-950 border-slate-700 text-white mt-1" />
              </div>
              <Button onClick={submit} disabled={!serial || !email || createReg.isPending} className="bg-cyan-600 hover:bg-cyan-500 text-white">
                {createReg.isPending ? 'Creating…' : 'Create Pending Enrollment'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle className="text-white">Enrollment Records ({regs.length})</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <p className="text-slate-500">Loading…</p> : regs.length === 0 ? <p className="text-slate-500 text-sm">No enrollments yet.</p> : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {regs.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                      <div className="min-w-0">
                        <p className="text-sm text-white font-medium truncate">{r.token_serial}</p>
                        <p className="text-xs text-slate-500">{r.registered_by_email} · {r.verification_method?.replace(/_/g, ' ')}</p>
                      </div>
                      <Badge variant="outline" className={statusStyle[r.registration_status] || 'border-slate-600 text-slate-300'}>{r.registration_status?.replace(/_/g, ' ')}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}