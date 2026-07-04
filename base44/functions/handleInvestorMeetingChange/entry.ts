import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data, old_data, changed_fields } = body;

    if (!data) return Response.json({ skipped: true, reason: 'no data in payload' });

    const meeting = data;
    const now = new Date().toISOString();

    // On create — log the initial meeting entry
    if (event?.type === 'create') {
      await base44.asServiceRole.entities.InvestorInteraction.create({
        investor_meeting_id: meeting.id,
        investor_name: meeting.investor_name,
        interaction_type: 'meeting_logged',
        description: `Meeting logged for ${meeting.investor_name}${meeting.company ? ' (' + meeting.company + ')' : ''} — Status: ${meeting.status}`,
        new_status: meeting.status,
        metadata: { meeting_date: meeting.meeting_date, location: meeting.meeting_location },
        timestamp: now,
      });
    }

    // On update — detect and log specific field changes
    if (event?.type === 'update' && Array.isArray(changed_fields)) {
      // Status change
      if (changed_fields.includes('status') && old_data?.status !== meeting.status) {
        await base44.asServiceRole.entities.InvestorInteraction.create({
          investor_meeting_id: meeting.id,
          investor_name: meeting.investor_name,
          interaction_type: 'status_change',
          description: `Pipeline status changed from "${old_data.status}" to "${meeting.status}"`,
          old_status: old_data.status,
          new_status: meeting.status,
          timestamp: now,
        });

        // Create pre-meeting preparation checklist in Google Tasks when status → "Meeting Scheduled"
        if (meeting.status === 'Meeting Scheduled') {
          try {
            const conn = await base44.asServiceRole.connectors.getConnection('googletasks');
            if (conn?.accessToken) {
              await createPreMeetingChecklist(conn.accessToken, meeting);

              await base44.asServiceRole.entities.InvestorInteraction.create({
                investor_meeting_id: meeting.id,
                investor_name: meeting.investor_name,
                interaction_type: 'checklist_created',
                description: `Pre-meeting preparation checklist created in Google Tasks (7 items) — due ${meeting.meeting_date || 'TBD'}`,
                timestamp: new Date().toISOString(),
              });
            }
          } catch (e) {
            // Google Tasks not connected or error — skip silently, interaction still logged
          }
        }
      }

      // Follow-up date scheduled
      if (changed_fields.includes('follow_up_date') && meeting.follow_up_date && old_data?.follow_up_date !== meeting.follow_up_date) {
        await base44.asServiceRole.entities.InvestorInteraction.create({
          investor_meeting_id: meeting.id,
          investor_name: meeting.investor_name,
          interaction_type: 'follow_up_scheduled',
          description: `Follow-up scheduled for ${meeting.follow_up_date}`,
          timestamp: now,
        });
      }

      // Feedback updated
      if (changed_fields.includes('feedback') && meeting.feedback) {
        await base44.asServiceRole.entities.InvestorInteraction.create({
          investor_meeting_id: meeting.id,
          investor_name: meeting.investor_name,
          interaction_type: 'feedback_updated',
          description: `Investor feedback updated: "${meeting.feedback.substring(0, 120)}${meeting.feedback.length > 120 ? '...' : ''}"`,
          timestamp: now,
        });
      }
    }

    return Response.json({ status: 'success', event_type: event?.type });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

/**
 * Creates a pre-meeting preparation checklist (multiple tasks) in Google Tasks.
 */
async function createPreMeetingChecklist(accessToken: string, meeting: any) {
  const meetingDate = meeting.meeting_date ? new Date(meeting.meeting_date) : new Date();
  // Prep tasks due 1 day before the meeting; if that's already past, due today
  const prepDue = new Date(meetingDate);
  prepDue.setDate(prepDue.getDate() - 1);
  if (prepDue.getTime() < Date.now()) prepDue.setTime(Date.now());

  const investorLabel = meeting.investor_name + (meeting.company ? ` (${meeting.company})` : '');
  const locationStr = [meeting.meeting_location, meeting.county ? meeting.county + ' Co., TX' : ''].filter(Boolean).join(', ');

  const checklist = [
    {
      title: `📋 Prepare pitch deck — ${meeting.investor_name}`,
      notes: `Customize the Three-Pillar Security System pitch deck for ${investorLabel}.\nFocus pillars: ${(meeting.pillars_discussed || ['All Three']).join(', ')}.`,
    },
    {
      title: `🔍 Research ${meeting.investor_name}'s background & portfolio`,
      notes: `Review investment history, portfolio companies, sector preferences, and recent news for ${investorLabel}.`,
    },
    {
      title: `📄 Prepare/sign NDA — ${meeting.investor_name}`,
      notes: `Generate Texas NDA for ${investorLabel}.${meeting.county ? ` Jurisdiction: ${meeting.county} County, TX.` : ''} Ensure it covers DNA authentication technology disclosures.`,
    },
    {
      title: `🖥️ Set up demo environment`,
      notes: 'Verify the following demos are operational:\n• DNA Breathalyzer simulation\n• IP Shield key rotation visualization\n• Forged API playground\n• AI Threat Detection dashboard',
    },
    {
      title: `📧 Send calendar invite with agenda to ${meeting.investor_name}`,
      notes: `Meeting date: ${meeting.meeting_date || 'TBD'}\nLocation: ${locationStr || 'TBD'}\nEmail: ${meeting.email || 'N/A'}\nPhone: ${meeting.phone || 'N/A'}\n\nAgenda:\n1. Introduction & company overview\n2. Three-Pillar Architecture deep dive\n3. Live demonstration\n4. Market opportunity & business model\n5. Q&A and next steps`,
    },
    {
      title: `📊 Prepare handout materials — ${meeting.investor_name}`,
      notes: 'Print/digital materials needed:\n• Executive summary (1-pager)\n• Technical architecture diagram\n• ROI / market size projections\n• Investor timeline & milestones',
    },
    {
      title: `💬 Review previous interactions with ${meeting.investor_name}`,
      notes: `Current interest level: ${meeting.interest_level || 3}/5\nCurrent status: ${meeting.status}\nPrevious feedback: ${meeting.feedback || 'None recorded'}\nNext steps from last interaction: ${meeting.next_steps || 'None'}`,
    },
  ];

  for (const task of checklist) {
    try {
      await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          notes: task.notes,
          due: prepDue.toISOString(),
        }),
      });
    } catch (_e) {
      // Continue creating remaining tasks even if one fails
    }
  }
}