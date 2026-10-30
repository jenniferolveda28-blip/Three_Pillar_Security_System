import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dna, Wind, Cpu, Shield, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

const PIPELINE_STAGES = [
  {
    stage: 'STAGE 01',
    title: 'Multi-Modal Bio-Intake',
    time: '0.0s – 0.8s',
    color: 'border-purple-500/50 bg-purple-950/20',
    accent: 'text-purple-400',
    icon: Dna,
    inputs: ['Capillary Saliva (15 μL)', 'Steady-State Exhalation'],
    process: 'Isothermal microfluidic lysis + optical probe hybridization across 5 high-entropy SNP loci (HLA-DRB1, APOE-ε3, CYP2D6, MTHFR, ACE I/D) paired with barometric/VOC respiration curve.',
    output: 'Raw Optical Fluorescence Vector + Liveness Bit (1)'
  },
  {
    stage: 'STAGE 02',
    title: 'Zero-Retention Ephemeral Hashing',
    time: '0.8s – 1.4s',
    color: 'border-cyan-500/50 bg-cyan-950/20',
    accent: 'text-cyan-400',
    icon: Cpu,
    inputs: ['SNP Allele Vector', 'Factory Silicon PUF ID'],
    process: 'On-chip SHA3-256 / Argon2id cryptographic mixing inside volatile SRAM. Raw optical values are overwritten with zeros immediately upon digest completion.',
    output: '32-Byte Irreversible Identity Digest (H_bio)'
  },
  {
    stage: 'STAGE 03',
    title: 'Temporal Key Synthesis (TCE)',
    time: '1.4s – 1.8s',
    color: 'border-emerald-500/50 bg-emerald-950/20',
    accent: 'text-emerald-400',
    icon: Lock,
    inputs: ['H_bio Digest', 'TCXO 3-Second Epoch Counter'],
    process: 'HMAC-SHA256 binds the verified biological hash, hardware serial secret, and 3-second temporal window into a single one-time authentication frame.',
    output: '6-Char Rolling Token Code + Signed Frame'
  },
  {
    stage: 'STAGE 04',
    title: 'CipherPass & Dynamic Scrambler Gate',
    time: '1.8s – 2.0s',
    color: 'border-amber-500/50 bg-amber-950/20',
    accent: 'text-amber-400',
    icon: Shield,
    inputs: ['Signed Token Frame', '100ms Scrambled Route'],
    process: 'Server verifies HMAC against the CLIA lab-enrolled reference hash, checks 3-attempt hardware lockout state, and opens the moving-target API tunnel.',
    output: 'Authenticated Session + Immutable Audit Log'
  }
];

const GENETIC_LOCI_PANEL = [
  { locus: 'HLA-DRB1', chr: 'Chr 6p21.3', role: 'Hyper-variable immune complex marker; primary entropy contributor', bits: '64-bit eq.' },
  { locus: 'APOE (rs429358 / rs7412)', chr: 'Chr 19q13.32', role: 'Tri-allelic isoform stability anchor (ε2/ε3/ε4)', bits: '32-bit eq.' },
  { locus: 'CYP2D6 Copy/SNP', chr: 'Chr 22q13.2', role: 'High-polymorphism metabolic locus (>100 known allelic variants)', bits: '64-bit eq.' },
  { locus: 'MTHFR (C677T / A1298C)', chr: 'Chr 1p36.22', role: 'Dual-point verification check for rapid optical SNR validation', bits: '48-bit eq.' },
  { locus: 'ACE (I/D Polymorphism)', chr: 'Chr 17q23.3', role: '287-bp insertion/deletion structural marker for physical sample authenticity', bits: '48-bit eq.' },
];

export default function SharedBioCryptoPipelineSchematic() {
  return (
    <Card className="bg-slate-900/80 border-slate-700">
      <CardHeader className="border-b border-slate-800 bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
              <Dna className="w-4 h-4" /> DWG NO. HLXV-BIO-002 · BIO-CRYPTOGRAPHIC SIGNAL FLOW
            </div>
            <CardTitle className="text-xl text-white mt-1">
              Saliva-to-Hash Microfluidic &amp; Cryptographic Pipeline Schematic
            </CardTitle>
            <CardDescription className="text-slate-400">
              End-to-end signal path showing how biological input becomes an irreversible 256-bit cryptographic proof in under 2 seconds without storing DNA.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-purple-500/50 text-purple-300 font-mono text-xs">
            ZERO RAW GENETIC STORAGE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* 4-Stage Schematic Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {PIPELINE_STAGES.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={s.stage} className={`rounded-xl border p-4 flex flex-col justify-between ${s.color}`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-mono font-bold ${s.accent}`}>{s.stage}</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-slate-300">
                      {s.time}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-5 h-5 ${s.accent} shrink-0`} />
                    <h4 className="text-sm font-bold text-white leading-snug">{s.title}</h4>
                  </div>
                  <div className="mb-3">
                    <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Inputs</div>
                    <div className="space-y-1">
                      {s.inputs.map((inp) => (
                        <div key={inp} className="text-xs bg-slate-950/70 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono">
                          + {inp}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{s.process}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Stage Output</div>
                  <div className={`text-xs font-mono font-semibold mt-0.5 ${s.accent}`}>→ {s.output}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cryptographic Formula Callout Banner */}
        <div className="rounded-xl border border-cyan-500/30 bg-[#061326] p-4 font-mono text-xs">
          <div className="text-cyan-400 font-bold mb-1">
            FORMAL IDENTITY BINDING EQUATION (EXECUTED IN VOLATILE SECURE ELEMENT SRAM):
          </div>
          <div className="text-slate-200 overflow-x-auto py-1">
            Token_Code(t) = Truncate_6( HMAC-SHA256( Key = SE_Secret ⊕ SHA3_256(SNP_Vector || PUF_UID), Msg = ⌊t / 3.0s⌋ || Liveness_Flag ) )
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            * Where Liveness_Flag == 1 requires simultaneous steady-state respiration VOC curve + closed wrist-capacitance loop.
          </div>
        </div>

        {/* Scientific Partner Loci Specification Table */}
        <div>
          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Candidate 5-Loci Target Panel (For Scientific Partner Validation)
          </h4>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase">
                <tr>
                  <th className="text-left p-2.5">Target Locus</th>
                  <th className="text-left p-2.5">Chromosomal Location</th>
                  <th className="text-left p-2.5">Engineering &amp; Assay Rationale</th>
                  <th className="text-left p-2.5">Entropy Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {GENETIC_LOCI_PANEL.map((row) => (
                  <tr key={row.locus} className="bg-slate-900/40">
                    <td className="p-2.5 font-mono font-semibold text-cyan-300">{row.locus}</td>
                    <td className="p-2.5 font-mono text-slate-400">{row.chr}</td>
                    <td className="p-2.5">{row.role}</td>
                    <td className="p-2.5 font-mono text-emerald-400">{row.bits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}