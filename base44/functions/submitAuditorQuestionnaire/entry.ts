import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const allowedAuditorEmail = 'auditor4threepillarsecurity@proton.me';
    if (
      user.role !== 'admin' &&
      user.role !== 'auditor' &&
      user.email?.toLowerCase() !== allowedAuditorEmail
    ) {
      return Response.json({ error: 'Forbidden: Auditor credentials required.' }, { status: 403 });
    }

    const body = await req.json();
    const { pass_id, passcode, answers } = body;

    if (!pass_id || !passcode || !answers) {
      return Response.json(
        { error: 'Pass ID, passcode, and answers are required.' },
        { status: 400 }
      );
    }

    const pass = await base44.asServiceRole.entities.AuditorAccessPass.get(pass_id);
    if (!pass) {
      return Response.json({ error: 'Access pass not found.' }, { status: 404 });
    }

    // Prevent IDOR: only the auditor who knows this pass's passcode may submit
    if (String(pass.passcode || '').trim() !== String(passcode).trim()) {
      return Response.json({ error: 'Passcode does not match this access pass.' }, { status: 403 });
    }

    if (pass.questionnaire_completed && user.role !== 'admin') {
      return Response.json(
        { error: 'Questionnaire has already been submitted and is locked against modification.' },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    await base44.asServiceRole.entities.AuditorAccessPass.update(pass_id, {
      questionnaire_answers: answers,
      questionnaire_completed: true,
      questionnaire_completed_date: now
    });

    await base44.asServiceRole.entities.SecurityLog.create({
      event_type: 'access_granted',
      details: `AUDITOR_QUESTIONNAIRE_SUBMITTED — ${pass.first_name} ${pass.last_name} submitted their audit questionnaire.`,
      success: true,
      threat_level: 'none'
    });

    return Response.json({ success: true, message: 'Questionnaire submitted successfully.' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});