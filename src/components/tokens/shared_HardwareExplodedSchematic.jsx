import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Cpu, Dna, BatteryCharging, ShieldCheck, Radio } from 'lucide-react';

const EXPLODED_LAYERS = [
  {
    id: 'L1',
    code: 'LAYER 01 · TOP ENCLOSURE & DISPLAY',
    name: 'Sapphire-Coated OLED & Biometric Port Bezel',
    spec: '24.0 mm × 38.0 mm × 1.4 mm · Gorilla Glass / Anodized Ti-6Al-4V',
    color: '#06b6d4',
    accent: 'text-cyan-400',
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-500/10',
    partnerRole: 'Industrial Design & Materials Partner',
    details: 'Houses the micro-OLED 6-digit rolling code window (3s refresh) and the sealed capillary intake port for the disposable microfluidic saliva cartridge.',
    metrics: ['IP68 Hermetic Seal', '128×64 PMOLED', 'UV-C Self-Sanitizing Rim']
  },
  {
    id: 'L2',
    code: 'LAYER 02 · BIO-ACQUISITION & LIVENESS ARRAY',
    name: 'Microfluidic SNP Reader & Respiration Sensor',
    spec: 'Lab-on-Chip CMOS Biosensor · Dual MEMS Barometric / VOC Liveness',
    color: '#a855f7',
    accent: 'text-purple-400',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
    partnerRole: 'Biomedical / Diagnostic Sensor Partner',
    details: 'Performs rapid isothermal amplification / optical SNP panel read across 5 target loci (HLA-DRB1, APOE, CYP2D6, MTHFR, ACE) while simultaneously verifying steady-state human respiration.',
    metrics: ['Target Read: < 2.0s', 'Zero Raw DNA Retention', 'CO₂ / Humidity Liveness Gate']
  },
  {
    id: 'L3',
    code: 'LAYER 03 · CRYPTOGRAPHIC SECURE ELEMENT PCB',
    name: 'Tamper-Responsive EAL6+ Silicon & Temporal Engine',
    spec: '4-Layer Rigid-Flex PCB · Hardware SHA3-256 + TOTP Co-Processor',
    color: '#10b981',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
    partnerRole: 'Embedded Security & Silicon Partner',
    details: 'Converts biological markers + factory Unclonable Silicon ID (PUF) into a 32-byte irreversible hash in volatile SRAM. Active tamper mesh zeroes all keys in < 2 microseconds if probed.',
    metrics: ['PUF Silicon Root', '3-Attempt Hardware Lockout', '±2 ppm TCXO Clock']
  },
  {
    id: 'L4',
    code: 'LAYER 04 · POWER, RF & ON-BODY CHASSIS',
    name: 'Solid-State Li-Po Cell, NFC/BLE Enclave & Skin Capacitance Base',
    spec: '110 mAh Solid-State Cell · Qi Magnetic Induction · Optical/Capacitive Wrist Sensor',
    color: '#f59e0b',
    accent: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    partnerRole: 'Wearable EE & Manufacturing Partner',
    details: 'Maintains continuous on-body liveness verification. Removing the strap immediately halts TOTP code emission and locks the CipherPass session until re-authenticated.',
    metrics: ['14-Day Target Runtime', 'Continuous On-Body Lock', 'Zero-Export RF Enclave']
  }
];

export default function SharedHardwareExplodedSchematic() {
  const [selectedLayer, setSelectedLayer] = useState('L2');
  const active = EXPLODED_LAYERS.find((l) => l.id === selectedLayer) || EXPLODED_LAYERS[0];

  return (
    <Card className="bg-slate-900/80 border-slate-700 overflow-hidden">
      <CardHeader className="border-b border-slate-800 bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Layers className="w-4 h-4" /> DWG NO. HLXV-CAD-001 · SCALE 4:1 · EXPLODED ISOMETRIC STACK
            </div>
            <CardTitle className="text-xl text-white mt-1">
              Physical Wearable Token — 4-Layer Exploded Hardware Schematic
            </CardTitle>
            <CardDescription className="text-slate-400">
              Click any hardware layer in the CAD diagram or selector to inspect engineering specifications and partner scope.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-cyan-500/50 text-cyan-300 font-mono text-xs">
            REV 1.4 · PRE-PRODUCTION CAD
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Interactive CAD Blueprint SVG */}
          <div className="lg:col-span-7 rounded-xl border border-cyan-500/30 bg-[#061326] p-4 relative overflow-hidden">
            {/* Blueprint grid background */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-cyan-400/80 mb-2">
              <span>TOLERANCE: ±0.05mm (ISO 2768-f)</span>
              <span>ENCLOSURE: 38.0 × 24.0 × 8.2 mm</span>
            </div>

            <svg viewBox="0 0 600 430" className="w-full h-auto select-none">
              <defs>
                <linearGradient id="blueprintGlow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Vertical Alignment Axis Lines */}
              <line x1="170" y1="45" x2="170" y2="385" stroke="#0ea5e9" strokeDasharray="3 4" strokeOpacity="0.45" />
              <line x1="430" y1="45" x2="430" y2="385" stroke="#0ea5e9" strokeDasharray="3 4" strokeOpacity="0.45" />
              <line x1="300" y1="25" x2="300" y2="405" stroke="#22d3ee" strokeDasharray="2 6" strokeOpacity="0.35" />

              {/* Dimension Callout Left */}
              <line x1="65" y1="60" x2="65" y2="365" stroke="#38bdf8" strokeWidth="1" />
              <line x1="58" y1="60" x2="72" y2="60" stroke="#38bdf8" strokeWidth="1" />
              <line x1="58" y1="365" x2="72" y2="365" stroke="#38bdf8" strokeWidth="1" />
              <text x="52" y="215" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle" transform="rotate(-90 52 215)">
                TOTAL Z-STACK: 8.2 mm
              </text>

              {/* LAYER 1: Top Bezel & OLED */}
              <g
                onClick={() => setSelectedLayer('L1')}
                className="cursor-pointer transition-opacity"
                opacity={selectedLayer === 'L1' ? 1 : 0.72}
              >
                <polygon
                  points="300,32 450,72 300,112 150,72"
                  fill={selectedLayer === 'L1' ? 'rgba(6,182,212,0.28)' : 'rgba(15,23,42,0.85)'}
                  stroke="#06b6d4"
                  strokeWidth={selectedLayer === 'L1' ? '2.5' : '1.3'}
                />
                {/* OLED screen cutout */}
                <polygon
                  points="285,55 365,75 315,90 235,70"
                  fill="#022c43"
                  stroke="#22d3ee"
                  strokeWidth="1"
                />
                <text x="300" y="76" fill="#67e8f9" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  849 201 · 3.0s
                </text>
                {/* Capillary intake port */}
                <circle cx="205" cy="72" r="7" fill="#083344" stroke="#22d3ee" strokeWidth="1.2" />
                <text x="468" y="68" fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  L1 · TITANIUM BEZEL
                </text>
                <text x="468" y="81" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  PMOLED + Saliva Port
                </text>
              </g>

              {/* LAYER 2: Microfluidic Bio-Sensor */}
              <g
                onClick={() => setSelectedLayer('L2')}
                className="cursor-pointer transition-opacity"
                opacity={selectedLayer === 'L2' ? 1 : 0.72}
              >
                <polygon
                  points="300,122 450,162 300,202 150,162"
                  fill={selectedLayer === 'L2' ? 'rgba(168,85,247,0.28)' : 'rgba(15,23,42,0.85)'}
                  stroke="#a855f7"
                  strokeWidth={selectedLayer === 'L2' ? '2.5' : '1.3'}
                />
                {/* Microfluidic channels */}
                <path d="M 205 162 L 265 152 L 330 162 L 385 162" stroke="#d8b4fe" strokeWidth="1.5" fill="none" />
                <path d="M 265 152 L 285 174 L 350 170" stroke="#c084fc" strokeWidth="1.2" fill="none" />
                <circle cx="205" cy="162" r="5" fill="#a855f7" />
                <rect x="315" y="153" width="32" height="16" fill="#3b0764" stroke="#e9d5ff" strokeWidth="1" />
                <text x="468" y="158" fill="#c084fc" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  L2 · BIO-MEMS ARRAY
                </text>
                <text x="468" y="171" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  5-Loci SNP + Breath VOC
                </text>
              </g>

              {/* LAYER 3: Cryptographic PCB & Secure Element */}
              <g
                onClick={() => setSelectedLayer('L3')}
                className="cursor-pointer transition-opacity"
                opacity={selectedLayer === 'L3' ? 1 : 0.72}
              >
                <polygon
                  points="300,214 450,254 300,294 150,254"
                  fill={selectedLayer === 'L3' ? 'rgba(16,185,129,0.28)' : 'rgba(15,23,42,0.85)'}
                  stroke="#10b981"
                  strokeWidth={selectedLayer === 'L3' ? '2.5' : '1.3'}
                />
                {/* Secure Element IC die */}
                <polygon
                  points="300,236 345,248 300,260 255,248"
                  fill="#064e3b"
                  stroke="#34d399"
                  strokeWidth="1.5"
                />
                <text x="300" y="252" fill="#6ee7b7" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  SE-EAL6+
                </text>
                {/* Circuit traces */}
                <line x1="220" y1="254" x2="255" y2="248" stroke="#34d399" strokeWidth="1" />
                <line x1="345" y1="248" x2="390" y2="256" stroke="#34d399" strokeWidth="1" />
                <text x="468" y="250" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  L3 · CRYPTO CORE PCB
                </text>
                <text x="468" y="263" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  SHA3-256 + PUF + Tamper
                </text>
              </g>

              {/* LAYER 4: Battery & On-Body Sensor Base */}
              <g
                onClick={() => setSelectedLayer('L4')}
                className="cursor-pointer transition-opacity"
                opacity={selectedLayer === 'L4' ? 1 : 0.72}
              >
                <polygon
                  points="300,306 450,346 300,386 150,346"
                  fill={selectedLayer === 'L4' ? 'rgba(245,158,11,0.28)' : 'rgba(15,23,42,0.85)'}
                  stroke="#f59e0b"
                  strokeWidth={selectedLayer === 'L4' ? '2.5' : '1.3'}
                />
                {/* Qi coil & skin sensor */}
                <ellipse cx="300" cy="346" rx="48" ry="16" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="4 2" />
                <ellipse cx="300" cy="346" rx="22" ry="8" fill="#78350f" stroke="#fcd34d" strokeWidth="1" />
                <text x="468" y="342" fill="#fbbf24" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  L4 · POWER &amp; BIAS BASE
                </text>
                <text x="468" y="355" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  110mAh Li-Po + Wrist Lock
                </text>
              </g>
            </svg>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-cyan-500/20 text-[11px] font-mono text-slate-400">
              <span>UNIT BOM TARGET: $38–$54 @ 10k MOQ</span>
              <span className="text-cyan-400">CLICK LAYER TO INSPECT SUBSYSTEM</span>
            </div>
          </div>

          {/* Layer Selector & Active Engineering Callout */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {EXPLODED_LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`text-left p-2.5 rounded-lg border transition-all ${
                    selectedLayer === layer.id
                      ? `${layer.bg} ${layer.border} ring-1 ring-current ${layer.accent}`
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[10px] font-mono uppercase opacity-80">{layer.id} SUBSYSTEM</div>
                  <div className="text-xs font-bold text-white truncate mt-0.5">{layer.name}</div>
                </button>
              ))}
            </div>

            <div className={`rounded-xl border p-5 ${active.bg} ${active.border} space-y-4`}>
              <div>
                <div className={`text-xs font-mono uppercase ${active.accent}`}>{active.code}</div>
                <h3 className="text-lg font-bold text-white mt-0.5">{active.name}</h3>
                <p className="text-xs font-mono text-slate-300 mt-1">{active.spec}</p>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed">{active.details}</p>

              <div>
                <div className="text-[11px] font-mono uppercase text-slate-400 mb-2">Target Design Parameters</div>
                <div className="flex flex-wrap gap-1.5">
                  {active.metrics.map((m) => (
                    <Badge key={m} variant="outline" className="bg-slate-950/70 border-slate-700 text-slate-200 text-xs">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Partner Collaboration Track:</span>
                <span className={`font-semibold ${active.accent}`}>{active.partnerRole}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}