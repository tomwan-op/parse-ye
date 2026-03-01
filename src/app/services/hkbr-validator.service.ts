import { Injectable } from '@angular/core';
import { HkbrData } from '../models/document.models';

@Injectable({ providedIn: 'root' })
export class HkbrValidatorService {
  validate(data: HkbrData): HkbrData {
    const issues: string[] = [];
    let validFields = 0;

    if (!data.brNumber) {
      issues.push('BR Number missing');
    } else if (!/^\d{8}$/.test(data.brNumber)) {
      issues.push('BR Number invalid (must be 8 digits)');
    } else {
      validFields++;
    }

    if (!data.companyName || data.companyName.trim() === '') {
      issues.push('Company Name missing');
    } else {
      validFields++;
    }

    if (!data.issueDate) {
      issues.push('Issue Date missing');
    } else if (!this.isValidDate(data.issueDate)) {
      issues.push('Issue Date invalid');
    } else {
      validFields++;
    }

    if (!data.expiryDate) {
      issues.push('Expiry Date missing');
    } else if (!this.isValidDate(data.expiryDate)) {
      issues.push('Expiry Date invalid');
    } else {
      validFields++;
    }

    return {
      ...data,
      validationScore: Math.round((validFields / 4) * 100),
      issues,
    };
  }

  private isValidDate(dateStr: string): boolean {
    const dmyMatch = dateStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10);
      const year = parseInt(dmyMatch[3], 10);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year > 1900) {
        const d = new Date(year, month - 1, day);
        return d.getMonth() === month - 1 && d.getDate() === day;
      }
    }

    const ymdMatch = dateStr.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10);
      const day = parseInt(ymdMatch[3], 10);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year > 1900) {
        const d = new Date(year, month - 1, day);
        return d.getMonth() === month - 1 && d.getDate() === day;
      }
    }

    return false;
  }
}
