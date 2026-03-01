import { Injectable, signal } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source relative to the document base URI so it works
// both on localhost and when deployed to a sub-path (e.g. GitHub Pages).
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'assets/pdf.worker.min.mjs',
  document.baseURI,
).href;

export interface PageData {
  pageNumber: number;
  width: number;
  height: number;
}

@Injectable({ providedIn: 'root' })
export class PdfService {
  readonly pages = signal<PageData[]>([]);
  readonly totalPages = signal(0);
  readonly currentFile = signal<File | null>(null);
  readonly isLoading = signal(false);

  private pdfDocument: pdfjsLib.PDFDocumentProxy | null = null;
  private imageDataUrl: string | null = null;

  async loadFile(file: File): Promise<void> {
    this.isLoading.set(true);
    this.reset();
    this.currentFile.set(file);

    try {
      // Some mobile browsers return an empty file.type; fall back to extension.
      const mimeType = file.type || this.getMimeTypeFromExtension(file.name);
      if (mimeType === 'application/pdf') {
        await this.loadPdf(file);
      } else if (mimeType.startsWith('image/')) {
        await this.loadImage(file);
      } else {
        throw new Error(`Unsupported file type: ${file.name}`);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  private getMimeTypeFromExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    const map: Record<string, string> = {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
    };
    return map[ext] ?? 'application/octet-stream';
  }

  private async loadPdf(file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    this.pdfDocument = pdf;
    this.totalPages.set(pdf.numPages);

    const pageDataList: PageData[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      pageDataList.push({
        pageNumber: i,
        width: viewport.width,
        height: viewport.height,
      });
    }
    this.pages.set(pageDataList);
  }

  private async loadImage(file: File): Promise<void> {
    const url = URL.createObjectURL(file);
    this.imageDataUrl = url;

    const img = await this.loadImageElement(url);
    this.totalPages.set(1);
    this.pages.set([{
      pageNumber: 1,
      width: img.naturalWidth,
      height: img.naturalHeight,
    }]);
  }

  async renderPage(pageNumber: number, canvas: HTMLCanvasElement, scale: number = 1.5): Promise<void> {
    if (this.pdfDocument) {
      await this.renderPdfPage(pageNumber, canvas, scale);
    } else if (this.imageDataUrl) {
      await this.renderImageToCanvas(canvas, scale);
    }
  }

  private async renderPdfPage(pageNumber: number, canvas: HTMLCanvasElement, scale: number): Promise<void> {
    if (!this.pdfDocument) return;
    const page = await this.pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvas,
      viewport,
    }).promise;
  }

  private async renderImageToCanvas(canvas: HTMLCanvasElement, scale: number): Promise<void> {
    if (!this.imageDataUrl) return;
    const img = await this.loadImageElement(this.imageDataUrl);

    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  async renderThumbnail(pageNumber: number, canvas: HTMLCanvasElement): Promise<void> {
    await this.renderPage(pageNumber, canvas, 0.3);
  }

  async getPageCanvas(pageNumber: number, scale: number = 1.5): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    await this.renderPage(pageNumber, canvas, scale);
    return canvas;
  }

  reset(): void {
    if (this.pdfDocument) {
      this.pdfDocument.destroy();
      this.pdfDocument = null;
    }
    if (this.imageDataUrl) {
      URL.revokeObjectURL(this.imageDataUrl);
      this.imageDataUrl = null;
    }
    this.pages.set([]);
    this.totalPages.set(0);
    this.currentFile.set(null);
  }

  private loadImageElement(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
}
