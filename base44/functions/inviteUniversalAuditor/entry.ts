import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const email = body.email || 'auditor4threepillarsecurity@proton.me';

    // Invite as "user" first — platform only allows user/admin at invite time
    const inviteResult = await base44.users.inviteUser(email, 'user');

    // Find the newly invited user and update role to "auditor" via service role
    const users = await base44.asServiceRole.entities.User.filter({ email });
    const invitedUser = users.find((u) => u.email === email);
    if (invitedUser) {
      await base44.asServiceRole.entities.User.update(invitedUser.id, { role: 'auditor' });
    }

    return Response.json({
      success: true,
      email,
      message: invitedUser
        ? 'Invited and role set to auditor'
        : 'Invitation sent — update role to auditor after they accept',
      inviteResult
    });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});