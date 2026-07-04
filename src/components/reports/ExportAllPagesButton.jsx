import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, FileStack } from 'lucide-react';
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
      const [
        universes, requests, keys, securityLogs, hardwareTokens,
        meetings, alerts, anomalies, scrambling, threats,
        tokens, metrics, subscriptions, roles, linkedAccounts,
        reports, incidentRules, tokenRegs, roleAssignments, interactions,
      ] = await Promise.all([
        base44.entities.Universe.list('-created_date', 100),
        base44.entities.UniversalRequest.list('-created_date', 50),
        base44.entities.UniversalKey.list('-created_date', 100),
        base44.entities.SecurityLog.list('-created_date', 50),
        base44.entities.HardwareToken.filter({ is_active: true }),
        base44.entities.InvestorMeeting.list('-meeting_date', 100),
        base44.entities.CriminalActivityAlert.list('-created_date', 50),
        base44.entities.BehaviorAnomaly.list('-created_date', 50),
        base44.entities.ScramblingSession.list('-created_date', 50),
        base44.entities.ThreatCorrelation.list('-created_date', 50),
        base44.entities.TokenRegistration.list('-created_date', 50),
        base44.entities.AnalyticsMetric.list('-created_date', 100),
        base44.entities.Subscription.list('-created_date', 50),
        base44.entities.Role.list('-created_date', 50),
        base44.entities.LinkedAccount.list('-created_date', 50),
        base44.entities.SecurityReport.list('-created_date', 50),
        base44.entities.IncidentRule.list('-created_date', 50),
        base44.entities.TokenRegistration.list('-created_date', 50),
        base44.entities.UserRoleAssignment.list('-created_date', 50),
        base44.entities.InvestorInteraction.list('-timestamp', 100),
      ]);

      const doc = new jsPDF();
      const today = format(new Date(), 'MMMM d, yyyy HH:mm');
      const dateStr = format(new Date(), 'yyyy-MM-dd');

      // Master cover page
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 297, 'F');
      doc.setFillColor(6, 182, 212);
      doc.rect(0, 0, 4, 297, 'F');
      doc.setTextColor(6, 182, 212);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPLETE SYSTEM', 14, 80);
      doc.text('EXPORT', 14, 100);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Three-Pillar Security System', 14, 120);
      doc.text('All Pages — Single Document', 14, 128);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${today}`, 14, 145);
      doc.text(`Total Pages in Report: 33 sections`, 14, 153);
      doc.text(`Sections: Dashboard, Security, Analytics, Investor,`, 14, 165);
      doc.text('Authenticator, Scrambler, Diagnostics, Reports, and more', 14, 171);

      // Demo environment banner
      doc.setFillColor(180, 83, 9);
      doc.rect(14, 180, 182, 12, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 237, 213);
      doc.text('⚠️ DEMO ENVIRONMENT — INTERNAL TESTING ONLY', 20, 188);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(255, 200, 150);
      doc.text('Simulated security layer. Not for production use. Hardware prototype required for full functionality.', 20, 192);

      let y = 20;
      const checkPage = (needed = 20) => {
        if (y + needed > 275) { doc.addPage(); y = 20; }
      };
      const section = (title) => {
        checkPage(30);
        doc.setFillColor(15, 23, 42);
        doc.rect(0, y - 8, 210, 14, 'F');
        doc.setFillColor(6, 182, 212);
        doc.rect(0, y - 8, 4, 14, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(6, 182, 212);
        doc.text(title, 10, y);
        y += 10;
      };
      const rows = (data) => {
        data.forEach(([l, v], i) => {
          checkPage(8);
          if (i % 2 === 0) { doc.setFillColor(241, 245, 249); doc.rect(10, y - 5, 190, 8, 'F'); }
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(30, 41, 59);
          doc.text(String(l), 13, y);
          doc.setFont('helvetica', 'normal'); doc.setTextColor(6, 182, 212);
          doc.text(String(v), 110, y);
          y += 9;
        });
        y += 4;
      };
      const body = (text) => {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(51, 65, 85);
        doc.splitTextToSize(text, 188).forEach(line => { checkPage(7); doc.text(line, 10, y); y += 6; });
        y += 5;
      };

      // Start content on new page
      doc.addPage();
      y = 20;

      // 1. Dashboard
      section('1. DASHBOARD — System Overview');
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

      // 2. AIThreatAnalysis
      section('2. AI THREAT ANALYSIS');
      rows([
        ['Active Threat Correlations', threats.length],
        ['Critical Severity', threats.filter(t => t.severity === 'critical').length],
        ['High Severity', threats.filter(t => t.severity === 'high').length],
        ['Under Investigation', threats.filter(t => t.status === 'investigating').length],
        ['Mitigated', threats.filter(t => t.status === 'mitigated').length],
      ]);
      body(threats.length > 0
        ? threats.slice(0, 10).map(t => `• ${t.attack_chain_name} — Severity: ${t.severity?.toUpperCase()} — Status: ${t.status} — Confidence: ${t.confidence_score || 'N/A'}%`).join('\n')
        : 'No active threat correlations detected.');

      // 3. AIThreatDetection
      section('3. AI THREAT DETECTION');
      rows([
        ['Security Events (Recent)', securityLogs.length],
        ['High/Critical Events', securityLogs.filter(l => l.threat_level === 'high' || l.threat_level === 'critical').length],
        ['Access Denied Events', securityLogs.filter(l => !l.success).length],
        ['Suspicious Activity', securityLogs.filter(l => l.event_type === 'suspicious_activity').length],
        ['DNA Verified', securityLogs.filter(l => l.event_type === 'dna_verified').length],
      ]);
      body(securityLogs.length > 0
        ? securityLogs.slice(0, 10).map(l => `• [${l.threat_level?.toUpperCase() || 'NONE'}] ${l.event_type} — ${l.success ? 'SUCCESS' : 'BLOCKED'} — ${l.details || ''}`).join('\n')
        : 'No security events recorded.');

      // 4. Analytics
      section('4. ANALYTICS');
      const successMetrics = metrics.filter(m => m.success);
      const failedMetrics = metrics.filter(m => !m.success);
      const avgLatency = metrics.length > 0 ? Math.round(metrics.reduce((s, m) => s + (m.latency_ms || 0), 0) / metrics.length) : 0;
      rows([
        ['Total Metrics Tracked', metrics.length],
        ['Successful Operations', successMetrics.length],
        ['Failed Operations', failedMetrics.length],
        ['Avg Latency (ms)', avgLatency],
        ['Error Rate', metrics.length > 0 ? `${Math.round(failedMetrics.length / metrics.length * 100)}%` : '0%'],
      ]);

      // 5. Authenticator
      section('5. AUTHENTICATOR — BioVerify');
      rows([
        ['Active Hardware Tokens', hardwareTokens.length],
        ['Linked Accounts', linkedAccounts.length],
        ['Active Subscriptions', subscriptions.length],
        ['Token Registrations', tokenRegs.length],
        ['Biometric Method', 'DNA Breathalyzer'],
        ['Token Replacement Cost', '$29.99'],
      ]);
      body(hardwareTokens.length > 0
        ? hardwareTokens.map(t => `• ${t.device_name} (ID: ${t.device_id}) — Active: ${t.is_active ? 'YES' : 'NO'} — Failed Attempts: ${t.failed_attempts || 0}`).join('\n')
        : 'No active hardware tokens.');
      body(linkedAccounts.length > 0
        ? linkedAccounts.slice(0, 10).map(a => `• ${a.account_provider} — ${a.account_identifier} — Type: ${a.account_type} — Status: ${a.status}`).join('\n')
        : 'No linked accounts.');

      // 6. DynamicScrambler
      section('6. DYNAMIC SCRAMBLER — IP Shield');
      const activeScrambles = scrambling.filter(s => s.status === 'active');
      const avgComplexity = scrambling.length > 0 ? Math.round(scrambling.reduce((s, sc) => s + (sc.complexity_level || 0), 0) / scrambling.length) : 0;
      const totalIterations = scrambling.reduce((s, sc) => s + (sc.iterations || 0), 0);
      rows([
        ['Total Scramble Sessions', scrambling.length],
        ['Active Sessions', activeScrambles.length],
        ['Total Iterations', totalIterations],
        ['Avg Complexity Level', avgComplexity],
        ['Scramble Types', [...new Set(scrambling.map(s => s.scramble_type))].length],
      ]);
      body(scrambling.length > 0
        ? scrambling.slice(0, 10).map(s => `• ${s.scramble_type} — Status: ${s.status} — Iterations: ${s.iterations || 0} — Complexity: ${s.complexity_level || 0}/100`).join('\n')
        : 'No scrambling sessions recorded.');

      // 7. InvestorDemo & 8. InvestorPresentation
      section('7. INVESTOR DEMO & PRESENTATION');
      rows([
        ['Total Investor Leads', meetings.length],
        ['Avg Interest Level', meetings.length > 0 ? (meetings.reduce((s, m) => s + Number(m.interest_level || 0), 0) / meetings.length).toFixed(1) : 'N/A'],
        ['Counties Covered', [...new Set(meetings.map(m => m.county).filter(Boolean))].length],
      ]);
      body(meetings.length > 0
        ? meetings.slice(0, 10).map(m => `• ${m.investor_name} (${m.company || 'N/A'}) — Interest: ${m.interest_level}/5 — Status: ${m.status}`).join('\n')
        : 'No investor meetings recorded.');

      // 9. LiveDemonstration
      section('8. LIVE DEMONSTRATION');
      body('Live demonstration capabilities include real-time DNA verification, dynamic key rotation visualization, AI threat detection in action, and multi-universe API routing. The demo showcases the three-pillar architecture with live data from the production system.');

      // 10. MarketingMaterials
      section('9. MARKETING MATERIALS');
      body('Marketing materials include pitch decks, technical whitepapers, demo videos, and audio content. Materials cover the three-pillar security system, DNA-based authentication, dynamic key scrambling, and AI threat detection. All materials are available for download and investor distribution.');

      // 11. RoleManagement
      section('10. ROLE MANAGEMENT');
      rows([
        ['Total Roles', roles.length],
        ['System Roles', roles.filter(r => r.is_system_role).length],
        ['Role Assignments', roleAssignments.length],
      ]);
      body(roles.length > 0
        ? roles.map(r => `• ${r.role_name}${r.is_system_role ? ' (System)' : ''} — ${r.description || 'No description'}`).join('\n')
        : 'No roles defined.');

      // 12. SecurityReports
      section('11. SECURITY REPORTS');
      rows([
        ['Total Reports', reports.length],
        ['Active Reports', reports.filter(r => r.is_active).length],
        ['Email Delivery', reports.filter(r => r.delivery_method === 'email' || r.delivery_method === 'both').length],
        ['Daily Reports', reports.filter(r => r.schedule_type === 'daily').length],
        ['Weekly Reports', reports.filter(r => r.schedule_type === 'weekly').length],
      ]);
      body(reports.length > 0
        ? reports.slice(0, 10).map(r => `• ${r.report_name} — Schedule: ${r.schedule_type} — Active: ${r.is_active ? 'YES' : 'NO'}`).join('\n')
        : 'No security reports configured.');

      // 13. SystemDiagnostics
      section('12. SYSTEM DIAGNOSTICS');
      const healthyUniverses = universes.filter(u => u.status === 'active');
      const degradedUniverses = universes.filter(u => u.status === 'degraded');
      rows([
        ['System Health', degradedUniverses.length === 0 ? 'HEALTHY' : 'DEGRADED'],
        ['Healthy Universes', healthyUniverses.length],
        ['Degraded Universes', degradedUniverses.length],
        ['Offline Universes', universes.filter(u => u.status === 'offline').length],
        ['Total Error Count (24h)', universes.reduce((s, u) => s + (u.error_count || 0), 0)],
        ['Avg Success Rate', universes.length > 0 ? `${Math.round(universes.reduce((s, u) => s + (u.success_rate || 100), 0) / universes.length)}%` : '100%'],
      ]);

      // 14. ThreatAnalysis
      section('13. THREAT ANALYSIS');
      body(threats.length > 0
        ? threats.slice(0, 10).map(t => {
            const stages = (t.attack_stages || []).length;
            return `• ${t.attack_chain_name} — Severity: ${t.severity} — Stages: ${stages} — Confidence: ${t.confidence_score || 'N/A'}%`;
          }).join('\n')
        : 'No threat correlations analyzed.');
      body(threats.length > 0 && threats[0].ai_analysis
        ? `AI Analysis: ${threats[0].ai_analysis}`
        : '');

      // 15. ThreePillarView
      section('14. THREE-PILLAR ARCHITECTURE');
      body('Pillar 1: DNA Authentication — BioVerify hardware tokens with genetic verification using saliva samples and breathalyzer backup. Tokens generate codes every 2 seconds and auto-lock after 3 failed attempts.\n\nPillar 2: Dynamic Scrambling — IP Shield rotates API keys every 0.1–5 seconds across multiple universes with quantum encryption. Keys are bound to DNA-verified tokens.\n\nPillar 3: AI Threat Detection — Real-time behavioral analysis, criminal activity monitoring, and automated threat neutralization with anomaly orchestration.');

      // 16. UniversePerformance
      section('15. UNIVERSE PERFORMANCE');
      rows([
        ['Total Universes', universes.length],
        ['Avg Success Rate', universes.length > 0 ? `${Math.round(universes.reduce((s, u) => s + (u.success_rate || 100), 0) / universes.length)}%` : '100%'],
        ['Total Errors (24h)', universes.reduce((s, u) => s + (u.error_count || 0), 0)],
        ['Auth Types Used', [...new Set(universes.map(u => u.auth_type).filter(Boolean))].length],
      ]);
      body(universes.length > 0
        ? universes.slice(0, 10).map(u => `• ${u.name} — Status: ${u.status?.toUpperCase()} — Success: ${u.success_rate ?? 100}% — Errors: ${u.error_count || 0}`).join('\n')
        : 'No universes connected.');

      // 17. SecurityAnalytics
      section('16. SECURITY ANALYTICS');
      const authMetrics = metrics.filter(m => m.metric_type === 'auth_attempt');
      const securityEventMetrics = metrics.filter(m => m.metric_type === 'security_event');
      const errorMetrics = metrics.filter(m => m.metric_type === 'error');
      rows([
        ['Auth Attempt Metrics', authMetrics.length],
        ['Security Event Metrics', securityEventMetrics.length],
        ['Error Metrics', errorMetrics.length],
        ['Performance Metrics', metrics.filter(m => m.metric_type === 'performance').length],
        ['API Call Metrics', metrics.filter(m => m.metric_type === 'api_call').length],
      ]);

      // 18. AnomalyInvestigation
      section('17. ANOMALY INVESTIGATION');
      rows([
        ['Total Anomalies', anomalies.length],
        ['Detected', anomalies.filter(a => a.status === 'detected').length],
        ['Investigating', anomalies.filter(a => a.status === 'investigating').length],
        ['Confirmed Threats', anomalies.filter(a => a.status === 'confirmed_threat').length],
        ['False Positives', anomalies.filter(a => a.status === 'false_positive').length],
        ['Resolved', anomalies.filter(a => a.status === 'resolved').length],
      ]);
      body(anomalies.length > 0
        ? anomalies.slice(0, 10).map(a => `• ${a.anomaly_type} — User: ${a.user_identifier} — Severity: ${a.severity} — Deviation: ${a.deviation_score || 'N/A'}`).join('\n')
        : 'No behavior anomalies detected.');

      // 19. ExecutiveSummary
      section('18. EXECUTIVE SUMMARY');
      body(`System Status: ${degradedUniverses.length === 0 ? 'OPERATIONAL' : 'DEGRADED'}\n\nThe Three-Pillar Security System is currently ${degradedUniverses.length === 0 ? 'fully operational' : 'experiencing degradation in ' + degradedUniverses.length + ' universe(s)'}. Key metrics:\n• ${universes.length} API universes connected with ${Math.round(universes.reduce((s, u) => s + (u.success_rate || 100), 0) / Math.max(universes.length, 1))}% average success rate\n• ${securityLogs.length} security events logged in recent period\n• ${threats.length} active threat correlations under monitoring\n• ${anomalies.length} behavior anomalies tracked\n• ${meetings.length} investor pipeline leads with ${meetings.filter(m => m.status === 'Interested' || m.status === 'Negotiating').length} active negotiations\n• ${hardwareTokens.length} hardware tokens active\n• ${scrambling.filter(s => s.status === 'active').length} scrambling sessions protecting the system\n\nRecommendation: ${alerts.filter(a => a.status === 'open').length > 0 ? 'Review open criminal activity alerts immediately.' : 'All systems nominal — continue routine monitoring.'}`);

      // 20. QuantumKeyManagement
      section('19. QUANTUM KEY MANAGEMENT');
      const activeKeys = keys.filter(k => k.status === 'active');
      const expiringKeys = keys.filter(k => k.status === 'expiring_soon');
      rows([
        ['Total Keys', keys.length],
        ['Active', activeKeys.length],
        ['Expiring Soon', expiringKeys.length],
        ['Expired', keys.filter(k => k.status === 'expired').length],
        ['Revoked', keys.filter(k => k.status === 'revoked').length],
        ['Total Usage Count', keys.reduce((s, k) => s + (k.usage_count || 0), 0)],
      ]);
      body(keys.length > 0
        ? keys.slice(0, 10).map(k => `• ${k.key_name} — Universe: ${k.universe_id} — Status: ${k.status} — Usage: ${k.usage_count || 0}`).join('\n')
        : 'No universal keys managed.');

      // 21. PredictiveAnalytics
      section('20. PREDICTIVE ANALYTICS');
      body(`Based on ${metrics.length} tracked metrics and ${requests.length} API requests, the system predicts:\n• Expected uptime: 99.9%+ (current: ${universes.length > 0 ? Math.round(universes.reduce((s, u) => s + (u.success_rate || 100), 0) / universes.length) : 100}%)\n• Projected API growth: ${Math.round((requests.length * 0.15))} additional requests next period\n• Threat risk assessment: ${threats.filter(t => t.severity === 'critical' || t.severity === 'high').length > 0 ? 'ELEVATED — active high/critical threats' : 'LOW — no critical threats'}\n• Key rotation health: ${activeKeys.length}/${keys.length} keys active (${keys.length > 0 ? Math.round(activeKeys.length / keys.length * 100) : 100}%)`);

      // 22. RedTeamSuite
      section('21. RED TEAM SUITE');
      body('Red Team testing capabilities include simulated attack chains, credential abuse detection, privilege escalation attempts, and data exfiltration pattern testing. The suite validates all three security pillars under adversarial conditions and generates compliance reports for security audits.');

      // 23. AnomalyOrchestration
      section('22. ANOMALY ORCHESTRATION');
      const criticalAnomalies = anomalies.filter(a => a.severity === 'critical' || a.severity === 'high');
      rows([
        ['Engine Status', criticalAnomalies.length > 0 ? 'ACTIVE — Auto-Neutralizing' : 'STANDBY'],
        ['Critical/High Anomalies', criticalAnomalies.length],
        ['Auto-Remediation', 'Enabled'],
        ['Session Revocation', 'Automatic for critical threats'],
      ]);
      body(anomalies.length > 0
        ? anomalies.slice(0, 10).map(a => `• [${a.severity?.toUpperCase()}] ${a.anomaly_type} — Status: ${a.status} — ${a.ai_reasoning ? a.ai_reasoning.substring(0, 80) : ''}`).join('\n')
        : 'No anomalies requiring orchestration.');

      // 24. UnifiedSecurityDashboard
      section('23. UNIFIED SECURITY DASHBOARD');
      rows([
        ['Security Logs', securityLogs.length],
        ['Active Alerts', alerts.filter(a => a.status === 'open' || a.status === 'investigating').length],
        ['Behavior Anomalies', anomalies.filter(a => a.status === 'detected' || a.status === 'investigating').length],
        ['Threat Correlations', threats.filter(t => t.status === 'active').length],
        ['Incident Rules Active', incidentRules.filter(r => r.is_active).length],
        ['Auto-Blocked Threats', alerts.filter(a => a.auto_blocked).length],
      ]);

      // 25. HourlySecurityEmailSetup & 26. DailyThreatEmail
      section('24. SECURITY EMAIL REPORTS');
      rows([
        ['Total Report Configs', reports.length],
        ['Daily Digest', reports.filter(r => r.schedule_type === 'daily').length],
        ['Weekly Reports', reports.filter(r => r.schedule_type === 'weekly').length],
        ['Monthly Reports', reports.filter(r => r.schedule_type === 'monthly').length],
        ['Email Delivery', reports.filter(r => r.delivery_method === 'email' || r.delivery_method === 'both').length],
        ['Total Recipients', reports.reduce((s, r) => s + (r.recipients || []).length, 0)],
      ]);

      // 27. SeekingPartners
      section('25. SEEKING PARTNERS');
      body('The Three-Pillar Security System is seeking strategic partners in cybersecurity, API infrastructure, and biometric authentication. Partnership opportunities include technology integration, co-development, distribution agreements, and investment. The system is based in Texas, USA and operates under Texas state jurisdiction with NDA-protected disclosures.');

      // 28. InvestorCRM
      section('26. INVESTOR CRM');
      const statusCounts = {};
      meetings.forEach(m => { statusCounts[m.status] = (statusCounts[m.status] || 0) + 1; });
      rows([
        ['Total Leads', meetings.length],
        ['Contacted', statusCounts['Contacted'] || 0],
        ['NDA Sent', statusCounts['NDA Sent'] || 0],
        ['Meeting Scheduled', statusCounts['Meeting Scheduled'] || 0],
        ['Follow-up Needed', statusCounts['Follow-up Needed'] || 0],
        ['Negotiating', statusCounts['Negotiating'] || 0],
        ['Interested', statusCounts['Interested'] || 0],
        ['Passed', statusCounts['Passed'] || 0],
      ]);

      // 29. TexasNDA
      section('27. TEXAS NDA');
      body('Texas Mutual Non-Disclosure Agreement generation system. Creates legally binding NDAs under Texas state law for protecting proprietary technology disclosures during investor meetings, partnership discussions, and due diligence processes. NDAs are customized per recipient and include specific clauses for DNA-based authentication technology protection.');

      // 30. InvestorOverview
      section('28. INVESTOR OVERVIEW');
      rows([
        ['Pipeline Value', `${meetings.filter(m => m.status === 'Interested' || m.status === 'Negotiating').length} active negotiations`],
        ['Avg Interest', meetings.length > 0 ? `${(meetings.reduce((s, m) => s + Number(m.interest_level || 0), 0) / meetings.length).toFixed(1)}/5` : 'N/A'],
        ['Follow-ups Due', meetings.filter(m => m.status === 'Follow-up Needed').length],
        ['Meetings Held', meetings.filter(m => m.status === 'Meeting Scheduled' || m.status === 'Interested' || m.status === 'Negotiating' || m.status === 'Passed').length],
      ]);

      // 31. LeadActivitySummary
      section('29. LEAD ACTIVITY SUMMARY');
      body(meetings.length > 0
        ? meetings.slice(0, 15).map(m => `• ${m.investor_name} (${m.company || 'N/A'}) — Status: ${m.status} — Interest: ${m.interest_level}/5 — Meeting: ${m.meeting_date || 'N/A'}${m.follow_up_date ? ' — Follow-up: ' + m.follow_up_date : ''}`).join('\n')
        : 'No lead activity recorded.');

      // 32. About
      section('30. ABOUT');
      body('The Three-Pillar Security System is a next-generation API security platform combining DNA-based biometric authentication, dynamic key scrambling, and AI-powered threat detection. Built in Texas, USA, the system provides architected-for-resilience API key management through rotating credentials bound to genetic identity, with real-time threat neutralization and multi-universe failover. Founded 2024.');

      // 33. Contact
      section('31. CONTACT');
      body('For inquiries, partnerships, or demonstrations of the Three-Pillar Security System, please use the contact form available on the Contact page. The system is based in Texas, USA and operates under Texas state jurisdiction. All technology disclosures require a signed Texas NDA prior to detailed discussions.');

      // Criminal Activity Alerts (full detail)
      section('32. CRIMINAL ACTIVITY ALERTS');
      rows([
        ['Total Alerts', alerts.length],
        ['Open', alerts.filter(a => a.status === 'open').length],
        ['Investigating', alerts.filter(a => a.status === 'investigating').length],
        ['Confirmed', alerts.filter(a => a.status === 'confirmed').length],
        ['Resolved', alerts.filter(a => a.status === 'resolved').length],
        ['Auto-Blocked', alerts.filter(a => a.auto_blocked).length],
        ['Authorities Notified', alerts.filter(a => a.authorities_notified).length],
      ]);
      body(alerts.length > 0
        ? alerts.slice(0, 10).map(a => `• [${a.severity?.toUpperCase()}] ${a.alert_type} — User: ${a.user_identifier || 'N/A'} — IP: ${a.ip_address || 'N/A'} — Status: ${a.status} — Confidence: ${a.confidence_score || 'N/A'}%`).join('\n')
        : 'No criminal activity alerts.');

      // Incident Rules
      section('33. INCIDENT RESPONSE RULES');
      rows([
        ['Total Rules', incidentRules.length],
        ['Active Rules', incidentRules.filter(r => r.is_active).length],
        ['Total Executions', incidentRules.reduce((s, r) => s + (r.execution_count || 0), 0)],
      ]);
      body(incidentRules.length > 0
        ? incidentRules.map(r => `• ${r.rule_name} — Trigger: ${r.trigger_type} — Min Severity: ${r.min_severity} — Active: ${r.is_active ? 'YES' : 'NO'} — Executions: ${r.execution_count || 0}`).join('\n')
        : 'No incident rules configured.');

      // Token Registrations
      section('34. TOKEN REGISTRATIONS');
      rows([
        ['Total Registrations', tokenRegs.length],
        ['Pending', tokenRegs.filter(t => t.registration_status === 'pending').length],
        ['DNA Verified', tokenRegs.filter(t => t.registration_status === 'dna_verified').length],
        ['Activated', tokenRegs.filter(t => t.registration_status === 'activated').length],
        ['Rejected', tokenRegs.filter(t => t.registration_status === 'rejected').length],
      ]);

      // Investor Interaction History
      section('35. INVESTOR INTERACTION HISTORY');
      const interactionCounts = {};
      interactions.forEach(i => { interactionCounts[i.interaction_type] = (interactionCounts[i.interaction_type] || 0) + 1; });
      rows([
        ['Total Interactions Logged', interactions.length],
        ['Status Changes', interactionCounts['status_change'] || 0],
        ['Meetings Logged', interactionCounts['meeting_logged'] || 0],
        ['Follow-Ups Scheduled', interactionCounts['follow_up_scheduled'] || 0],
        ['Checklists Created', interactionCounts['checklist_created'] || 0],
        ['Feedback Updates', interactionCounts['feedback_updated'] || 0],
      ]);
      body(interactions.length > 0
        ? interactions.slice(0, 15).map(i => `• [${format(new Date(i.timestamp), 'MMM d, yyyy')}] ${i.interaction_type} — ${i.investor_name}: ${i.description}`).join('\n')
        : 'No interactions logged yet.');

      // Subscription Revenue Estimate
      const PLAN_PRICES = { basic: 9.99, pro: 49.99, enterprise: 199.99 };
      const monthlyRevenue = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + (PLAN_PRICES[s.plan_type] || 0), 0);
      section('36. SUBSCRIPTIONS & REVENUE');
      rows([
        ['Total Subscriptions', subscriptions.length],
        ['Active', subscriptions.filter(s => s.status === 'active').length],
        ['Basic Plan', subscriptions.filter(s => s.plan_type === 'basic').length],
        ['Pro Plan', subscriptions.filter(s => s.plan_type === 'pro').length],
        ['Enterprise', subscriptions.filter(s => s.plan_type === 'enterprise').length],
        ['Auto-Renew Enabled', subscriptions.filter(s => s.auto_renew).length],
        ['Monthly Revenue (Est.)', `$${monthlyRevenue.toFixed(2)}`],
        ['Annual Revenue (Est.)', `$${(monthlyRevenue * 12).toFixed(2)}`],
      ]);

      // Role Permissions Detail
      section('37. ROLE PERMISSIONS MATRIX');
      body(roles.length > 0
        ? roles.map(r => {
            const perms = r.permissions || {};
            const enabled = Object.entries(perms).filter(([k, v]) => v === true).map(([k]) => k);
            return `• ${r.role_name}${r.is_system_role ? ' (System)' : ''} — ${r.description || 'No description'}\n  Enabled Permissions: ${enabled.length > 0 ? enabled.join(', ') : 'None'}`;
          }).join('\n')
        : 'No roles defined.');

      // Threat Correlation Details
      section('38. THREAT CORRELATION DETAILS');
      body(threats.length > 0
        ? threats.map(t => {
            const stages = (t.attack_stages || []).length;
            const systems = (t.affected_systems || []).join(', ') || 'N/A';
            const actions = (t.recommended_actions || []).slice(0, 3).join('; ') || 'N/A';
            return `• ${t.attack_chain_name} — Severity: ${t.severity} — Status: ${t.status}\n  Stages: ${stages} | Systems: ${systems} | Confidence: ${t.confidence_score || 'N/A'}%\n  Recommended: ${actions}`;
          }).join('\n')
        : 'No threat correlations recorded.');

      // Analytics by Auth Method
      section('39. ANALYTICS BY AUTH METHOD');
      const authMethodCounts = {};
      metrics.filter(m => m.auth_method).forEach(m => { authMethodCounts[m.auth_method] = (authMethodCounts[m.auth_method] || 0) + 1; });
      const methodEntries = Object.entries(authMethodCounts);
      rows([
        ['DNA Authentications', authMethodCounts['dna'] || 0],
        ['Fingerprint', authMethodCounts['fingerprint'] || 0],
        ['Facial Recognition', authMethodCounts['facial'] || 0],
        ['Breathalyzer', authMethodCounts['breathalyzer'] || 0],
        ['Liveness Check', authMethodCounts['liveness'] || 0],
        ['Continuous Auth', authMethodCounts['continuous'] || 0],
      ]);

      // Linked Accounts by Type
      section('40. LINKED ACCOUNTS BY TYPE');
      const accountTypeCounts = {};
      linkedAccounts.forEach(a => { accountTypeCounts[a.account_type] = (accountTypeCounts[a.account_type] || 0) + 1; });
      rows([
        ['Email Accounts', accountTypeCounts['email'] || 0],
        ['Social Accounts', accountTypeCounts['social'] || 0],
        ['Banking Accounts', accountTypeCounts['banking'] || 0],
        ['Cloud Storage', accountTypeCounts['cloud_storage'] || 0],
        ['Other', accountTypeCounts['other'] || 0],
        ['Active', linkedAccounts.filter(a => a.status === 'active').length],
        ['Locked', linkedAccounts.filter(a => a.status === 'locked').length],
      ]);

      // API Universe by Auth Type
      section('41. API UNIVERSE AUTH BREAKDOWN');
      const authTypeCounts = {};
      universes.forEach(u => { if (u.auth_type) authTypeCounts[u.auth_type] = (authTypeCounts[u.auth_type] || 0) + 1; });
      rows([
        ['API Key Auth', authTypeCounts['api_key'] || 0],
        ['Bearer Token', authTypeCounts['bearer'] || 0],
        ['OAuth', authTypeCounts['oauth'] || 0],
        ['No Auth', authTypeCounts['none'] || 0],
      ]);
      body(universes.length > 0
        ? universes.slice(0, 15).map(u => `• ${u.name} — Auth: ${u.auth_type || 'N/A'} — Base URL: ${u.base_url || 'N/A'} — Capabilities: ${(u.capabilities || []).join(', ') || 'N/A'}`).join('\n')
        : 'No universes connected.');

      // Request History detail
      section('42. API REQUEST HISTORY');
      body(requests.length > 0
        ? requests.slice(0, 20).map(r => `• [${r.status?.toUpperCase()}] "${r.intent}" → ${r.routed_to || 'N/A'} — ${r.latency_ms || '?'}ms${r.fallback_used ? ' (FALLBACK)' : ''}`).join('\n')
        : 'No API requests recorded.');

      // Footer on all pages
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 282, 210, 15, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('THREE-PILLAR SECURITY SYSTEM — DEMO ENVIRONMENT (INTERNAL TESTING ONLY)', 10, 289);
        doc.text(`Page ${i} of ${pages}  |  ${dateStr}`, 150, 289);
      }

      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `complete-system-export-${dateStr}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);

      toast.success(`Complete export generated (${pages} pages, all sections)!`);
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