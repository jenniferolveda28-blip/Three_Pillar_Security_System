import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const DEMO_PROMPTS = {
  detection: `Generate a detailed technical explanation for our "Illegal Activity Detection" security demo. Cover: What the demo showcases, the AI-powered threat detection technology, real-time response mechanisms, economic warfare against hackers, and business impact for investors. Include specific technical details about the 0.15 second response time, behavior analysis, attack chain identification, and automated law enforcement integration. Format in markdown with clear sections.`,
  dna: `Generate a detailed technical explanation for our "HelixVerify DNA Authentication" wearable token demo. Cover: How DNA gets encoded into the HelixVerify wearable identity anchor with hardware-backed rotation and liveness, the zero-knowledge architecture where we never store actual DNA (only cryptographic hashes), GDPR/HIPAA compliance advantages, the mathematical impossibility of reverse engineering, and why this is revolutionary for investors. Include technical details about SHA-256 hashing, AES-256-GCM encryption, and the 2-second registration process. Format in markdown with clear sections.`,
  integrated: `Generate a detailed technical explanation for our "Reclaim Me Integration" demo showcasing HelixVerify + CipherPass + Dynamic Scrambler working together as the Reclaim Me authentication platform. Cover: How the three interlocking authentication layers create an impenetrable defense, real-world attack scenario simulation, the synergy between HelixVerify DNA wearable authentication, CipherPass protected API gateway, and Dynamic Scrambler continuous moving-target defense, and the competitive moat this creates. Include specific examples of how an attack is detected, analyzed, and neutralized across all three systems simultaneously. Format in markdown with clear sections.`,
  replacement: `Generate a detailed technical explanation for our "Token Replacement" demo. Cover: The $29.99 replacement cost advantage, 2-3 day shipping timeline, 30-second reactivation process, how DNA verification works without resubmitting samples (cloud-stored hash comparison), zero password reset hassle, and the customer experience benefits. Include the business case for investors on recurring revenue potential and customer lock-in through biological identity. Format in markdown with clear sections.`,
};

function executiveSummaryPrompt(m) {
  return `You are a professional executive summary writer for an investor relations CRM. Transform the following meeting notes into a polished executive summary suitable for sharing with stakeholders or potential investors.

MEETING DETAILS:
- Investor: ${m.investor_name}
- Company: ${m.company || 'N/A'}
- Meeting Date: ${m.meeting_date}
- Location: ${m.meeting_location || 'N/A'}, ${m.county || 'Travis'} County, TX
- Pipeline Stage: ${m.status}
- Interest Level: ${m.interest_level}/5
- Pillars Discussed: ${(m.pillars_discussed || []).join(', ') || 'N/A'}
- Documents Reviewed: ${m.documents_reviewed || 'N/A'}

INVESTOR FEEDBACK:
${m.feedback || 'N/A'}

NEXT STEPS:
${m.next_steps || 'N/A'}

Create a professional executive summary with these sections (use plain text, no markdown symbols):
1. EXECUTIVE OVERVIEW — A concise paragraph summarizing the meeting and investor engagement level.
2. KEY DISCUSSION POINTS — 3-5 bullet points covering the main topics covered and investor reactions.
3. INVESTOR SENTIMENT — A brief assessment of the investor's interest, concerns, and likelihood to proceed.
4. RECOMMENDED ACTIONS — Clear, actionable next steps with suggested timelines.

Keep the tone professional, consistent, and concise. Do not use markdown headers (#) or asterisks.`;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    let prompt;

    if (body.kind === 'threat_assistant') {
      const query = String(body.query || '').trim();
      if (!query) return Response.json({ error: 'query is required' }, { status: 400 });
      if (query.length > 2000) return Response.json({ error: 'query is too long' }, { status: 400 });
      prompt = `You are an advanced cybersecurity AI assistant. Analyze the following security query and provide actionable recommendations:\n\n${query}\n\nProvide: 1) Risk assessment 2) Mitigation strategies 3) Response playbook steps`;
    } else if (body.kind === 'demo_explanation') {
      prompt = DEMO_PROMPTS[body.demo_id];
      if (!prompt) return Response.json({ error: 'Unknown demo' }, { status: 400 });
    } else if (body.kind === 'executive_summary') {
      if (!body.meeting_id) return Response.json({ error: 'meeting_id is required' }, { status: 400 });
      // User-scoped read: access rules decide whether the caller may see this meeting
      const meeting = await base44.entities.InvestorMeeting.get(body.meeting_id)
        .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!meeting) return Response.json({ error: 'Meeting not found' }, { status: 404 });
      prompt = executiveSummaryPrompt(meeting);
    } else {
      return Response.json({ error: 'Unknown insight kind' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
    return Response.json({ text: typeof result === 'string' ? result : JSON.stringify(result) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}