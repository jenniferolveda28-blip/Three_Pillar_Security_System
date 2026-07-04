import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Plus, Save, Trash2, Eye, Send, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const DEFAULT_TEMPLATES = [
  {
    name: 'Initial Investor Introduction',
    sequence_type: 'initial_intro',
    trigger: 'New lead logged in CRM',
    subject: 'Three-Pillar Security System — Introduction',
    body: `Dear {{investor_name}},

I hope this message finds you well. I'm reaching out from the Three-Pillar Security System team to introduce you to a groundbreaking approach to API security.

Our system combines three pillars:
1. DNA-based biometric authentication
2. Dynamic key scrambling (IP Shield)
3. AI-powered threat detection

I'd love to schedule a brief call to discuss how this technology could be of interest to {{company}}.

Would you be available next week for a 30-minute introduction?

Best regards,
The Three-Pillar Security Team`,
  },
  {
    name: 'NDA Follow-Up',
    sequence_type: 'nda_followup',
    trigger: 'Status changed to "NDA Sent"',
    subject: 'Your Texas NDA — Please Review & Sign',
    body: `Dear {{investor_name}},

Thank you for your interest in the Three-Pillar Security System. As discussed, I've attached a Texas-governed Mutual Non-Disclosure Agreement for your review.

This NDA covers:
• DNA authentication technology disclosures
• API key scrambling architecture details
• AI threat detection methodology

Please review, sign, and return at your earliest convenience so we can schedule a deeper technical dive.

Best regards,
The Three-Pillar Security Team`,
  },
  {
    name: 'Post-Meeting Thank You',
    sequence_type: 'post_meeting',
    trigger: 'Meeting completed',
    subject: 'Thank you for your time — Next Steps',
    body: `Dear {{investor_name}},

Thank you for taking the time to meet with us on {{meeting_date}}. We appreciated the opportunity to demonstrate the Three-Pillar Security System and discuss how it aligns with {{company}}'s investment thesis.

As discussed, our next steps are:
{{next_steps}}

Please don't hesitate to reach out with any follow-up questions. We look forward to continuing the conversation.

Best regards,
The Three-Pillar Security Team`,
  },
  {
    name: 'Follow-Up Reminder (7 days)',
    sequence_type: 'followup_reminder',
    trigger: 'No response after 7 days',
    subject: 'Following up — Three-Pillar Security System',
    body: `Dear {{investor_name}},

I wanted to follow up on my previous email regarding the Three-Pillar Security System. I understand you're busy, so I'll keep this brief.

We're currently scheduling lab visits and live demonstrations for interested partners. Would you like me to reserve a slot for {{company}}?

Happy to answer any questions you may have.

Best regards,
The Three-Pillar Security Team`,
  },
  {
    name: 'Daily Threat Digest Header',
    sequence_type: 'daily_digest',
    trigger: 'Daily automated email',
    subject: 'Three-Pillar Security — Daily Threat Summary for {{date}}',
    body: `SECURITY STATUS REPORT — {{date}}

SYSTEM OVERVIEW:
• Connected API Universes: {{universe_count}}
• Security Events (24h): {{event_count}}
• Threats Neutralized: {{threats_neutralized}}
• Active Anomalies: {{anomaly_count}}

This automated digest is generated daily to keep stakeholders informed of the system's security posture.

— Three-Pillar Security System`,
  },
];

export default function EmailTemplates() {
  const qc = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(null);

  const { data: savedTemplates = [] } = useQuery({
    queryKey: ['email_templates'],
    queryFn: () => base44.entities.SecurityReport.filter({ report_name: { $regex: 'Email Template' } }, '-updated_date', 50),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const existing = savedTemplates.find(t => t.report_name === data.report_name);
      if (existing) return base44.entities.SecurityReport.update(existing.id, data);
      return base44.entities.SecurityReport.create(data);
    },
    onSuccess: () => {
      qc.invalidateQueries(['email_templates']);
      toast.success('Email template saved!');
      setEditMode(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SecurityReport.delete(id),
    onSuccess: () => {
      qc.invalidateQueries(['email_templates']);
      toast.success('Template deleted');
      setSelectedTemplate(null);
    },
  });

  const allTemplates = [...DEFAULT_TEMPLATES, ...savedTemplates.map(t => ({
    name: t.report_name?.replace('Email Template: ', ''),
    sequence_type: t.schedule_type || 'custom',
    trigger: t.description || 'Custom trigger',
    subject: t.time_range_days ? `Stored template` : 'Stored template',
    body: t.notes || t.description || '',
    id: t.id,
    isSaved: true,
  }))];

  const handleSelectTemplate = (t) => {
    setSelectedTemplate(t);
    setDraft({ ...t });
    setEditMode(false);
  };

  const handleSave = () => {
    if (!draft.name) { toast.error('Template name is required'); return; }
    saveMutation.mutate({
      report_name: `Email Template: ${draft.name}`,
      description: draft.trigger,
      schedule_type: draft.sequence_type,
      notes: `Subject: ${draft.subject}\n\n${draft.body}`,
      is_active: true,
    });
  };

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black gradient-text">Email Template Manager</h1>
          <p className="text-slate-400 mt-1">View, edit, and save automated email sequences for investor follow-ups</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template List */}
          <div className="lg:col-span-1 space-y-2">
            <h2 className="text-sm font-semibold text-slate-400 mb-2">TEMPLATES ({allTemplates.length})</h2>
            {allTemplates.map((t, i) => (
              <Card key={i} className={`bg-slate-800/60 border-slate-700 cursor-pointer transition-all hover:border-cyan-500/50 ${selectedTemplate?.name === t.name ? 'ring-1 ring-cyan-500/50 border-cyan-500/50' : ''}`}
                onClick={() => handleSelectTemplate(t)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{t.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t.trigger}</p>
                      {t.isSaved && <Badge className="bg-green-600 text-white text-xs mt-1">Saved</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-2">
            {!selectedTemplate ? (
              <Card className="bg-slate-800/40 border-slate-700 border-dashed">
                <CardContent className="p-12 text-center text-slate-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                  <p>Select a template to view and edit its content</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800/60 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-cyan-400 flex items-center gap-2">
                      <Mail className="w-5 h-5" /> {editMode ? 'Edit Template' : 'Template Preview'}
                    </CardTitle>
                    <div className="flex gap-2">
                      {!editMode ? (
                        <>
                          <Button size="sm" onClick={() => setEditMode(true)} className="bg-cyan-600 hover:bg-cyan-500">
                            <Plus className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          {selectedTemplate.isSaved && (
                            <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(selectedTemplate.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          <Button size="sm" onClick={handleSave} disabled={saveMutation.isLoading} className="bg-green-600 hover:bg-green-500">
                            <Save className="w-4 h-4 mr-1" /> Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditMode(false)} className="border-slate-600 text-slate-300">Cancel</Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!editMode ? (
                    <>
                      <div>
                        <label className="text-xs text-slate-400 font-semibold">Template Name</label>
                        <p className="text-white font-semibold mt-1">{draft.name}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-semibold">Trigger</label>
                        <p className="text-slate-300 text-sm mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{draft.trigger}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-semibold">Subject Line</label>
                        <p className="text-white text-sm mt-1 p-3 bg-slate-900/50 rounded-lg border border-slate-700">{draft.subject}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-semibold">Email Body</label>
                        <pre className="text-slate-300 text-sm mt-1 p-4 bg-slate-900/50 rounded-lg border border-slate-700 whitespace-pre-wrap font-sans">{draft.body}</pre>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Template Name</label>
                        <Input className="bg-slate-900 border-slate-700 text-white" value={draft.name}
                          onChange={e => setDraft({ ...draft, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Trigger Event</label>
                        <Input className="bg-slate-900 border-slate-700 text-white" value={draft.trigger}
                          onChange={e => setDraft({ ...draft, trigger: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Subject Line</label>
                        <Input className="bg-slate-900 border-slate-700 text-white" value={draft.subject}
                          onChange={e => setDraft({ ...draft, subject: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Email Body (supports variables like &#123;&#123;investor_name&#125;&#125;)</label>
                        <Textarea className="bg-slate-900 border-slate-700 text-white min-h-[300px] font-mono text-sm" value={draft.body}
                          onChange={e => setDraft({ ...draft, body: e.target.value })} />
                      </div>
                    </>
                  )}
                  <div className="bg-slate-900/30 border border-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">
                      <strong className="text-slate-400">Available variables:</strong> {'{{investor_name}}'}, {'{{company}}'}, {'{{meeting_date}}'}, {'{{next_steps}}'}, {'{{date}}'}, {'{{universe_count}}'}, {'{{event_count}}'}, {'{{threats_neutralized}}'}, {'{{anomaly_count}}'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}