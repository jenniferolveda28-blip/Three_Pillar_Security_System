import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Cpu, Microscope, TrendingUp, AlertTriangle, Printer, FileText,
  ArrowLeft, CheckCircle2, Wrench, ShieldCheck, Compass
} from 'lucide-react';
import PrintReportButton from '@/components/PrintReportButton';
import SharedHardwareExplodedSchematic from '@/components/tokens/shared_HardwareExplodedSchematic';
import SharedBioCryptoPipelineSchematic from '@/components/tokens/shared_BioCryptoPipelineSchematic';

const MILESTONES = [
  {
    phase: 'PHASE 1 · MONTHS 1–4',
    title: 'Benchtop Assay & Breadboard Secure Element',
    budget: '$120k – $250k',
    status: 'Seeking Lead Biotech & Embedded Partner',
    deliverables: [
      'Validate 5-loci isothermal/optical SNP discrimination from human saliva on benchtop microfluidic cartridge',
      'Integrate EAL6+ Secure Element dev-board with SHA3-256 digest & 3-second TOTP counter',
      'Demonstrate live hardware-to-cloud handshake against existing Reclaim Me verification API'
    ]
  },
  {
    phase: 'PHASE 2 · MONTHS 5–9',
    title: 'EVT Wearable Form-Factor Prototype (25 Units)',
    budget: '$350k – $750k',
    status: 'Pre-Seed / Seed Tranche',
    deliverables: [
      'Miniaturize 4-layer rigid-flex PCB into 38 × 24 × 8.2 mm titanium/sapphire wrist enclosure',
      'Embed MEMS respiration liveness sensor and capacitive wrist-removal auto-lock loop',
      'Execute CLIA lab enrollment pilot: saliva kit → reference hash → wearable activation → 30s token replacement'
    ]
  },
  {
    phase: 'PHASE 3 · MONTHS 10–14',
    title: 'DVT Hardening, Red-Team Penetration & Regulatory Filing',
    budget: '$500k – $1.0M',
    status: 'Seed Milestone',
    deliverables: [
      'Independent physical tamper & side-channel attack audit (active mesh zeroization < 2 μs)',
      'Measure empirical False Accept Rate (FAR) and False Reject Rate (FRR) across 500-subject cohort',
      'Complete FCC/CE RF certification and GINA / HIPAA / GDPR privacy compliance sign-off'
    ]
  }
];

const BOM_SUBSYSTEMS = [
  ['Microfluidic CMOS SNP Sensor & Cartridge Intake', 'Biomedical Partner', '$14.50 – $21.00', 'Custom Lab-on-Chip / Optical Reader'],
  ['EAL6+ Cryptographic Secure Element + PUF', 'Silicon Vendor (NXP / Infineon class)', '$4.20 – $6.00', 'Non-exportable key storage + SHA3'],
  ['MEMS Respiration VOC + Skin Capacitance Array', 'Sensor OEM', '$3.80 – $5.20', 'Dual liveness & on-body lock'],
  ['128×64 PMOLED + Titanium/Sapphire Enclosure', 'Precision CNC / Display OEM', '$9.50 – $13.50', 'IP68 tamper-evident housing'],
  ['110 mAh Solid-State Li-Po + Qi Induction Coil', 'Power Subsystem OEM', '$3.20 – $4.50', 'Sealed contactless charging'],
  ['4-Layer Rigid-Flex PCB + TCXO (±2 ppm) + BLE/NFC', 'EMS Assembly Partner', '$3.30 – $4.30', 'Time-sync & encrypted companion link']
];

export default function SharedHelixPrototypeSchematics() {
  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/SeekingPartners">
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
              <ArrowLeft className="w-4 h-4 mr-1" /> Seeking Partners
            </Button>
          </Link>
          <Link to="/bioverify-blueprint">
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
              <FileText className="w-4 h-4 mr-1" /> System Architecture
            </Button>
          </Link>
          <Link to="/helix-token-production-brief">
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
              <Wrench className="w-4 h-4 mr-1" /> Production Brief
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <PrintReportButton
            reportTitle="HelixVerify™ Prototype Blueprint Schematics"
            subtitle="Engineering CAD Stack, Bio-Cryptographic Pipeline & Partner Roadmap for Investors & Scientific Partners"
            filename="helixverify-prototype-schematics-{date}.pdf"
            sections={[
              {
                heading: 'DOCUMENT SCOPE & DISCLOSURE',
                body: 'This engineering blueprint package defines the proposed physical and bio-cryptographic schematics for the HelixVerify™ wearable DNA authentication token. Reclaim Me has built and validated the complete cloud orchestration, CipherPass gateway, and Dynamic Scrambler software platform. These schematics specify the physical wearable prototype to be co-developed with scientific, hardware, and investment partners.'
              },
              {
                heading: '4-LAYER EXPLODED HARDWARE STACK (38.0 × 24.0 × 8.2 mm)',
                rows: [
                  ['Layer 01 — Top Bezel', 'Anodized Ti-6Al-4V + Sapphire 128×64 PMOLED (3s code window) + sealed capillary saliva port'],
                  ['Layer 02 — Bio-MEMS Array', 'Microfluidic 5-loci SNP optical reader (HLA-DRB1, APOE, CYP2D6, MTHFR, ACE) + MEMS breath VOC liveness'],
                  ['Layer 03 — Crypto Core PCB', 'EAL6+ Secure Element, PUF silicon ID, volatile SRAM SHA3-256 hashing, 3-attempt hardware lockout'],
                  ['Layer 04 — Power & Base', '110 mAh solid-state Li-Po, Qi magnetic charging, capacitive/optical wrist-removal auto-lock']
                ]
              },
              {
                heading: 'BIO-CRYPTOGRAPHIC SIGNAL FLOW (< 2.0 SECOND TARGET)',
                body: 'Stage 1 (0.0–0.8s): Capillary saliva sample (15 μL) + steady-state exhalation enter the microfluidic chamber.\nStage 2 (0.8–1.4s): Optical SNP vector and Factory PUF UID are hashed via SHA3-256 in volatile SRAM; raw biological signal is immediately zeroed.\nStage 3 (1.4–1.8s): Temporal Cryptography Engine combines the 32-byte digest with the 3-second TCXO epoch counter.\nStage 4 (1.8–2.0s): Signed 6-character token code authenticates through CipherPass and Dynamic Scrambler.'
              },
              {
                heading: 'PRELIMINARY BILL OF MATERIALS (TARGET @ 10,000 UNIT MOQ)',
                rows: BOM_SUBSYSTEMS.map(([sub, partner, cost, note]) => [sub, `${cost} (${partner}) — ${note}`])
              },
              {
                heading: 'PROTOTYPE DEVELOPMENT MILESTONES ($250K – $2.0M SEED)',
                rows: MILESTONES.map((m) => [m.phase, `${m.title} (${m.budget}) — ${m.deliverables.join('; ')}`])
              }
            ]}
          />
          <Button variant="outline" size="sm" onClick={() => window.print()} className="border-cyan-500/40 text-cyan-300">
            <Printer className="w-4 h-4 mr-1" /> Print Blueprint
          </Button>
        </div>
      </div>

      {/* Blueprint Title Block Header */}
      <div className="rounded-2xl border border-cyan-500/40 bg-slate-950/90 p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-2">
              <Compass className="w-3.5 h-3.5" /> BLUEPRINT PACKAGE · DOC ID: HLXV-SCHEM-2026-A
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              HelixVerify™ Prototype Blueprint Schematics
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Prepared for Prospective Angel/Seed Investors, Biomedical Research Labs &amp; Embedded Hardware Partners
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/90 p-3 rounded-xl border border-slate-800 shrink-0">
            <div className="text-slate-500">ENCLOSURE:</div>
            <div className="text-cyan-300 text-right">38.0 × 24.0 × 8.2 mm</div>
            <div className="text-slate-500">HASH DIGEST:</div>
            <div className="text-emerald-300 text-right">SHA3-256 (32-Byte)</div>
            <div className="text-slate-500">CODE CADENCE:</div>
            <div className="text-purple-300 text-right">3.0s TOTP / 100ms Gate</div>
            <div className="text-slate-500">TARGET BOM:</div>
            <div className="text-amber-300 text-right">$38.50 – $54.50 (10k)</div>
          </div>
        </div>

        {/* Honest Engineering Status Disclosure */}
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200 leading-relaxed">
            <strong>Engineering Transparency Notice:</strong> The cloud verification service, CipherPass gateway, Dynamic Scrambler, and DNA hash registry are built and running live in this software platform. The hardware schematics below represent our target physical prototype architecture for co-development with biomedical and embedded systems partners.
          </p>
        </div>
      </div>

      {/* Schematic 1: Interactive 4-Layer Exploded Hardware Stack */}
      <SharedHardwareExplodedSchematic />

      {/* Schematic 2: Bio-Cryptographic Pipeline & 5-Loci Assay */}
      <SharedBioCryptoPipelineSchematic />

      {/* Preliminary BOM & Partner Allocation + Phased R&D Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BOM Table */}
        <Card className="lg:col-span-7 bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Preliminary Bill of Materials (BOM) &amp; Partner Scope
            </CardTitle>
            <CardDescription className="text-slate-400">
              Estimated unit cost breakdown at 10,000-unit initial production volume ($38.50–$54.50 target).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase">
                  <tr>
                    <th className="text-left p-2.5">Subsystem</th>
                    <th className="text-left p-2.5">Partner Track</th>
                    <th className="text-left p-2.5">Est. Unit Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {BOM_SUBSYSTEMS.map(([sub, track, cost, note]) => (
                    <tr key={sub} className="bg-slate-900/40">
                      <td className="p-2.5">
                        <div className="font-semibold text-white">{sub}</div>
                        <div className="text-[11px] text-slate-400">{note}</div>
                      </td>
                      <td className="p-2.5 text-cyan-300 font-mono">{track}</td>
                      <td className="p-2.5 font-mono text-emerald-400 whitespace-nowrap">{cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Phased R&D & Capital Milestones */}
        <Card className="lg:col-span-5 bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Prototype R&amp;D &amp; Funding Tranches
            </CardTitle>
            <CardDescription className="text-slate-400">
              Capital &amp; scientific validation milestones from benchtop breadboard to DVT certification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {MILESTONES.map((m) => (
              <div key={m.phase} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-cyan-400">{m.phase}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs">
                    {m.budget}
                  </Badge>
                </div>
                <div className="text-sm font-bold text-white">{m.title}</div>
                <ul className="space-y-1 text-xs text-slate-300">
                  {m.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Partner & Investor Call-to-Action Footer */}
      <Card className="bg-gradient-to-r from-cyan-950/50 via-slate-900 to-purple-950/50 border-cyan-500/40">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Microscope className="w-5 h-5 text-cyan-400" />
              Ready to Co-Develop or Fund the HelixVerify Hardware Prototype?
            </h3>
            <p className="text-sm text-slate-300">
              Generate a mutual Texas NDA, inspect the full hardware requirements, or log an investor/partner inquiry directly.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link to="/TexasNDA">
              <Button className="bg-cyan-600 hover:bg-cyan-500 text-white">
                <ShieldCheck className="w-4 h-4 mr-1.5" /> Execute Mutual NDA
              </Button>
            </Link>
            <Link to="/helix-token-requirements">
              <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                Full Requirements Spec
              </Button>
            </Link>
            <Link to="/SeekingPartners">
              <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800">
                Partner Inquiry Form
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}