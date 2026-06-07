import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield, Dna, Layers, RefreshCw, BookOpen } from 'lucide-react';
import PrintReportButton from '@/components/PrintReportButton';
import IllegalActivityDetectionDemo from '@/components/investor/IllegalActivityDetectionDemo';
import DNABreathalyzerDemo from '@/components/investor/DNABreathalyzerDemo';
import ThreePillarIntegratedDemo from '@/components/investor/ThreePillarIntegratedDemo';
import TokenReplacementDemo from '@/components/investor/TokenReplacementDemo';
import DemoExplanation from '@/components/investor/DemoExplanation';

export default function InvestorPresentation() {
  const [activeDemo, setActiveDemo] = useState('detection');

  const demos = [
    {
      id: 'detection',
      title: 'Illegal Activity Detection',
      icon: Shield,
      description: 'Real-time threat detection and response',
      component: IllegalActivityDetectionDemo,
      color: 'red'
    },
    {
      id: 'dna',
      title: 'DNA Breathalyzer',
      icon: Dna,
      description: 'Secure biometric registration process',
      component: DNABreathalyzerDemo,
      color: 'blue'
    },
    {
      id: 'integrated',
      title: 'Three Pillars Integration',
      icon: Layers,
      description: 'Complete security ecosystem in action',
      component: ThreePillarIntegratedDemo,
      color: 'purple'
    },
    {
      id: 'replacement',
      title: 'Token Replacement',
      icon: RefreshCw,
      description: 'Fast and secure device replacement',
      component: TokenReplacementDemo,
      color: 'green'
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold gradient-text text-center mb-3">
            Live Security Demonstrations
          </h1>
          <p className="text-xl text-slate-400 text-center">
            Interactive demonstrations showcasing our three-pillar security technology
          </p>
          <div className="flex justify-center mt-6">
            <PrintReportButton
              reportTitle="Forged API — Investor Presentation Package"
              subtitle="Three-Pillar Security Architecture · Confidential Investor Copy"
              filename="investor-presentation-hardcopy-{date}.pdf"
              sections={[
                {
                  heading: 'COMPANY OVERVIEW',
                  body: 'Forged API is a next-generation cybersecurity platform built on three interlocking pillars:\n\n  1. BioVerify — DNA breathalyzer biometric authentication\n  2. Forged API — AI-powered multi-universe API gateway\n  3. IP Shield — Real-time 100ms cryptographic scrambling engine\n\nTogether these systems make unauthorized access mathematically infeasible — not merely difficult. This document serves as a hard-copy reference for investors reviewing our technology in detail.'
                },
                {
                  heading: 'DEMO 1 — ILLEGAL ACTIVITY DETECTION',
                  body: 'Real-time threat detection and automated response system.\n\nThe platform continuously monitors all API traffic using AI behavioral analysis. When attack patterns are detected, the system responds in four stages:\n\n  0.05s — Initial anomaly detected (450+ req/s from single IP, matches attack signature)\n  0.08s — AI correlates 4-stage attack chain, confidence 98%\n  0.10s — Emergency scramble triggered: all keys, routes, and encryption layers rotated\n  0.15s — Attacker IP globally blacklisted, sessions terminated, authorities notified\n\nData compromised: ZERO. By the time the attacker analyzes our structure, it has already changed — every piece of reconnaissance becomes obsolete before it can be weaponized.'
                },
                {
                  heading: 'DEMO 2 — DNA BREATHALYZER AUTHENTICATION',
                  body: 'The BioVerify hardware token uses a nano-sensor array to extract DNA markers from a saliva breath sample in under 2 seconds.\n\nRegistration Process:\n  Step 1 — Customer receives hardware token (BioVerify device + fingerprint backup + secure chip)\n  Step 2 — User breathes into device; DNA markers extracted, converted to one-way SHA-256 hash on-device\n  Step 3 — Raw DNA immediately discarded from memory; only hash transmitted\n  Step 4 — Hash encrypted (AES-256-GCM) and transmitted over TLS 1.3 with certificate pinning\n  Step 5 — Token activated; user can authenticate immediately\n\nWhat we store: A mathematical fingerprint. What we cannot do: reconstruct your DNA, share biological data, or expose genetic information in a breach. Fully GDPR, HIPAA, and CCPA compliant.'
                },
                {
                  heading: 'DEMO 3 — THREE PILLARS INTEGRATION (COMPLETE SYSTEM)',
                  body: 'Full end-to-end transaction flow:\n\n  1. User authenticates via DNA breathalyzer — match confidence 99.8%, processed in 0.5s\n  2. Forged API receives DNA-verified session token, routes request via AI scoring\n  3. IP Shield executes 100ms scramble cycle before processing — keys, routes, encryption all rotated\n  4. AI selects optimal Universe (e.g., OpenWeather), uses current scrambled key, makes request\n  5. Attacker intercepts traffic — has 0.05s before next scramble invalidates all intercepted data\n  6. AI threat detection correlates suspicious activity — unusual IP, rapid requests, admin targeting — 97% confidence\n  7. IP Shield completes next cycle — all attacker reconnaissance is now obsolete\n  8. Legitimate user receives data in 0.3s total; attacker blocked, blacklisted, authorities notified'
                },
                {
                  heading: 'DEMO 4 — TOKEN REPLACEMENT PROCESS',
                  body: 'Lost or damaged device handling:\n\n  Immediate revocation: Report lost token → old serial globally revoked in under 1 second. Device becomes inoperable immediately regardless of location.\n\n  Replacement: New BioVerify token ships within 24 hours for $29.99. DNA hash remains safely in cloud — no biological re-collection required.\n\n  Re-activation: Receive new device, open app, breathe once. System matches breath to existing stored hash (99.8% confidence). Full access restored in 30 seconds.\n\n  Key investor point: Your DNA exists ONLY as an encrypted hash. The new token connects to this hash — it does not contain your DNA data. Even if an attacker finds the old device, it is cryptographically dead with no usable data on it.',
                  rows: [
                    ['Revocation Time', '< 1 second globally'],
                    ['Replacement Cost', '$29.99 one-time hardware fee'],
                    ['Shipping Time', '2–3 days (express available)'],
                    ['Re-registration Time', '30 seconds — one breath'],
                    ['DNA Re-collection Required', 'NO — hash already stored securely'],
                  ]
                },
                {
                  heading: 'COMPETITIVE ADVANTAGE SUMMARY',
                  rows: [
                    ['Authentication Factor', 'DNA (cannot be stolen, phished, or guessed)'],
                    ['IP Shield vs. Google Authenticator', '300x faster (100ms vs. 30 seconds)'],
                    ['Attacker Exploit Window', '0.1 seconds (vs. industry standard 30 seconds)'],
                    ['Successful Breaches', 'ZERO by mathematical design'],
                    ['Security Layers Per Request', '5 (vs. 1 for traditional MFA)'],
                    ['API Failover Time', '< 50ms automatic rerouting'],
                    ['System Uptime', '99.9%+ across all Universe providers'],
                    ['Regulatory Compliance', 'GDPR · HIPAA · CCPA — fully compliant'],
                    ['Enterprise Target Price', '$500–$5,000/month SaaS + $29.99/user device'],
                    ['TAM — API Security', '$5.1B growing 22% YoY'],
                    ['TAM — Biometric Auth', '$43B growing 19% YoY'],
                  ]
                },
                {
                  heading: 'CONTACT & NEXT STEPS',
                  body: 'This document is confidential and intended solely for the use of the named investor recipient.\n\nTo schedule a live technical demonstration, request due diligence materials, or discuss investment terms, please contact the Forged API investor relations team.\n\nAll technology described herein is patent-pending. Unauthorized reproduction or distribution of this document is prohibited.'
                },
              ]}
            />
          </div>
        </div>

        {/* Navigation & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <Card className="bg-slate-900/50 border-slate-700 sticky top-6">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                  Demo Navigation
                </h3>
                <div className="space-y-2">
                  {demos.map((demo) => {
                    const Icon = demo.icon;
                    const isActive = activeDemo === demo.id;
                    return (
                      <Button
                        key={demo.id}
                        onClick={() => setActiveDemo(demo.id)}
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          isActive 
                            ? `bg-${demo.color}-600 hover:bg-${demo.color}-700` 
                            : 'hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <div className="text-left flex-1">
                          <div className="font-semibold">{demo.title}</div>
                          <div className="text-xs opacity-70">{demo.description}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-6">
              {demos.map((demo) => {
                const DemoComponent = demo.component;
                return (
                  <TabsContent key={demo.id} value={demo.id} className="space-y-6">
                    {/* AI-Generated Explanation Section */}
                    <DemoExplanation demoId={demo.id} demoTitle={demo.title} />

                    {/* Interactive Demo */}
                    <DemoComponent />
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}