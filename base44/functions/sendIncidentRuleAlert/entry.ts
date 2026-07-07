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

    const body = await req.json();
    const alertData = body.data || body;
    const alertType = alertData.alert_type;
    const alertSeverity = alertData.severity || 'medium';

    if (!alertType) return Response.json({ skipped: true, reason: 'No alert_type in payload' });

    // Fetch all active incident rules
    const rules = await base44.asServiceRole.entities.IncidentRule.filter({ is_active: true });
    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4, emergency: 5 };

    // Find matching rules
    const matchingRules = rules.filter(rule => {
      if (rule.trigger_type !== alertType) return false;
      const ruleMinSeverity = severityOrder[rule.min_severity] || 3;
      const alertSeverityLevel = severityOrder[alertSeverity] || 2;
      return alertSeverityLevel >= ruleMinSeverity;
    });

    if (matchingRules.length === 0) {
      return Response.json({ triggered: false, reason: 'No matching incident rules' });
    }

    // Get Gmail connection for sending alerts
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    if (!accessToken) return Response.json({ error: 'Gmail not connected', triggered: false }, { status: 400 });

    // Determine recipient
    let recipientEmail = (user && user.email) || '';
    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (profileRes.ok) {
      const profile = await profileRes.json();
      recipientEmail = profile.emailAddress || recipientEmail;
    }

    let emailsSent = 0;
    const now = new Date().toISOString();

    for (const rule of matchingRules) {
      const notifyEmail = rule.notify_email || recipientEmail;
      if (!notifyEmail) continue;

      const subject = `🚨 Incident Alert: ${rule.rule_name}`;
      const severityColor = alertSeverity === 'critical' || alertSeverity === 'emergency' ? '#ef4444' : '#f59e0b';

      const htmlBody = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
  <div style="background:#0f172a;padding:24px;border-radius:8px 8px 0 0;border-left:4px solid ${severityColor};">
    <h1 style="color:#ef4444;margin:0;font-size:22px;">🚨 Incident Rule Activated</h1>
    <p style="color:#94a3b8;margin:4px 0 0;font-size:13px;">${new Date().toLocaleString()}</p>
  </div>
  <div style="padding:28px;background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#334155;">
      <tr><td style="padding:8px 0;font-weight:bold;">Rule Name:</td><td style="padding:8px 0;">${rule.rule_name}</td></tr>
      <tr><td style="padding:8px 0;font-weight:bold;">Trigger Type:</td><td style="padding:8px 0;">${alertType}</td></tr>
      <tr><td style="padding:8px 0;font-weight:bold;">Severity:</td><td style="padding:8px 0;color:${severityColor};font-weight:bold;text-transform:uppercase;">${alertSeverity}</td></tr>
      <tr><td style="padding:8px 0;font-weight:bold;">Min Severity Threshold:</td><td style="padding:8px 0;">${rule.min_severity}</td></tr>
      ${alertData.user_identifier ? `<tr><td style="padding:8px 0;font-weight:bold;">User:</td><td style="padding:8px 0;">${alertData.user_identifier}</td></tr>` : ''}
      ${alertData.ip_address ? `<tr><td style="padding:8px 0;font-weight:bold;">IP Address:</td><td style="padding:8px 0;">${alertData.ip_address}</td></tr>` : ''}
      ${alertData.confidence_score != null ? `<tr><td style="padding:8px 0;font-weight:bold;">Confidence Score:</td><td style="padding:8px 0;">${alertData.confidence_score}%</td></tr>` : ''}
      <tr><td style="padding:8px 0;font-weight:bold;">Auto-Blocked:</td><td style="padding:8px 0;">${alertData.auto_blocked ? 'Yes' : 'No'}</td></tr>
    </table>
    ${alertData.indicators && alertData.indicators.length > 0 ? `<div style="margin:16px 0;"><p style="font-weight:bold;font-size:13px;color:#334155;">Indicators:</p><ul>${alertData.indicators.map(i => `<li style="font-size:13px;color:#64748b;">${i}</li>`).join('')}</ul></div>` : ''}
    <div style="margin-top:20px;padding:12px;background:#fef2f2;border-radius:6px;">
      <p style="margin:0;font-size:13px;color:#991b1b;">Actions configured for this rule: ${rule.actions ? rule.actions.map(a => a.replace(/_/g, ' ')).join(', ') : 'none'}</p>
    </div>
    <p style="font-size:12px;color:#94a3b8;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px;">This alert was triggered automatically by the Three-Pillar Security System incident response engine.</p>
  </div>
</div>`;

      const textBody = `INCIDENT RULE ACTIVATED\n\nRule: ${rule.rule_name}\nTrigger: ${alertType}\nSeverity: ${alertSeverity}\nUser: ${alertData.user_identifier || 'N/A'}\nIP: ${alertData.ip_address || 'N/A'}\nConfidence: ${alertData.confidence_score || 'N/A'}%\nAuto-Blocked: ${alertData.auto_blocked ? 'Yes' : 'No'}\n\nActions: ${rule.actions ? rule.actions.join(', ') : 'none'}\n\nGenerated by Three-Pillar Security System.`;

      const boundary = 'b44incident_' + Math.random().toString(36).substring(2);
      const rawMessage = [
        `To: ${notifyEmail}`,
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

      if (sendRes.ok) emailsSent++;

      // Increment execution count and update last_triggered
      await base44.asServiceRole.entities.IncidentRule.update(rule.id, {
        execution_count: (rule.execution_count || 0) + 1,
        last_triggered: now,
      });
    }

    return Response.json({
      triggered: true,
      rules_matched: matchingRules.length,
      emails_sent: emailsSent,
    });
  } catch (error) {
    return Response.json({ error: error.message, triggered: false }, { status: 500 });
  }
});