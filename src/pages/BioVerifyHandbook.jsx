import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Cpu, Fingerprint, Shield, Dna, Wind, Lock, Zap, Activity,
  CheckCircle2, KeyRound, FileBadge, ScanLine, BookOpen,
  Eye, ArrowRight, Layers
} from "lucide-react";

const LAYERS = [
  {
    id: 'hardware',
    title: 'The Hardware Layer',
    icon: Cpu,
    color: 'cyan',
    analogy: 'Think of it like a physical key that cannot be copied.',
    description: 'Every BioVerify token is a small physical device. It contains a tiny computer chip that has a unique serial number burned into it at the factory. This number cannot be changed, duplicated, or faked.',
    components: [
      { name: 'Unique Serial Number', plain: 'A one-of-a-kind ID etched into the chip. No two tokens share it.' },
      { name: 'Rolling Code Generator', plain: 'The token displays a new 6-digit code every 3 seconds. By the time someone copies a code, it has already expired.' },
      { name: 'Self-Locking Mechanism', plain: 'If someone tries the wrong code 3 times in a row, the token locks itself. No server needed — the device protects itself.' }
    ]
  },
  {
    id: 'sampling',
    title: 'The Sampling Layer',
    icon: Fingerprint,
    color: 'purple',
    analogy: 'Think of it like a fingerprint scanner, but using your DNA instead.',
    description: 'Before you can use the token, you must prove who you are biologically. The system collects a small saliva sample and checks that you are a living, breathing person.',
    components: [
      { name: 'Saliva DNA Check', plain: 'A cheek swab provides a DNA sample. The system reads specific genetic markers to confirm your identity.' },
      { name: 'Breath/Liveness Check', plain: 'A sensor checks your breathing pattern during the sample. This proves a living person is present — not a stolen or synthetic sample.' },
      { name: 'One-Way Hashing', plain: 'Your DNA is converted into a scrambled code (a "hash"). The original DNA is never stored anywhere. The hash cannot be reversed back into DNA.' }
    ]
  },
  {
    id: 'verification',
    title: 'The Verification Layer',
    icon: Shield,
    color: 'emerald',
    analogy: 'Think of it like a bouncer checking your ID, your face, and your pulse all at once.',
    description: 'When you try to log in, the system checks three things at the same time: that you have the right physical token, that your DNA matches, and that you are alive right now.',
    components: [
      { name: 'Three-Factor Identity Check', plain: 'The system confirms: (1) your physical token, (2) your DNA hash, and (3) your liveness — all in one step.' },
      { name: 'Confidence Scoring', plain: 'Each login attempt gets a score from 0 to 100. If the score is too low, access is denied and the event is logged.' },
      { name: 'Real-Time Audit Log', plain: 'Every action — successful logins, failed attempts, and device locks — is recorded permanently for security teams and auditors to review.' }
    ]
  }
];

const FAQ = [
  {
    q: 'Is my DNA stored anywhere?',
    a: 'No. The system converts your DNA into an irreversible mathematical code (a hash) at enrollment. The original sample and raw genetic data are never saved on any server or device.'
  },
  {
    q: 'What happens if I lose my token?',
    a: 'The token is useless without your biometric match. An admin can revoke the lost token and issue a new one. Your identity stays safe because the physical token alone cannot grant access.'
  },
  {
    q: 'Can someone steal my code?',
    a: 'Codes rotate every 3 seconds, so a stolen code expires almost instantly. Even with the code, the attacker still needs your DNA and a live breath sample to authenticate.'
  },
  {
    q: 'What makes this "audit-proof"?',
    a: 'Every single interaction is logged with a timestamp and cannot be deleted. Auditors receive a complete, tamper-evident record of who accessed what, when, and whether authentication succeeded.'
  }
];

const COLOR_MAP = {
  cyan: { border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  purple: { border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  emerald: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400' }
};

export default function BioVerifyHandbook() {
  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-8 max-w-4xl mx-auto">
      {/* Cover */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 mb-4">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-slate-400 tracking-wider">STAKEHOLDER HANDBOOK · BVFY-HB-1.0</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold gradient-text mb-3">
          BioVerify™ Token
        </h1>
        <p className="text-slate-300 text-xl mb-1">A Plain-Language Guide</p>
        <p className="text-slate-500 text-sm">
          How the BioVerify token protects identity using hardware, biology, and real-time verification.
        </p>
      </div>

      {/* Executive Summary */}
      <Card className="bg-slate-900/60 border-slate-700 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Layers className="w-5 h-5 text-cyan-400" />
            What Is BioVerify?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 leading-relaxed">
            BioVerify is a security token that combines a <span className="text-cyan-400 font-semibold">physical device</span>,
            your <span className="text-purple-400 font-semibold">DNA</span>, and a <span className="text-emerald-400 font-semibold">real-time
            check</span> to confirm you are exactly who you say you are. Traditional passwords can be stolen, guessed, or phished.
            BioVerify replaces passwords with something you <em>have</em> (the token), something you <em>are</em> (your DNA),
            and proof that you are <em>alive</em> (your breath) — making identity theft practically impossible.
          </p>
        </CardContent>
      </Card>

      {/* The Three Layers */}
      <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center gap-2">
        <ScanLine className="w-6 h-6 text-cyan-400" />
        The Three Layers
      </h2>

      {LAYERS.map((layer, idx) => {
        const colors = COLOR_MAP[layer.color];
        const LayerIcon = layer.icon;
        return (
          <div key={layer.id} className="mb-8">
            {idx > 0 && <Separator className="my-6 bg-slate-800" />}

            <div className={`flex items-center gap-4 mb-4 p-4 rounded-xl ${colors.bg} ${colors.border} border`}>
              <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                <LayerIcon className={`w-7 h-7 ${colors.text}`} />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-slate-100">{layer.title}</h3>
                  <Badge variant="outline" className={`${colors.bg} ${colors.text} border-current`}>
                    Layer {idx + 1}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 italic">{layer.analogy}</p>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed mb-4 pl-2">{layer.description}</p>

            <div className="space-y-3">
              {layer.components.map((comp) => (
                <Card key={comp.name} className={`bg-slate-900/40 ${colors.border} border`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <ArrowRight className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                      <div>
                        <h4 className="font-semibold text-slate-200 mb-1">{comp.name}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">{comp.plain}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* How It All Works Together */}
      <Separator className="my-8 bg-slate-800" />
      <Card className="bg-slate-900/60 border-slate-700 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Activity className="w-5 h-5 text-cyan-400" />
            How It All Works Together
          </CardTitle>
          <CardDescription className="text-slate-400">
            A step-by-step walkthrough of a single login attempt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {[
              'You press the button on your BioVerify token. It displays a fresh 6-digit code.',
              'You enter the code into the login screen along with your email.',
              'The system checks that the code is valid and has not expired (3-second window).',
              'The system asks you to provide a saliva swab and breathe into the sensor.',
              'Your DNA is converted to a hash and compared to your stored hash. Your breath confirms you are alive.',
              'The system calculates a confidence score. If it passes, you are granted access.',
              'Every step of this process is recorded permanently in the audit log.'
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-sm font-bold text-cyan-400">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-300 pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Separator className="my-8 bg-slate-800" />
      <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center gap-2">
        <Eye className="w-6 h-6 text-cyan-400" />
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {FAQ.map((item, i) => (
          <Card key={i} className="bg-slate-900/40 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-200">{item.q}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-400 leading-relaxed">{item.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-slate-600 text-xs pt-10 pb-12">
        <p className="font-mono">END OF HANDBOOK · BVFY-HB-1.0</p>
        <p className="mt-1">Three-Pillar Security System © 2024–2026 · Texas, USA</p>
      </div>
    </div>
  );
}