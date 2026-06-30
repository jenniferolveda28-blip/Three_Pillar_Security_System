import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Download, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ExecutiveSummaryGenerator({ meeting, onClose }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const prompt = `You are a professional executive summary writer for an investor relations CRM. Transform the following meeting notes into a polished executive summary suitable for sharing with stakeholders or potential investors.

MEETING DETAILS:
- Investor: ${meeting.investor_name}
- Company: ${meeting.company || 'N/A'}
- Meeting Date: ${meeting.meeting_date}
- Location: ${meeting.meeting_location || 'N/A'}, ${meeting.county || 'Travis'} County, TX
- Pipeline Stage: ${meeting.status}
- Interest Level: ${meeting.interest_level}/5
- Pillars Discussed: ${(meeting.pillars_discussed || []).join(', ') || 'N/A'}
- Documents Reviewed: ${meeting.documents_reviewed || 'N/A'}

INVESTOR FEEDBACK:
${meeting.feedback || 'N/A'}

NEXT STEPS:
${meeting.next_steps || 'N/A'}

Create a professional executive summary with these sections (use plain text, no markdown symbols):
1. EXECUTIVE OVERVIEW — A concise paragraph summarizing the meeting and investor engagement level.
2. KEY DISCUSSION POINTS — 3-5 bullet points covering the main topics covered and investor reactions.
3. INVESTOR SENTIMENT — A brief assessment of the investor's interest, concerns, and likelihood to proceed.
4. RECOMMENDED ACTIONS — Clear, actionable next steps with suggested timelines.

Keep the tone professional, consistent, and concise. Do not use markdown headers (#) or asterisks.`;

      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      setSummary(typeof res === 'string' ? res : JSON.stringify(res));
      toast.success('Executive summary generated!');
    } catch (err) {
      toast.error('Failed to generate: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 0, 4, 45, 'F');
    doc.setTextColor(6, 182, 212);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE SUMMARY', 12, 18);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`${meeting.investor_name}${meeting.company ? ' — ' + meeting.company : ''}`, 12, 28);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')} | Three-Pillar Security System`, 12, 38);

    let y = 58;
    const lines = doc.splitTextToSize(summary || 'No summary generated yet.', 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    lines.forEach(line => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(line, 12, y);
      y += 6;
    });

    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 282, 210, 15, 'F');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('THREE-PILLAR SECURITY SYSTEM — EXECUTIVE SUMMARY', 12, 289);
      doc.text(`Page ${i} of ${pages}`, 175, 289);
    }

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exec-summary-${meeting.investor_name?.replace(/\s+/g, '-')}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    toast.success('Executive summary PDF downloaded!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-cyan-400">
        <FileText className="w-5 h-5" />
        <h3 className="font-bold">Executive Summary Generator</h3>
      </div>
      <p className="text-slate-400 text-sm">
        AI-formats the meeting notes for <strong className="text-white">{meeting.investor_name}</strong> into a consistent, professional executive summary.
      </p>
      {!summary ? (
        <Button onClick={generate} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Executive Summary</>}
        </Button>
      ) : (
        <>
          <Textarea value={summary} onChange={e => setSummary(e.target.value)} readOnly={false}
            className="bg-slate-900 border-slate-700 text-white min-h-64 font-mono text-sm" />
          <div className="flex gap-2">
            <Button onClick={downloadPDF} className="bg-cyan-600 hover:bg-cyan-500 flex-1">
              <Download className="w-4 h-4 mr-2" />Download PDF
            </Button>
            <Button onClick={generate} variant="outline" className="border-slate-600 text-slate-300">
              <Sparkles className="w-4 h-4 mr-2" />Regenerate
            </Button>
          </div>
        </>
      )}
      <Button variant="ghost" onClick={onClose} className="w-full text-slate-400">Close</Button>
    </div>
  );
}