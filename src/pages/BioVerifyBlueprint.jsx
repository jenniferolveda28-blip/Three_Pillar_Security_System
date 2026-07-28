import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Cpu, Fingerprint, Shield, Dna, Wind, Lock, Zap, Activity,
  CheckCircle2, AlertTriangle, KeyRound, FileBadge, ScanLine
} from "lucide-react";

const LAYERS = [
  {
    id: 'hardware',
    title: 'Hardware Interface Layer',
    subtitle: 'The Physical Gate',
    icon: Cpu,
    color: 'cyan',
    description: 'The physical silicon and onboard logic that forms the unclonable foundation of every BioVerify token.',
    components: [
      {
        name: 'Unique Identifier Module (UIM)',
        icon: FileBadge,
        spec: 'Non-clonable silicon ID embedded at manufacture. Cryptographically distinct across all tokens.',
        purpose: 'Ensures every device is globally unique and cannot be replicated or spoofed.'
      },
      {
        name: 'Temporal Cryptography Engine (TCE)',
        icon: KeyRound,
        spec: 'Onboard time-based rolling rotation. Generates a new 6-character authentication key every 3 seconds.',
        purpose: 'Eliminates replay attacks — a intercepted code is useless within seconds.'
      },
      {
        name: 'Local Security State Machine',
        icon: Lock,
        spec: 'Tamper-evident logic. Auto-locks the token after 3 consecutive failed authentication attempts.',
        purpose: 'Neutralizes brute-force attacks at the hardware level before the server is ever contacted.'
      }
    ]
  },
  {
    id: 'biometric',
    title: 'Biometric Acquisition Layer',
    subtitle: 'The DNA Interface',
    icon: Fingerprint,
    color: 'purple',
    description: 'The multi-modal sampling system that converts biological traits into irreversible digital signatures.',
    components: [
      {
        name: 'Saliva-DNA Module',
        icon: Dna,
        spec: 'Analyzes genetic markers (HLA-DRB1, APOE-ε3, CYP2D6, MTHFR, ACE I/D) to establish an Identity Anchor.',
        purpose: 'Binds the physical token to a specific human being — not just a credential.'
      },
      {
        name: 'Breathalyzer / Respiration Sensor',
        icon: Wind,
        spec: 'Monitors steady-state respiration patterns during the sampling window.',
        purpose: 'Liveness Detection — proves the sample comes from a living, breathing subject, not a synthetic replica.'
      },
      {
        name: 'One-Way Hashing Engine',
        icon: Zap,
        spec: '32-byte irreversible cryptographic hash. Converts biological input into a digital signature.',
        purpose: 'No raw genetic data is ever stored on the server or the device. The hash cannot be reversed to recover DNA.'
      }
    ]
  },
  {
    id: 'orchestration',
    title: 'Orchestration & Trust Layer',
    subtitle: 'The Verification Protocol',
    icon: Shield,
    color: 'emerald',
    description: 'The software infrastructure that binds hardware identity to biometric identity and audits every interaction.',
    components: [
      {
        name: 'The Identity Contract',
        icon: FileBadge,
        spec: 'A digital agreement binding the Biometric Hash + Physical Token ID + User Email into a single trust unit.',
        purpose: 'Creates a three-factor identity: What you have (token) + Who you are (DNA) + Proof of liveness (breath).'
      },
      {
        name: 'Confidence Scoring Engine',
        icon: Activity,
        spec: 'Every authentication attempt receives a Biometric Confidence Score (0–100%). Matches below threshold are denied.',
        purpose: 'Prevents degraded or spoofed samples from passing verification.'
      },
      {
        name: 'Real-Time Audit Infrastructure',
        icon: CheckCircle2,
        spec: 'Every interaction — success, failure, lock, unlock — is streamed to the SecurityLog and correlated with threat intelligence.',
        purpose: 'Provides an immutable, machine-audited compliance trail for regulators and auditors.'
      }
    ]
  }
];

const ASSURANCE_POINTS = [
  'No raw biometric data is ever stored — only irreversible 32-byte cryptographic hashes.',
  'Authentication codes expire every 3 seconds, making replay attacks mathematically futile.',
  'Three consecutive failed attempts trigger hardware-level lockdown without server round-trips.',
  'Liveness detection via respiration monitoring prevents synthetic or post-mortem exploitation.',
  'Every system interaction is logged to an immutable audit trail accessible to authorized auditors in real time.'
];

const COLOR_MAP = {
  cyan: { border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
  purple: { border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
  emerald: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' }
};

export default function BioVerifyBlueprint() {
  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-8 max-w-5xl mx-auto">
      {/* Document Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 mb-4">
          <ScanLine className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-slate-400 tracking-wider">ENGINEERING SPECIFICATION · BVFY-REV-1.0</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
          BioVerify™ Token
        </h1>
        <p className="text-slate-400 text-lg">
          System Blueprint & Component Architecture
        </p>
        <p className="text-slate-600 text-sm mt-2">
          Three-Pillar Security System · Texas, USA · Classification: Internal Engineering
        </p>
      </div>

      {/* Security Assurance Summary */}
      <Card className="bg-slate-900/60 border-slate-700 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Shield className="w-5 h-5 text-cyan-400" />
            Security Assurance Summary
          </CardTitle>
          <CardDescription className="text-slate-400">
            The following guarantees are enforced by the BioVerify architecture at all times.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {ASSURANCE_POINTS.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Architecture Layers */}
      {LAYERS.map((layer, idx) => {
        const colors = COLOR_MAP[layer.color];
        const LayerIcon = layer.icon;
        return (
          <div key={layer.id} className="mb-8">
            {idx > 0 && <Separator className="my-6 bg-slate-800" />}

            {/* Layer Header */}
            <div className={`flex items-center gap-4 mb-4 p-4 rounded-xl ${colors.bg} ${colors.border} border`}>
              <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                <LayerIcon className={`w-7 h-7 ${colors.text}`} />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-100">{layer.title}</h2>
                  <Badge variant="outline" className={`${colors.bg} ${colors.text} border-current`}>
                    Layer {idx + 1}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 italic">{layer.subtitle}</p>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-4 pl-2">{layer.description}</p>

            {/* Component Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {layer.components.map((comp) => {
                const CompIcon = comp.icon;
                return (
                  <Card key={comp.name} className={`bg-slate-900/40 ${colors.border} border shadow-lg ${colors.glow}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CompIcon className={`w-5 h-5 ${colors.text}`} />
                        <CardTitle className="text-sm font-semibold text-slate-200 leading-tight">
                          {comp.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      <div>
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-wide mb-1">Specification</p>
                        <p className="text-xs text-slate-300 leading-relaxed">{comp.spec}</p>
                      </div>
                      <Separator className="bg-slate-800" />
                      <div>
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-wide mb-1">Purpose</p>
                        <p className="text-xs text-slate-400 leading-relaxed">{comp.purpose}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Threat Neutralization Matrix */}
      <Separator className="my-8 bg-slate-800" />
      <Card className="bg-slate-900/60 border-slate-700 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Threat Neutralization Matrix
          </CardTitle>
          <CardDescription className="text-slate-400">
            How each layer defends against common attack vectors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wide">
                  <th className="text-left py-2 pr-4">Attack Vector</th>
                  <th className="text-left py-2 pr-4">Neutralized By</th>
                  <th className="text-left py-2">Mechanism</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-800">
                  <td className="py-3 pr-4 font-medium">Replay Attack</td>
                  <td className="py-3 pr-4 text-cyan-400">Hardware Layer</td>
                  <td className="py-3 text-slate-400">3-second code rotation renders intercepted codes useless</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-3 pr-4 font-medium">Brute Force</td>
                  <td className="py-3 pr-4 text-cyan-400">Hardware Layer</td>
                  <td className="py-3 text-slate-400">Hardware lockdown after 3 attempts — no server round-trip needed</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-3 pr-4 font-medium">Credential Phishing</td>
                  <td className="py-3 pr-4 text-purple-400">Biometric Layer</td>
                  <td className="py-3 text-slate-400">DNA + breath cannot be phished or socially engineered</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-3 pr-4 font-medium">Synthetic Identity</td>
                  <td className="py-3 pr-4 text-purple-400">Biometric Layer</td>
                  <td className="py-3 text-slate-400">Liveness detection via respiration monitoring</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Data Breach (Hash Theft)</td>
                  <td className="py-3 pr-4 text-emerald-400">Orchestration Layer</td>
                  <td className="py-3 text-slate-400">One-way hashing — stolen hashes cannot be reversed to recover DNA</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Document Footer */}
      <div className="text-center text-slate-600 text-xs pb-12">
        <p className="font-mono">END OF SPECIFICATION · BVFY-REV-1.0</p>
        <p className="mt-1">Three-Pillar Security System © 2024–2026 · Texas, USA</p>
      </div>
    </div>
  );
}