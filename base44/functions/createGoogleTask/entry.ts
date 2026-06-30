import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    let meeting = body.data;
    if (!meeting && body.meeting_id) {
      meeting = await base44.asServiceRole.entities.InvestorMeeting.get(body.meeting_id);
    }
    if (!meeting) return Response.json({ error: 'No meeting data provided' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googletasks');
    if (!accessToken) return Response.json({ error: 'Google Tasks not connected' }, { status: 400 });

    // Due date: follow_up_date if set, otherwise meeting_date + 3 days, otherwise today + 3 days
    let dueDate;
    if (meeting.follow_up_date) {
      dueDate = new Date(meeting.follow_up_date);
    } else if (meeting.meeting_date) {
      dueDate = new Date(meeting.meeting_date);
      dueDate.setDate(dueDate.getDate() + 3);
    } else {
      dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3);
    }

    const task = {
      title: `Follow up with ${meeting.investor_name}${meeting.company ? ' (' + meeting.company + ')' : ''}`,
      notes: `Three-Pillar Security System — Investor Follow-up Task\n\nStatus: ${meeting.status}\nEmail: ${meeting.email || 'N/A'}\nPhone: ${meeting.phone || 'N/A'}\nInterest Level: ${meeting.interest_level || 3}/5\nPillars Discussed: ${(meeting.pillars_discussed || []).join(', ') || 'N/A'}\n\nNext Steps:\n${meeting.next_steps || 'N/A'}\n\nFeedback:\n${meeting.feedback || 'N/A'}`,
      due: dueDate.toISOString(),
    };

    const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: 'Google Tasks API error', details: errText }, { status: 502 });
    }

    const created = await res.json();

    await base44.asServiceRole.entities.SecurityLog.create({
      event_type: 'universe_accessed',
      success: true,
      details: `Follow-up task created for investor: ${meeting.investor_name}`,
      threat_level: 'none',
    });

    return Response.json({
      status: 'success',
      task_id: created.id,
      due_date: dueDate.toISOString(),
      message: `Follow-up task created for ${meeting.investor_name}`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});