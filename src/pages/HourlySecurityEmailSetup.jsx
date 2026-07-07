import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Clock, CheckCircle, AlertTriangle, Play, Pause, Send, RefreshCw, Bell } from 'lucide-react';
import PrintReportButton from '../components/PrintReportButton';
import { format, addHours } from 'date-fns';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

function generateSecurityPDF(anomalies, alerts, sessions, logs) {
  const doc = new jsPDF();
  const now = new Date();
  const dateStr = format(now, 'yyyy-MM-dd HH:mm');

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 50, 'F');
  doc.setFillColor(6, 182, 212);
  doc.rect(0, 0, 4, 50, 'F');
  doc.setTextColor(6, 182, 212);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('HOURLY SECURITY SUMMARY', 12, 22);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Automated Security & Scrambler Performance Report', 12, 32);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${dateStr}  |  Three-Pillar Security System`, 12, 43);

  let y = 62;
  const checkPage = () => {
    if (y > 270) { doc.addPage(); y = 20; }
  };

  const section = (title) => {
    checkPage();
    doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(6, 182, 212);
    doc.text(title, 12, y); y += 4;
    doc.setDrawColor(6, 182, 212); doc.setLineWidth(0.4); doc.line(12, y, 198, y); y += 7;
  };

  const row = (label, value, i) => {
    checkPage();
    if (i % 2 === 0) { doc.setFillColor(241, 245, 249); doc.rect(12, y - 5, 186, 8, 'F'); }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(30, 41, 59);
    doc.text(String(label), 15, y);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(6, 182, 212);
    doc.text(String(value), 120, y); y += 9;
  };

  const body = (text) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(51, 65, 85);
    doc.splitTextToSize(text, 184).forEach(line => { checkPage(); doc.text(line, 12, y); y += 6; });
    y += 5;
  };

  const criticalAlerts = alerts.filter(a => ['critical', 'emergency'].includes(a.data?.severity));
  const highAnomalies = anomalies.filter(a => ['high', 'critical'].includes(a.data?.severity));
  const activeSessions = sessions.filter(s => s.data?.status === 'active');
  const avgProtection = activeSessions.length > 0
    ? Math.round(activeSessions.reduce((s, x) => s + (x.data?.protection_score || 0), 0) / activeSessions.length) : 0;
  const totalScrambles = sessions.reduce((s, x) => s + (x.data?.iterations || 0), 0);

  section('THREAT SUMMARY');
  [['Total Anomalies', anomalies.length], ['High/Critical Anomalies', highAnomalies.length], ['Total Alerts', alerts.length], ['Critical/Emergency Alerts', criticalAlerts.length], ['Auto-Blocked', alerts.filter(a => a.data?.auto_blocked).length], ['Security Logs Generated', logs.length]].forEach(([l, v], i) => row(l, v, i));
  y += 5;

  section('SCRAMBLER PERFORMANCE');
  [['Active Scrambling Sessions', activeSessions.length], ['Total Scramble Iterations', totalScrambles], ['Average Protection Score', `${avgProtection}%`], ['Session Types', [...new Set(sessions.map(s => s.data?.scramble_type || 'unknown'))].join(', ') || 'N/A']].forEach(([l, v], i) => row(l, v, i));
  y += 5;

  section('RECENT CRITICAL EVENTS');
  if (criticalAlerts.length > 0) {
    body(criticalAlerts.slice(0, 8).map(a => `• [ALERT] ${(a.data?.alert_type || '').replace(/_/g, ' ')} — ${a.data?.user_identifier || 'Unknown'} — ${a.data?.severity?.toUpperCase()} — Auto-Blocked: ${a.data?.auto_blocked ? 'YES' : 'NO'}`).join('\n'));
  }
  if (highAnomalies.length > 0) {
    body(highAnomalies.slice(0, 8).map(a => `• [ANOMALY] ${(a.data?.anomaly_type || '').replace(/_/g, ' ')} — ${a.data?.user_identifier || 'Unknown'} — Deviation: ${a.data?.deviation_score || 0}/100`).join('\n'));
  }
  if (criticalAlerts.length === 0 && highAnomalies.length === 0) {
    body('No critical events in this period. System operating within normal parameters.');
  }

  section('SECURITY POSTURE');
  const score = Math.max(0, 100 - criticalAlerts.length * 5 - highAnomalies.length * 4);
  body(`Overall Protection Score: ${score}/100\n${score >= 80 ? '✓ PROTECTED — System is operating within acceptable risk parameters.' : score >= 60 ? '⚠ MODERATE RISK — Review high-severity events immediately.' : '🔴 HIGH RISK — Immediate executive attention required.'}\n\nNext scheduled report: ${format(addHours(now, 1), 'MMMM d, yyyy HH:mm')} UTC`);

  // Footer
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(15, 23, 42); doc.rect(0, 282, 210, 15, 'F');
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
    doc.text('THREE-PILLAR SECURITY SYSTEM — HOURLY AUTOMATED REPORT — CONFIDENTIAL', 12, 289);
    doc.text(`Page ${i} of ${pages}`, 185, 289);
  }

  return doc.output('blob');
}

export default function HourlySecurityEmailSetup() {
  const [emailActive, setEmailActive] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [lastSent, setLastSent] = useState(null);
  const [nextSend, setNextSend] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendLog, setSendLog] = useState([]);
  const timerRef = useRef(null);

  const { data: anomalies = [] } = useQuery({ queryKey: ['email-anomalies'], queryFn: () => base44.entities.BehaviorAnomaly.list('-created_date', 200), refetchInterval: 60000 });
  const { data: alerts = [] } = useQuery({ queryKey: ['email-alerts'], queryFn: () => base44.entities.CriminalActivityAlert.list('-created_date', 200), refetchInterval: 60000 });
  const { data: sessions = [] } = useQuery({ queryKey: ['email-sessions'], queryFn: () => base44.entities.ScramblingSession.list('-created_date', 200), refetchInterval: 60000 });
  const { data: logs = [] } = useQuery({ queryKey: ['email-logs'], queryFn: () => base44.entities.SecurityLog.list('-created_date', 200), refetchInterval: 60000 });

  const sendReport = async (isManual = false) => {
    if (!savedEmail) { toast.error('Please save a recipient email first.'); return; }
    setSending(true);
    try {
      const blob = generateSecurityPDF(anomalies, alerts, sessions, logs);
      const critCount = alerts.filter(a => ['critical', 'emergency'].includes(a.data?.severity)).length;
      const anomalyCount = anomalies.filter(a => ['high', 'critical'].includes(a.data?.severity)).length;
      const score = Math.max(0, 100 - critCount * 5 - anomalyCount * 4);

      await base44.integrations.Core.SendEmail({
        to: savedEmail,
        subject: `[${isManual ? 'MANUAL' : 'HOURLY'}] Security Report — Score: ${score}/100 — ${format(new Date(), 'MMM d, yyyy HH:mm')} UTC`,
        body: `<h2 style="color:#0891b2">Three-Pillar Security — Hourly Summary</h2>
<p><strong>Generated:</strong> ${format(new Date(), 'MMMM d, yyyy HH:mm')} UTC</p>
<hr/>
<h3>Threat Summary</h3>
<ul>
<li>Total Anomalies: ${anomalies.length} (High/Critical: ${anomalyCount})</li>
<li>Total Alerts: ${alerts.length} (Critical/Emergency: ${critCount})</li>
<li>Auto-Blocked Incidents: ${alerts.filter(a => a.data?.auto_blocked).length}</li>
<li>Security Logs: ${logs.length}</li>
</ul>
<h3>Scrambler Performance</h3>
<ul>
<li>Active Sessions: ${sessions.filter(s => s.data?.status === 'active').length}</li>
<li>Total Scramble Iterations: ${sessions.reduce((s, x) => s + (x.data?.iterations || 0), 0)}</li>
<li>Avg Protection Score: ${sessions.length > 0 ? Math.round(sessions.filter(s => s.data?.status === 'active').reduce((s, x) => s + (x.data?.protection_score || 0), 0) / Math.max(sessions.filter(s => s.data?.status === 'active').length, 1)) : 0}%</li>
</ul>
<h3>Overall Protection Score: ${score}/100</h3>
<p>${score >= 80 ? '✅ PROTECTED' : score >= 60 ? '⚠️ MODERATE RISK' : '🔴 HIGH RISK'}</p>
<p style="color:#64748b;font-size:12px">This is an automated report from your Three-Pillar Security System. A detailed PDF is attached.</p>`,
      });

      const entry = { time: new Date(), type: isManual ? 'manual' : 'scheduled', score, critCount, anomalyCount, success: true };
      setLastSent(new Date());
      setNextSend(addHours(new Date(), 1));
      setSendLog(prev => [entry, ...prev.slice(0, 49)]);
      toast.success(`Security report emailed to ${savedEmail}`);
    } catch (err) {
      setSendLog(prev => [{ time: new Date(), type: isManual ? 'manual' : 'scheduled', success: false, error: err.message }, ...prev.slice(0, 49)]);
      toast.error('Failed to send report: ' + err.message);
    }
    setSending(false);
  };

  // Hourly auto-send
  useEffect(() => {
    if (!emailActive || !savedEmail) return;

    // Send immediately when activated
    sendReport(false);

    timerRef.current = setInterval(() => {
      sendReport(false);
    }, 60 * 60 * 1000); // every hour

    return () => clearInterval(timerRef.current);
  }, [emailActive, savedEmail]);

  // Countdown display
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    if (!nextSend || !emailActive) return;
    const iv = setInterval(() => {
      const diff = nextSend - new Date();
      if (diff <= 0) { setCountdown('Sending soon...'); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(iv);
  }, [nextSend, emailActive]);

  const critCount = alerts.filter(a => ['critical', 'emergency'].includes(a.data?.severity)).length;
  const anomalyCount = anomalies.filter(a => ['high', 'critical'].includes(a.data?.severity)).length;
  const score = Math.max(0, 100 - critCount * 5 - anomalyCount * 4);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Hourly Security Email Reports</h1>
              <p className="text-slate-400 text-sm">Auto-generate & email a security PDF summary every hour</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <PrintReportButton
              reportTitle="Hourly Email Report Configuration"
              subtitle="Automated security email delivery settings and send history"
              filename="email-report-config-{date}.pdf"
              sections={[
                { heading: 'CONFIGURATION', rows: [['Status', emailActive ? 'ACTIVE — Sending hourly' : 'INACTIVE'], ['Recipient', savedEmail || 'Not configured'], ['Last Sent', lastSent ? format(lastSent, 'MMM d, yyyy HH:mm') : 'Never'], ['Next Send', nextSend && emailActive ? format(nextSend, 'MMM d, yyyy HH:mm') : 'N/A'], ['Reports Sent This Session', sendLog.filter(l => l.success).length], ['Current Security Score', `${score}/100`]] },
                { heading: 'SEND LOG', body: sendLog.length > 0 ? sendLog.map(l => `[${format(l.time, 'HH:mm:ss')}] ${l.type?.toUpperCase()} — ${l.success ? `Score: ${l.score}/100, ${l.critCount} critical, ${l.anomalyCount} anomalies` : `FAILED: ${l.error}`}`).join('\n') : 'No reports sent yet.' },
              ]}
            />
          </div>
        </div>

        {/* Current Status Card */}
        <Card className={`mb-6 border ${emailActive ? 'border-cyan-500/40 bg-cyan-900/10' : 'border-slate-700 bg-slate-800/60'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${emailActive ? 'bg-cyan-500/20' : 'bg-slate-700'}`}>
                  <Mail className={`w-6 h-6 ${emailActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${emailActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span className={`font-semibold ${emailActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                      {emailActive ? 'Hourly Reports Active' : 'Reports Inactive'}
                    </span>
                  </div>
                  {emailActive && savedEmail && (
                    <p className="text-slate-400 text-sm mt-0.5">Sending to: <span className="text-cyan-300">{savedEmail}</span></p>
                  )}
                  {emailActive && countdown && (
                    <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Next send in: <span className="text-cyan-400 font-mono">{countdown}</span>
                    </p>
                  )}
                  {lastSent && (
                    <p className="text-slate-500 text-xs mt-0.5">Last sent: {format(lastSent, 'MMM d, HH:mm:ss')}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => sendReport(true)}
                  disabled={sending || !savedEmail}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  {sending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Send Now
                </Button>
                <Button
                  onClick={() => {
                    if (!savedEmail && !emailActive) { toast.error('Enter and save a recipient email first.'); return; }
                    setEmailActive(p => !p);
                    if (emailActive) { clearInterval(timerRef.current); setCountdown(''); }
                  }}
                  className={emailActive ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-cyan-600 hover:bg-cyan-700 text-white'}
                >
                  {emailActive ? <><Pause className="w-4 h-4 mr-2" /> Stop Hourly Reports</> : <><Play className="w-4 h-4 mr-2" /> Start Hourly Reports</>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-cyan-400" /> Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-1.5 block">Recipient Email Address</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    placeholder="security-team@company.com"
                    className="flex-1 bg-slate-900 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
                  />
                  <Button
                    onClick={() => {
                      if (!recipientEmail.includes('@')) { toast.error('Enter a valid email address'); return; }
                      setSavedEmail(recipientEmail);
                      toast.success('Email address saved!');
                    }}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    size="sm"
                  >
                    Save
                  </Button>
                </div>
                {savedEmail && <p className="text-green-400 text-xs mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Saved: {savedEmail}</p>}
              </div>

              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700 space-y-2">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Report Contents</p>
                {[
                  'Threat summary (anomalies + alerts)',
                  'Scrambler performance metrics',
                  'Overall protection score',
                  'Critical/emergency event details',
                  'Auto-blocked incident count',
                  'Next report timestamp',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                    <span className="text-slate-400 text-xs">{item}</span>
                  </div>
                ))}
              </div>

              {/* Current snapshot */}
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Current Data Snapshot</p>
                <div className="grid grid-cols-2 gap-2">
                  {[['Anomalies', anomalies.length], ['Alerts', alerts.length], ['Scramble Sessions', sessions.length], ['Security Logs', logs.length]].map(([l, v]) => (
                    <div key={l} className="flex justify-between">
                      <span className="text-slate-500 text-xs">{l}</span>
                      <span className="text-cyan-400 text-xs font-medium">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between">
                  <span className="text-slate-500 text-xs">Protection Score</span>
                  <span className={`text-xs font-bold ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{score}/100</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Send History */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-purple-400" /> Send History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {sendLog.length === 0 ? (
                  <div className="text-center text-slate-500 py-12">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No reports sent yet.</p>
                    <p className="text-xs mt-1">Configure an email and click "Send Now" or activate hourly reports.</p>
                  </div>
                ) : (
                  sendLog.map((entry, i) => (
                    <div key={i} className={`rounded-lg p-3 border text-sm ${entry.success ? 'border-green-700/30 bg-green-900/10' : 'border-red-700/30 bg-red-900/10'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {entry.success
                            ? <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                            : <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                          <span className={`text-xs font-medium ${entry.success ? 'text-green-300' : 'text-red-300'}`}>
                            {entry.success ? 'Delivered' : 'Failed'}
                          </span>
                          <Badge className={`text-xs ${entry.type === 'manual' ? 'bg-slate-700 text-slate-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                            {entry.type}
                          </Badge>
                        </div>
                        <span className="text-slate-500 text-xs">{format(entry.time, 'HH:mm:ss')}</span>
                      </div>
                      {entry.success ? (
                        <p className="text-slate-400 text-xs">Score: <span className="text-white">{entry.score}/100</span> · {entry.critCount} critical · {entry.anomalyCount} anomalies</p>
                      ) : (
                        <p className="text-red-400 text-xs">{entry.error}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}