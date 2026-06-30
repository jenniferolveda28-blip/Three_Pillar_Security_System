import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, Download, User, Building2, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PILLAR_OPTIONS = ['DNA Breathalyzer', 'IP Shield', 'Forged API', 'All Three', 'Business Model', 'Market Size'];

const FIELD_STYLES = 'bg-slate-900 border-slate-600 text-white placeholder:text-slate-500';

export default function ContactLeadForm() {
  const [form, setForm] = useState({
    investor_name: '',
    company: '',
    email: '',
    phone: '',
    meeting_location: '',
    pillars_discussed: [],
    feedback: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const togglePillar = (p) => {
    set('pillars_discussed', form.pillars_discussed.includes(p)
      ? form.pillars_discussed.filter(x => x !== p)
      : [...form.pillars_discussed, p]);
  };

  const generatePDF = (data) => {
    const doc = new jsPDF();
    const today = format(new Date(), 'MMMM d, yyyy');

    // Header banner
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 0, 4, 50, 'F');
    doc.setTextColor(6, 182, 212);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PARTNER CONTACT REQUEST', 12, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Three-Pillar Security System', 12, 32);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Submitted: ${today}`, 12, 43);

    let y = 65;
    const labelX = 15, valueX = 80, valueMaxW = 115;

    const drawField = (label, value) => {
      const valueLines = doc.splitTextToSize(String(value || '—'), valueMaxW);
      const rowHeight = Math.max(9, valueLines.length * 5.5 + 4);
      doc.setFillColor(241, 245, 249);
      doc.rect(12, y - 5, 186, rowHeight, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(75, y - 5, 75, y - 5 + rowHeight);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(label, labelX, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(6, 182, 212);
      doc.text(valueLines, valueX, y);
      y += rowHeight + 2;
    };

    drawField('Name', data.investor_name);
    drawField('Company / Fund', data.company);
    drawField('Email', data.email);
    drawField('Phone', data.phone);
    drawField('Location', data.meeting_location);
    drawField('Pillars of Interest', (data.pillars_discussed || []).join(', '));
    drawField('Date Submitted', today);
    drawField('Status', 'PENDING — New Lead');

    // Message section
    y += 4;
    if (data.feedback) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(6, 182, 212);
      doc.text('MESSAGE', 12, y);
      y += 5;
      doc.setDrawColor(6, 182, 212);
      doc.setLineWidth(0.3);
      doc.line(12, y, 198, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const msgLines = doc.splitTextToSize(data.feedback, 184);
      msgLines.forEach(line => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(line, 12, y);
        y += 6;
      });
    }

    // Footer
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 282, 210, 15, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('THREE-PILLAR SECURITY SYSTEM — LEAD CONTACT RECORD', 12, 289);
      doc.text(`Page ${i} of ${pages}`, 175, 289);
    }

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-lead-${data.investor_name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.investor_name || !form.email) {
      toast.error('Please provide your name and email.');
      return;
    }
    setSubmitting(true);
    try {
      const record = {
        investor_name: form.investor_name,
        company: form.company || undefined,
        email: form.email,
        phone: form.phone || undefined,
        meeting_date: format(new Date(), 'yyyy-MM-dd'),
        meeting_location: form.meeting_location || undefined,
        county: 'Travis',
        status: 'pending',
        interest_level: '3',
        pillars_discussed: form.pillars_discussed,
        feedback: form.feedback || undefined,
        documents_reviewed: 'SeekingPartners page contact form',
      };
      const saved = await base44.entities.InvestorMeeting.create(record);
      generatePDF({ ...form });
      setSubmitted(true);
      toast.success('Your contact request has been submitted!');
    } catch (err) {
      toast.error('Failed to submit: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="bg-slate-800/50 border-cyan-500/40">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-cyan-600/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Thank You!</h3>
          <p className="text-slate-300 mb-2">
            Your contact request has been received and logged into our system.
          </p>
          <p className="text-slate-400 text-sm mb-6">
            A PDF summary has been downloaded for your records. We'll be in touch soon.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setForm({ investor_name: '', company: '', email: '', phone: '', meeting_location: '', pillars_discussed: [], feedback: '' });
            }}
            variant="outline"
            className="border-slate-500 text-slate-300 hover:bg-slate-700"
          >
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2"><User className="w-3 h-3" /> Full Name *</Label>
              <Input className={FIELD_STYLES} value={form.investor_name}
                onChange={e => set('investor_name', e.target.value)} placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2"><Building2 className="w-3 h-3" /> Company / Fund</Label>
              <Input className={FIELD_STYLES} value={form.company}
                onChange={e => set('company', e.target.value)} placeholder="Company or fund name" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2"><Mail className="w-3 h-3" /> Email *</Label>
              <Input type="email" className={FIELD_STYLES} value={form.email}
                onChange={e => set('email', e.target.value)} placeholder="email@example.com" required />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2"><Phone className="w-3 h-3" /> Phone</Label>
              <Input className={FIELD_STYLES} value={form.phone}
                onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-slate-300 flex items-center gap-2"><MapPin className="w-3 h-3" /> City / Location</Label>
              <Input className={FIELD_STYLES} value={form.meeting_location}
                onChange={e => set('meeting_location', e.target.value)} placeholder="City, State" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Which Pillars Interest You?</Label>
            <div className="flex flex-wrap gap-2">
              {PILLAR_OPTIONS.map(p => (
                <button key={p} type="button" onClick={() => togglePillar(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    form.pillars_discussed.includes(p)
                      ? 'bg-cyan-600 border-cyan-500 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-400'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2"><MessageSquare className="w-3 h-3" /> Your Message</Label>
            <Textarea className={FIELD_STYLES + ' min-h-32'} value={form.feedback}
              onChange={e => set('feedback', e.target.value)}
              placeholder="Tell us about your background, what caught your attention, and how you'd like to be involved..." />
          </div>

          <Button type="submit" disabled={submitting}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 h-auto text-lg">
            {submitting
              ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</>
              : <><Download className="w-5 h-5 mr-2" /> Submit &amp; Download PDF</>}
          </Button>
          <p className="text-slate-500 text-xs text-center">
            Your information is saved directly to our investor pipeline and a PDF copy is generated for your records.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}