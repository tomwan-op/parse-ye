import { Injectable, inject } from '@angular/core';
import { DocumentStructure } from '../models/document.models';
import { PdfService } from './pdf.service';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private pdfService = inject(PdfService);

  async exportJson(structure: DocumentStructure, filename: string = 'parseye-output.json'): Promise<void> {
    const json = JSON.stringify(structure, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const { saveAs } = await import('file-saver');
    saveAs(blob, filename);
  }

  async exportMarkdown(structure: DocumentStructure, filename: string = 'parseye-output.md'): Promise<void> {
    const md = this.structureToMarkdown(structure);
    const blob = new Blob([md], { type: 'text/markdown' });
    const { saveAs } = await import('file-saver');
    saveAs(blob, filename);
  }

  async exportPlainText(structure: DocumentStructure, filename: string = 'parseye-output.txt'): Promise<void> {
    const text = this.structureToPlainText(structure);
    const blob = new Blob([text], { type: 'text/plain' });
    const { saveAs } = await import('file-saver');
    saveAs(blob, filename);
  }

  async exportSearchablePdf(structure: DocumentStructure, filename: string = 'parseye-searchable.pdf'): Promise<void> {
    const { jsPDF } = await import('jspdf');

    const firstPage = this.pdfService.pages()[0];
    if (!firstPage) return;

    const doc = new jsPDF({
      unit: 'pt',
      format: [firstPage.width, firstPage.height],
    });

    for (let i = 0; i < structure.pages.length; i++) {
      const page = structure.pages[i];
      const pageData = this.pdfService.pages()[i];

      if (i > 0 && pageData) {
        doc.addPage([pageData.width, pageData.height]);
      }

      // Render the page image onto the PDF
      try {
        const canvas = await this.pdfService.getPageCanvas(page.pageNumber, 2);
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const w = pageData?.width ?? firstPage.width;
        const h = pageData?.height ?? firstPage.height;
        doc.addImage(imgData, 'JPEG', 0, 0, w, h);
      } catch {
        // Skip if rendering fails
      }

      // Add invisible text layer for searchability
      doc.setFont('helvetica');
      for (const element of page.elements) {
        const fontSize = element.type === 'title' ? 14 : 10;
        doc.setFontSize(fontSize);
        doc.setTextColor(255, 255, 255);
        doc.text(element.text, element.bbox.x, element.bbox.y + element.bbox.height);
      }
    }

    doc.save(filename);
  }

  structureToMarkdown(structure: DocumentStructure): string {
    const lines: string[] = [];

    for (const page of structure.pages) {
      if (structure.pages.length > 1) {
        lines.push(`\n---\n\n## Page ${page.pageNumber}\n`);
      }

      for (const element of page.elements) {
        switch (element.type) {
          case 'title':
            lines.push(`# ${element.text}\n`);
            break;
          case 'list':
            lines.push(`- ${element.text}`);
            break;
          case 'paragraph':
          default:
            lines.push(`${element.text}\n`);
            break;
        }
      }

      for (const table of page.tables) {
        lines.push('');
        if (table.rows.length > 0) {
          lines.push('| ' + table.rows[0].join(' | ') + ' |');
          lines.push('| ' + table.rows[0].map(() => '---').join(' | ') + ' |');
          for (let i = 1; i < table.rows.length; i++) {
            lines.push('| ' + table.rows[i].join(' | ') + ' |');
          }
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  structureToPlainText(structure: DocumentStructure): string {
    const lines: string[] = [];

    for (const page of structure.pages) {
      if (structure.pages.length > 1) {
        lines.push(`\n--- Page ${page.pageNumber} ---\n`);
      }

      for (const element of page.elements) {
        lines.push(element.text);
      }

      for (const table of page.tables) {
        lines.push('');
        for (const row of table.rows) {
          lines.push(row.join('\t'));
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }
}
