import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck, Trash2, Lock, FileLock2, Clock, Eye, Ban,
  CheckCircle2, ArrowLeft, ScrollText
} from 'lucide-react';

const STANDARDS = [
  { icon: Lock, title: 'Minimum-Necessary Retention', detail: 'We retain only a one-way cryptographic hash of your genetic marker profile — never raw DNA. The hash exists solely to verify your identity at the moment of authentication.' },
  { icon: Clock, title: 'Defined Retention Window', detail: 'Each stored genetic hash carries a mandatory retention expiry date. By default, hashes are retained no longer than 90 days from sample receipt unless you explicitly extend consent.' },
  { icon: Eye, title: 'Immutable Access Logging', detail: 'Every read of a genetic hash is recorded with timestamp, requester identity, and purpose. You are notified of any access to your identity record.' },
  { icon: Ban, title: 'No Secondary Use', detail: 'Genetic data is never used for research, sold to third parties, shared with data brokers, or disclosed to employers or insurers under GINA.' },
];

const DESTRUCTION_STEPS = [
  'You submit a verified destruction request through the platform or via our contact channel.',
  'Your stored genetic hash is permanently deleted from all platform systems within 30 days.',
  'The bound hardware token is revoked, severing the identity link.',
  'Our CLIA-certified lab partner is notified to destroy any residual sample identifiers.',
  'A signed Certificate of Destruction is issued to you as proof of compliance.',
  'A final entry is written to the audit log recording the destruction timestamp.',
];

export default function SharedDestructionPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-rose-400" />
            </div>
            <Badge variant="outline" className="border-rose-500/50 text-rose-300 bg-rose-500/10">
              Policy Document · v1.0
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Privacy Standards & Data Destruction Policy
          </h1>
          <p className="mt-3 text-slate-400 max-w-3xl">
            Our binding commitment for how biological identity information is stored — and how it is
            permanently destroyed. This policy governs the full lifecycle of your stored genetic hash.
          </p>
          <p className="mt-2 text-xs text-slate-500">Last updated: September 2026 · Jurisdiction: Texas, USA</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Privacy standards */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" /> Privacy Standards
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {STANDARDS.map((s) => (
              <Card key={s.title} className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                      <s.icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{s.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.detail}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* What we store */}
        <section>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileLock2 className="w-5 h-5 text-emerald-400" /> What We Actually Store</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-3">
              <p>
                We do <span className="text-rose-400 font-semibold">not</span> store raw biological material, full genome sequences, or health-derivable data on the platform.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-emerald-900/40 bg-emerald-500/5 p-4">
                  <p className="text-xs font-semibold text-emerald-300 mb-2">STORED</p>
                  <ul className="space-y-1 text-xs text-slate-400">
                    <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" /> One-way SHA-256 hash of marker profile</li>
                    <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" /> Hardware token binding reference</li>
                    <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" /> Retention expiry timestamp</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-rose-900/40 bg-rose-500/5 p-4">
                  <p className="text-xs font-semibold text-rose-300 mb-2">NEVER STORED</p>
                  <ul className="space-y-1 text-xs text-slate-400">
                    <li className="flex gap-2"><Ban className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" /> Raw DNA / biological samples</li>
                    <li className="flex gap-2"><Ban className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" /> Full genome or sequencing data</li>
                    <li className="flex gap-2"><Ban className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" /> Health traits or ancestry analysis</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Destruction process */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-400" /> Mandatory Destruction Process
          </h2>
          <Card className="bg-slate-900/50 border-rose-900/40">
            <CardContent className="pt-6">
              <ol className="space-y-4">
                {DESTRUCTION_STEPS.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-rose-500/15 border border-rose-500/40 flex items-center justify-center shrink-0 text-sm font-semibold text-rose-300">
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-300 pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>

        {/* Retention timeline */}
        <section>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-amber-400" /> Retention Timeline</CardTitle>
              <CardDescription>How long each artifact is kept before mandatory destruction.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { item: 'Raw biological sample (at CLIA lab)', period: 'Destroyed immediately after marker extraction', icon: Trash2 },
                  { item: 'Genetic hash on platform', period: '90 days default · extendable only with renewed consent', icon: FileLock2 },
                  { item: 'Hardware token binding', period: 'Revoked on hash destruction or token loss', icon: Lock },
                  { item: 'Audit log entries', period: '7 years (regulatory record retention)', icon: ScrollText },
                ].map((r) => (
                  <div key={r.item} className="flex items-center justify-between gap-3 py-3 border-b border-slate-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <r.icon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-300">{r.item}</span>
                    </div>
                    <span className="text-xs text-slate-500 text-right">{r.period}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-rose-500/5 border border-rose-900/40 text-sm">
          <Trash2 className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-slate-300 font-medium">Ready to request destruction?</p>
            <p className="text-slate-500 text-xs mt-1">
              Submit a verified destruction request via the{' '}
              <Link to="/Contact" className="text-rose-400 hover:underline">Contact page</Link> or through your account dashboard. Certificates of Destruction are issued within 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}