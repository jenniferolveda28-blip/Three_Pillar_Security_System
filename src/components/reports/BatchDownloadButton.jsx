import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { toast } from 'sonner';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function buildPDF(reportTitle, subtitle, sections) {
  const doc = new jsPDF();
  const today = format(new Date(), 'MMMM d, yyyy HH:mm');
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 50, 'F');
  doc.setFillColor(6, 182, 212);
  doc.rect(0, 0, 4, 50, 'F');

  doc.setTextColor(6, 182, 212);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(reportTitle.toUpperCase(), 12, 22);

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(subtitle, 12, 32);
  }

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${today}  |  Three-Pillar Security System`, 12, 43);

  let y = 62;

  const checkPage = (needed = 20) => {
    if (y + needed > 275) {
      doc.addPage();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 14, 'F');
      doc.setFillColor(6, 182, 212);
      doc.rect(0, 0, 4, 14, 'F');
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`${reportTitle} — continued`, 12, 9);
      y = 22;
    }
  };

  sections.forEach((section) => {
    checkPage(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 182, 212);
    doc.text(section.heading, 12, y);
    y += 4;
    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(0.4);
    doc.line(12, y, 198, y);
    y += 7;

    if (section.rows && section.rows.length > 0) {
      section.rows.forEach(([label, value], ri) => {
        checkPage(8);
        if (ri % 2 === 0) { doc.setFillColor(241, 245, 249); doc.rect(12, y - 5, 186, 8, 'F'); }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(30, 41, 59);
        doc.text(String(label), 15, y);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(6, 182, 212);
        doc.text(String(value), 120, y);
        y += 9;
      });
      y += 4;
    }

    if (section.body) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(section.body, 184);
      lines.forEach(line => { checkPage(7); doc.text(line, 12, y); y += 6; });
      y += 5;
    }
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 282, 210, 15, 'F');
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
    doc.text('THREE-PILLAR SECURITY SYSTEM — CONFIDENTIAL', 12, 289);
    doc.text(`Page ${i} of ${pageCount}  |  ${dateStr}`, 155, 289);
  }

  return { blob: doc.output('blob'), dateStr };
}

export default function BatchDownloadButton({ universes = [], requests = [], keys = [], securityLogs = [], hardwareTokens = [] }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const reports = [
    {
      title: 'Forged API — API Key & Universe Management',
      subtitle: 'Live system status and API key management report',
      filename: 'forged-api-key-report',
      sections: [
        {
          heading: 'LIVE SYSTEM STATUS',
          rows: [
            ['Connected API Universes', universes.length],
            ['Total Requests Processed', requests.length],
            ['Active API Keys', keys.length],
            ['Active Hardware Tokens', hardwareTokens.length],
            ['Security Logs', securityLogs.length],
            ['Key Rotation', 'Continuous — every 0.1 to 5 seconds'],
            ['Routing Algorithm', 'AI-powered latency + health scoring'],
            ['Failover Time', '< 50ms automatic rerouting'],
          ]
        },
        {
          heading: 'CONNECTED API UNIVERSES',
          body: universes.length > 0
            ? universes.map(u => `• ${u.name} — Status: ${u.status?.toUpperCase()} — URL: ${u.base_url} — Success Rate: ${u.success_rate ?? 100}% — Errors (24h): ${u.error_count ?? 0}`).join('\n')
            : 'No universes connected yet.'
        },
        {
          heading: 'ACTIVE API KEYS',
          body: keys.length > 0
            ? keys.map(k => `• Key: ${k.key_name} — Universe: ${k.universe_id} — Status: ${k.status?.toUpperCase()} — Usage: ${k.usage_count ?? 0} calls`).join('\n')
            : 'No keys configured.'
        },
        {
          heading: 'API KEY SECURITY ARCHITECTURE',
          body: 'Every API key in Forged API is bound to a DNA-verified hardware token and rotates automatically every 0.1–5 seconds via IP Shield. Keys are never stored in plaintext. Even if intercepted, they expire before they can be replayed.\n\nLayer 1: DNA Authentication\nLayer 2: Key Validation (rotating TOTP)\nLayer 3: Rate Limiting\nLayer 4: AI Threat Analysis\nLayer 5: Immutable Audit Logging'
        },
      ]
    },
    {
      title: 'Forged API — Security Threat Intelligence Report',
      subtitle: 'Live security logs and threat activity summary',
      filename: 'security-threat-report',
      sections: [
        {
          heading: 'SECURITY LOG SUMMARY',
          rows: [
            ['Total Security Events', securityLogs.length],
            ['High/Critical Threats', securityLogs.filter(l => l.threat_level === 'high' || l.threat_level === 'critical').length],
            ['Successful Events', securityLogs.filter(l => l.success).length],
            ['Failed/Blocked Events', securityLogs.filter(l => !l.success).length],
            ['DNA Verification Events', securityLogs.filter(l => l.event_type === 'dna_verified').length],
            ['Suspicious Activity Events', securityLogs.filter(l => l.event_type === 'suspicious_activity').length],
          ]
        },
        {
          heading: 'RECENT SECURITY EVENTS (LAST 20)',
          body: securityLogs.slice(0, 20).length > 0
            ? securityLogs.slice(0, 20).map(l => `• [${l.threat_level?.toUpperCase() ?? 'NONE'}] ${l.event_type} — ${l.success ? 'SUCCESS' : 'BLOCKED'} — IP: ${l.ip_address ?? 'N/A'} — ${l.details ?? ''}`).join('\n')
            : 'No security events recorded.'
        },
        {
          heading: 'IP SHIELD STATUS',
          body: 'IP Shield continuously scrambles the system every 100ms, rotating API keys, routing paths, and encryption layers. This ensures any intercepted credential is expired before it can be exploited.\n\nAttacker exploit window: 0.1 seconds (vs 30 seconds for Google Authenticator)\nSuccessful breaches: ZERO by mathematical design'
        }
      ]
    },
    {
      title: 'Forged API — Request History & Performance Report',
      subtitle: 'API request routing history and performance metrics',
      filename: 'request-history-report',
      sections: [
        {
          heading: 'REQUEST PERFORMANCE SUMMARY',
          rows: [
            ['Total Requests', requests.length],
            ['Successful Requests', requests.filter(r => r.status === 'success').length],
            ['Failed Requests', requests.filter(r => r.status === 'failed').length],
            ['Fallback Used', requests.filter(r => r.fallback_used).length],
            ['Average Latency (ms)', requests.length > 0 ? Math.round(requests.filter(r => r.latency_ms).reduce((s, r) => s + (r.latency_ms || 0), 0) / Math.max(requests.filter(r => r.latency_ms).length, 1)) : 'N/A'],
          ]
        },
        {
          heading: 'RECENT REQUESTS (LAST 20)',
          body: requests.slice(0, 20).length > 0
            ? requests.slice(0, 20).map(r => `• [${r.status?.toUpperCase()}] "${r.intent}" → ${r.routed_to ?? 'N/A'} — ${r.latency_ms ?? '?'}ms${r.fallback_used ? ' [FALLBACK]' : ''}`).join('\n')
            : 'No requests recorded.'
        },
        {
          heading: 'AI ROUTING INTELLIGENCE',
          body: 'Each request is routed by AI using a weighted scoring algorithm:\n  • Real-time latency — 40%\n  • Historical success rate — 30%\n  • Current health status — 20%\n  • Geographic proximity — 10%\n\nIf any Universe degrades, automatic failover occurs in < 50ms with zero application downtime.'
        }
      ]
    },
    {
      title: 'Forged API — Hardware Token & BioVerify Status',
      subtitle: 'DNA authentication hardware and biometric token status',
      filename: 'hardware-token-report',
      sections: [
        {
          heading: 'HARDWARE TOKEN SUMMARY',
          rows: [
            ['Active Tokens', hardwareTokens.length],
            ['Biometric Method', 'DNA Breathalyzer (saliva nano-sensor)'],
            ['Backup Authentication', 'Fingerprint + Facial Recognition'],
            ['Match Confidence', '99.7 – 99.8%'],
            ['DNA Storage Method', 'SHA-256 one-way hash, AES-256-GCM encrypted'],
            ['Raw DNA Retention', 'ZERO — discarded immediately after hashing'],
          ]
        },
        {
          heading: 'ACTIVE TOKEN DETAILS',
          body: hardwareTokens.length > 0
            ? hardwareTokens.map(t => `• Device: ${t.device_name} (ID: ${t.device_id}) — Active: ${t.is_active ? 'YES' : 'NO'} — Failed Attempts: ${t.failed_attempts ?? 0} — Last Used: ${t.last_used ?? 'Never'}`).join('\n')
            : 'No active hardware tokens.'
        },
        {
          heading: 'TOKEN REPLACEMENT POLICY',
          body: 'Lost token: Report via app → immediate global revocation in < 1 second.\nReplacement: New BioVerify token shipped for $29.99, delivered in 2-3 days.\nRe-activation: One breath required — existing DNA hash matched in 30 seconds.\nNo biological re-collection required. Your DNA hash remains securely stored.'
        }
      ]
    },
  ];

  const handleBatchDownload = async () => {
    setLoading(true);
    setDone(false);
    try {
      for (const r of reports) {
        const { blob, dateStr } = buildPDF(r.title, r.subtitle, r.sections);
        downloadBlob(blob, `${r.filename}-${dateStr}.pdf`);
        await new Promise(res => setTimeout(res, 400)); // stagger downloads
      }
      toast.success(`${reports.length} reports downloaded successfully!`);
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch (err) {
      toast.error('Batch download failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBatchDownload}
      disabled={loading}
      className="bg-violet-600 hover:bg-violet-700 text-white"
    >
      {loading ? (
        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating {reports.length} PDFs...</>
      ) : done ? (
        <><CheckCircle2 className="w-4 h-4 mr-2" />{reports.length} Reports Downloaded!</>
      ) : (
        <><Download className="w-4 h-4 mr-2" />Batch Download All Reports ({reports.length})</>
      )}
    </Button>
  );
}