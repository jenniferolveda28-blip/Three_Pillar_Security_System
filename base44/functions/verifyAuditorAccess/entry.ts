import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { first_name, last_name, passcode } = body;

    if (!first_name || !last_name || !passcode) {
      return Response.json(
        { error: 'First name, last name, and passcode are required.' },
        { status: 400 }
      );
    }

    // Find a matching pass — name must match case-insensitively
    const passes = await base44.asServiceRole.entities.AuditorAccessPass.filter({
      passcode: passcode.trim()
    });

    const match = passes.find(
      (p) =>
        p.first_name?.toLowerCase().trim() === first_name.toLowerCase().trim() &&
        p.last_name?.toLowerCase().trim() === last_name.toLowerCase().trim()
    );

    if (!match) {
      return Response.json(
        { error: 'Invalid name or passcode. Please check your credentials and try again.' },
        { status: 403 }
      );
    }

    if (match.status === 'revoked' || match.status === 'expired') {
      return Response.json(
        { error: `This access pass has been ${match.status}. Please contact the administrator.` },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();
    const isFirstAccess = match.status === 'active';

    // Mark as used on first access, update access info
    await base44.asServiceRole.entities.AuditorAccessPass.update(match.id, {
      status: 'used',
      accessed_date: now,
      access_count: (match.access_count || 0) + 1
    });

    // Log the access in security logs
    await base44.asServiceRole.entities.SecurityLog.create({
      event_type: 'access_granted',
      details: `AUDITOR_ACCESS — ${first_name} ${last_name} accessed the audit portal via passcode ${passcode.substring(0, 4)}****. ${isFirstAccess ? 'First access.' : 'Return access (#' + ((match.access_count || 0) + 1) + ')'}.`,
      success: true,
      threat_level: 'none'
    });

    return Response.json({
      success: true,
      pass_id: match.id,
      first_name: match.first_name,
      last_name: match.last_name,
      is_first_access: isFirstAccess,
      questionnaire_completed: match.questionnaire_completed || false
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});