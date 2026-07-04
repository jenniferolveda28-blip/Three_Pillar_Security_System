import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, X, CheckSquare } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['Contacted', 'NDA Sent', 'Meeting Scheduled', 'Follow-up Needed', 'Negotiating', 'Interested', 'Passed'];

export default function BulkActionBar({ selectedCount, onBulkStatusUpdate, onExportSelected, onClearSelection }) {
  const [newStatus, setNewStatus] = useState('');

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/80 border border-cyan-500/40 rounded-xl">
      <CheckSquare className="w-5 h-5 text-cyan-400" />
      <span className="text-white font-semibold text-sm">{selectedCount} selected</span>
      <div className="flex-1" />
      <Select value={newStatus} onValueChange={setNewStatus}>
        <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
          <SelectValue placeholder="Update status..." />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button size="sm" disabled={!newStatus} onClick={() => { onBulkStatusUpdate(newStatus); setNewStatus(''); }}
        className="bg-cyan-600 hover:bg-cyan-500">
        Apply
      </Button>
      <Button size="sm" onClick={onExportSelected} className="bg-purple-600 hover:bg-purple-500">
        <Download className="w-4 h-4 mr-1" /> Export PDF
      </Button>
      <Button size="sm" variant="outline" onClick={onClearSelection} className="border-slate-600 text-slate-300">
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function exportSelectedLeadsPDF(meetings) {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setFillColor(6, 182, 212);
  doc.rect(0, 0, 4, 40, 'F');
  doc.setTextColor(6, 182, 212);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SELECTED LEADS EXPORT', 12, 18);
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(`Three-Pillar Security System  |  ${format(new Date(), 'MMMM d, yyyy')}`, 12, 30);
  doc.text(`Total Leads: ${meetings.length}`, 12, 36);

  let y = 50;
  meetings.forEach((m, i) => {
    if (y > 260) { doc.addPage(); y = 20; }

    // Card background
    doc.setFillColor(241, 245, 249);
    doc.rect(10, y, 190, 50, 'F');
    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(0.3);
    doc.rect(10, y, 190, 50);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`${i + 1}. ${m.investor_name}${m.company ? ' — ' + m.company : ''}`, 14, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Status: ${(m.status || 'N/A').toUpperCase()}`, 14, y + 16);
    doc.text(`Interest: ${'⭐'.repeat(parseInt(m.interest_level || 3))} (${m.interest_level || 3}/5)`, 14, y + 23);
    doc.text(`Meeting: ${m.meeting_date || '—'}  |  Location: ${m.meeting_location || '—'}, ${m.county || 'Travis'} Co., TX`, 14, y + 30);
    doc.text(`Email: ${m.email || '—'}  |  Phone: ${m.phone || '—'}`, 14, y + 37);
    doc.text(`Pillars: ${(m.pillars_discussed || []).join(', ') || '—'}  |  Follow-up: ${m.follow_up_date || '—'}`, 14, y + 44);

    y += 56;
  });

  // Footer
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 282, 210, 15, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('THREE-PILLAR SECURITY SYSTEM — SELECTED LEADS EXPORT', 12, 289);
    doc.text(`Page ${i} of ${pages}  |  ${format(new Date(), 'yyyy-MM-dd')}`, 150, 289);
  }

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `selected-leads-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  toast.success(`Exported ${meetings.length} leads to PDF!`);
}