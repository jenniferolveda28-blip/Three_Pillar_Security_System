import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { event, data, old_data } = body;

    const eventType = event?.type; // 'create' or 'update'

    let messageText = '';

    if (eventType === 'create' && data?.broker_name) {
      messageText =
        `🚨 *New Exposure Discovered*\n\n` +
        `*Broker:* ${data.broker_name}\n` +
        `*Type:* ${(data.exposure_type || '').replace(/_/g, ' ')}\n` +
        `*Risk Score:* ${data.risk_score ?? 'N/A'}/100\n` +
        (data.listing_url ? `*Listing:* ${data.listing_url}\n` : '') +
        (data.user_email ? `*User:* ${data.user_email}\n` : '') +
        `\n_Exposure Shield logged a new data broker listing._`;
    } else if (eventType === 'update' && data?.status === 'scrubbed' && old_data?.status !== 'scrubbed') {
      messageText =
        `✅ *Removal Verified*\n\n` +
        `*Broker:* ${data.broker_name}\n` +
        `*Type:* ${(data.exposure_type || '').replace(/_/g, ' ')}\n` +
        (data.scrubbed_date ? `*Scrubbed:* ${new Date(data.scrubbed_date).toLocaleString()}\n` : '') +
        (data.user_email ? `*User:* ${data.user_email}\n` : '') +
        `\n_The listing has been confirmed removed from the data broker._`;
    } else {
      return Response.json({ skipped: true, reason: 'Not a notification-worthy event' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('slack');

    // Determine target channel: explicit param, else DM the connected user (self)
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