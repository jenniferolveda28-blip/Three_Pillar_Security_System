import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { createMimeMessage } from 'npm:mimetext@3.0.24';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const logId = body.log_id;
    let eventData = body.event_data || body.data || {};

    if (logId && (!eventData || !eventData.event_type)) {
      const record = await base44.asServiceRole.entities.SecurityLog.get(logId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e)
      );
      if (record) {
        eventData = record;
      }
    }

    const eventType = eventData.event_type || 'suspicious_activity';
    const threatLevel = eventData.threat_level || 'high';
    const details =
      eventData.details ||
      'Potential security threat or unauthorized HelixVerify token access attempt detected.';
    const ipAddress = eventData.ip_address || 'Unknown origin';
    const timestamp = eventData.created_date
      ? new Date(eventData.created_date).toLocaleString()
      : new Date().toLocaleString();

    const isTokenEvent =
      eventType === 'token_activation_failure' ||
      eventType === 'access_denied' ||
      details.toLowerCase().includes('token') ||
      details.toLowerCase().includes('helixverify') ||
      details.toLowerCase().includes('subdermal');

    // Get Gmail OAuth connection
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    if (!accessToken) {
      return Response.json({ error: 'Gmail connector not authorized' }, { status: 400 });
    }

    // Resolve sender & default recipient from Gmail profile
    let senderEmail = user.email || '';
    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10000),
    });
    if (profileRes.ok) {
      const profile = await profileRes.json();
      if (profile.emailAddress) {
        senderEmail = profile.emailAddress;
      }
    }

    // Check SecurityConfig for configured notification email
    let recipientEmail = senderEmail || user.email;
    const configs = await base44.asServiceRole.entities.SecurityConfig.filter(
      { is_active: true },
      '-created_date',
      1
    ).catch(() => []);
    const configList = Array.isArray(configs) ? configs : configs?.items || [];
    if (configList.length > 0 && configList[0].notify_email) {
      recipientEmail = configList[0].notify_email;
    }

    if (!recipientEmail) {
      return Response.json({ error: 'No recipient email available' }, { status: 400 });
    }

    const alertTitle = isTokenEvent
      ? 'Unauthorized HelixVerify Token Access / Activation Alert'
      : 'Potential Security Threat Detected';

    const subject = `[Reclaim Me Alert] ${alertTitle} (${threatLevel.toUpperCase()})`;
    const badgeColor =
      threatLevel === 'critical' || threatLevel === 'high' ? '#ef4444' : '#f59e0b';

    const htmlBody = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#0f172a;color:#f1f5f9;border-radius:12px;overflow:hidden;border:1px solid #334155;">
  <div style="padding:24px;background:#1e293b;border-bottom:3px solid ${badgeColor};">
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#38bdf8;">Reclaim Me Security Automation</p>
    <h1 style="margin:0;font-size:20px;color:#ffffff;">${alertTitle}</h1>
    <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;">Detected at ${timestamp}</p>
  </div>
  <div style="padding:24px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#e2e8f0;">
      <tr>
        <td style="padding:8px 0;color:#94a3b8;width:150px;">Event Type:</td>
        <td style="padding:8px 0;font-weight:bold;">${eventType.replace(/_/g, ' ').toUpperCase()}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#94a3b8;">Threat Level:</td>
        <td style="padding:8px 0;font-weight:bold;color:${badgeColor};text-transform:uppercase;">${threatLevel}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#94a3b8;">Origin / Gate:</td>
        <td style="padding:8px 0;font-family:monospace;">${ipAddress}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#94a3b8;">Access Status:</td>
        <td style="padding:8px 0;">${eventData.success === false ? 'BLOCKED / DENIED' : 'FLAGGED'}</td>
      </tr>
    </table>
    <div style="margin-top:16px;padding:16px;background:#090d16;border-left:4px solid ${badgeColor};border-radius:6px;">
      <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;text-transform:uppercase;">Event Details</p>
      <p style="margin:0;font-size:14px;line-height:1.5;color:#f8fafc;">${details}</p>
    </div>
    <p style="margin-top:20px;font-size:12px;color:#64748b;">
      This automated Gmail notification was sent by your Reclaim Me threat &amp; HelixVerify token monitoring workflow.
    </p>
  </div>
</div>`;

    const plainText = [
      `RECLAIM ME SECURITY ALERT: ${alertTitle}`,
      `Time: ${timestamp}`,
      `Event Type: ${eventType}`,
      `Threat Level: ${threatLevel.toUpperCase()}`,
      `Origin / Gate: ${ipAddress}`,
      `Details: ${details}`,
    ].join('\n');

    const msg = createMimeMessage();
    msg.setSender({ name: 'Reclaim Me Security', addr: senderEmail || recipientEmail });
    msg.setRecipient(recipientEmail);
    msg.setSubject(subject);
    msg.addMessage({ contentType: 'text/plain', data: plainText });
    msg.addMessage({ contentType: 'text/html', data: htmlBody });

    const rawMime = msg.asRaw();
    const encoded = btoa(unescape(encodeURIComponent(rawMime)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encoded }),
      signal: AbortSignal.timeout(10000),
    });

    if (!sendRes.ok) {
      // Fallback to built-in SendEmail if Gmail API rejects
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: recipientEmail,
        subject,
        body: htmlBody,
        category: 'transactional',
      });
      return Response.json({
        sent: true,
        channel: 'core_fallback',
        recipient: recipientEmail,
        event_type: eventType,
      });
    }

    const sendData = await sendRes.json();
    return Response.json({
      sent: true,
      channel: 'gmail',
      message_id: sendData.id,
      recipient: recipientEmail,
      event_type: eventType,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}