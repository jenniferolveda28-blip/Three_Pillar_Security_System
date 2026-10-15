import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Dna, Zap, BrainCircuit, Mail, ArrowRight, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function About() {
  return (
    <div className="min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-black mb-8 gradient-text">
          About Reclaim Me
        </h1>

        <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
          <p>
            Reclaim Me is a next-generation authentication platform built on three
            interlocking layers: <strong>HelixVerify</strong> (DNA-based wearable identity anchor with hardware-backed
            rotation and liveness), <strong>CipherPass</strong> (protected key and API gateway layer), and
            <strong> Dynamic Scrambler</strong> (continuous moving-target defense across keys, paths, and encryption
            layers). Together, these capabilities create an authentication architecture that combines uncopyable
            identity verification with infrastructure that changes faster than attackers can exploit it.
          </p>
          <p>
            Beyond core authentication, the platform includes automated data-broker exposure search, one-click
            removal requests, and identity protection as an added benefit for enrolled users. It is designed for
            enterprises, government agencies, and security-conscious organizations, as well as biomedical
            researchers, hardware engineers, and university labs who can help bring the physical HelixVerify
            wearable token prototype to life.
          </p>
          <p>
            The system was built independently by a solo developer based in Texas, USA, without funding,
            a team, or formal backing. Every component — the authentication architecture, the CipherPass gateway,
            the Dynamic Scrambler simulation, the AI threat detection engine, the role-based access controls,
            and the investor-facing demonstrations — was created from scratch. The architecture is demonstrated
            in software, and the physical HelixVerify sensor hardware prototype is the next frontier.
          </p>
          <p>
            Our mission is simple: make digital identity verification uncopyable, make API access
            self-defending, and make credential theft mathematically impractical. Instead of relying on static
            credentials, the system continuously reinvents itself — rotating keys, routes, and encryption layers
            hundreds of times per minute — so that by the time an attacker maps your infrastructure, every path
            they discovered has already changed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-blue-950/30 border border-blue-500/40 rounded-xl p-6">
            <Dna className="w-8 h-8 text-blue-400 mb-3" />
            <h2 className="text-lg font-bold text-white mb-2">1. HelixVerify</h2>
            <p className="text-sm text-slate-400">
              DNA-based wearable identity anchor with hardware-backed rotation and liveness. Produces a cryptographic
              hash that cannot be stolen or forged.
            </p>
          </div>
          <div className="bg-purple-950/30 border border-purple-500/40 rounded-xl p-6">
            <BrainCircuit className="w-8 h-8 text-purple-400 mb-3" />
            <h2 className="text-lg font-bold text-white mb-2">2. CipherPass</h2>
            <p className="text-sm text-slate-400">
              Protected key and API gateway layer with AI-driven routing, real-time threat detection, and automatic
              failover across all connected APIs.
            </p>
          </div>
          <div className="bg-orange-950/30 border border-orange-500/40 rounded-xl p-6">
            <Zap className="w-8 h-8 text-orange-400 mb-3" />
            <h2 className="text-lg font-bold text-white mb-2">3. Dynamic Scrambler</h2>
            <p className="text-sm text-slate-400">
              Continuous moving-target defense rotating API keys, routes, and encryption layers every 100 milliseconds —
              300× faster than standard authenticators.
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
          <button
            onClick={() => {
              const doc = new jsPDF();
              let y = 20;
              doc.setFontSize(20);
              doc.setTextColor(15, 23, 42);
              doc.text('Reclaim Me', 20, y);
              y += 10;
              doc.setFontSize(11);
              doc.setTextColor(100, 116, 139);
              doc.text('Texas, USA · 2024–2026', 20, y);
              y += 12;
              doc.setFontSize(13);
              doc.setTextColor(15, 23, 42);
              doc.text('About', 20, y);
              y += 8;

              const sections = [
                'Reclaim Me is a next-generation authentication platform built on three interlocking layers: HelixVerify (DNA-based wearable identity anchor with hardware-backed rotation and liveness), CipherPass (protected key and API gateway layer), and Dynamic Scrambler (continuous moving-target defense across keys, paths, and encryption layers).',
                'Beyond core authentication, the platform includes automated data-broker exposure search, one-click removal requests, and identity protection as an added benefit. It is designed for enterprises, government agencies, and biomedical/hardware partners helping bring the physical HelixVerify wearable token prototype to life.',
                'The system was built independently by a solo developer based in Texas, USA. Every component — the HelixVerify authentication workflow, CipherPass gateway, Dynamic Scrambler simulation, AI threat detection, and investor demonstrations — was created from scratch.',
                'Our mission is simple: make digital identity verification uncopyable, make API access self-defending, and make credential theft mathematically impractical by rotating keys, routes, and encryption layers continuously.',
              ];

              doc.setFontSize(10);
              doc.setTextColor(51, 65, 85);
              sections.forEach(text => {
                const lines = doc.splitTextToSize(text, 170);
                lines.forEach(line => {
                  if (y > 270) { doc.addPage(); y = 20; }
                  doc.text(line, 20, y);
                  y += 5;
                });
                y += 4;
              });

              doc.addPage();
              y = 20;
              const pillars = [
                { title: '1. HelixVerify', body: 'DNA-based wearable identity anchor with hardware-backed rotation and liveness.' },
                { title: '2. CipherPass', body: 'Protected key and API gateway layer with AI-driven routing and automatic failover.' },
                { title: '3. Dynamic Scrambler', body: 'Continuous moving-target defense rotating keys, paths, and encryption layers every 100 milliseconds.' },
              ];
              doc.setFontSize(16);
              doc.setTextColor(15, 23, 42);
              doc.text('Core Capabilities', 20, y);
              y += 12;
              pillars.forEach(p => {
                if (y > 250) { doc.addPage(); y = 20; }
                doc.setFontSize(13);
                doc.setTextColor(15, 23, 42);
                doc.text(p.title, 20, y);
                y += 7;
                doc.setFontSize(10);
                doc.setTextColor(71, 85, 105);
                const plines = doc.splitTextToSize(p.body, 170);
                plines.forEach(l => { doc.text(l, 20, y); y += 5; });
                y += 6;
              });

              doc.save('reclaim-me-about.pdf');
            }}
            className="inline-flex items-center justify-center gap-2 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-bold px-8 py-4 rounded-lg transition-colors"
          >
            <FileDown className="w-5 h-5" /> Download PDF
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 border border-slate-500 text-slate-300 hover:bg-slate-800 font-bold px-8 py-4 rounded-lg transition-colors"
          >
            Explore the Platform <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="mt-12 flex items-center gap-3 text-slate-500 text-sm">
          <Shield className="w-5 h-5" />
          Reclaim Me · Built independently · Texas, USA · 2024–2026
        </div>
      </div>
    </div>
  );
}