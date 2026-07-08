import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { pass_id, answers } = body;

    if (!pass_id || !answers) {
      return Response.json(
        { error: 'Pass ID and answers are required.' },
        { status: 400 }
      );
    }

    const pass = await base44.asServiceRole.entities.AuditorAccessPass.get(pass_id);
    if (!pass) {
      return Response.json({ error: 'Access pass not found.' }, { status: 404 });
    }

    const now = new Date().toISOString();
    await base44.asServiceRole.entities.AuditorAccessPass.update(pass_id, {
      questionnaire_answers: answers,
      questionnaire_completed: true,
      questionnaire_completed_date: now
    });

    await base44.asServiceRole.entities.SecurityLog.create({
      event_type: 'suspicious_activity',
      details: `AUDITOR_QUESTIONNAIRE_SUBMITTED — ${pass.first_name} ${pass.last_name} submitted their audit questionnaire.`,
      success: true,
      threat_level: 'none'
    });

    return Response.json({ success: true, message: 'Questionnaire submitted successfully.' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});