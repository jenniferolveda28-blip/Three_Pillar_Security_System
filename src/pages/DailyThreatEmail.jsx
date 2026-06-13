import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PrintReportButton from '../components/PrintReportButton';
import { Mail, Clock, CheckCircle, AlertTriangle, Play, Pause, Send, RefreshCw, Bell, Shield, Zap, ArrowLeft } from 'lucide-react';
import { format, addDays, subHours } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function DailyThreatEmail() {
  const [emailActive, setEmailActive] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [lastSent, setLastSent] = useState(null);
  const [nextSend, setNextSend] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendLog, setSendLog] = useState([]);
  const [countdown, setCountdown] = useState('');
  const timerRef = useRef(null);

  // Fetch 24h of data
  const since24h = subHours(new Date(), 24).toISOString();

  const { data: anomalies = [] } = useQuery({
    queryKey: ['daily-anomalies'],
    queryFn: () => base44.entities.BehaviorAnomaly.list('-created_date', 500),
    refetchInterval: 300000,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['daily-alerts'],
    queryFn: () => base44.entities.CriminalActivityAlert.list('-created_date', 500),
    refetchInterval: 300000,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['daily-logs'],
    queryFn: () => base44.entities.SecurityLog.list('-created_date', 500),
    refetchInterval: 300000,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['daily-sessions'],
    queryFn: () => base44.entities.ScramblingSession.list('-created_date', 200),
    refetchInterval: 300000,
  });

  // Filter to last 24h
  const recent = (arr) => arr.filter(x => x.created_date && new Date(x.created_date) >= new Date(since24h));
  const recentAnomalies = recent(anomalies);
  const recentAlerts = recent(alerts);
  const recentLogs = recent(logs);

  // Computed stats
  const criticalAlerts = recentAlerts.filter(a => ['critical', 'emergency'].includes(a.data?.severity || a.severity));
  const highAnomalies = recentAnomalies.filter(a => ['high', 'critical'].includes(a.data?.severity || a.severity));
  const autoBlocked = recentAlerts.filter(a => a.data?.auto_blocked || a.auto_blocked);
  const neutralized = [...recentAnomalies.filter(a => ['confirmed_threat', 'resolved'].includes(a.data?.status || a.status)),
                       ...recentAlerts.filter(a => ['confirmed', 'resolved'].includes(a.data?.status || a.status)),
                       ...recentAlerts.filter(a => a.data?.auto_blocked || a.auto_blocked)];
  const totalNeutralizations = neutralized.length;
  const totalScrambles = sessions.reduce((s, x) => s + (x.data?.iterations || x.iterations || 0), 0);
  const score = Math.max(0, 100 - criticalAlerts.length * 5 - highAnomalies.length * 4);

  const buildEmailBody = () => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 24px; border-radius: 12px;">
  <div style="border-left: 4px solid #06b6d4; padding-left: 16px; margin-bottom: 24px;">
    <h1 style="color: #06b6d4; margin: 0; font-size: 22px;">🛡️ Daily Threat Summary</h1>
    <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">Three-Pillar Security System — Last 24 Hours<br>${format(new Date(), 'MMMM d, yyyy HH:mm')} CST</p>
  </div>

  <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
    <h2 style="color: #f1f5f9; font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">📊 24-Hour Summary</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Total Threats Detected</td><td style="color: #f1f5f9; font-weight: bold; text-align: right;">${recentAnomalies.length + recentAlerts.length}</td></tr>
      <tr><td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Critical / Emergency Alerts</td><td style="color: ${criticalAlerts.length > 0 ? '#ef4444' : '#10b981'}; font-weight: bold; text-align: right;">${criticalAlerts.length}</td></tr>
      <tr><td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">High-Severity Anomalies</td><td style="color: ${highAnomalies.length > 0 ? '#f97316' : '#10b981'}; font-weight: bold; text-align: right;">${highAnomalies.length}</td></tr>
      <tr><td style="padding: 6px 0; color: #94a3b8; font-size: 13px; border-top: 1px solid #334155;">⚡ Total Neutralizations Performed</td><td style="color: #10b981; font-weight: bold; text-align: right; border-top: 1px solid #334155; font-size: 16px;">${totalNeutralizations}</td></tr>
      <tr><td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Auto-Blocked Incidents</td><td style="color: #10b981; font-weight: bold; text-align: right;">${autoBlocked.length}</td></tr>
      <tr><td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">IP Shield Scramble Iterations</td><td style="color: #8b5cf6; font-weight: bold; text-align: right;">${totalScrambles.toLocaleString()}</td></tr>
      <tr><td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Security Logs Generated</td><td style="color: #f1f5f9; font-weight: bold; text-align: right;">${recentLogs.length}</td></tr>
    </table>
  </div>

  <div style="background: ${score >= 80 ? '#052e16' : score >= 60 ? '#422006' : '#450a0a'}; border: 1px solid ${score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626'}; border-radius: 8px; padding: 16px; margin-bottom: 16px; text-align: center;">
    <p style="font-size: 32px; font-weight: bold; margin: 0; color: ${score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171'};">${score}/100</p>
    <p style="color: #94a3b8; margin: 4px 0 0; font-size: 12px;">Overall Protection Score</p>
    <p style="margin: 8px 0 0; font-size: 14px; font-weight: bold; color: ${score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171'};">${score >= 80 ? '✅ SYSTEM PROTECTED' : score >= 60 ? '⚠️ MODERATE RISK — Review Required' : '🔴 HIGH RISK — Immediate Action Required'}</p>
  </div>

  ${criticalAlerts.length > 0 ? `
  <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
    <h2 style="color: #ef4444; font-size: 13px; margin: 0 0 10px; text-transform: uppercase;">🚨 Critical Events (Last 24h)</h2>
    ${criticalAlerts.slice(0, 5).map(a => `
    <div style="border-left: 3px solid #ef4444; padding-left: 10px; margin-bottom: 8px;">
      <p style="margin: 0; font-size: 13px; color: #f1f5f9;">${(a.data?.alert_type || a.alert_type || 'Unknown').replace(/_/g, ' ').toUpperCase()}</p>
      <p style="margin: 2px 0 0; font-size: 11px; color: #94a3b8;">User: ${a.data?.user_identifier || a.user_identifier || 'N/A'} | Auto-Blocked: ${(a.data?.auto_blocked || a.auto_blocked) ? '✅ YES' : '❌ NO'}</p>
    </div>`).join('')}
  </div>` : ''}

  <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
    <h2 style="color: #06b6d4; font-size: 13px; margin: 0 0 10px; text-transform: uppercase;">⚡ Neutralization Breakdown</h2>
    <p style="color: #94a3b8; font-size: 13px; margin: 0;">Auto-blocked incidents: <strong style="color: #10b981;">${autoBlocked.length}</strong></p>
    <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">Resolved anomalies: <strong style="color: #10b981;">${recentAnomalies.filter(a => ['resolved', 'false_positive'].includes(a.data?.status || a.status)).length}</strong></p>
    <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">Quarantined / Investigating: <strong style="color: #f97316;">${recentAnomalies.filter(a => a.data?.status === 'investigating' || a.status === 'investigating').length}</strong></p>
    <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">IP Shield scrambles performed: <strong style="color: #8b5cf6;">${totalScrambles.toLocaleString()}</strong></p>
  </div>

  <p style="color: #475569; font-size: 11px; text-align: center; margin: 16px 0 0;">
    Daily automated report · Three-Pillar Security System · Next report: ${format(addDays(new Date(), 1), 'MMM d, yyyy')}
  </p>
</div>`;

  const sendReport = async (isManual = false) => {
    if (!savedEmail) { toast.error('Save a recipient email first.'); return; }
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: savedEmail,
        subject: `[DAILY THREAT SUMMARY] ${recentAnomalies.length + recentAlerts.length} threats | ${totalNeutralizations} neutralizations | Score: ${score}/100 — ${format(new Date(), 'MMM d, yyyy')}`,
        body: buildEmailBody(),
      });
      const entry = { time: new Date(), type: isManual ? 'manual' : 'daily', score, threats: recentAnomalies.length + recentAlerts.length, neutralizations: totalNeutralizations, success: true };
      setLastSent(new Date());
      setNextSend(addDays(new Date(), 1));
      setSendLog(prev => [entry, ...prev.slice(0, 29)]);
      toast.success(`Daily threat summary sent to ${savedEmail}`);
    } catch (err) {
      setSendLog(prev => [{ time: new Date(), type: isManual ? 'manual' : 'daily', success: false, error: err.message }, ...prev.slice(0, 29)]);
      toast.error('Failed: ' + err.message);
    }
    setSending(false);
  };

  // Daily auto-send
  useEffect(() => {
    if (!emailActive || !savedEmail) return;
    sendReport(false);
    timerRef.current = setInterval(() => sendReport(false), 24 * 60 * 60 * 1000);
    return () => clearInterval(timerRef.current);
  }, [emailActive, savedEmail]);

  // Countdown
  useEffect(() => {
    if (!nextSend || !emailActive) return;
    const iv = setInterval(() => {
      const diff = nextSend - new Date();
      if (diff <= 0) { setCountdown('Sending soon...'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(iv);
  }, [nextSend, emailActive]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
            </Link>
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Daily Threat Summary Email</h1>
              <p className="text-slate-400 text-sm">Automatic 24-hour threat digest with total neutralization count</p>
            </div>
          </div>
          <PrintReportButton
            reportTitle="Daily Threat Summary Email Configuration"
            subtitle="Automated daily threat digest settings and delivery log"
            filename="daily-threat-email-config-{date}.pdf"
            sections={[
              { heading: 'CONFIGURATION', rows: [['Status', emailActive ? 'ACTIVE — Sending daily' : 'INACTIVE'], ['Recipient', savedEmail || 'Not configured'], ['Last Sent', lastSent ? format(lastSent, 'MMM d, yyyy HH:mm') : 'Never'], ['Next Send', nextSend && emailActive ? format(nextSend, 'MMM d, yyyy HH:mm') : 'N/A'], ['Emails Sent This Session', sendLog.filter(l => l.success).length]] },
              { heading: 'CURRENT 24H SNAPSHOT', rows: [['Total Threats (24h)', recentAnomalies.length + recentAlerts.length], ['Critical Alerts', criticalAlerts.length], ['High Anomalies', highAnomalies.length], ['Total Neutralizations', totalNeutralizations], ['Auto-Blocked', autoBlocked.length], ['IP Shield Scrambles', totalScrambles], ['Protection Score', `${score}/100`]] },
              { heading: 'SEND LOG', body: sendLog.length > 0 ? sendLog.map(l => `[${format(l.time, 'MMM d HH:mm:ss')}] ${l.type?.toUpperCase()} — ${l.success ? `Score: ${l.score}/100 | Threats: ${l.threats} | Neutralizations: ${l.neutralizations}` : `FAILED: ${l.error}`}`).join('\n') : 'No emails sent yet.' },
            ]}
          />
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Threats (24h)', value: recentAnomalies.length + recentAlerts.length, color: 'text-red-400', icon: AlertTriangle },
            { label: 'Total Neutralizations', value: totalNeutralizations, color: 'text-green-400', icon: Zap },
            { label: 'Auto-Blocked', value: autoBlocked.length, color: 'text-cyan-400', icon: Shield },
            { label: 'Protection Score', value: `${score}/100`, color: score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400', icon: Shield },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="bg-slate-800/60 border-slate-700">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-slate-400 text-xs mt-1">{s.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Status card */}
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
                      {emailActive ? 'Daily Reports Active' : 'Reports Inactive'}
                    </span>
                  </div>
                  {emailActive && savedEmail && (
                    <p className="text-slate-400 text-sm mt-0.5">Sending daily digest to: <span className="text-cyan-300">{savedEmail}</span></p>
                  )}
                  {emailActive && countdown && (
                    <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Next report in: <span className="text-cyan-400 font-mono">{countdown}</span>
                    </p>
                  )}
                  {lastSent && <p className="text-slate-500 text-xs mt-0.5">Last sent: {format(lastSent, 'MMM d, HH:mm:ss')}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={() => sendReport(true)} disabled={sending || !savedEmail} variant="outline" className="border-slate-600 text-slate-300">
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
                  {emailActive ? <><Pause className="w-4 h-4 mr-2" />Stop Daily Reports</> : <><Play className="w-4 h-4 mr-2" />Start Daily Reports</>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Config */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-cyan-400" /> Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-1.5 block">Recipient Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="flex-1 bg-slate-900 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
                  />
                  <Button onClick={() => {
                    if (!recipientEmail.includes('@')) { toast.error('Enter a valid email'); return; }
                    setSavedEmail(recipientEmail);
                    toast.success('Email saved!');
                  }} className="bg-cyan-600 hover:bg-cyan-700 text-white" size="sm">Save</Button>
                </div>
                {savedEmail && <p className="text-green-400 text-xs mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Saved: {savedEmail}</p>}
              </div>

              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700 space-y-2">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Email Includes</p>
                {[
                  'Total threats detected in last 24h',
                  'Total neutralizations performed',
                  'Critical & emergency alert details',
                  'Auto-blocked incident count',
                  'IP Shield scramble performance',
                  'Overall protection score',
                  'Per-category threat breakdown',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                    <span className="text-slate-400 text-xs">{item}</span>
                  </div>
                ))}
              </div>

              {/* Live snapshot */}
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Current 24h Snapshot</p>
                <div className="space-y-1.5">
                  {[
                    ['Anomalies', recentAnomalies.length, 'text-orange-400'],
                    ['Criminal Alerts', recentAlerts.length, 'text-red-400'],
                    ['Critical/Emergency', criticalAlerts.length, 'text-red-400'],
                    ['Neutralizations', totalNeutralizations, 'text-green-400'],
                    ['Auto-Blocked', autoBlocked.length, 'text-green-400'],
                    ['Scramble Iterations', totalScrambles.toLocaleString(), 'text-purple-400'],
                  ].map(([l, v, c]) => (
                    <div key={l} className="flex justify-between">
                      <span className="text-slate-500 text-xs">{l}</span>
                      <span className={`text-xs font-medium ${c}`}>{v}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-700 pt-1.5 mt-1 flex justify-between">
                    <span className="text-slate-500 text-xs">Protection Score</span>
                    <span className={`text-xs font-bold ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{score}/100</span>
                  </div>
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
                    <p className="text-xs mt-1">Save an email address and click "Send Now" to test, or activate daily reports.</p>
                  </div>
                ) : sendLog.map((entry, i) => (
                  <div key={i} className={`rounded-lg p-3 border text-sm ${entry.success ? 'border-green-700/30 bg-green-900/10' : 'border-red-700/30 bg-red-900/10'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {entry.success ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                        <span className={`text-xs font-medium ${entry.success ? 'text-green-300' : 'text-red-300'}`}>{entry.success ? 'Delivered' : 'Failed'}</span>
                        <Badge className={`text-xs ${entry.type === 'manual' ? 'bg-slate-700 text-slate-300' : 'bg-cyan-500/20 text-cyan-300'}`}>{entry.type}</Badge>
                      </div>
                      <span className="text-slate-500 text-xs">{format(entry.time, 'HH:mm:ss')}</span>
                    </div>
                    {entry.success ? (
                      <p className="text-slate-400 text-xs">Score: <span className="text-white">{entry.score}/100</span> · {entry.threats} threats · <span className="text-green-400 font-medium">{entry.neutralizations} neutralizations</span></p>
                    ) : (
                      <p className="text-red-400 text-xs">{entry.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}