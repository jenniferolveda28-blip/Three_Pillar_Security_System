import jsPDF from 'jspdf';

/**
 * Shared PDF export utility for bulk report generation.
 * Generates a branded, multi-section PDF with auto-pagination.
 */

const BRAND = {
  primary: [6, 182, 212],
  dark: [15, 23, 42],
  slate: [100, 116, 139],
  border: [51, 65, 85],
  white: [255, 255, 255],
  red: [239, 68, 68],
  green: [16, 185, 129],
  amber: [245, 158, 11],
};

function drawHeader(doc, title, subtitle) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 30, pageWidth, 2, 'F');
  doc.setTextColor(...BRAND.white);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Three-Pillar Security System', 14, 16);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...BRAND.primary);
  doc.text(title, 14, 25);
  if (subtitle) {
    doc.setTextColor(...BRAND.slate);
    doc.text(subtitle, 14, 42);
  }
  doc.setTextColor(...BRAND.slate);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 16, { align: 'right' });
}

function drawFooter(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageNum = doc.internal.getNumberOfPages();
  doc.setDrawColor(...BRAND.border);
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.slate);
  doc.text('Three-Pillar Security System · Confidential', 14, pageHeight - 6);
  doc.text(`Page ${pageNum}`, pageWidth - 14, pageHeight - 6, { align: 'right' });
}

function checkPageBreak(doc, y, needed = 20) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 20) {
    drawFooter(doc);
    doc.addPage();
    return 50;
  }
  return y;
}

function drawTable(doc, y, headers, rows, colWidths) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const startX = 14;
  const rowHeight = 7;

  // Header row
  doc.setFillColor(...BRAND.dark);
  doc.rect(startX, y, pageWidth - 28, rowHeight, 'F');
  doc.setTextColor(...BRAND.white);
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  let x = startX + 2;
  headers.forEach((h, i) => {
    doc.text(String(h), x, y + 5);
    x += colWidths[i];
  });

  y += rowHeight;
  doc.setFont(undefined, 'normal');

  // Data rows
  rows.forEach((row, rowIdx) => {
    y = checkPageBreak(doc, y, rowHeight);
    if (rowIdx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(startX, y, pageWidth - 28, rowHeight, 'F');
    }
    doc.setTextColor(...BRAND.dark);
    doc.setFontSize(7.5);
    x = startX + 2;
    row.forEach((cell, i) => {
      const text = String(cell ?? '—');
      const truncated = text.length > 40 ? text.slice(0, 37) + '…' : text;
      doc.text(truncated, x, y + 5, { maxWidth: colWidths[i] - 4 });
      x += colWidths[i];
    });
    y += rowHeight;
  });

  return y;
}

/**
 * Export a report as a PDF.
 * @param {string} title - Report title
 * @param {string} subtitle - Report subtitle
 * @param {Array<{sectionTitle: string, headers: string[], rows: Array<Array>, colWidths: Array<number>, summary?: Array<{label:string, value:string}>}>} sections
 * @param {string} filename - Output filename
 */
export function exportBulkPDF(title, subtitle, sections, filename) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  drawHeader(doc, title, subtitle);
  let y = subtitle ? 50 : 40;

  sections.forEach((section, sIdx) => {
    y = checkPageBreak(doc, y, 30);

    // Section title
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...BRAND.dark);
    doc.text(section.sectionTitle, 14, y);
    y += 4;

    doc.setDrawColor(...BRAND.primary);
    doc.setLineWidth(0.5);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;

    // Summary stats if provided
    if (section.summary && section.summary.length > 0) {
      const statWidth = (pageWidth - 28) / section.summary.length;
      section.summary.forEach((stat, i) => {
        const sx = 14 + i * statWidth;
        doc.setFillColor(...BRAND.dark);
        doc.roundedRect(sx + 2, y, statWidth - 4, 14, 2, 2, 'F');
        doc.setTextColor(...BRAND.slate);
        doc.setFontSize(7);
        doc.setFont(undefined, 'normal');
        doc.text(stat.label.toUpperCase(), sx + 5, y + 5);
        doc.setTextColor(...BRAND.white);
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.text(String(stat.value), sx + 5, y + 11);
      });
      y += 20;
    }

    // Table
    if (section.rows && section.rows.length > 0) {
      y = drawTable(doc, y, section.headers, section.rows, section.colWidths);
    } else if (section.rows) {
      doc.setTextColor(...BRAND.slate);
      doc.setFontSize(9);
      doc.setFont(undefined, 'italic');
      doc.text('No records found.', 14, y + 5);
      y += 12;
    }

    y += 10;
  });

  drawFooter(doc);
  doc.save(filename);
}