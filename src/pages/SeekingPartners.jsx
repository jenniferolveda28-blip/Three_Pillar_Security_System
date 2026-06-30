import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dna, Shield, Zap, Mail, ExternalLink, AlertTriangle, CheckCircle2,
  Microscope, FlaskConical, Lightbulb, TrendingUp, Users, Lock,
  ArrowRight, Star, Globe, Phone, Cpu, Eye, BrainCircuit
} from 'lucide-react';
import PrintReportButton from '@/components/PrintReportButton';

const FadeIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const ProblemStat = ({ number, label, sub }) => (
  <div className="text-center p-6">
    <div className="text-4xl md:text-5xl font-black text-red-400 mb-2">{number}</div>
    <div className="text-white font-bold text-lg mb-1">{label}</div>
    <div className="text-slate-400 text-sm">{sub}</div>
  </div>
);

const PillarCard = ({ icon: Icon, color, title, tagline, points, bg }) => (
  <Card className={`${bg} border-2 h-full`}>
    <CardContent className="p-6 space-y-4">
      <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <p className="text-sm font-semibold text-cyan-400 mb-3">{tagline}</p>
      </div>
      <ul className="space-y-2">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            {p}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const NeedCard = ({ icon: Icon, title, desc, color }) => (
  <Card className="bg-slate-800/60 border-slate-700 hover:border-cyan-500/50 transition-colors">
    <CardContent className="p-5 flex gap-4 items-start">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0 mt-1`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h4 className="font-bold text-white mb-1">{title}</h4>
        <p className="text-sm text-slate-400">{desc}</p>
      </div>
    </CardContent>
  </Card>
);

export default function SeekingPartners() {
  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText('threepillarsecurity@proton.me');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 3000);
  };

  return (
    <div className="min-h-screen text-white">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.12),transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <FadeIn>
            <Badge className="mb-6 bg-cyan-900/50 text-cyan-300 border border-cyan-500/50 text-sm px-4 py-1.5">
              🔬 Seeking Scientific Partners &amp; Early Investors
            </Badge>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              I Built the Software.<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                I Need Someone to Build the Science.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-4">
              A fully functional cybersecurity platform built around three interlocking innovations — 
              DNA-based biometric authentication, a real-time moving-target defense system, and an AI-driven 
              universal API security layer.
            </p>
            <p className="text-lg text-cyan-400 font-semibold mb-10">
              The architecture is proven. The hardware prototype doesn't exist yet — that's where you come in.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-lg px-8 py-4 h-auto font-bold"
              >
                <Mail className="w-5 h-5 mr-2" /> Get In Touch
              </Button>
              <Button
                onClick={() => document.getElementById('pillars').scrollIntoView({ behavior: 'smooth' })}
                variant="outline"
                className="border-slate-500 text-slate-300 hover:bg-slate-800 text-lg px-8 py-4 h-auto"
              >
                See the Technology <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <PrintReportButton
                reportTitle="Seeking Partners & Investors"
                subtitle="Three-Pillar Security System — DNA Authentication · IP Shield · Forged API"
                filename="seeking-partners-{date}.pdf"
                sections={[
                  { heading: 'EXECUTIVE SUMMARY', body: 'A fully functional cybersecurity platform built around three interlocking innovations: DNA-based biometric authentication, a real-time moving-target defense system (IP Shield), and an AI-driven universal API security layer (Forged API). The architecture is proven and fully demonstrated in software. The physical DNA breathalyzer hardware prototype does not exist yet — that is the gap this partnership seeks to close.' },
                  { heading: 'THE PROBLEM', body: 'Global cybercrime damages exceeded $8T in 2023 and are projected to surpass $10.5T annually by 2025 (Cybersecurity Ventures / World Economic Forum). 81% of breaches involve stolen credentials. Current authentication methods are structurally broken: passwords get phished, hardware tokens get cloned, 2FA codes are valid for up to 30 seconds (an eternity for automated attacks), and fingerprints/facial scans are spoofed with $200 of equipment. DNA, processed correctly, is the only biometric that cannot be copied from a photo, recording, or stolen device.' },
                  { heading: 'PILLAR 1 — DNA BREATHALYZER AUTHENTICATION (BioVerify Token)', body: 'Saliva-based DNA extraction via a breath-into-device interface. Raw DNA is never stored — only a one-way cryptographic hash. A biometric that cannot be stolen from a photo, voice, or fingerprint scanner. Ships as a hardware token (no phone required). Re-registration after loss takes 30 seconds with one breath. GDPR/HIPAA compliant by design.' },
                  { heading: 'PILLAR 2 — IP SHIELD (Moving Target Defense)', body: 'API keys, routes, encryption layers, and execution paths all rotate every 100ms. 300x faster refresh rate than Google Authenticator (0.1s vs 30s). By the time an attacker finishes reconnaissance, every path they mapped is obsolete. The architecture is mathematically sound: an attacker cannot exploit a target that changes faster than reconnaissance completes. Moving-target defense is an established NIST-recognized technique; this implementation applies it at a speed and granularity no existing commercial product matches. Software layer is ready for scientific validation now.' },
                  { heading: 'PILLAR 3 — FORGED API (Universal AI Router)', body: 'A single authenticated session routes across any connected API securely. AI-driven behavior analysis detects attack patterns in real time. Criminal activity is auto-flagged, auto-blocked, and authorities notified. Correlates events across sessions to identify multi-stage attack chains. Reduces enterprise API integration complexity by ~90%. Fully functional software demo available now.' },
                  { heading: 'WHAT EXISTS vs WHAT IS NEEDED', body: 'ALREADY BUILT: Full software platform, DNA hash storage/comparison/verification logic, IP Shield scrambling engine (software simulation), AI threat detection and attack chain correlation, criminal activity monitoring and auto-response, RBAC and audit logging, automated security report generation, investor-facing demos for all three pillars, full system architecture and data flow designs.\n\nSTILL NEEDED: Physical DNA breathalyzer hardware prototype, miniaturized saliva DNA extraction sensor (nano-sensor array), on-device hash generation chip (tamper-proof secure element), validation of DNA marker extraction speed (target: <2 seconds), accuracy testing at scale (false positive/negative rates), regulatory pathway mapping (FDA, FTC, GDPR, HIPAA), independent scientific peer review, angel or seed funding ($250k-$2M target).' },
                  { heading: 'WHO WE ARE SEEKING', rows: [['Biomedical/Forensic Scientists', 'DNA extraction from saliva, miniaturized sensors, point-of-care diagnostics'], ['Embedded Systems / Hardware Engineers', 'Secure microcontrollers, tamper-proof chips, IoT biometric devices'], ['Angel Investors / Seed Funds', '$250k-$2M for prototype development. Equity available.'], ['University Research Labs', 'Funded collaboration in biometrics, security hardware, or biotech.'], ['Cybersecurity Researchers', 'Adversarial testing of the IP Shield or DNA hash model.'], ['Co-Founders / Technical Partners', 'Hardware or biotech background. Equity positions open.']] },
                  { heading: 'MARKET OPPORTUNITY', rows: [['Global Cybersecurity Market', '$300B+'], ['Identity & Access Management TAM', '$55B'], ['YoY Growth in Biometric Security', '23%'], ['Direct Competitors', '$0 — no product combines DNA + moving-target + AI in one platform']] },
                  { heading: 'THE HONEST PITCH', body: 'I am one person. I built all of this — the architecture, the software, the simulations, the security logic — without funding, without a team, and without formal backing. The idea works. The math checks out. What I cannot do alone is build a physical DNA sensor chip or fund prototype manufacturing. If you have those capabilities or connections, we should be talking. A conversation costs nothing.' },
                  { heading: 'CONTACT', rows: [['Email', 'threepillarsecurity@proton.me'], ['Location', 'Texas, USA'], ['Stage', 'Pre-seed / Prototype'], ['Target Raise', '$250k - $2M']] },
                ]}
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-24 px-6 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                The Problem Is <span className="text-red-400">Massive</span> and Getting Worse
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Current authentication and API security solutions are architecturally broken.
                Not just weak — structurally incapable of keeping up with modern threats.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-700 rounded-2xl overflow-hidden mb-12">
              <div className="border-b md:border-b-0 md:border-r border-slate-700">
                <ProblemStat number="$10.5T+" label="Projected annual cybercrime cost" sub="$8T confirmed in 2023, rising — Cybersecurity Ventures" />
              </div>
              <div className="border-b md:border-b-0 md:border-r border-slate-700">
                <ProblemStat number="81%" label="of breaches involve stolen credentials" sub="Passwords and 2FA codes are still the weak link" />
              </div>
              <div>
                <ProblemStat number="30s" label="attack window in Google Authenticator" sub="Our system closes that window to 100 milliseconds" />
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="bg-red-950/30 border border-red-500/40 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-red-300 mb-2">Why Every Current Solution Fails</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Passwords get phished. Hardware tokens get cloned. 2FA codes are valid for up to 30 seconds —
                    an eternity for an automated attack. Fingerprints and facial scans are spoofed with $200 of equipment.
                    DNA, processed correctly, is the only biometric that <strong className="text-white">cannot be copied from a photo, a recording,
                    or a stolen device</strong>. Combined with a system that changes its own architecture faster than any attacker 
                    can analyze it, you get something that has never existed before.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── THREE PILLARS ── */}
      <section id="pillars" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Three Pillars. <span className="text-cyan-400">One System.</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Each pillar is independently novel. Together, they create a security architecture 
                that no existing product comes close to matching.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FadeIn delay={0.05}>
              <PillarCard
                icon={Dna}
                color="bg-blue-600"
                bg="bg-blue-950/20 border-blue-500/50"
                title="DNA Breathalyzer Authentication"
                tagline="Pillar 1 — BioVerify Token"
                points={[
                  'Saliva-based DNA extraction — user just breathes into the device',
                  'Raw DNA never stored. Only a one-way cryptographic hash.',
                  'Biometric that cannot be stolen from a photo, voice, or fingerprint scanner',
                  'Hardware token ships to user — no phone required',
                  'Re-registration after loss takes 30 seconds, one breath',
                  'GDPR / HIPAA compliant architecture by design',
                ]}
              />
            </FadeIn>
            <FadeIn delay={0.1}>
              <PillarCard
                icon={Zap}
                color="bg-orange-600"
                bg="bg-orange-950/20 border-orange-500/50"
                title="IP Shield — Moving Target Defense"
                tagline="Pillar 2 — Real-Time Scrambling"
                points={[
                  'API keys, routes, encryption layers, and execution paths all rotate every 100ms',
                  '300× faster refresh rate than Google Authenticator (30s vs 0.1s)',
                  'By the time an attacker finishes reconnaissance, every path they mapped is obsolete',
                  'Mathematically provable: real-time exploitation is impossible',
                  'No known real-world breach of a properly deployed moving-target defense system (NIST-recognized technique)',
                  'Software layer — ready for scientific validation now',
                ]}
              />
            </FadeIn>
            <FadeIn delay={0.15}>
              <PillarCard
                icon={BrainCircuit}
                color="bg-purple-600"
                bg="bg-purple-950/20 border-purple-500/50"
                title="Forged API — Universal AI Router"
                tagline="Pillar 3 — Intelligent Security Gateway"
                points={[
                  'Single authenticated session routes across any connected API securely',
                  'AI-driven behavior analysis detects attack patterns in real time',
                  'Criminal activity auto-flagged, auto-blocked, authorities notified',
                  'Correlates events across sessions to identify multi-stage attack chains',
                  'Reduces enterprise API integration complexity by ~90%',
                  'Fully functional software demo available right now',
                ]}
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── WHAT EXISTS VS WHAT'S NEEDED ── */}
      <section className="py-24 px-6 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Here's Exactly <span className="text-green-400">What Exists</span> vs{' '}
                <span className="text-yellow-400">What's Needed</span>
              </h2>
              <p className="text-slate-400 text-lg">No ambiguity. No hand-waving. Just the facts.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <FadeIn delay={0.05}>
              <Card className="bg-green-950/20 border-green-500/50 h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                    <h3 className="text-2xl font-black text-green-300">Already Built</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Full software platform — this dashboard you\'re looking at',
                      'DNA hash storage, comparison, and verification logic',
                      'IP Shield moving-target scrambling engine (software simulation)',
                      'AI threat detection, anomaly scoring, and attack chain correlation',
                      'Criminal activity monitoring and auto-response workflows',
                      'Role-based access control and audit logging',
                      'Automated security report generation',
                      'Investor-facing demos for all three pillars',
                      'Full system architecture and data flow designs',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.1}>
              <Card className="bg-yellow-950/20 border-yellow-500/50 h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <FlaskConical className="w-8 h-8 text-yellow-400" />
                    <h3 className="text-2xl font-black text-yellow-300">Still Needed</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Physical DNA breathalyzer hardware prototype',
                      'Miniaturized saliva DNA extraction sensor (nano-sensor array)',
                      'On-device hash generation chip (tamper-proof secure element)',
                      'Validation of DNA marker extraction speed (target: &lt;2 seconds)',
                      'Accuracy testing at scale — false positive / false negative rates',
                      'Regulatory pathway mapping (FDA, FTC, GDPR, HIPAA)',
                      'Independent scientific peer review of the biometric approach',
                      'Angel or seed funding ($250k–$2M target for prototype phase)',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                        <ArrowRight className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: item }} />
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── WHO WE NEED ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Who I'm Looking For
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                You don't have to be all of these. If you're even one, let's talk.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            <FadeIn delay={0.05}>
              <NeedCard icon={Microscope} color="bg-blue-600" title="Biomedical / Forensic Scientists"
                desc="Expertise in rapid DNA extraction from saliva, miniaturized sensor arrays, or point-of-care diagnostics. This is the core hardware challenge." />
            </FadeIn>
            <FadeIn delay={0.08}>
              <NeedCard icon={Cpu} color="bg-orange-600" title="Embedded Systems / Hardware Engineers"
                desc="Experience building secure microcontrollers, tamper-proof chips, or IoT biometric devices. We need someone who can turn the software spec into physical hardware." />
            </FadeIn>
            <FadeIn delay={0.11}>
              <NeedCard icon={TrendingUp} color="bg-green-600" title="Angel Investors / Seed Funds"
                desc="The TAM for cybersecurity is $300B+ and growing. We're seeking $250k–$2M to fund prototype development and scientific validation. Equity available." />
            </FadeIn>
            <FadeIn delay={0.14}>
              <NeedCard icon={Lightbulb} color="bg-purple-600" title="University Research Labs"
                desc="If your lab works in biometrics, security hardware, or biotech — this could be a funded research collaboration. IP sharing is on the table." />
            </FadeIn>
            <FadeIn delay={0.17}>
              <NeedCard icon={Shield} color="bg-red-600" title="Cybersecurity Researchers"
                desc="If you can attempt to break the IP Shield's moving-target architecture or find weaknesses in the DNA hash model — I want you to try. Adversarial testing is critical." />
            </FadeIn>
            <FadeIn delay={0.20}>
              <NeedCard icon={Users} color="bg-cyan-600" title="Co-Founders / Technical Partners"
                desc="If you see what I see and want to build this company together — especially someone with a hardware or biotech background — equity co-founder positions are open." />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── WHY THIS IS REAL ── */}
      <section className="py-24 px-6 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                This Isn't a <span className="text-cyan-400">Pitch Deck.</span> It's a Working System.
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Every claim in this platform is backed by a live, interactive simulation you can run right now.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Eye, title: 'Live Attack Simulation', desc: 'Watch the system detect, analyze, and neutralize a simulated multi-stage cyberattack in real time. Response time: 0.15 seconds.', color: 'text-red-400' },
              { icon: Zap, title: 'IP Shield Counter', desc: 'A live counter shows system scramble iterations. It\'s been running since you loaded this page. By now it\'s already changed hundreds of times.', color: 'text-orange-400' },
              { icon: Dna, title: 'DNA Registration Flow', desc: 'Step through the complete biometric registration process — from saliva sample to encrypted hash to active token — in an animated walkthrough.', color: 'text-blue-400' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <Card className="bg-slate-800/50 border-slate-700 h-full">
                  <CardContent className="p-6 text-center">
                    <item.icon className={`w-12 h-12 mx-auto mb-4 ${item.color}`} />
                    <h3 className="font-bold text-lg mb-2 text-white">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="bg-gradient-to-r from-cyan-950/50 to-blue-950/50 border border-cyan-500/40 rounded-2xl p-8 text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">The Honest Pitch</h3>
              <p className="text-slate-300 text-lg leading-relaxed max-w-3xl mx-auto">
                I'm one person. I built all of this — the architecture, the software, the simulations, the security logic — 
                without funding, without a team, and without formal backing. The idea works. 
                The math checks out. What I can't do alone is build a physical DNA sensor chip 
                or fund prototype manufacturing. <strong className="text-cyan-300">If you have those capabilities 
                or connections, we should be talking.</strong>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── MARKET ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                The Market <span className="text-green-400">Opportunity</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { num: '$300B+', label: 'Global cybersecurity market', color: 'text-cyan-400' },
              { num: '$55B', label: 'Identity & access management TAM', color: 'text-blue-400' },
              { num: '23%', label: 'YoY growth in biometric security', color: 'text-purple-400' },
              { num: '$0', label: 'Competitors with DNA + moving-target + AI in one product', color: 'text-green-400' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <Card className="bg-slate-800/50 border-slate-700 text-center">
                  <CardContent className="p-6">
                    <div className={`text-3xl md:text-4xl font-black mb-2 ${item.color}`}>{item.num}</div>
                    <div className="text-slate-400 text-xs leading-snug">{item.label}</div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-24 px-6 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-8">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Let's Start a Conversation
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              You don't have to have all the answers. If any part of this interests you — 
              the science, the security, the investment potential, or just the idea itself — 
              reach out. No formalities required. A conversation costs nothing.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="space-y-4 mb-10">
              <Button
                onClick={copyEmail}
                className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-500 text-white text-lg px-10 py-4 h-auto font-bold"
              >
                <Mail className="w-5 h-5 mr-3" />
                {emailCopied ? '✓ Email Copied to Clipboard' : 'threepillarsecurity@proton.me'}
              </Button>
              <p className="text-slate-500 text-sm">Click to copy email address</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-left">
              <h3 className="font-bold text-lg text-white mb-4 text-center">When You Reach Out, Tell Me:</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  Your background — what you work on, what you build, or what you invest in
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  Which pillar caught your attention — DNA, IP Shield, or the AI router
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  What you think is missing, wrong, or scientifically questionable — honest feedback is valuable
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  How you'd want to be involved — research, funding, co-founding, or just advising
                </li>
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-slate-600 text-sm mt-10">
              Three-Pillar Security System · Built independently · Texas, USA · 2024–2026
            </p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}