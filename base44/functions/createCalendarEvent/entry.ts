import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    // Works both as automation handler (body.data = entity) and direct call (body.meeting_id)
    let meeting = body.data;
    if (!meeting && body.meeting_id) {
      meeting = await base44.asServiceRole.entities.InvestorMeeting.get(body.meeting_id);
    }
    if (!meeting) return Response.json({ error: 'No meeting data provided' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    if (!accessToken) return Response.json({ error: 'Google Calendar not connected' }, { status: 400 });

    const eventDate = meeting.meeting_date || new Date().toISOString().split('T')[0];
    const endDate = new Date(eventDate);
    endDate.setDate(endDate.getDate() + 1);

    const event = {
      summary: `Investor Meeting: ${meeting.investor_name}${meeting.company ? ' (' + meeting.company + ')' : ''}`,
      description: `Three-Pillar Security System — Investor CRM Meeting\n\nStatus: ${meeting.status}\nLocation: ${meeting.meeting_location || 'TBD'}, ${meeting.county || 'Travis'} County, TX\nInterest Level: ${meeting.interest_level || 3}/5\nPillars Discussed: ${(meeting.pillars_discussed || []).join(', ') || 'N/A'}\n\nFeedback:\n${meeting.feedback || 'N/A'}\n\nNext Steps:\n${meeting.next_steps || 'N/A'}`,
      start: { date: eventDate },
      end: { date: endDate.toISOString().split('T')[0] },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: 'Google Calendar API error', details: errText }, { status: 502 });
    }

    const created = await res.json();

    await base44.asServiceRole.entities.SecurityLog.create({
      event_type: 'universe_accessed',
      success: true,
      details: `Calendar event created for investor meeting: ${meeting.investor_name}`,
      threat_level: 'none',
    });

    return Response.json({
      status: 'success',
      event_id: created.id,
      event_link: created.htmlLink,
      message: `Calendar event created for ${meeting.investor_name}`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});