import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Printer, Download, Shield } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { toast } from 'sonner';

const TX_COUNTIES = [
  'Anderson','Andrews','Angelina','Aransas','Archer','Armstrong','Atascosa','Austin','Bailey','Bandera',
  'Bastrop','Baylor','Bee','Bell','Bexar','Blanco','Borden','Bosque','Bowie','Brazoria','Brazos',
  'Brewster','Briscoe','Brooks','Brown','Burleson','Burnet','Caldwell','Calhoun','Callahan','Cameron',
  'Camp','Carson','Cass','Castro','Chambers','Cherokee','Childress','Clay','Cochran','Coke','Coleman',
  'Collin','Collingsworth','Colorado','Comal','Comanche','Concho','Cooke','Corpus Christi (Nueces)',
  'Dallas','Denton','El Paso','Fort Bend','Galveston','Harris','Hays','Hidalgo','Hunt','Johnson',
  'Kaufman','Lubbock','McLennan','Montgomery','Nueces','Parker','Potter','Randall','Rockwall',
  'Smith','Tarrant','Taylor','Travis','Walker','Webb','Wichita','Williamson','Wise',
];

const DISCLOSURE_TYPES = [
  'proprietary cybersecurity architecture and source code',
  'DNA biometric authentication technology and processes',
  'IP Shield moving-target defense system and algorithms',
  'Forged API routing technology and AI threat detection logic',
  'all three pillars of the Three-Pillar Security System',
  'business plans, financial projections, and investor materials',
];

export default function TexasNDA() {
  const today = format(new Date(), 'MMMM d, yyyy');
  const [form, setForm] = useState({
    disclosingParty: 'Three-Pillar Security System (Sole Proprietor)',
    disclosingAddress: 'Texas, United States',
    receivingParty: '',
    receivingAddress: '',
    receivingTitle: '',
    county: 'Travis',
    city: 'Austin',
    disclosureType: 'all three pillars of the Three-Pillar Security System',
    purposeDescription: 'evaluating a potential investment, research collaboration, or co-founding partnership',
    termYears: '3',
    date: today,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const generateNDA = () => {
    if (!form.receivingParty) {
      toast.error('Please enter the receiving party name.');
      return;
    }

    const doc = new jsPDF();

    // ── Cover Header ──
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 55, 'F');
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 0, 4, 55, 'F');
    doc.setTextColor(6, 182, 212);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('NON-DISCLOSURE AGREEMENT', 12, 20);
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.text('Mutual Confidentiality & Non-Disclosure Agreement', 12, 30);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Governed by the Laws of the State of Texas  |  ${form.county} County`, 12, 40);
    doc.text(`Date: ${form.date}`, 12, 49);

    let y = 68;

    const heading = (title) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(6, 182, 212);
      doc.text(title, 12, y);
      y += 3;
      doc.setDrawColor(6, 182, 212);
      doc.setLineWidth(0.3);
      doc.line(12, y, 198, y);
      y += 7;
    };

    const para = (text) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      const lines = doc.splitTextToSize(text, 186);
      lines.forEach(line => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(line, 12, y);
        y += 6;
      });
      y += 4;
    };

    // ── PARTIES ──
    heading('1. PARTIES');
    para(`This Non-Disclosure Agreement ("Agreement") is entered into as of ${form.date}, by and between:`);
    para(`DISCLOSING PARTY: ${form.disclosingParty}, located at ${form.disclosingAddress} ("Disclosing Party").`);
    para(`RECEIVING PARTY: ${form.receivingParty}${form.receivingTitle ? ', ' + form.receivingTitle : ''}, located at ${form.receivingAddress || 'address to be provided'} ("Receiving Party").`);

    heading('2. PURPOSE');
    para(`The parties wish to explore the possibility of ${form.purposeDescription} in connection with the Disclosing Party's proprietary technology. In connection with this evaluation, the Disclosing Party may disclose certain confidential information relating to ${form.disclosureType}.`);

    heading('3. DEFINITION OF CONFIDENTIAL INFORMATION');
    para(`"Confidential Information" means any and all technical, commercial, financial, or operational information disclosed by the Disclosing Party to the Receiving Party, whether orally, visually, or in writing, including but not limited to: source code, software architecture, algorithms, security protocols, DNA biometric processes, API routing logic, threat detection systems, business plans, financial projections, investor presentations, trade secrets, and any other proprietary information marked or reasonably understood to be confidential.`);

    heading('4. OBLIGATIONS OF RECEIVING PARTY');
    para(`The Receiving Party agrees to: (a) hold all Confidential Information in strict confidence; (b) not disclose Confidential Information to any third party without prior written consent of the Disclosing Party; (c) use Confidential Information solely for the Purpose stated in Section 2; (d) protect the Confidential Information with at least the same degree of care used to protect its own confidential information, but no less than reasonable care; (e) promptly notify the Disclosing Party of any unauthorized disclosure or use of Confidential Information.`);

    heading('5. EXCLUSIONS');
    para(`The obligations of confidentiality shall not apply to information that: (a) was in the public domain at the time of disclosure; (b) becomes publicly known through no fault of the Receiving Party; (c) was independently developed by the Receiving Party without reference to the Confidential Information; (d) is required to be disclosed by law or court order, provided that the Receiving Party gives prompt written notice to the Disclosing Party.`);

    heading('6. INTELLECTUAL PROPERTY');
    para(`Nothing in this Agreement shall be construed to grant the Receiving Party any license, right, title, or interest in or to any Confidential Information, intellectual property, patents, trademarks, copyrights, or trade secrets of the Disclosing Party. All Confidential Information remains the exclusive property of the Disclosing Party.`);

    heading('7. TERM');
    para(`This Agreement shall remain in effect for a period of ${form.termYears} (${form.termYears}) years from the date of execution, unless earlier terminated by mutual written agreement. The obligations of confidentiality shall survive the termination of this Agreement for an additional two (2) years.`);

    heading('8. GOVERNING LAW & VENUE');
    para(`This Agreement shall be governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of laws provisions. Any dispute arising from this Agreement shall be resolved exclusively in the courts of ${form.county} County, Texas, and the parties hereby consent to personal jurisdiction in such courts.`);

    heading('9. REMEDIES');
    para(`The parties acknowledge that any breach of this Agreement may cause irreparable harm for which monetary damages may be inadequate. Accordingly, the Disclosing Party shall be entitled to seek injunctive or other equitable relief, in addition to any other remedies available at law or equity, without the necessity of posting any bond.`);

    heading('10. ENTIRE AGREEMENT');
    para(`This Agreement constitutes the entire agreement between the parties with respect to its subject matter and supersedes all prior negotiations, representations, warranties, and understandings of the parties. This Agreement may only be amended by a written instrument signed by both parties.`);

    // ── Signature Block ──
    y += 8;
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFillColor(241, 245, 249);
    doc.rect(10, y, 190, 65, 'F');
    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(0.5);
    doc.rect(10, y, 190, 65);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(6, 182, 212);
    doc.text('SIGNATURES', 14, y);
    y += 10;

    // Left sig
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('DISCLOSING PARTY:', 14, y);
    y += 8;
    doc.setDrawColor(100, 116, 139);
    doc.line(14, y, 98, y);
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(form.disclosingParty, 14, y);
    y += 5;
    doc.text(`Date: _______________`, 14, y);

    // Reset y back for right column
    y -= 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('RECEIVING PARTY:', 110, y);
    y += 8;
    doc.line(110, y, 198, y);
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(form.receivingParty + (form.receivingTitle ? ', ' + form.receivingTitle : ''), 110, y);
    y += 5;
    doc.text(`Date: _______________`, 110, y);

    // ── Footer on each page ──
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 282, 210, 15, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`NON-DISCLOSURE AGREEMENT  |  ${form.county} County, Texas  |  CONFIDENTIAL`, 12, 289);
      doc.text(`Page ${i} of ${pages}`, 182, 289);
    }

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NDA-${form.receivingParty.replace(/\s+/g, '-')}-${form.county}County-TX.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    toast.success('NDA generated and downloaded!');
  };

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-cyan-600 flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black gradient-text">Texas NDA Generator</h1>
            <p className="text-slate-400">Pre-filled non-disclosure agreements for Texas investor meetings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-cyan-400 text-lg">Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Your Name / Entity (Disclosing Party)</label>
                <Input className="bg-slate-900 border-slate-600 text-white" value={form.disclosingParty}
                  onChange={e => set('disclosingParty', e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Your Address</label>
                <Input className="bg-slate-900 border-slate-600 text-white" value={form.disclosingAddress}
                  onChange={e => set('disclosingAddress', e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Receiving Party Name *</label>
                <Input className="bg-slate-900 border-slate-600 text-white" value={form.receivingParty}
                  onChange={e => set('receivingParty', e.target.value)} placeholder="Investor / Researcher full name" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Receiving Party Title / Company</label>
                <Input className="bg-slate-900 border-slate-600 text-white" value={form.receivingTitle}
                  onChange={e => set('receivingTitle', e.target.value)} placeholder="Managing Partner, XYZ Ventures" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Receiving Party Address</label>
                <Input className="bg-slate-900 border-slate-600 text-white" value={form.receivingAddress}
                  onChange={e => set('receivingAddress', e.target.value)} placeholder="City, State" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Texas County (Venue)</label>
                  <Select value={form.county} onValueChange={v => set('county', v)}>
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {TX_COUNTIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Term (Years)</label>
                  <Select value={form.termYears} onValueChange={v => set('termYears', v)}>
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['1','2','3','5','7','10'].map(n => <SelectItem key={n} value={n}>{n} Year{n !== '1' ? 's' : ''}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">What's Being Disclosed</label>
                <Select value={form.disclosureType} onValueChange={v => set('disclosureType', v)}>
                  <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCLOSURE_TYPES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Purpose of Disclosure</label>
                <Input className="bg-slate-900 border-slate-600 text-white" value={form.purposeDescription}
                  onChange={e => set('purposeDescription', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="space-y-4">
            <Card className="bg-slate-900/80 border-cyan-500/40">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <h3 className="font-bold text-cyan-300 text-lg">NDA Preview</h3>
                </div>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="bg-slate-800 rounded-lg p-3">
                    <span className="text-slate-400 text-xs">DISCLOSING PARTY</span>
                    <p className="font-semibold text-white">{form.disclosingParty || '—'}</p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <span className="text-slate-400 text-xs">RECEIVING PARTY</span>
                    <p className="font-semibold text-white">{form.receivingParty || '—'} {form.receivingTitle && `(${form.receivingTitle})`}</p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <span className="text-slate-400 text-xs">GOVERNING JURISDICTION</span>
                    <p className="font-semibold text-white">{form.county} County, Texas</p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <span className="text-slate-400 text-xs">SUBJECT MATTER</span>
                    <p className="font-semibold text-white">{form.disclosureType}</p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <span className="text-slate-400 text-xs">TERM</span>
                    <p className="font-semibold text-white">{form.termYears} Year{form.termYears !== '1' ? 's' : ''} from signing</p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <span className="text-slate-400 text-xs">DATE</span>
                    <p className="font-semibold text-white">{form.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-950/30 border-green-500/40">
              <CardContent className="p-5 text-sm text-slate-300 space-y-2">
                <p className="font-bold text-green-300">What this NDA covers:</p>
                <p>✓ Source code, algorithms, and security architecture</p>
                <p>✓ DNA biometric processes and IP Shield technology</p>
                <p>✓ Business plans and investor materials</p>
                <p>✓ Injunctive relief clause (no bond required)</p>
                <p>✓ Texas venue and governing law</p>
                <p>✓ Signature blocks for both parties</p>
              </CardContent>
            </Card>

            <Button onClick={generateNDA}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 h-auto text-lg">
              <Download className="w-5 h-5 mr-2" />
              Generate &amp; Download NDA PDF
            </Button>

            <p className="text-xs text-slate-500 text-center">
              This NDA template is provided for convenience. For legal enforceability, review with a licensed Texas attorney.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}