import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data } = body;

    if (event?.type !== 'create' || !data?.alert_type) {
      return Response.json({ skipped: true, reason: 'Not a new threat alert' });
    }

    const severityEmoji = data.severity === 'critical' || data.severity === 'emergency' ? '🔴' : data.severity === 'high' ? '🟠' : '🟡';

    const messageText =
      `${severityEmoji} *Security Threat Detected*\n\n` +
      `*Type:* ${data.alert_type.replace(/_/g, ' ')}\n` +
      `*Severity:* ${data.severity}\n` +
      (data.confidence_score != null ? `*Confidence:* ${data.confidence_score}/100\n` : '') +
      (data.user_identifier ? `*User:* ${data.user_identifier}\n` : '') +
      (data.ip_address ? `*IP:* ${data.ip_address}\n` : '') +
      (Array.isArray(data.indicators) && data.indicators.length ? `*Indicators:* ${data.indicators.join(', ')}\n` : '') +
      (data.auto_blocked ? `*Auto-blocked:* Yes\n` : '') +
      `\n_Threat detection system flagged a new security event._`;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('slack');

    let channel = body.channel;
    if (!channel) {
      const authRes = await fetch('https://slack.com/api/auth.test', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const authBody = await authRes.json();
      if (authBody.ok && authBody.user_id) {
        channel = authBody.user_id;
      }
    }

    const postRes = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: channel,
        text: messageText,
        unfurl_links: false
      })
    });

    const postBody = await postRes.json();
    if (!postBody.ok) {
      return Response.json({ error: postBody.error, channel: channel }, { status: 502 });
    }

    return Response.json({ success: true, message_ts: postBody.ts, channel: postBody.channel });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}