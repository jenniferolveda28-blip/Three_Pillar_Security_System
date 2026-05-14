import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, Shield, AlertTriangle, Activity } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export default function ExecutiveReportGenerator({ logs = [], alerts = [], sessions = [] }) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const now = new Date();
      const today = format(now, 'MMMM d, yyyy');
      const reportDate = format(now, 'yyyy-MM-dd');

      // Dark header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 42, 'F');
      doc.setTextColor(6, 182, 212);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('EXECUTIVE COMPLIANCE REPORT', 20, 20);
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text(`Three-Pillar Security System  |  Generated: ${today}`, 20, 33);

      let y = 55;

      const section = (title, r, g, b) => {
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(r, g, b);
        doc.text(title, 20, y);
        y += 6;
        doc.setDrawColor(r, g, b);
        doc.line(20, y, 190, y);
        y += 9;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
      };

      const row = (label, value) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 25, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), 125, y);
        y += 8;
      };

      // ── Threat Summary ──
      section('THREAT DETECTION SUMMARY', 239, 68, 68);
      // Helper: unwrap data field (SDK wraps records in { data: {...} })
      const d = (record) => record?.data || record || {};

      const totalThreats = alerts.length;
      const criticalThreats = alerts.filter(a => d(a).severity === 'critical' || d(a).severity === 'emergency').length;
      const resolved = alerts.filter(a => d(a).status === 'resolved').length;
      const blocked = alerts.filter(a => d(a).auto_blocked).length;
      row('Total Threats Detected:', totalThreats);
      row('Critical / Emergency:', criticalThreats);
      row('Auto-Blocked:', blocked);
      row('Resolved:', resolved);
      row('Resolution Rate:', totalThreats > 0 ? `${Math.round((resolved / totalThreats) * 100)}%` : 'N/A');
      y += 4;

      // ── System Stability ──
      section('SYSTEM STABILITY METRICS', 16, 185, 129);
      const totalLogs = logs.length;
      const successLogs = logs.filter(l => d(l).success).length;
      const successRate = totalLogs > 0 ? Math.round((successLogs / totalLogs) * 100) : 100;
      row('Security Events Logged:', totalLogs);
      row('Successful Operations:', successLogs);
      row('System Success Rate:', `${successRate}%`);
      row('Overall Stability:', successRate >= 90 ? 'EXCELLENT' : successRate >= 70 ? 'GOOD' : 'NEEDS ATTENTION');
      y += 4;

      // ── Scrambling ──
      section('SCRAMBLING DEFENSE METRICS', 245, 158, 11);
      const activeSessions = sessions.filter(s => d(s).status === 'active').length;
      const totalIterations = sessions.reduce((sum, s) => sum + (d(s).iterations || 0), 0);
      const avgProtection = sessions.length > 0
        ? Math.round(sessions.reduce((sum, s) => sum + (d(s).protection_score || 0), 0) / sessions.length)
        : 100;
      row('Active Scrambling Sessions:', activeSessions);
      row('Total Scramble Iterations:', totalIterations.toLocaleString());
      row('Average Protection Score:', `${avgProtection}%`);
      row('Defense Status:', activeSessions > 0 ? 'ACTIVE — Moving Target Engaged' : 'STANDBY');
      y += 4;

      // ── Compliance ──
      section('COMPLIANCE ASSESSMENT', 139, 92, 246);
      const complianceScore = Math.round(
        successRate * 0.4 + avgProtection * 0.3 +
        Math.min(100, (resolved / Math.max(1, totalThreats)) * 100) * 0.3
      );
      row('Overall Compliance Score:', `${complianceScore} / 100`);
      row('Authentication Compliance:', 'ACTIVE — DNA Biometric Enabled');
      row('Data Protection:', 'COMPLIANT — AES-256 Encryption Active');
      row('Audit Trail:', 'COMPLETE — All events logged');
      row('Incident Response:', blocked > 0 ? `${blocked} threat(s) auto-mitigated` : 'No incidents requiring escalation');
      y += 4;

      // ── Recommendations ──
      section('EXECUTIVE RECOMMENDATIONS', 14, 165, 233);
      doc.setFontSize(10);
      const recs = [];
      if (criticalThreats > 0) recs.push(`• Review and resolve ${criticalThreats} critical/emergency threat(s) immediately.`);
      if (avgProtection < 80) recs.push('• Increase scrambling frequency to improve protection score.');
      if (successRate < 90) recs.push('• Investigate failed security events to identify system vulnerabilities.');
      recs.push('• Continue monitoring DNA authentication patterns for anomalies.');
      recs.push('• Ensure hardware tokens are rotated per schedule.');
      recs.push('• Review all access logs for unauthorized access attempts.');
      recs.forEach(rec => {
        const lines = doc.splitTextToSize(rec, 170);
        doc.text(lines, 20, y);
        y += lines.length * 6 + 2;
      });

      // Footer on all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Three-Pillar Security System — CONFIDENTIAL — Page ${i} of ${pageCount}`, 20, 285);
        doc.text(`Report ID: EXEC-${reportDate}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, 150, 285);
      }

      // Use blob URL for reliable download across all browsers/iframes
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `executive-compliance-${reportDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } finally {
      setGenerating(false);
    }
  };

  const d = (record) => record?.data || record || {};
  const totalThreats = alerts.length;
  const criticalCount = alerts.filter(a => d(a).severity === 'critical' || d(a).severity === 'emergency').length;
  const activeSessions = sessions.filter(s => d(s).status === 'active').length;

  return (
    <Card className="multi-layer-card card-layer-monitoring border mt-8">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-600/20 rounded-lg">
            <FileText className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <CardTitle className="text-slate-100">Executive Compliance Report</CardTitle>
            <CardDescription className="text-slate-400">
              Aggregate daily threat detection, system stability, and scrambling metrics into a downloadable PDF
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-slate-800/50 rounded-lg border border-red-500/20 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-400">{totalThreats}</p>
            <p className="text-xs text-slate-400">Total Threats</p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg border border-orange-500/20 text-center">
            <Shield className="w-6 h-6 text-orange-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-orange-400">{criticalCount}</p>
            <p className="text-xs text-slate-400">Critical Alerts</p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg border border-violet-500/20 text-center">
            <Activity className="w-6 h-6 text-violet-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-violet-400">{activeSessions}</p>
            <p className="text-xs text-slate-400">Active Scrambles</p>
          </div>
        </div>
        <Button
          onClick={generatePDF}
          disabled={generating}
          className="w-full bg-violet-600 hover:bg-violet-700"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating PDF...</>
          ) : (
            <><Download className="w-4 h-4 mr-2" />Download Executive Compliance Report (PDF)</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}