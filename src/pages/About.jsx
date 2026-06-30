import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Dna, Zap, BrainCircuit, Mail, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-black mb-8 gradient-text">
          About Three-Pillar Security System
        </h1>

        <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
          <p>
            The Three-Pillar Security System is a next-generation cybersecurity platform built around three
            interlocking innovations: DNA-based biometric authentication, a real-time moving-target defense system,
            and an AI-driven universal API security layer. Together, these pillars create a security architecture
            that no existing product on the market can match — combining uncopyable identity verification with
            infrastructure that changes faster than attackers can exploit it.
          </p>
          <p>
            The platform is designed for enterprises, government agencies, and security-conscious organizations
            that require the highest level of protection for their APIs, user identities, and sensitive data.
            It is also built for biomedical researchers, hardware engineers, and university labs who can help
            bring the physical DNA breathalyzer prototype to life. Investors and venture partners seeking
            opportunities in the $300B+ cybersecurity market will find a fully functional software platform
            ready for scientific validation and commercialization.
          </p>
          <p>
            The system was built independently by a solo developer based in Texas, USA, without funding,
            a team, or formal backing. Every component — the software architecture, the AI threat detection
            engine, the IP Shield scrambling simulation, the criminal activity monitoring, the role-based
            access controls, and the investor-facing demonstrations — was created from scratch. The
            architecture is proven and fully demonstrated in software. The physical DNA sensor hardware
            prototype is the next frontier, and that is where scientific partners and investors come in.
          </p>
          <p>
            Our mission is simple: make digital identity verification uncopyable, make API security
            self-defending, and make cyberattacks mathematically impractical. We believe security should
            not rely on static credentials or hope that attackers are slower than your defenses. Instead,
            the system continuously reinvents itself — rotating keys, routes, and encryption layers hundreds
            of times per minute — so that by the time an attacker maps your infrastructure, every path
            they discovered has already changed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-blue-950/30 border border-blue-500/40 rounded-xl p-6">
            <Dna className="w-8 h-8 text-blue-400 mb-3" />
            <h2 className="text-lg font-bold text-white mb-2">DNA Authentication</h2>
            <p className="text-sm text-slate-400">
              Saliva-based DNA extraction produces a cryptographic hash that cannot be stolen from a photo,
              recording, or stolen device.
            </p>
          </div>
          <div className="bg-orange-950/30 border border-orange-500/40 rounded-xl p-6">
            <Zap className="w-8 h-8 text-orange-400 mb-3" />
            <h2 className="text-lg font-bold text-white mb-2">IP Shield</h2>
            <p className="text-sm text-slate-400">
              API keys, routes, and encryption layers rotate every 100 milliseconds — 300× faster than
              Google Authenticator.
            </p>
          </div>
          <div className="bg-purple-950/30 border border-purple-500/40 rounded-xl p-6">
            <BrainCircuit className="w-8 h-8 text-purple-400 mb-3" />
            <h2 className="text-lg font-bold text-white mb-2">Forged API</h2>
            <p className="text-sm text-slate-400">
              An AI-driven universal router that detects attack patterns in real time and auto-blocks
              criminal activity across all connected APIs.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Link
            to="/Contact"
            className="inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-4 rounded-lg transition-colors"
          >
            <Mail className="w-5 h-5" /> Get In Touch
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 border border-slate-500 text-slate-300 hover:bg-slate-800 font-bold px-8 py-4 rounded-lg transition-colors"
          >
            Explore the Platform <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="mt-12 flex items-center gap-3 text-slate-500 text-sm">
          <Shield className="w-5 h-5" />
          Three-Pillar Security System · Built independently · Texas, USA · 2024–2026
        </div>
      </div>
    </div>
  );
}