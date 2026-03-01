import { Injectable } from '@angular/core';
import { DocumentStructure, HkbrData } from '../models/document.models';

@Injectable({ providedIn: 'root' })
export class HkbrParserService {
  parse(structure: DocumentStructure): HkbrData {
    const lines: string[] = [];
    for (const page of structure.pages) {
      for (const el of page.elements) {
        lines.push(el.text.trim());
      }
    }
    const fullText = lines.join('\n');

    const brNumber = this.extractBrNumber(lines);
    const companyName = this.extractCompanyName(lines, fullText);
    const issueDate = this.extractDate(lines, fullText, /issu/i);
    const expiryDate = this.extractDate(lines, fullText, /expir|valid\s+until|validity/i);

    return {
      brNumber,
      companyName,
      issueDate,
      expiryDate,
      validationScore: 0,
      issues: [],
    };
  }

  private extractBrNumber(lines: string[]): string {
    for (const line of lines) {
      const match = line.match(/\b(\d{8})\b/);
      if (match) return match[1];
    }
    return '';
  }

  private extractCompanyName(lines: string[], fullText: string): string {
    const labelMatch = fullText.match(
      /(?:business\s+name|company\s+name|name\s+of\s+(?:business|company))[:\s]*\n?([^\n]+)/i
    );
    if (labelMatch) return labelMatch[1].trim();

    for (const line of lines) {
      const clean = line.trim();
      if (
        clean.length > 3 &&
        clean.length < 100 &&
        clean === clean.toUpperCase() &&
        /[A-Z]/.test(clean) &&
        !/^\d+$/.test(clean)
      ) {
        return clean;
      }
    }
    return '';
  }

  private extractDate(lines: string[], fullText: string, labelPattern: RegExp): string {
    const datePattern =
      /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/;

    for (let i = 0; i < lines.length; i++) {
      if (labelPattern.test(lines[i])) {
        for (let j = i; j < Math.min(i + 3, lines.length); j++) {
          const match = lines[j].match(datePattern);
          if (match) return match[1];
        }
      }
    }

    const labelIndex = fullText.search(labelPattern);
    if (labelIndex >= 0) {
      const context = fullText.substring(labelIndex, labelIndex + 120);
      const match = context.match(datePattern);
      if (match) return match[1];
    }

    return '';
  }
}
