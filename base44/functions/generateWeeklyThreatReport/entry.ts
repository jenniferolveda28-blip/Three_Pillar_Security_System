import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await base44.auth.me();
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      securityLogs,
      threatCorrelations,
      criminalAlerts,
      behaviorAnomalies,
      universes,
      recentRequests,
      scramblingSessions,
    ] = await Promise.all([
      base44.asServiceRole.entities.SecurityLog.list('-created_date', 500),
      base44.asServiceRole.entities.ThreatCorrelation.list('-created_date', 200),
      base44.asServiceRole.entities.CriminalActivityAlert.list('-created_date', 200),
      base44.asServiceRole.entities.BehaviorAnomaly.list('-created_date', 200),
      base44.asServiceRole.entities.Universe.list('-created_date', 100),
      base44.asServiceRole.entities.UniversalRequest.list('-created_date', 200),
      base44.asServiceRole.entities.ScramblingSession.list('-created_date', 50),
    ]);

    const weekAlerts = criminalAlerts.filter(a => new Date(a.created_date) > weekAgo);
    const weekAnomalies = behaviorAnomalies.filter(a => new Date(a.created_date) > weekAgo);
    const weekThreats = threatCorrelations.filter(t => new Date(t.created_date) > weekAgo);
    const weekLogs = securityLogs.filter(l => new Date(l.created_date) > weekAgo);

    const criticalAlerts = weekAlerts.filter(a => a.severity === 'critical' || a.severity === 'emergency');
    const highAlerts = weekAlerts.filter(a => a.severity === 'high');
    const openAlerts = weekAlerts.filter(a => a.status === 'open' || a.status === 'investigating');
    const resolvedAlerts = weekAlerts.filter(a => a.status === 'resolved' || a.status === 'false_positive');

    const criticalAnomalies = weekAnomalies.filter(a => a.severity === 'critical');
    const detectedAnomalies = weekAnomalies.filter(a => a.status === 'detected' || a.status === 'investigating');

    const activeThreats = weekThreats.filter(t => t.status === 'active' || t.status === 'investigating');

    const failedAccess = weekLogs.filter(l => l.event_type === 'access_denied' || l.success === false).length;
    const suspiciousEvents = weekLogs.filter(l => l.threat_level === 'high' || l.threat_level === 'critical').length;

    const activeUniverses = universes.filter(u => u.status === 'active').length;
    const degradedUniverses = universes.filter(u => u.status === 'degraded').length;
    const offlineUniverses = universes.filter(u => u.status === 'offline').length;

    const recentSuccess = recentRequests.filter(r => r.status === 'success').length;
    const successRate = recentRequests.length ? ((recentSuccess / recentRequests.length) * 100).toFixed(1) : '—';
    const avgLatency = recentRequests.length && recentRequests.filter(r => r.latency_ms).length
      ? Math.round(recentRequests.reduce((s, r) => s + (r.latency_ms || 0), 0) / recentRequests.length)
      : '—';

    const totalIterations = scramblingSessions.reduce((s, ss) => s + (ss.iterations || 0), 0);
    const avgProtection = scramblingSessions.length
      ? Math.round(scramblingSessions.reduce((s, ss) => s + (ss.protection_score || 0), 0) / scramblingSessions.length)
      : '—';

    // --- Generate PDF ---
    const doc = new jsPDF();
    let y = 20;

    // Header band
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(6, 182, 212);
    doc.setFontSize(22);
    doc.text('Weekly Threat & Anomaly Report', 20, 18);
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Three-Pillar Security System`, 20, 25);
    doc.text(`Period: ${weekAgo.toLocaleDateString()} — ${now.toLocaleDateString()}`, 20, 30);

    y = 45;
    doc.setTextColor(15, 23, 42);

    // Threat Summary
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text('Threat Summary', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const threatStats = [
      [`Critical/Emergency Alerts`, criticalAlerts.length],
      [`High Severity Alerts`, highAlerts.length],
      [`Open/Investigating Alerts`, openAlerts.length],
      [`Resolved/False Positive`, resolvedAlerts.length],
      [`Total Alerts This Week`, weekAlerts.length],
    ];
    threatStats.forEach(([label, val]) => {
      doc.text(`  • ${label}:`, 25, y);
      doc.text(String(val), 120, y);
      y += 6;
    });
    y += 4;

    // Anomalies
    doc.setFontSize(14);
    doc.setTextColor(139, 92, 246);
    doc.text('Behavior Anomalies', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const anomalyStats = [
      [`Critical Anomalies`, criticalAnomalies.length],
      [`Detected/Investigating`, detectedAnomalies.length],
      [`Total Anomalies This Week`, weekAnomalies.length],
    ];
    anomalyStats.forEach(([label, val]) => {
      doc.text(`  • ${label}:`, 25, y);
      doc.text(String(val), 120, y);
      y += 6;
    });
    y += 4;

    // Threat Correlations
    doc.setFontSize(14);
    doc.setTextColor(239, 68, 68);
    doc.text('Threat Correlations', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`  • Active/Investigating:`, 25, y);
    doc.text(String(activeThreats.length), 120, y);
    y += 6;
    doc.text(`  • Total Correlations This Week:`, 25, y);
    doc.text(String(weekThreats.length), 120, y);
    y += 6;
    y += 4;

    // Security Logs
    doc.setFontSize(14);
    doc.setTextColor(245, 158, 11);
    doc.text('Security Log Summary', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`  • Failed Access Attempts:`, 25, y);
    doc.text(String(failedAccess), 120, y);
    y += 6;
    doc.text(`  • High/Critical Threat Events:`, 25, y);
    doc.text(String(suspiciousEvents), 120, y);
    y += 6;
    doc.text(`  • Total Log Events This Week:`, 25, y);
    doc.text(String(weekLogs.length), 120, y);
    y += 10;

    // System Performance
    doc.setFontSize(14);
    doc.setTextColor(6, 182, 212);
    doc.text('System Performance', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const perfStats = [
      [`API Universes (Active / Degraded / Offline)`, `${activeUniverses} / ${degradedUniverses} / ${offlineUniverses}`],
      [`API Success Rate`, `${successRate}%`],
      [`Average Latency`, avgLatency === '—' ? 'N/A' : `${avgLatency}ms`],
      [`Scrambler Iterations`, totalIterations.toLocaleString()],
      [`Average Protection Score`, avgProtection === '—' ? 'N/A' : `${avgProtection}/100`],
    ];
    perfStats.forEach(([label, val]) => {
      doc.text(`  • ${label}:`, 25, y);
      doc.text(String(val), 120, y);
      y += 6;
    });

    // Notable Incidents detail
    if (weekAlerts.length > 0) {
      y += 6;
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setTextColor(220, 38, 38);
      doc.text('Notable Incidents This Week', 20, y);
      y += 8;

      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      weekAlerts.slice(0, 15).forEach(alert => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`[${(alert.severity || '').toUpperCase()}] ${alert.alert_type || 'Unknown'}`, 25, y);
        y += 5;
        if (alert.user_identifier) { doc.text(`    User: ${alert.user_identifier}`, 30, y); y += 4; }
        if (alert.ip_address) { doc.text(`    IP: ${alert.ip_address}`, 30, y); y += 4; }
        doc.text(`    Status: ${alert.status || 'open'} | Auto-Blocked: ${alert.auto_blocked ? 'Yes' : 'No'}`, 30, y);
        y += 6;
      });
    }

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('THREE-PILLAR SECURITY SYSTEM — Weekly Threat & Anomaly Report', 20, 290);
      doc.text(`Page ${p} of ${totalPages} · Generated ${now.toLocaleString()}`, 20, 294);
    }

    const pdfBytes = doc.output('arraybuffer');
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const file = new File([blob], `weekly-threat-report-${now.toISOString().split('T')[0]}.pdf`, { type: 'application/pdf' });
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    // --- Email via Gmail ---
    let emailSent = false;
    let recipientEmail = (user && user.email) || '';
    try {
      const { accessToken: gmailToken } = await base44.asServiceRole.connectors.getConnection('gmail');
      if (gmailToken) {
        const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
          headers: { 'Authorization': `Bearer ${gmailToken}` },
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          recipientEmail = profile.emailAddress || recipientEmail;
        }

        const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const subject = `📊 Weekly Threat & Anomaly Report — ${dateStr}`;

        const htmlBody = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
  <div style="background:#0f172a;padding:24px;border-radius:8px 8px 0 0;border-left:4px solid #06b6d4;">
    <h1 style="color:#06b6d4;margin:0;font-size:22px;">📊 Weekly Threat & Anomaly Report</h1>
    <p style="color:#94a3b8;margin:4px 0 0;font-size:13px;">${dateStr}</p>
  </div>
  <div style="padding:28px;background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
    <p style="font-size:14px;color:#334155;">Your weekly security summary is ready. Key highlights from the past 7 days:</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#334155;margin:16px 0;">
      <tr style="background:#fef2f2;"><td style="padding:10px 16px;font-weight:bold;border-bottom:1px solid #fee2e2;">Total Alerts</td><td style="padding:10px 16px;text-align:right;font-weight:bold;color:#ef4444;">${weekAlerts.length}</td></tr>
      <tr><td style="padding:8px 16px;padding-left:32px;border-bottom:1px solid #f1f5f9;">Critical/Emergency</td><td style="padding:8px 16px;text-align:right;">${criticalAlerts.length}</td></tr>
      <tr style="background:#f5f3ff;"><td style="padding:10px 16px;font-weight:bold;border-bottom:1px solid #ddd6fe;">Behavior Anomalies</td><td style="padding:10px 16px;text-align:right;font-weight:bold;color:#8b5cf6;">${weekAnomalies.length}</td></tr>
      <tr style="background:#fffbeb;"><td style="padding:10px 16px;font-weight:bold;border-bottom:1px solid #fde68a;">Threat Correlations</td><td style="padding:10px 16px;text-align:right;font-weight:bold;color:#f59e0b;">${weekThreats.length}</td></tr>
      <tr><td style="padding:10px 16px;font-weight:bold;">Failed Access Attempts</td><td style="padding:10px 16px;text-align:right;color:#ef4444;">${failedAccess}</td></tr>
    </table>
    <div style="background:#f0f9ff;border-left:3px solid #0ea5e9;padding:16px;margin:16px 0;border-radius:4px;">
      <p style="margin:0;font-size:14px;color:#334155;"><strong>System Performance:</strong> ${activeUniverses} active universes · ${successRate}% API success rate · ${avgProtection}/100 protection score</p>
    </div>
    <p style="font-size:14px;color:#334155;">The full PDF report is available here: <a href="${file_url}" style="color:#06b6d4;">Download Report</a></p>
    <p style="font-size:12px;color:#94a3b8;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px;">Generated by Three-Pillar Security System automated weekly reporting.</p>
  </div>
</div>`;

        const textBody = `Weekly Threat & Anomaly Report — ${dateStr}\n\nTotal Alerts: ${weekAlerts.length} (${criticalAlerts.length} critical)\nBehavior Anomalies: ${weekAnomalies.length}\nThreat Correlations: ${weekThreats.length}\nFailed Access Attempts: ${failedAccess}\n\nSystem: ${activeUniverses} active universes, ${successRate}% success rate, ${avgProtection}/100 protection\n\nFull report: ${file_url}`;

        const boundary = 'b44weekly_' + Math.random().toString(36).substring(2);
        const rawMessage = [
          `To: ${recipientEmail}`,
          `From: ${recipientEmail}`,
          `Subject: ${subject}`,
          'MIME-Version: 1.0',
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          '',
          `--${boundary}`,
          'Content-Type: text/plain; charset=utf-8',
          'Content-Transfer-Encoding: 8bit',
          '',
          textBody,
          '',
          `--${boundary}`,
          'Content-Type: text/html; charset=utf-8',
          'Content-Transfer-Encoding: 8bit',
          '',
          htmlBody,
          '',
          `--${boundary}--`,
        ].join('\r\n');

        const encoded = btoa(unescape(encodeURIComponent(rawMessage))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${gmailToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw: encoded }),
        });

        if (sendRes.ok) {
          emailSent = true;
        } else {
          // Gmail API failed (e.g. "Mail service not enabled") — fall back to built-in email
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: recipientEmail,
            subject,
            body: htmlBody,
          });
          emailSent = true;
        }
      }
    } catch (e) {
      // Gmail not available — still return the PDF
    }

    return Response.json({
      success: true,
      file_url,
      email_sent: emailSent,
      recipient: recipientEmail,
      summary: {
        total_alerts: weekAlerts.length,
        critical_alerts: criticalAlerts.length,
        anomalies: weekAnomalies.length,
        threat_correlations: weekThreats.length,
        failed_access: failedAccess,
        success_rate: successRate,
        avg_protection: avgProtection,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});