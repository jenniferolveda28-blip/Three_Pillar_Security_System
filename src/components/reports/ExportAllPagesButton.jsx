import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle2, FileStack } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ExportAllPagesButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    setDone(false);
    try {
      const [universes, requests, keys, securityLogs, hardwareTokens, meetings, alerts, anomalies] = await Promise.all([
        base44.entities.Universe.list('-created_date'),
        base44.entities.UniversalRequest.list('-created_date', 50),
        base44.entities.UniversalKey.list('-created_date'),
        base44.entities.SecurityLog.list('-created_date', 50),
        base44.entities.HardwareToken.filter({ is_active: true }),
        base44.entities.InvestorMeeting.list('-meeting_date', 100),
        base44.entities.CriminalActivityAlert.list('-created_date', 50),
        base44.entities.BehaviorAnomaly.list('-created_date', 50),
      ]);

      const doc = new jsPDF();
      const today = format(new Date(), 'MMMM d, yyyy HH:mm');
      const dateStr = format(new Date(), 'yyyy-MM-dd');

      // Master header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 50, 'F');
      doc.setFillColor(6, 182, 212);
      doc.rect(0, 0, 4, 50, 'F');
      doc.setTextColor(6, 182, 212);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPLETE SYSTEM EXPORT', 12, 22);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Three-Pillar Security System — All-in-One Report', 12, 32);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${today}`, 12, 43);

      let y = 62;
      const checkPage = (needed = 20) => {
        if (y + needed > 275) { doc.addPage(); y = 20; }
      };
      const section = (title) => { checkPage(30); doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(6, 182, 212); doc.text(title, 12, y); y += 4; doc.setDrawColor(6, 182, 212); doc.setLineWidth(0.4); doc.line(12, y, 198, y); y += 8; };
      const rows = (data) => { data.forEach(([l, v], i) => { checkPage(8); if (i % 2 === 0) { doc.setFillColor(241, 245, 249); doc.rect(12, y - 5, 186, 8, 'F'); } doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(30, 41, 59); doc.text(String(l), 15, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(6, 182, 212); doc.text(String(v), 120, y); y += 9; }); y += 4; };
      const body = (text) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(51, 65, 85); doc.splitTextToSize(text, 184).forEach(line => { checkPage(7); doc.text(line, 12, y); y += 6; }); y += 5; };

      // 1. System Overview
      section('1. SYSTEM OVERVIEW');
      rows([
        ['Connected API Universes', universes.length],
        ['Total API Requests', requests.length],
        ['Active API Keys', keys.length],
        ['Hardware Tokens', hardwareTokens.length],
        ['Security Log Events', securityLogs.length],
        ['Investor Pipeline Leads', meetings.length],
        ['Criminal Activity Alerts', alerts.length],
        ['Behavior Anomalies', anomalies.length],
      ]);

      // 2. Investor Pipeline
      section('2. INVESTOR PIPELINE SUMMARY');
      const statusCounts = {};
      meetings.forEach(m => { statusCounts[m.status] = (statusCounts[m.status] || 0) + 1; });
      rows([
        ['Total Leads', meetings.length],
        ['Contacted', statusCounts['Contacted'] || 0],
        ['NDA Sent', statusCounts['NDA Sent'] || 0],
        ['Meeting Scheduled', statusCounts['Meeting Scheduled'] || 0],
        ['Follow-up Needed', statusCounts['Follow-up Needed'] || 0],
        ['Negotiating', statusCounts['Negotiating'] || 0],
        ['Passed', statusCounts['Passed'] || 0],
      ]);
      body(meetings.length > 0
        ? meetings.slice(0, 15).map(m => `• ${m.investor_name} (${m.company || 'N/A'}) — Status: ${m.status} — Interest: ${m.interest_level}/5 — Meeting: ${m.meeting_date || 'N/A'}`).join('\n')
        : 'No investor meetings recorded.');

      // 3. API Universes
      section('3. CONNECTED API UNIVERSES');
      body(universes.length > 0
        ? universes.map(u => `• ${u.name} — Status: ${u.status?.toUpperCase()} — Success Rate: ${u.success_rate ?? 100}% — Capabilities: ${(u.capabilities || []).join(', ')}`).join('\n')
        : 'No universes connected.');

      // 4. Request History
      section('4. RECENT API REQUESTS');
      body(requests.length > 0
        ? requests.slice(0, 15).map(r => `• [${r.status?.toUpperCase()}] "${r.intent}" → ${r.routed_to || 'N/A'} — ${r.latency_ms || '?'}ms`).join('\n')
        : 'No requests recorded.');

      // 5. Security & Threats
      section('5. SECURITY & THREAT SUMMARY');
      rows([
        ['Total Security Events', securityLogs.length],
        ['Critical/High Threats', securityLogs.filter(l => l.threat_level === 'high' || l.threat_level === 'critical').length],
        ['Criminal Alerts (Open)', alerts.filter(a => a.status === 'open' || a.status === 'investigating').length],
        ['Behavior Anomalies (Active)', anomalies.filter(a => a.status === 'detected' || a.status === 'investigating').length],
        ['Auto-Blocked Threats', alerts.filter(a => a.auto_blocked).length],
      ]);
      body(securityLogs.length > 0
        ? securityLogs.slice(0, 10).map(l => `• [${l.threat_level?.toUpperCase() || 'NONE'}] ${l.event_type} — ${l.success ? 'SUCCESS' : 'BLOCKED'} — ${l.details || ''}`).join('\n')
        : 'No security events recorded.');

      // 6. Hardware Tokens
      section('6. HARDWARE TOKEN STATUS');
      rows([
        ['Active Tokens', hardwareTokens.length],
        ['Biometric Method', 'DNA Breathalyzer'],
        ['Token Replacement Cost', '$29.99'],
      ]);
      body(hardwareTokens.length > 0
        ? hardwareTokens.map(t => `• ${t.device_name} (ID: ${t.device_id}) — Active: ${t.is_active ? 'YES' : 'NO'} — Failed Attempts: ${t.failed_attempts || 0}`).join('\n')
        : 'No active hardware tokens.');

      // Footer on all pages
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 282, 210, 15, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('THREE-PILLAR SECURITY SYSTEM — COMPLETE EXPORT', 12, 289);
        doc.text(`Page ${i} of ${pages}  |  ${dateStr}`, 155, 289);
      }

      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `complete-system-export-${dateStr}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);

      toast.success(`Complete system export generated (${pages} pages)!`);
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch (err) {
      toast.error('Export failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={loading} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold">
      {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Exporting All Pages...</>
        : done ? <><CheckCircle2 className="w-4 h-4 mr-2" />Export Complete!</>
        : <><FileStack className="w-4 h-4 mr-2" />Export All Pages</>}
    </Button>
  );
}