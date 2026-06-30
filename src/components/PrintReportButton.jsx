import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { toast } from 'sonner';

/**
 * Universal print/PDF button.
 * Props:
 *   reportTitle  – string, page title
 *   subtitle     – string, subtitle/tagline
 *   sections     – array of { heading, body, rows? }
 *                  rows is an optional array of [label, value] pairs for table-style output
 *   filename     – output file name (default: report.pdf)
 *   className    – extra tailwind classes
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

export default function PrintReportButton({ reportTitle, subtitle, sections = [], filename = 'report.pdf', className = '' }) {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      const today = format(new Date(), 'MMMM d, yyyy HH:mm');
      const dateStr = format(new Date(), 'yyyy-MM-dd');

      // ── Dark header banner ──
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 50, 'F');

      // Accent stripe
      doc.setFillColor(6, 182, 212);
      doc.rect(0, 0, 4, 50, 'F');

      doc.setTextColor(6, 182, 212);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(reportTitle.toUpperCase(), 12, 22);

      if (subtitle) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(subtitle, 12, 32);
      }

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${today}  |  Three-Pillar Security System`, 12, 43);

      let y = 62;

      const checkPage = (needed = 20) => {
        if (y + needed > 275) {
          doc.addPage();
          y = 20;
          // mini header on continuation pages
          doc.setFillColor(15, 23, 42);
          doc.rect(0, 0, 210, 14, 'F');
          doc.setFillColor(6, 182, 212);
          doc.rect(0, 0, 4, 14, 'F');
          doc.setTextColor(148, 163, 184);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(`${reportTitle} — continued`, 12, 9);
          y = 22;
        }
      };

      sections.forEach((section, idx) => {
        checkPage(30);

        // Section heading
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(6, 182, 212);
        doc.text(section.heading, 12, y);
        y += 4;
        doc.setDrawColor(6, 182, 212);
        doc.setLineWidth(0.4);
        doc.line(12, y, 198, y);
        y += 7;

        // Optional table rows — value column wraps to fit page width
        if (section.rows && section.rows.length > 0) {
          section.rows.forEach(([label, value], ri) => {
            const valueLines = doc.splitTextToSize(String(value), 75);
            const rowHeight = Math.max(8, valueLines.length * 5 + 3);
            checkPage(rowHeight + 2);
            // alternating row bg
            if (ri % 2 === 0) {
              doc.setFillColor(241, 245, 249);
              doc.rect(12, y - 5, 186, rowHeight, 'F');
            }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(30, 41, 59);
            doc.text(String(label), 15, y);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(6, 182, 212);
            doc.text(valueLines, 120, y);
            y += rowHeight + 1;
          });
          y += 4;
        }

        // Body text
        if (section.body) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          const lines = doc.splitTextToSize(section.body, 184);
          lines.forEach(line => {
            checkPage(7);
            doc.text(line, 12, y);
            y += 6;
          });
          y += 5;
        }
      });

      // ── Footer on every page ──
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 282, 210, 15, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('THREE-PILLAR SECURITY SYSTEM — CONFIDENTIAL', 12, 289);
        doc.text(`Page ${i} of ${pageCount}  |  ${dateStr}`, 155, 289);
      }

      const blob = doc.output('blob');
      downloadBlob(blob, filename.replace('{date}', dateStr));
      toast.success('Report downloaded!');
    } catch (err) {
      toast.error('Failed to generate PDF: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={generate} disabled={loading} className={`bg-cyan-600 hover:bg-cyan-700 text-white ${className}`}>
      {loading
        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
        : <><Printer className="w-4 h-4 mr-2" />Print / Download PDF</>}
    </Button>
  );
}