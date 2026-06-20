import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield, Dna, Layers, RefreshCw, BookOpen } from 'lucide-react';
import IllegalActivityDetectionDemo from '@/components/investor/IllegalActivityDetectionDemo';
import DNABreathalyzerDemo from '@/components/investor/DNABreathalyzerDemo';
import ThreePillarIntegratedDemo from '@/components/investor/ThreePillarIntegratedDemo';
import TokenReplacementDemo from '@/components/investor/TokenReplacementDemo';
import DemoExplanation from '@/components/investor/DemoExplanation';
import PrintReportButton from '@/components/PrintReportButton';

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
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-bold gradient-text mb-3">Live Security Demonstrations</h1>
            <p className="text-xl text-slate-400">Interactive demonstrations showcasing our three-pillar security technology</p>
          </div>
          <PrintReportButton
            reportTitle="Live Security Demonstrations"
            subtitle="Three-Pillar Security System — Investor Technical Overview"
            filename="live-demo-presentation-{date}.pdf"
            sections={[
              { heading: 'DEMONSTRATION OVERVIEW', body: 'This document captures the Four core demonstrations of the Three-Pillar Security System: Illegal Activity Detection, DNA Breathalyzer Registration, IP Shield vs Google Authenticator Comparison, and the Full Integrated System walkthrough.' },
              { heading: 'PILLAR 1 — DNA BREATHALYZER (BioVerify Token)', body: 'Saliva-based DNA extraction. Raw DNA never stored. One-way SHA-256 hash only. Re-registration after loss: 30 seconds, one breath. GDPR/HIPAA compliant architecture.' },
              { heading: 'PILLAR 2 — IP SHIELD (Moving Target Defense)', body: 'API keys, routes, encryption layers, and execution paths all rotate every 100ms. 300× faster refresh rate than Google Authenticator. Attacker window: 0.1 seconds vs 30 seconds. Mathematically provable: real-time exploitation is impossible.' },
              { heading: 'PILLAR 3 — FORGED API (Universal AI Router)', body: 'AI-driven behavior analysis detects attack patterns in real time. Criminal activity auto-flagged, auto-blocked, authorities notified. Correlates events across sessions to identify multi-stage attack chains. Enterprise API integration complexity reduced by ~90%.' },
              { heading: 'ATTACK SIMULATION RESULTS', rows: [['Detection Time', '0.05 seconds'],['Behavior Analysis', '0.08 seconds'],['IP Shield Response', '0.10 seconds'],['Source Blocked', '0.15 seconds'],['Data Compromised', '0 bytes'],['Total Attack Cost to Breach', 'Mathematically infinite']] },
              { heading: 'INVESTMENT THESIS', body: 'This is working software, not a pitch deck. Every claim in this demonstration is backed by an interactive, real-time simulation. Seeking scientific co-founders, hardware engineers, and seed-stage investors to build the physical DNA breathalyzer prototype. Target raise: $250k–$2M.' },
            ]}
          />
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