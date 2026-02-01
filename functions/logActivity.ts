import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action_type, entity_type, entity_id, description, details, status = 'success' } = await req.json();

    if (!action_type || !description) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const log = await base44.entities.ActivityLog.create({
      user_email: user.email,
      action_type,
      entity_type,
      entity_id,
      description,
      details,
      status,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });

    return Response.json({ success: true, log });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});