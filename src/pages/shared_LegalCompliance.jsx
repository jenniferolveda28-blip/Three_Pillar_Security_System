import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield, ShieldCheck, Dna, FileLock2, Trash2, Stethoscope,
  Gavel, Eye, KeyRound, AlertTriangle, CheckCircle2, FileText, ArrowLeft
} from 'lucide-react';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'collection', label: 'Sample Collection' },
  { id: 'storage', label: 'Storage & Hashing' },
  { id: 'destruction', label: 'Data Destruction' },
  { id: 'compliance', label: 'Regulatory Compliance' },
  { id: 'rights', label: 'Your Rights' },
  { id: 'labs', label: 'Lab Partners' },
  { id: 'breach', label: 'Breach Response' },
];

const COMPLIANCE_FRAMEWORKS = [
  {
    name: 'GINA (Genetic Information Nondiscrimination Act)',
    description: 'Prohibits use of genetic information for employment and health insurance underwriting decisions. We never disclose DNA-derived data to employers or insurers.',
    icon: Gavel,
    level: 'Federal',
  },
  {
    name: 'HIPAA Privacy & Security Rules',
    description: 'All protected health information (PHI) is handled under HIPAA safeguards. Genetic hashes are treated as PHI when associated with an identifiable individual.',
    icon: FileLock2,
    level: 'Federal',
  },
  {
    name: 'Texas Health & Safety Code § 503A',
    description: 'Direct-to-consumer genetic testing requirements followed, including informed consent, written authorization, and right of withdrawal for Texas residents.',
    icon: ShieldCheck,
    level: 'Texas',
  },
  {
    name: 'Texas Genetic Privacy Act',
    description: 'Genetic information may not be collected, retained, or disclosed without explicit written consent. Sample destruction upon request is mandatory within 30 days.',
    icon: Shield,
    level: 'Texas',
  },
  {
    name: 'CLIA-Certified Laboratory Processing',
    description: 'All biological samples are processed exclusively by CLIA-certified partner laboratories operating under a signed Business Associate Agreement (BAA).',
    icon: Stethoscope,
    level: 'Federal',
  },
  {
    name: '21 CFR Part 11 (Electronic Records)',
    description: 'Consent records, audit trails, and electronic signatures meet FDA electronic record integrity standards where applicable.',
    icon: KeyRound,
    level: 'Federal',
  },
];

const HANDLING_PRINCIPLES = [
  {
    icon: Dna,
    title: 'Biological Sample Types',
    detail: 'Saliva, hair follicle, and blood samples are accepted. Samples are collected via authorized kits and shipped directly to a CLIA-certified lab — never processed in-app or on-device.',
    color: 'cyan',
  },
  {
    icon: FileLock2,
    title: 'No Raw DNA Stored',
    detail: 'Once the lab extracts a genetic signature, raw biological material is destroyed. Only a one-way cryptographic hash of the genetic marker profile is returned and stored — the hash cannot be reverse-engineered into your genome.',
    color: 'emerald',
  },
  {
    icon: KeyRound,
    title: 'Hardware-Bound Identity',
    detail: 'The genetic hash is bound to a physical hardware token (TOTP). Authentication requires possession of the token plus a live-generated code — the stored hash alone is never sufficient to authenticate.',
    color: 'amber',
  },
  {
    icon: Trash2,
    title: 'Destruction on Request',
    detail: 'Users may request full destruction of their genetic hash and all associated identity records at any time. Verified destruction is completed within 30 days and a certificate of destruction is issued.',
    color: 'rose',
  },
  {
    icon: Eye,
    title: 'Access Logging',
    detail: 'Every read of a genetic hash is recorded in an immutable audit log with timestamp, requester identity, and purpose. Users receive notifications of any access to their identity record.',
    color: 'violet',
  },
  {
    icon: AlertTriangle,
    title: 'No Secondary Use',
    detail: 'Genetic data is never used for research, sold to third parties, or shared with data brokers. It serves one purpose only: verifying your identity for authentication.',
    color: 'slate',
  },
];

const USER_RIGHTS = [
  'Request a copy of your stored genetic hash profile',
  'Request an audit log of every access to your identity record',
  'Request modification of associated account identifiers',
  'Request full destruction of biological data and identity binding',
  'Withdraw consent at any time without losing app access to non-biometric features',
  'Receive a certificate of destruction within 30 days of a verified request',
  'Lodge a complaint with the platform and, if unresolved, with the Texas Attorney General or HHS Office for Civil Rights',
];

const colorMap = {
  cyan: 'border-cyan-500/40 bg-cyan-500/5 text-cyan-300',
  emerald: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300',
  amber: 'border-amber-500/40 bg-amber-500/5 text-amber-300',
  rose: 'border-rose-500/40 bg-rose-500/5 text-rose-300',
  violet: 'border-violet-500/40 bg-violet-500/5 text-violet-300',
  slate: 'border-slate-500/40 bg-slate-500/5 text-slate-300',
};

export default function SharedLegalCompliance() {
  const [active, setActive] = useState('overview');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-300 bg-emerald-500/10">
              Compliance Document · v1.0
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Biological Data Privacy & Legal Compliance
          </h1>
          <p className="mt-3 text-slate-400 max-w-3xl">
            How we collect, protect, and — when you ask — destroy the sensitive biological identity
            information that powers DNA-based authentication. This document outlines our privacy
            standards and the regulatory frameworks we operate under.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Last updated: September 2026 · Jurisdiction: Texas, USA (with federal applicability)
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-[220px_1fr] gap-8">
        {/* Sidebar nav */}
        <nav className="md:sticky md:top-6 h-fit space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActive(s.id);
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                active === s.id
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="space-y-10">
          {/* Overview */}
          <section id="overview" className="scroll-mt-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-cyan-400" /> Overview</CardTitle>
                <CardDescription>
                  Our platform uses DNA-based biometric authentication — the only identity factor that
                  cannot be forged, stolen, or socially engineered. Because genetic data is among the
                  most sensitive information a person can share, we hold ourselves to the strictest
                  privacy standards in the industry.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <p>
                  We do not store raw DNA. We do not sell genetic data. We do not use your biological
                  information for research, profiling, or any purpose beyond verifying that you are
                  who you claim to be at the moment of authentication.
                </p>
                <p className="text-slate-400">
                  This page explains exactly what we collect, how it is protected, the laws we comply
                  with, and the rights you have over your own biological data at every step.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Handling principles */}
          <section id="collection" className="scroll-mt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Dna className="w-5 h-5 text-cyan-400" /> How We Handle Biological Data
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {HANDLING_PRINCIPLES.map((p) => (
                <Card key={p.title} className={`bg-slate-900/50 border ${colorMap[p.color]}`}>
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorMap[p.color]}`}>
                        <p.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{p.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.detail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Storage & Hashing */}
          <section id="storage" className="scroll-mt-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileLock2 className="w-5 h-5 text-emerald-400" /> Storage & Cryptographic Hashing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-3">
                <p>
                  After a CLIA-certified lab extracts the genetic marker profile from your sample, the
                  raw biological material is destroyed at the lab. A one-way cryptographic hash of the
                  marker profile — a fixed-length string that uniquely identifies your genetic
                  signature — is the only artifact returned to the platform.
                </p>
                <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-4 font-mono text-xs text-slate-400 overflow-x-auto">
                  DNA Sample → CLIA Lab → Marker Profile → SHA-256 Hash → Stored Hash<br />
                  <span className="text-rose-400">[raw sample destroyed]</span> · [hash is irreversible]
                </div>
                <p className="text-slate-400">
                  The hash cannot be used to reconstruct your genome, determine health traits, or
                  identify relatives. It is a verification fingerprint — nothing more.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Destruction */}
          <section id="destruction" className="scroll-mt-6">
            <Card className="bg-slate-900/50 border-rose-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trash2 className="w-5 h-5 text-rose-400" /> Data Destruction Policy</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-3">
                <p>
                  You may request complete destruction of your biological identity data at any time.
                  A verified destruction request triggers:
                </p>
                <ul className="space-y-2">
                  {[
                    'Permanent deletion of your stored genetic hash from all platform systems',
                    'Notification to the CLIA-certified lab to destroy any residual sample identifiers',
                    'Revocation of your hardware token binding',
                    'Issuance of a signed Certificate of Destruction within 30 days',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                      <span className="text-slate-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Compliance frameworks */}
          <section id="compliance" className="scroll-mt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Gavel className="w-5 h-5 text-cyan-400" /> Regulatory Compliance
            </h2>
            <div className="space-y-3">
              {COMPLIANCE_FRAMEWORKS.map((f) => (
                <Card key={f.name} className="bg-slate-900/50 border-slate-800">
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                        <f.icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">{f.name}</h3>
                          <Badge variant="outline" className="text-[10px] py-0 h-5 border-slate-600 text-slate-400">
                            {f.level}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{f.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* User rights */}
          <section id="rights" className="scroll-mt-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-violet-400" /> Your Rights</CardTitle>
                <CardDescription>You retain full control over your biological identity data.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {USER_RIGHTS.map((right) => (
                    <li key={right} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                      <span>{right}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Lab partners */}
          <section id="labs" className="scroll-mt-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Stethoscope className="w-5 h-5 text-emerald-400" /> Laboratory Partners</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-3">
                <p>
                  Biological samples are processed exclusively by CLIA-certified laboratories that have
                  signed a Business Associate Agreement (BAA) with the platform. The BAA legally binds
                  the lab to HIPAA-compliant handling of all samples and derived data.
                </p>
                <p className="text-slate-400">
                  Labs are prohibited from retaining samples beyond the processing window, sharing
                  derived data with third parties, or using samples for any research purpose. Sample
                  destruction at the lab is verified and logged.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Breach response */}
          <section id="breach" className="scroll-mt-6">
            <Card className="bg-slate-900/50 border-amber-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-400" /> Breach Response</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-3">
                <p>
                  In the unlikely event of unauthorized access to identity records, the platform will:
                </p>
                <ol className="space-y-2 list-decimal list-inside marker:text-amber-400">
                  <li>Notify all affected users within 72 hours of confirmed detection</li>
                  <li>Report the breach to the Texas Attorney General and HHS Office for Civil Rights where required</li>
                  <li>Immediately revoke all affected hardware token bindings</li>
                  <li>Provide affected users with re-enrollment at no cost</li>
                  <li>Publish a public incident report within 30 days</li>
                </ol>
              </CardContent>
            </Card>
          </section>

          {/* Footer note */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-500">
            <FileText className="w-4 h-4 shrink-0 mt-0.5 text-slate-600" />
            <p>
              This document is a summary of our compliance posture and does not constitute legal advice.
              For the full Privacy Policy, GINA Notice, or Data Destruction Policy, or to submit a
              data rights request, contact us via the <Link to="/Contact" className="text-cyan-400 hover:underline">Contact page</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}