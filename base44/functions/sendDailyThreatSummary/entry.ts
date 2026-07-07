import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // --- Gather threat & performance data (service role) ---
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
      base44.asServiceRole.entities.ThreatCorrelation.list('-created_date', 100),
      base44.asServiceRole.entities.CriminalActivityAlert.list('-created_date', 100),
      base44.asServiceRole.entities.BehaviorAnomaly.list('-created_date', 100),
      base44.asServiceRole.entities.Universe.list('-created_date', 100),
      base44.asServiceRole.entities.UniversalRequest.list('-created_date', 200),
      base44.asServiceRole.entities.ScramblingSession.list('-created_date', 50),
    ]);

    // --- Security log breakdown ---
    const logCounts = {};
    let failedAccess = 0;
    let suspiciousEvents = 0;
    for (const log of securityLogs) {
      logCounts[log.event_type] = (logCounts[log.event_type] || 0) + 1;
      if (log.event_type === 'access_denied' || log.success === false) failedAccess++;
      if (log.threat_level === 'high' || log.threat_level === 'critical') suspiciousEvents++;
    }

    // --- Threat correlations ---
    const activeThreats = threatCorrelations.filter(t => t.status === 'active' || t.status === 'investigating');
    const criticalThreats = threatCorrelations.filter(t => t.severity === 'critical');
    const highThreats = threatCorrelations.filter(t => t.severity === 'high');

    // --- Criminal alerts ---
    const openAlerts = criminalAlerts.filter(a => a.status === 'open' || a.status === 'investigating');
    const criticalAlerts = criminalAlerts.filter(a => a.severity === 'critical' || a.severity === 'emergency');

    // --- Behavior anomalies ---
    const detectedAnomalies = behaviorAnomalies.filter(a => a.status === 'detected' || a.status === 'investigating');

    // --- API performance ---
    const activeUniverses = universes.filter(u => u.status === 'active');
    const degradedUniverses = universes.filter(u => u.status === 'degraded');
    const offlineUniverses = universes.filter(u => u.status === 'offline');
    const avgSuccessRate = universes.length
      ? (universes.reduce((s, u) => s + (u.success_rate || 0), 0) / universes.length).toFixed(1)
      : '—';

    const recentSuccess = recentRequests.filter(r => r.status === 'success').length;
    const recentFailed = recentRequests.filter(r => r.status === 'failed').length;
    const successRate = recentRequests.length
      ? ((recentSuccess / recentRequests.length) * 100).toFixed(1)
      : '—';
    const avgLatency = recentRequests.length && recentRequests.filter(r => r.latency_ms).length
      ? Math.round(recentRequests.reduce((s, r) => s + (r.latency_ms || 0), 0) / recentRequests.length)
      : '—';

    // --- Scrambling ---
    const activeScrambles = scramblingSessions.filter(s => s.status === 'active');
    const totalIterations = scramblingSessions.reduce((s, ss) => s + (ss.iterations || 0), 0);
    const avgProtection = scramblingSessions.length
      ? (scramblingSessions.reduce((s, ss) => s + (ss.protection_score || 0), 0) / scramblingSessions.length).toFixed(0)
      : '—';

    // --- Get Gmail connection ---
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    if (!accessToken) return Response.json({ error: 'Gmail not connected' }, { status: 400 });

    // Get recipient email from connected Gmail account
    let recipientEmail = (user && user.email) || '';
    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (profileRes.ok) {
      const profile = await profileRes.json();
      recipientEmail = profile.emailAddress || recipientEmail;
    }
    if (!recipientEmail) return Response.json({ error: 'Could not determine recipient email' }, { status: 400 });

    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Chicago' });

    const subject = `🔒 Daily Threat Summary — ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Chicago' })}`;

    const textBody = `THREE-PILLAR SECURITY SYSTEM
Daily Threat & Performance Summary
${dateStr}

=== THREAT OVERVIEW ===

Active Threat Correlations: ${activeThreats.length}
  - Critical severity: ${criticalThreats.length}
  - High severity: ${highThreats.length}

Open Criminal Activity Alerts: ${openAlerts.length}
  - Critical/Emergency: ${criticalAlerts.length}

Detected Behavior Anomalies: ${detectedAnomalies.length}

Security Log Summary (last ${securityLogs.length} events):
${Object.entries(logCounts).map(([k, v]) => `  - ${k}: ${v}`).join('\n')}
  - Failed access attempts: ${failedAccess}
  - High/critical threat-level events: ${suspiciousEvents}

=== PERFORMANCE HIGHLIGHTS ===

API Universes: ${universes.length} total (${activeUniverses.length} active, ${degradedUniverses.length} degraded, ${offlineUniverses.length} offline)
Average Universe Success Rate: ${avgSuccessRate}%

Recent API Requests (${recentRequests.length}):
  - Success rate: ${successRate}%
  - Average latency: ${avgLatency === '—' ? 'N/A' : avgLatency + 'ms'}

Dynamic Scrambler:
  - Active sessions: ${activeScrambles.length}
  - Total iterations: ${totalIterations}
  - Average protection score: ${avgProtection === '—' ? 'N/A' : avgProtection + '/100'}

===
Generated by Three-Pillar Security System automated monitoring.`;

    const threatColor = activeThreats.length > 0 ? '#ef4444' : '#10b981';
    const threatLabel = activeThreats.length > 0 ? 'THREATS ACTIVE' : 'ALL CLEAR';

    const htmlBody = `<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
  <div style="background: #0f172a; padding: 24px; border-radius: 8px 8px 0 0; border-left: 4px solid ${threatColor};">
    <h1 style="color: #06b6d4; margin: 0; font-size: 22px;">🔒 Daily Threat Summary</h1>
    <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">${dateStr}</p>
    <span style="display: inline-block; margin-top: 12px; padding: 4px 12px; background: ${threatColor}; color: #fff; border-radius: 12px; font-size: 12px; font-weight: bold;">${threatLabel}</span>
  </div>

  <div style="padding: 28px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">

    <h2 style="color: #ef4444; font-size: 18px; margin: 0 0 16px;">⚠️ Threat Overview</h2>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
      <tr style="background: #fef2f2;"><td style="padding: 10px 16px; font-weight: bold; border-bottom: 1px solid #fee2e2;">Active Threat Correlations</td><td style="padding: 10px 16px; text-align: right; font-weight: bold; color: #ef4444;">${activeThreats.length}</td></tr>
      <tr><td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; padding-left: 32px;">— Critical severity</td><td style="padding: 8px 16px; text-align: right;">${criticalThreats.length}</td></tr>
      <tr><td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; padding-left: 32px;">— High severity</td><td style="padding: 8px 16px; text-align: right;">${highThreats.length}</td></tr>
      <tr style="background: #fef3c7;"><td style="padding: 10px 16px; font-weight: bold; border-bottom: 1px solid #fde68a;">Open Criminal Alerts</td><td style="padding: 10px 16px; text-align: right; font-weight: bold; color: #f59e0b;">${openAlerts.length}</td></tr>
      <tr><td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; padding-left: 32px;">— Critical/Emergency</td><td style="padding: 8px 16px; text-align: right;">${criticalAlerts.length}</td></tr>
      <tr style="background: #f5f3ff;"><td style="padding: 10px 16px; font-weight: bold; border-bottom: 1px solid #ddd6fe;">Detected Behavior Anomalies</td><td style="padding: 10px 16px; text-align: right; font-weight: bold; color: #8b5cf6;">${detectedAnomalies.length}</td></tr>
      <tr><td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Failed Access Attempts</td><td style="padding: 10px 16px; text-align: right; color: #ef4444;">${failedAccess}</td></tr>
      <tr><td style="padding: 10px 16px; font-weight: bold;">High/Critical Threat Events</td><td style="padding: 10px 16px; text-align: right; color: #ef4444;">${suspiciousEvents}</td></tr>
    </table>

    <h2 style="color: #06b6d4; font-size: 18px; margin: 28px 0 16px;">📊 Performance Highlights</h2>

    <div style="background: #f0f9ff; border-left: 3px solid #0ea5e9; padding: 16px; margin: 16px 0; border-radius: 4px;">
      <h3 style="color: #0ea5e9; margin: 0 0 8px; font-size: 15px;">API Universes</h3>
      <p style="margin: 0; font-size: 14px; color: #334155;">
        ${universes.length} total — ${activeUniverses.length} active, ${degradedUniverses.length} degraded, ${offlineUniverses.length} offline<br>
        <strong>Average Success Rate: ${avgSuccessRate}%</strong>
      </p>
    </div>

    <div style="background: #ecfdf5; border-left: 3px solid #10b981; padding: 16px; margin: 16px 0; border-radius: 4px;">
      <h3 style="color: #10b981; margin: 0 0 8px; font-size: 15px;">Recent API Requests</h3>
      <p style="margin: 0; font-size: 14px; color: #334155;">
        ${recentRequests.length} requests — <strong>${successRate}% success rate</strong><br>
        Average latency: ${avgLatency === '—' ? 'N/A' : avgLatency + 'ms'}
      </p>
    </div>

    <div style="background: #fffbeb; border-left: 3px solid #f59e0b; padding: 16px; margin: 16px 0; border-radius: 4px;">
      <h3 style="color: #f59e0b; margin: 0 0 8px; font-size: 15px;">Dynamic Scrambler (IP Shield)</h3>
      <p style="margin: 0; font-size: 14px; color: #334155;">
        ${activeScrambles.length} active sessions — ${totalIterations} total iterations<br>
        <strong>Average Protection Score: ${avgProtection === '—' ? 'N/A' : avgProtection + '/100'}</strong>
      </p>
    </div>

    <p style="font-size: 12px; color: #94a3b8; margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
      Generated by Three-Pillar Security System automated monitoring.<br>
      This is an automated daily summary — review the dashboard for full details.
    </p>
  </div>
</div>`;

    // Build raw RFC 2822 message manually (no external dependency)
    const boundary = 'b44summary_' + Math.random().toString(36).substring(2);
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
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: encoded }),
    });

    if (!sendRes.ok) {
      const errText = await sendRes.text();
      return Response.json({ error: 'Gmail API error', details: errText }, { status: 502 });
    }

    const sent = await sendRes.json();

    return Response.json({
      status: 'success',
      message_id: sent.id,
      recipient: recipientEmail,
      summary: {
        activeThreats: activeThreats.length,
        openAlerts: openAlerts.length,
        detectedAnomalies: detectedAnomalies.length,
        successRate,
        avgLatency,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});