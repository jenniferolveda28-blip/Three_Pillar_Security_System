import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Plus, Calendar, FileText, Star, TrendingUp, MessageSquare, Printer, ChevronRight, Layout, Sparkles, Flame } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import PrintReportButton from '@/components/PrintReportButton';
import ExportAllPagesButton from '@/components/reports/ExportAllPagesButton';
import KanbanBoard from '@/components/investor/KanbanBoard';
import ExecutiveSummaryGenerator from '@/components/investor/ExecutiveSummaryGenerator';
import PriorityBadge, { calculatePriorityScore, getPriorityTier } from '@/components/investor/PriorityBadge';
import BulkActionBar, { exportSelectedLeadsPDF } from '@/components/investor/BulkActionBar';
import InteractionTimeline from '@/components/investor/InteractionTimeline';

const STATUS_COLORS = {
  'Contacted': 'bg-blue-600',
  'NDA Sent': 'bg-yellow-600',
  'Meeting Scheduled': 'bg-cyan-600',
  'Follow-up Needed': 'bg-orange-600',
  'Negotiating': 'bg-purple-600',
  'Interested': 'bg-green-600',
  'Passed': 'bg-slate-600',
};

const PILLARS = ['DNA Breathalyzer', 'IP Shield', 'Forged API', 'All Three', 'Business Model', 'Market Size'];

function MeetingForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    investor_name: '', company: '', email: '', phone: '',
    meeting_date: format(new Date(), 'yyyy-MM-dd'),
    meeting_location: '', county: 'Travis',
    status: 'pending', interest_level: '3',
    pillars_discussed: [], feedback: '', next_steps: '',
    documents_reviewed: '', follow_up_date: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const togglePillar = (p) => {
    set('pillars_discussed', form.pillars_discussed.includes(p)
      ? form.pillars_discussed.filter(x => x !== p)
      : [...form.pillars_discussed, p]);
  };

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Investor Name *</label>
          <Input className="bg-slate-800 border-slate-700 text-white" value={form.investor_name}
            onChange={e => set('investor_name', e.target.value)} placeholder="Full name" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Company / Fund</label>
          <Input className="bg-slate-800 border-slate-700 text-white" value={form.company}
            onChange={e => set('company', e.target.value)} placeholder="Company" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Email</label>
          <Input className="bg-slate-800 border-slate-700 text-white" value={form.email}
            onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Phone</label>
          <Input className="bg-slate-800 border-slate-700 text-white" value={form.phone}
            onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Meeting Date</label>
          <Input type="date" className="bg-slate-800 border-slate-700 text-white" value={form.meeting_date}
            onChange={e => set('meeting_date', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Follow-Up Date</label>
          <Input type="date" className="bg-slate-800 border-slate-700 text-white" value={form.follow_up_date}
            onChange={e => set('follow_up_date', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Meeting Location</label>
          <Input className="bg-slate-800 border-slate-700 text-white" value={form.meeting_location}
            onChange={e => set('meeting_location', e.target.value)} placeholder="City, TX" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">County (TX)</label>
          <Input className="bg-slate-800 border-slate-700 text-white" value={form.county}
            onChange={e => set('county', e.target.value)} placeholder="Travis" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Status</label>
          <Select value={form.status} onValueChange={v => set('status', v)}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(STATUS_COLORS).map(s => (
                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Interest Level (1-5)</label>
          <Select value={form.interest_level} onValueChange={v => set('interest_level', v)}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['1','2','3','4','5'].map(n => (
                <SelectItem key={n} value={n}>{'⭐'.repeat(parseInt(n))} ({n}/5)</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-2 block">Pillars Discussed</label>
        <div className="flex flex-wrap gap-2">
          {PILLARS.map(p => (
            <button key={p} onClick={() => togglePillar(p)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                form.pillars_discussed.includes(p)
                  ? 'bg-cyan-600 border-cyan-500 text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-400'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Documents Reviewed</label>
        <Input className="bg-slate-800 border-slate-700 text-white" value={form.documents_reviewed}
          onChange={e => set('documents_reviewed', e.target.value)} placeholder="NDA, Executive Summary, IP Shield Whitepaper..." />
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Investor Feedback</label>
        <Textarea className="bg-slate-800 border-slate-700 text-white min-h-24" value={form.feedback}
          onChange={e => set('feedback', e.target.value)} placeholder="What did they say about the technology, concerns, questions..." />
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Next Steps</label>
        <Textarea className="bg-slate-800 border-slate-700 text-white min-h-16" value={form.next_steps}
          onChange={e => set('next_steps', e.target.value)} placeholder="Send whitepaper, schedule lab visit, connect with CTO..." />
      </div>

      <div className="flex gap-3 pt-2">
        <Button onClick={() => onSave(form)} className="bg-cyan-600 hover:bg-cyan-500 flex-1">Save Meeting</Button>
        <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">Cancel</Button>
      </div>
    </div>
  );
}

function printMeetingPDF(meeting) {
  const doc = new jsPDF();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setFillColor(6, 182, 212);
  doc.rect(0, 0, 4, 40, 'F');
  doc.setTextColor(6, 182, 212);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('INVESTOR MEETING RECORD', 12, 18);
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(`Three-Pillar Security System  |  ${format(new Date(), 'MMMM d, yyyy')}`, 12, 30);

  let y = 55;
  const row = (label, value, color) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), 12, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(color || 30, color ? 0 : 41, color ? 0 : 59);
    if (color) doc.setTextColor(...(color === 'cyan' ? [6,182,212] : [30,41,59]));
    else doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(String(value || '—'), 150);
    doc.text(lines, 60, y);
    y += lines.length * 6 + 4;
  };

  doc.setFillColor(241, 245, 249);
  doc.rect(10, 48, 190, 130, 'F');
  doc.setDrawColor(6, 182, 212);
  doc.setLineWidth(0.3);
  doc.rect(10, 48, 190, 130);

  row('Investor', meeting.investor_name);
  row('Company', meeting.company);
  row('Email', meeting.email);
  row('Phone', meeting.phone);
  row('Meeting Date', meeting.meeting_date);
  row('Location', `${meeting.meeting_location}, ${meeting.county} County, TX`);
  row('Status', meeting.status?.toUpperCase());
  row('Interest', '⭐'.repeat(parseInt(meeting.interest_level || 3)) + ` (${meeting.interest_level}/5)`);
  row('Pillars Covered', (meeting.pillars_discussed || []).join(', '));
  row('Documents', meeting.documents_reviewed);

  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(10, y, 190, 60, 'F');
  doc.setDrawColor(6, 182, 212);
  doc.rect(10, y, 190, 60);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(6, 182, 212);
  doc.text('INVESTOR FEEDBACK', 14, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  const fbLines = doc.splitTextToSize(meeting.feedback || '—', 182);
  doc.text(fbLines, 14, y);
  y += fbLines.length * 6 + 12;

  doc.setFillColor(241, 245, 249);
  doc.rect(10, y, 190, 40, 'F');
  doc.setDrawColor(139, 92, 246);
  doc.rect(10, y, 190, 40);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(139, 92, 246);
  doc.text('NEXT STEPS', 14, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const nsLines = doc.splitTextToSize(meeting.next_steps || '—', 182);
  doc.text(nsLines, 14, y);

  // Footer
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 282, 210, 15, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('THREE-PILLAR SECURITY SYSTEM — CONFIDENTIAL INVESTOR RECORD', 12, 289);
  doc.text(format(new Date(), 'yyyy-MM-dd'), 180, 289);

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `investor-meeting-${meeting.investor_name?.replace(/\s+/g, '-')}-${meeting.meeting_date}.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  toast.success('Meeting record downloaded!');
}

export default function InvestorCRM() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [execSummaryMeeting, setExecSummaryMeeting] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const { data: meetings = [] } = useQuery({
    queryKey: ['investor_meetings'],
    queryFn: () => base44.entities.InvestorMeeting.list('-meeting_date', 100),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.InvestorMeeting.update(editing.id, data)
      : base44.entities.InvestorMeeting.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['investor_meetings']);
      setShowForm(false);
      setEditing(null);
      toast.success('Meeting saved!');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.InvestorMeeting.update(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries(['investor_meetings']);
      toast.success('Pipeline stage updated!');
    },
  });

  const handleStatusChange = (id, newStatus) => {
    statusMutation.mutate({ id, status: newStatus });
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev => prev.size === meetings.length ? new Set() : new Set(meetings.map(m => m.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }) => base44.entities.InvestorMeeting.bulkUpdate(ids.map(id => ({ id, status }))),
    onSuccess: () => {
      qc.invalidateQueries(['investor_meetings']);
      toast.success(`Updated ${selectedIds.size} leads to "${status}"`);
      clearSelection();
    },
  });

  const handleBulkStatusUpdate = (newStatus) => {
    bulkStatusMutation.mutate({ ids: [...selectedIds], status: newStatus });
  };

  const handleExportSelected = () => {
    const selectedMeetings = meetings.filter(m => selectedIds.has(m.id));
    exportSelectedLeadsPDF(selectedMeetings);
  };

  const openEdit = (m) => { setEditing(m); setShowForm(true); };
  const openNew = () => { setEditing(null); setShowForm(true); };

  const stats = {
    total: meetings.length,
    interested: meetings.filter(m => m.status === 'interested' || m.status === 'negotiating').length,
    avgInterest: meetings.length ? (meetings.reduce((s, m) => s + parseInt(m.interest_level || 3), 0) / meetings.length).toFixed(1) : '—',
    followUps: meetings.filter(m => m.follow_up_date && new Date(m.follow_up_date) >= new Date()).length,
  };

  const priorityStats = {
    high: meetings.filter(m => getPriorityTier(calculatePriorityScore(m)) === 'high').length,
    medium: meetings.filter(m => getPriorityTier(calculatePriorityScore(m)) === 'medium').length,
  };

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black gradient-text">Investor CRM</h1>
            <p className="text-slate-400 mt-1">Track every meeting, feedback, and follow-up</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <ExportAllPagesButton />
            <PrintReportButton
              reportTitle="Investor Pipeline Summary"
              subtitle="Three-Pillar Security System — CRM Export"
              filename="investor-pipeline-{date}.pdf"
              sections={[
                { heading: 'PIPELINE SUMMARY', body: `As of ${format(new Date(), 'MMMM d, yyyy')}, the investor pipeline includes ${stats.total} logged meeting${stats.total !== 1 ? 's' : ''}. ${stats.interested} investor${stats.interested !== 1 ? 's' : ''} currently interested or negotiating. Average interest score: ${stats.avgInterest}/5. ${stats.followUps} upcoming follow-up${stats.followUps !== 1 ? 's' : ''} scheduled.` },
                { heading: 'PIPELINE METRICS', rows: [
                  ['Total Meetings', stats.total],
                  ['Interested / Negotiating', stats.interested],
                  ['Average Interest Score', stats.avgInterest + '/5'],
                  ['Upcoming Follow-Ups', stats.followUps],
                ]},
                ...meetings.map((m, i) => ({
                  heading: `${i + 1}. ${m.investor_name}${m.company ? ' — ' + m.company : ''}`,
                  rows: [
                    ['Status', (m.status || 'pending').toUpperCase()],
                    ['Interest', '\u2B50'.repeat(parseInt(m.interest_level || 3)) + ` (${m.interest_level || 3}/5)`],
                    ['Meeting Date', m.meeting_date || '—'],
                    ['Location', m.meeting_location ? `${m.meeting_location}, ${m.county || 'Travis'} Co., TX` : `${m.county || 'Travis'} Co., TX`],
                    ['Email', m.email || '—'],
                    ['Phone', m.phone || '—'],
                    ['Pillars Discussed', (m.pillars_discussed || []).join(', ') || '—'],
                    ['Documents Reviewed', m.documents_reviewed || '—'],
                    ['Follow-Up Date', m.follow_up_date || '—'],
                  ],
                  body: [m.feedback && `FEEDBACK: ${m.feedback}`, m.next_steps && `NEXT STEPS: ${m.next_steps}`].filter(Boolean).join('\n\n') || undefined,
                })),
              ]}
            />
            <Button onClick={openNew} className="bg-cyan-600 hover:bg-cyan-500 font-bold">
              <Plus className="w-4 h-4 mr-2" /> Log Meeting
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Meetings', value: stats.total, icon: Users, color: 'text-cyan-400' },
            { label: 'Interested / Negotiating', value: stats.interested, icon: TrendingUp, color: 'text-green-400' },
            { label: 'Avg Interest Score', value: stats.avgInterest + '/5', icon: Star, color: 'text-yellow-400' },
            { label: 'High Priority', value: priorityStats.high, icon: Flame, color: 'text-red-400' },
            { label: 'Upcoming Follow-Ups', value: stats.followUps, icon: Calendar, color: 'text-purple-400' },
          ].map((s, i) => (
            <Card key={i} className="bg-slate-800/60 border-slate-700">
              <CardContent className="p-5 flex items-center gap-4">
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div>
                  <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-slate-400 text-xs">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}>
            <Layout className="w-4 h-4 mr-2" /> List View
          </Button>
          <Button size="sm" onClick={() => setViewMode('kanban')}
            className={viewMode === 'kanban' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}>
            <Users className="w-4 h-4 mr-2" /> Kanban Board
          </Button>
        </div>

        {/* Meeting List */}
        {viewMode === 'list' && (
        <div className="space-y-4">
          {selectedIds.size > 0 && (
            <BulkActionBar
              selectedCount={selectedIds.size}
              onBulkStatusUpdate={handleBulkStatusUpdate}
              onExportSelected={handleExportSelected}
              onClearSelection={clearSelection}
            />
          )}
          <div className="flex items-center gap-3 px-1">
            <Checkbox
              checked={meetings.length > 0 && selectedIds.size === meetings.length}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-xs text-slate-400 font-medium">
              {selectedIds.size > 0 ? `${selectedIds.size} of ${meetings.length} selected` : 'Select all'}
            </span>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {meetings.length === 0 && (
            <Card className="col-span-3 bg-slate-800/40 border-slate-700">
              <CardContent className="p-12 text-center text-slate-500">
                No meetings logged yet. Click "Log Meeting" to add your first investor contact.
              </CardContent>
            </Card>
          )}
          {meetings.map(m => (
            <Card key={m.id} className={`bg-slate-800/60 border-slate-700 hover:border-cyan-500/50 transition-colors cursor-pointer ${selectedIds.has(m.id) ? 'ring-2 ring-cyan-500/50' : ''}`}
              onClick={() => setSelected(m === selected ? null : m)}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Checkbox
                    checked={selectedIds.has(m.id)}
                    onCheckedChange={() => toggleSelect(m.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                  />
                  <div className="flex-1 flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-lg">{m.investor_name}</h3>
                      <p className="text-slate-400 text-sm">{m.company}</p>
                    </div>
                    <Badge className={`${STATUS_COLORS[m.status] || 'bg-slate-600'} text-white text-xs`}>
                      {m.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-yellow-400 text-sm">{'⭐'.repeat(parseInt(m.interest_level || 3))}</div>
                  <PriorityBadge meeting={m} />
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {m.meeting_date} — {m.meeting_location}, {m.county} Co., TX
                  </div>
                  {m.pillars_discussed?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {m.pillars_discussed.map(p => (
                        <span key={p} className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full text-xs">{p}</span>
                      ))}
                    </div>
                  )}
                </div>

                {selected?.id === m.id && (
                  <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                    {m.feedback && (
                      <div>
                        <p className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Feedback
                        </p>
                        <p className="text-sm text-slate-300">{m.feedback}</p>
                      </div>
                    )}
                    {m.next_steps && (
                      <div>
                        <p className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1">
                          <ChevronRight className="w-3 h-3" /> Next Steps
                        </p>
                        <p className="text-sm text-slate-300">{m.next_steps}</p>
                      </div>
                    )}
                    {m.documents_reviewed && (
                      <div>
                        <p className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Documents Reviewed
                        </p>
                        <p className="text-sm text-slate-300">{m.documents_reviewed}</p>
                      </div>
                    )}
                    {m.follow_up_date && (
                      <div className="bg-purple-950/40 border border-purple-500/40 rounded px-3 py-2">
                        <p className="text-xs text-purple-300">📅 Follow-up scheduled: <strong>{m.follow_up_date}</strong></p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); openEdit(m); }}
                        className="bg-slate-700 hover:bg-slate-600 text-white text-xs flex-1">Edit</Button>
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); setExecSummaryMeeting(m); }}
                        className="bg-purple-700 hover:bg-purple-600 text-white text-xs flex-1">
                        <Sparkles className="w-3 h-3 mr-1" /> Exec Summary
                      </Button>
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); printMeetingPDF(m); }}
                        className="bg-cyan-700 hover:bg-cyan-600 text-white text-xs flex-1">
                        <Printer className="w-3 h-3 mr-1" /> Print PDF
                      </Button>
                    </div>
                    <InteractionTimeline meeting={m} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
        )}

        {/* Kanban Board */}
        {viewMode === 'kanban' && (
          <KanbanBoard meetings={meetings} onStatusChange={handleStatusChange} onCardClick={openEdit} />
        )}
      </div>

      {/* Executive Summary Dialog */}
      <Dialog open={!!execSummaryMeeting} onOpenChange={(v) => { if (!v) setExecSummaryMeeting(null); }}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">Executive Summary</DialogTitle>
          </DialogHeader>
          {execSummaryMeeting && <ExecutiveSummaryGenerator meeting={execSummaryMeeting} onClose={() => setExecSummaryMeeting(null)} />}
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={v => { setShowForm(v); if (!v) setEditing(null); }}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">{editing ? 'Edit Meeting' : 'Log New Investor Meeting'}</DialogTitle>
          </DialogHeader>
          <MeetingForm
            initial={editing}
            onSave={data => saveMutation.mutate(data)}
            onClose={() => { setShowForm(false); setEditing(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}