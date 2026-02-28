import { Injectable } from '@angular/core';
import { DocumentElement, Table, Page, BBox } from '../models/document.models';
import { OcrLine } from './ocr.service';

@Injectable({ providedIn: 'root' })
export class StructureService {

  processPage(pageNumber: number, lines: OcrLine[], pageWidth: number, pageHeight: number): Page {
    const nonTableLines: OcrLine[] = [];

    // Separate potential table lines from regular text
    const tableGroups = this.detectTableGroups(lines);
    const tableLinesSet = new Set(tableGroups.flat());

    for (const line of lines) {
      if (!tableLinesSet.has(line)) {
        nonTableLines.push(line);
      }
    }

    // Sort non-table lines by reading order (top to bottom, left to right)
    const sorted = [...nonTableLines].sort((a, b) => {
      const aTop = this.getBoxTop(a.box);
      const bTop = this.getBoxTop(b.box);
      if (Math.abs(aTop - bTop) > 10) return aTop - bTop;
      return this.getBoxLeft(a.box) - this.getBoxLeft(b.box);
    });

    // Classify each line
    const elements: DocumentElement[] = [];
    for (const line of sorted) {
      const bbox = this.boxToBBox(line.box, pageWidth, pageHeight);
      const type = this.classifyElement(line, bbox, pageWidth, pageHeight);

      elements.push({
        type,
        text: line.text,
        bbox,
        confidence: line.confidence,
      });
    }

    // Group consecutive paragraphs
    const groupedElements = this.groupParagraphs(elements);

    // Build tables
    const tables: Table[] = tableGroups.map(group => this.buildTable(group, pageWidth, pageHeight));

    return {
      pageNumber,
      elements: groupedElements,
      tables,
    };
  }

  private classifyElement(
    line: OcrLine,
    bbox: BBox,
    pageWidth: number,
    pageHeight: number
  ): DocumentElement['type'] {
    const text = line.text.trim();

    // Title heuristics: short text, near top of page or ALL CAPS
    if (text.length < 80 && text.length > 0) {
      const widthRatio = bbox.width / pageWidth;
      if (widthRatio > 0.3 && text.length < 50 && bbox.y < pageHeight * 0.15) {
        return 'title';
      }
      if (text === text.toUpperCase() && text.length > 3 && text.length < 60) {
        return 'title';
      }
      if (/^(\d+\.?\s|chapter\s|section\s)/i.test(text) && text.length < 80) {
        return 'title';
      }
    }

    // List heuristics: starts with bullet, dash, number+dot
    if (/^[\u2022\u2023\u25E6\u2043\u2219•●○◦▪▸►‣–—-]\s/.test(text)) {
      return 'list';
    }
    if (/^\d+[.)]\s/.test(text) && text.length < 200) {
      return 'list';
    }
    if (/^[a-zA-Z][.)]\s/.test(text)) {
      return 'list';
    }

    return 'paragraph';
  }

  private detectTableGroups(lines: OcrLine[]): OcrLine[][] {
    if (lines.length < 4) return [];

    const groups: OcrLine[][] = [];
    const rows = this.groupByRows(lines, 8);

    // A table needs at least 2 rows with 2+ cells each
    const multiCellRows = rows.filter(row => row.length >= 2);
    if (multiCellRows.length < 2) return [];

    if (this.hasConsistentColumns(multiCellRows)) {
      groups.push(multiCellRows.flat());
    }

    return groups;
  }

  private groupByRows(lines: OcrLine[], tolerance: number): OcrLine[][] {
    const sorted = [...lines].sort((a, b) => this.getBoxTop(a.box) - this.getBoxTop(b.box));
    const rows: OcrLine[][] = [];
    let currentRow: OcrLine[] = [];
    let currentTop = -Infinity;

    for (const line of sorted) {
      const top = this.getBoxTop(line.box);
      if (top - currentTop > tolerance && currentRow.length > 0) {
        rows.push(currentRow);
        currentRow = [];
      }
      currentRow.push(line);
      currentTop = top;
    }
    if (currentRow.length > 0) rows.push(currentRow);

    return rows;
  }

  private hasConsistentColumns(rows: OcrLine[][]): boolean {
    if (rows.length < 2) return false;
    const firstRowLefts = rows[0].map(l => this.getBoxLeft(l.box)).sort((a, b) => a - b);

    let matchCount = 0;
    for (let i = 1; i < rows.length; i++) {
      const rowLefts = rows[i].map(l => this.getBoxLeft(l.box)).sort((a, b) => a - b);
      let matched = 0;
      for (const left of rowLefts) {
        if (firstRowLefts.some(fl => Math.abs(fl - left) < 20)) {
          matched++;
        }
      }
      if (matched >= 2) matchCount++;
    }

    return matchCount >= Math.floor(rows.length / 2);
  }

  private buildTable(lines: OcrLine[], pageWidth: number, pageHeight: number): Table {
    const rows = this.groupByRows(lines, 8);
    const tableRows = rows.map(row => {
      const sorted = [...row].sort((a, b) => this.getBoxLeft(a.box) - this.getBoxLeft(b.box));
      return sorted.map(l => l.text);
    });

    let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
    for (const line of lines) {
      const b = this.boxToBBox(line.box, pageWidth, pageHeight);
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width);
      maxY = Math.max(maxY, b.y + b.height);
    }

    return {
      bbox: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
      rows: tableRows,
    };
  }

  private groupParagraphs(elements: DocumentElement[]): DocumentElement[] {
    if (elements.length === 0) return [];

    const result: DocumentElement[] = [];
    let current: DocumentElement | null = null;

    for (const el of elements) {
      if (el.type === 'paragraph' && current != null && current.type === 'paragraph') {
        const gap = el.bbox.y - (current.bbox.y + current.bbox.height);
        if (gap < 15 && Math.abs(el.bbox.x - current.bbox.x) < 20) {
          current = {
            ...current as DocumentElement,
            text: current.text + ' ' + el.text,
            bbox: {
              x: Math.min(current.bbox.x, el.bbox.x),
              y: current.bbox.y,
              width: Math.max(current.bbox.width, el.bbox.width),
              height: (el.bbox.y + el.bbox.height) - current.bbox.y,
            },
            confidence: (current.confidence + el.confidence) / 2,
          };
          continue;
        }
      }
      if (current) result.push(current);
      current = { ...el };
    }
    if (current) result.push(current);

    return result;
  }

  private boxToBBox(box: number[][], pageWidth: number, _pageHeight: number): BBox {
    if (!box || box.length === 0) {
      return { x: 0, y: 0, width: pageWidth, height: 20 };
    }

    const xs = box.map(p => p[0]);
    const ys = box.map(p => p[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  private getBoxTop(box: number[][]): number {
    if (!box || box.length === 0) return 0;
    return Math.min(...box.map(p => p[1]));
  }

  private getBoxLeft(box: number[][]): number {
    if (!box || box.length === 0) return 0;
    return Math.min(...box.map(p => p[0]));
  }
}
