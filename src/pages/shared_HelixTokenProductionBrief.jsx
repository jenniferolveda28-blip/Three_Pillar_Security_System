import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ShieldCheck, ClipboardList, AlertTriangle, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// All values are PROPOSED targets for the manufacturer to confirm. None are validated.
const HARDWARE = [
  ['Secure element', 'Tamper-resistant chip holding the token secret; secret is non-exportable', 'Must', 'Vendor + part number to be selected'],
  ['Unique device ID', 'Factory-provisioned, read-only, not cloneable', 'Must', 'Provisioned at manufacture'],
  ['Real-time clock', 'Keeps code windows aligned with the server', 'Must', 'Max drift tolerance TBD'],
  ['Code presentation', 'On-device display or secure companion link', 'Must', 'Decision open'],
  ['Form factor', 'Wearable (e.g., wristband), comfortable for daily wear', 'Must', 'Industrial design TBD'],
  ['On-body detection', 'Sensor so a removed token stops issuing codes', 'Should', 'Sensor type TBD'],
  ['Battery', 'Rechargeable or replaceable; low-battery reporting', 'Should', 'Runtime target TBD'],
  ['Durability', 'Water and dust resistance for everyday use', 'Should', 'Rating TBD'],
  ['Tamper response', 'Secret is wiped if the enclosure is opened or the chip is probed', 'Should', 'Method TBD'],
  ['Certifications', 'Radio, safety and regional compliance for chosen hardware', 'Must', 'Applicable list TBD'],
];

const SECURITY = [
  ['Provisioning', 'Secret generated and loaded in a controlled step; never sent in clear text; stored server-side only encrypted.'],
  ['Identity binding', 'DNA-based verification only, via lab-returned genetic hash. No fingerprint, face, voice or password fallback.'],
  ['Genetic data handling', 'Raw sample data is never stored. Only a one-way hash is kept, with the chosen retention period and automated destruction.'],
  ['Server-side authority', 'Activation, lock and revoke are done by trusted server logic and an administrator. Users can only create pending registrations.'],
  ['Lockout', 'Token locks after 3 consecutive failures; recovery is administrator-assisted.'],
  ['Replay and rate limits', 'Each code accepted once per window; verification attempts are rate limited.'],
  ['Firmware integrity', 'Signed firmware; unsigned updates rejected.'],
  ['Audit trail', 'All token events written to a log that end users cannot create, edit or delete.'],
  ['Replacement', 'Lost token is revoked and a new token re-bound to the existing enrollment without a new sample.'],
];

const TESTS = [
  'Independent security review or penetration test with no open critical findings',
  'Prototype units pass code generation, clock accuracy and lockout tests against a test verification service',
  'Lab pilot proves the full path: sample received, hash returned, token activated, replacement re-bound',
  'Environmental and battery tests against targets agreed with the manufacturer',
  'Accuracy figures published only after measured results exist',
];

const OPEN = [
  'Manufacturer, unit cost, minimum order quantity and lead time',
  'Display on the token versus companion-app code presentation',
  'Code refresh interval and clock-drift tolerance',
  'Regulatory certifications required for the selected hardware',
  'Lab partner contract terms for handling, destruction and breach notice',
];

export default function SharedHelixTokenProductionBrief() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-sm mb-1">
              <ClipboardList className="w-4 h-4" /> Production Brief · Draft v0.1
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">HelixVerify Wearable Token: Hardware and Security Brief</h1>
            <p className="text-slate-400 mt-2 text-sm">
              A hand-off brief for manufacturers and security reviewers. It states what the token must be and do.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="shrink-0">
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-200">
            Proposed requirements only. No hardware has been selected, built or tested, and no performance figure is claimed. Items marked TBD need manufacturer input.
          </p>
        </div>

        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader><CardTitle className="text-white text-lg">1. Purpose and scope</CardTitle></CardHeader>
          <CardContent className="text-sm text-slate-300 space-y-2">
            <p>The HelixVerify token is a wearable that produces rotating one-time codes. It is bound to one person through a lab-verified genetic hash and used to prove identity and recover locked-out accounts.</p>
            <p>This brief covers the physical device, its security controls and how it will be accepted for production. Enrollment logistics and platform screens are covered in the <Link to="/helix-token-requirements" className="text-cyan-400 hover:underline">full requirements document</Link>.</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader><CardTitle className="text-white text-lg flex items-center gap-2"><Cpu className="w-5 h-5 text-cyan-400" /> 2. Hardware requirements</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {HARDWARE.map(([name, req, pri, note]) => (
              <div key={name} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white">{name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${pri === 'Must' ? 'border-red-500/40 text-red-300' : 'border-slate-600 text-slate-300'}`}>{pri}</span>
                </div>
                <p className="text-sm text-slate-300 mt-1">{req}</p>
                <p className="text-xs text-amber-300 mt-1">Open item: {note}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader><CardTitle className="text-white text-lg flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-cyan-400" /> 3. Security requirements</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {SECURITY.map(([name, text]) => (
              <div key={name} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                <span className="text-sm font-semibold text-white">{name}</span>
                <p className="text-sm text-slate-300 mt-1">{text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader><CardTitle className="text-white text-lg">4. Acceptance tests before production</CardTitle></CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-1.5 text-sm text-slate-300">
              {TESTS.map((t) => <li key={t}>{t}</li>)}
            </ol>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader><CardTitle className="text-white text-lg">5. Open questions for the manufacturer</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-300">
              {OPEN.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}