import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  FlaskConical, ArrowLeft, Copy, Check, FileText, ShieldCheck, Eye
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PLACEHOLDER = '[PLATFORM_NAME]';

const PRIVACY_POLICY = `[PLATFORM_NAME] Privacy Policy

Effective Date: September 2026

1. Overview
[PLATFORM_NAME] provides DNA-based identity authentication and proactive digital exposure removal. This Privacy Policy explains how [PLATFORM_NAME] collects, uses, stores, and destroys biological identity information.

2. Information We Collect
- Biological samples (saliva, blood, or hair) submitted via authorized collection kits.
- A one-way cryptographic hash derived from your genetic marker profile.
- Account identifiers such as your name, email, and hardware token serial.

3. How We Use Your Information
[PLATFORM_NAME] uses your genetic hash solely to verify your identity at the moment of authentication. We never use biological data for research, advertising, or profiling.

4. Storage & Retention
Raw biological material is destroyed at the CLIA-certified lab after marker extraction. The genetic hash is retained no longer than 90 days by default, extendable only with renewed written consent.

5. Data Sharing
[PLATFORM_NAME] does not sell or share genetic data with third parties, data brokers, employers, or insurers. Access by auditors is logged and time-bound.

6. Your Rights
You may request access to, modification of, or full destruction of your stored genetic hash at any time. A Certificate of Destruction is issued within 30 days of a verified request.

7. Security
All identity records are encrypted at rest, access is logged immutably, and the platform operates a moving-target defense to neutralize persistence threats.

8. Contact
For privacy requests, contact the [PLATFORM_NAME] team via the Contact page.`;

const GINA_NOTICE = `[PLATFORM_NAME] GINA Notice

Effective Date: September 2026

This notice is provided in accordance with the Genetic Information Nondiscrimination Act (GINA), 42 U.S.C. § 2000ff, and applicable Texas state genetic privacy law.

What GINA Protects
GINA prohibits employers with 15 or more employees and health insurers from using genetic information in employment or underwriting decisions. [PLATFORM_NAME] supports and enforces these protections.

How [PLATFORM_NAME] Uses Genetic Information
[PLATFORM_NAME] uses your genetic marker hash exclusively for identity authentication. Your genetic information is NOT used to:
- Determine eligibility for employment
- Set health insurance premiums or coverage
- Conduct research of any kind
- Profile or predict health traits

No Secondary Use
Under no circumstances will [PLATFORM_NAME] disclose your genetic information to employers, health insurers, or data brokers.

Your Right to Destruction
Under Texas law you may request destruction of your genetic information at any time. [PLATFORM_NAME] will complete verified destruction within 30 days and issue a Certificate of Destruction.

Questions
Contact the [PLATFORM_NAME] privacy team via the Contact page for any GINA-related inquiries.`;

const TEMPLATES = {
  privacy: { label: 'Privacy Policy', icon: FileText, content: PRIVACY_POLICY },
  gina: { label: 'GINA Notice', icon: ShieldCheck, content: GINA_NOTICE },
};

export default function SystemNameTester() {
  const { toast } = useToast();
  const [name, setName] = useState('Three Pillar Plus');
  const [template, setTemplate] = useState('privacy');
  const [copied, setCopied] = useState(false);

  const rendered = useMemo(
    () => TEMPLATES[template].content.replaceAll(PLACEHOLDER, name || '[PLATFORM_NAME]'),
    [template, name]
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(rendered);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast({ title: 'Copied', description: 'Document text copied to clipboard.' });
    } catch {
      toast({ variant: 'destructive', title: 'Copy failed' });
    }
  };

  const ActiveIcon = TEMPLATES[template].icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-cyan-400 shrink-0"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2"><FlaskConical className="w-5 h-5 text-cyan-400" /> Platform Name Tester</h1>
            <p className="text-xs text-slate-500">Preview how candidate names render inside legal documents</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Test a Name</CardTitle>
              <CardDescription>Type any candidate name and watch it fill the document.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Platform name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Helix Auth"
                  className="bg-slate-950 border-slate-700 font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Document template</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger className="bg-slate-950 border-slate-700"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TEMPLATES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        <span className="flex items-center gap-2"><v.icon className="w-3.5 h-3.5" /> {v.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={copy} variant="outline" className="w-full border-slate-700 text-slate-300">
                {copied ? <Check className="w-4 h-4 mr-1 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? 'Copied' : 'Copy Document'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Eye className="w-4 h-4 text-cyan-400" /> Quick Try</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['Helix Auth', 'NucleusID', 'BioShift', 'Vanta Key', 'GeneBind', 'Verigen'].map((n) => (
                <button
                  key={n}
                  onClick={() => setName(n)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-colors ${name === n ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600'}`}
                >
                  {n}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="border-b border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ActiveIcon className="w-4 h-4 text-cyan-400" /> {TEMPLATES[template].label}
              </CardTitle>
              <span className="text-xs text-slate-500">Rendered with “{name || '[PLATFORM_NAME]'}”</span>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <pre className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans max-h-[70vh] overflow-y-auto">
              {rendered}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}