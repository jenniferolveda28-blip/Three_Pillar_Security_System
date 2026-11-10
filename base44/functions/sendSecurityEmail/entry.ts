import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const ADMIN_KINDS = ['security_digest', 'auditor_passcode', 'destruction_reminder'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { kind } = body;
    if (!['threat_neutralized', ...ADMIN_KINDS].includes(kind)) {
      return Response.json({ error: 'Unknown email kind' }, { status: 400 });
    }
    if (ADMIN_KINDS.includes(kind) && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    let email;

    if (kind === 'security_digest') {
      // Admin-composed security summary (daily / hourly reports)
      const { to, subject, html } = body;
      if (!to || !subject || !html) return Response.json({ error: 'to, subject and html are required' }, { status: 400 });
      email = { to: String(to), subject: String(subject).slice(0, 300), body: String(html).slice(0, 200000) };
    }

    if (kind === 'threat_neutralized') {
      const title = String(body.title || 'Threat').slice(0, 200);
      const severity = String(body.severity || 'unknown').slice(0, 30).toUpperCase();
      email = {
        to: 'security-team@threepillar.ai',
        subject: `🚨 THREAT NEUTRALIZED: ${title}`,
        body: `Security team,\n\nA threat has been neutralized by an operator.\n\nType: ${title}\nSeverity: ${severity}\nTime: ${new Date().toLocaleString()}\nAction: Node isolated, active credentials revoked.\n\nPlease verify and follow up as needed.\n\n— Reclaim Me`,
      };
    }

    if (kind === 'auditor_passcode') {
      if (!body.pass_id) return Response.json({ error: 'pass_id is required' }, { status: 400 });
      const pass = await base44.asServiceRole.entities.AuditorAccessPass.get(body.pass_id)
        .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!pass) return Response.json({ error: 'Pass not found' }, { status: 404 });
      if (!pass.auditor_email) return Response.json({ error: 'Pass has no email' }, { status: 400 });
      const appUrl = `${req.headers.get('X-Base44-App-Url') || 'https://reclaimme.base44.app'}/auditor-access`;
      email = {
        to: pass.auditor_email,
        subject: 'Your Auditor Access Passcode — Reclaim Me',
        body: `Hello ${pass.first_name || ''},\n\nYou have been granted auditor access to Reclaim Me.\n\nApp login email (shared): auditor4threepillarsecurity@proton.me\nYour unique access passcode: ${pass.passcode}\n\nAccess portal: ${appUrl}\n\nInstructions:\n1. Visit the access portal link above\n2. Log in with the shared email above, then enter your first name, last name, and passcode\n3. Complete the security audit questionnaire\n\nThis passcode is unique to you. Do not share it with others.\n\nThank you,\nReclaim Me Team`,
      };
    }

    if (kind === 'destruction_reminder') {
      if (!body.sample_id) return Response.json({ error: 'sample_id is required' }, { status: 400 });
      const s = await base44.asServiceRole.entities.system_DnaSample.get(body.sample_id)
        .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!s) return Response.json({ error: 'Sample not found' }, { status: 404 });
      if (!s.submitter_email) return Response.json({ error: 'Sample has no submitter email' }, { status: 400 });
      const destructionDate = String(body.destruction_date || '').slice(0, 40);
      const daysLeft = Number(body.days_left) || 0;
      email = {
        to: s.submitter_email,
        subject: 'Action required: your biological sample nearing mandatory destruction',
        body: `Hello ${s.submitter_name},\n\n` +
          `This is a courtesy notice from the platform. The biological identity data associated with sample ${s.sample_id} is nearing its mandatory retention expiry.\n\n` +
          `Destruction date: ${destructionDate} (${daysLeft} day(s) remaining)\n\n` +
          `Under our Data Destruction Policy and Texas genetic privacy law, your stored genetic hash will be permanently destroyed on or after this date unless you renew consent.\n\n` +
          `If you wish to extend retention, withdraw consent early, or request immediate destruction, please contact us via the platform.\n\n` +
          `— Platform Privacy Team`,
      };
    }

    const result = await base44.asServiceRole.integrations.Core.SendEmail({ ...email, category: 'transactional' });
    if (result && result.success === false) {
      return Response.json({ error: result.message || `Email blocked: ${result.reason}` }, { status: 422 });
    }
    return Response.json({ sent: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}