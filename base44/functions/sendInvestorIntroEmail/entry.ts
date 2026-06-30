import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { MimeBuilder } from 'npm:emailjs-mime-builder@2.0.5';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    // Works as automation handler (body.data = entity) or direct call (body.meeting_id)
    let meeting = body.data;
    if (!meeting && body.meeting_id) {
      meeting = await base44.asServiceRole.entities.InvestorMeeting.get(body.meeting_id);
    }
    if (!meeting) return Response.json({ error: 'No meeting data provided' }, { status: 400 });
    if (!meeting.email) return Response.json({ error: 'Investor has no email address' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    if (!accessToken) return Response.json({ error: 'Gmail not connected' }, { status: 400 });

    const investorName = meeting.investor_name || 'there';
    const company = meeting.company ? ` at ${meeting.company}` : '';
    const pillars = (meeting.pillars_discussed || []).length > 0
      ? meeting.pillars_discussed.join(', ')
      : 'our three-pillar security architecture';

    const subject = `Three-Pillar Security System — Technical Overview & Next Steps`;

    const textBody = `Dear ${investorName},

Thank you for your interest in the Three-Pillar Security System. Following our recent discussion${company}, I wanted to share a comprehensive technical overview of our platform and outline the next steps for our engagement.

PLATFORM OVERVIEW

The Three-Pillar Security System is a next-generation cybersecurity platform built on three integrated pillars:

1. DNA Breathalyzer Authentication (BioVerify)
   - Hardware token with saliva-based nano-sensor DNA verification
   - 99.7–99.8% match confidence with SHA-256 one-way hashing
   - Raw DNA is never stored — discarded immediately after hashing
   - Token replacement: $29.99, shipped in 2-3 days, re-activated with one breath

2. IP Shield (Dynamic Scrambler)
   - Moving Target Defense: API keys, routing paths, and encryption layers rotate every 0.1–5 seconds
   - Attacker exploit window: 0.1 seconds (vs. 30 seconds for Google Authenticator)
   - Zero successful breaches by mathematical design
   - Continuous key rotation with AES-256-GCM encryption

3. Forged API (Multi-Universe Router)
   - AI-powered routing across multiple API universes with < 50ms automatic failover
   - Real-time latency, health, and success-rate scoring algorithm
   - Immutable audit logging and AI threat analysis on every request

KEY DIFFERENTIATORS

- Continuous authentication (not just login-time verification)
- Quantum-resistant encryption layer
- AI-powered threat correlation and behavioral anomaly detection
- Criminal activity detection with automatic blocking and authority notification
- Sub-second credential rotation rendering intercepted keys useless

PILLARS OF INTEREST

During our discussion, you indicated interest in: ${pillars}. I would be happy to arrange a deeper technical dive into any of these areas, including a live demonstration of the system in action.

NEXT STEPS

1. Review the technical overview above
2. Schedule a live demonstration at your convenience
3. Discuss pilot program opportunities and integration timelines

Please don't hesitate to reach out with any questions. I look forward to continuing our conversation.

Best regards,
${user.full_name || 'The Three-Pillar Security Team'}
Three-Pillar Security System
Texas, USA`;

    const htmlBody = `<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1e293b;">
  <div style="background: #0f172a; padding: 24px; border-radius: 8px 8px 0 0; border-left: 4px solid #06b6d4;">
    <h1 style="color: #06b6d4; margin: 0; font-size: 22px;">Three-Pillar Security System</h1>
    <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">Technical Overview &amp; Next Steps</p>
  </div>
  <div style="padding: 28px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 15px;">Dear ${investorName},</p>
    <p style="font-size: 15px;">Thank you for your interest in the Three-Pillar Security System. Following our recent discussion${company}, I wanted to share a comprehensive technical overview of our platform and outline the next steps for our engagement.</p>

    <h2 style="color: #06b6d4; font-size: 18px; margin-top: 28px;">Platform Overview</h2>
    <p style="font-size: 15px;">The Three-Pillar Security System is a next-generation cybersecurity platform built on three integrated pillars:</p>

    <div style="background: #f0f9ff; border-left: 3px solid #0ea5e9; padding: 16px; margin: 16px 0; border-radius: 4px;">
      <h3 style="color: #0ea5e9; margin: 0 0 8px; font-size: 15px;">1. DNA Breathalyzer Authentication (BioVerify)</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155;">
        <li>Hardware token with saliva-based nano-sensor DNA verification</li>
        <li>99.7–99.8% match confidence with SHA-256 one-way hashing</li>
        <li>Raw DNA never stored — discarded immediately after hashing</li>
        <li>Token replacement: $29.99, 2-3 day delivery, re-activated with one breath</li>
      </ul>
    </div>

    <div style="background: #fffbeb; border-left: 3px solid #f59e0b; padding: 16px; margin: 16px 0; border-radius: 4px;">
      <h3 style="color: #f59e0b; margin: 0 0 8px; font-size: 15px;">2. IP Shield (Dynamic Scrambler)</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155;">
        <li>Moving Target Defense: keys &amp; paths rotate every 0.1–5 seconds</li>
        <li>Attacker exploit window: 0.1 seconds (vs. 30s for Google Authenticator)</li>
        <li>Zero successful breaches by mathematical design</li>
        <li>Continuous key rotation with AES-256-GCM encryption</li>
      </ul>
    </div>

    <div style="background: #f5f3ff; border-left: 3px solid #8b5cf6; padding: 16px; margin: 16px 0; border-radius: 4px;">
      <h3 style="color: #8b5cf6; margin: 0 0 8px; font-size: 15px;">3. Forged API (Multi-Universe Router)</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155;">
        <li>AI-powered routing across multiple API universes</li>
        <li>&lt; 50ms automatic failover with zero downtime</li>
        <li>Real-time latency, health &amp; success-rate scoring</li>
        <li>Immutable audit logging and AI threat analysis</li>
      </ul>
    </div>

    <h2 style="color: #06b6d4; font-size: 18px; margin-top: 28px;">Key Differentiators</h2>
    <ul style="font-size: 14px; color: #334155;">
      <li>Continuous authentication (not just login-time verification)</li>
      <li>Quantum-resistant encryption layer</li>
      <li>AI-powered threat correlation &amp; behavioral anomaly detection</li>
      <li>Criminal activity detection with automatic blocking</li>
      <li>Sub-second credential rotation rendering intercepted keys useless</li>
    </ul>

    <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 8px;">
      <h3 style="color: #10b981; margin: 0 0 8px; font-size: 15px;">Pillars of Interest</h3>
      <p style="margin: 0; font-size: 14px;">During our discussion, you indicated interest in: <strong>${pillars}</strong>. I would be happy to arrange a deeper technical dive into any of these areas, including a live demonstration.</p>
    </div>

    <h2 style="color: #06b6d4; font-size: 18px; margin-top: 28px;">Next Steps</h2>
    <ol style="font-size: 14px; color: #334155;">
      <li>Review the technical overview above</li>
      <li>Schedule a live demonstration at your convenience</li>
      <li>Discuss pilot program opportunities and integration timelines</li>
    </ol>

    <p style="font-size: 15px; margin-top: 28px;">Please don't hesitate to reach out with any questions. I look forward to continuing our conversation.</p>

    <p style="font-size: 15px; margin-top: 24px;">Best regards,<br>
    <strong>${user.full_name || 'The Three-Pillar Security Team'}</strong><br>
    Three-Pillar Security System<br>
    Texas, USA</p>
  </div>
  <div style="background: #0f172a; padding: 12px 24px; border-radius: 0 0 8px 8px; text-align: center;">
    <p style="color: #64748b; font-size: 11px; margin: 0;">Three-Pillar Security System — Confidential Investor Communication</p>
  </div>
</div>`;

    // Build RFC 2822 message using MIME library
    const message = new MimeBuilder('multipart/alternative')
      .addHeader('To', meeting.email)
      .addHeader('Subject', subject);

    // Get sender email from the connected Gmail account
    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    let fromEmail = user.email || '';
    if (profileRes.ok) {
      const profile = await profileRes.json();
      fromEmail = profile.emailAddress || fromEmail;
    }
    message.addHeader('From', fromEmail);

    const textPart = new MimeBuilder('text/plain').setContent(textBody);
    const htmlPart = new MimeBuilder('text/html').setContent(htmlBody);
    message.appendChild(textPart);
    message.appendChild(htmlPart);

    const rawMessage = btoa(message.build()).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: rawMessage }),
    });

    if (!sendRes.ok) {
      const errText = await sendRes.text();
      return Response.json({ error: 'Gmail API error', details: errText }, { status: 502 });
    }

    const sent = await sendRes.json();

    await base44.asServiceRole.entities.SecurityLog.create({
      event_type: 'universe_accessed',
      success: true,
      details: `Introductory email sent to interested investor: ${meeting.investor_name} (${meeting.email})`,
      threat_level: 'none',
    });

    return Response.json({
      status: 'success',
      message_id: sent.id,
      recipient: meeting.email,
      subject: subject,
      message: `Introductory email sent to ${meeting.investor_name}`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});