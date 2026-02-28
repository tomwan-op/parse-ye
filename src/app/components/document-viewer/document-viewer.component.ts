import { Component, inject, input, effect, viewChild, ElementRef, signal } from '@angular/core';
import { UiService } from '../../services/ui.service';
import { PdfService } from '../../services/pdf.service';
import { DocumentStructure, DocumentElement } from '../../models/document.models';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  template: `
    <div class="flex-1 flex flex-col overflow-hidden bg-slate-950">
      <!-- Toolbar -->
      <div class="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400">Zoom</span>
          <button class="btn btn-ghost btn-xs text-slate-400 hover:text-indigo-400" (click)="ui.zoomOut()">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
            </svg>
          </button>
          <span class="text-xs text-slate-300 w-12 text-center font-mono">{{ zoomPercent() }}%</span>
          <button class="btn btn-ghost btn-xs text-slate-400 hover:text-indigo-400" (click)="ui.zoomIn()">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m-7-7h14" />
            </svg>
          </button>
          <button class="btn btn-ghost btn-xs text-slate-400 hover:text-indigo-400" (click)="ui.resetZoom()">
            Reset
          </button>
        </div>
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" class="toggle toggle-xs toggle-primary" [checked]="overlaysVisible()" (change)="toggleOverlays()" />
            <span class="text-xs text-slate-400">Overlays</span>
          </label>
          <div class="text-xs text-slate-500">
            Page {{ activePage() }} of {{ pdfService.totalPages() }}
          </div>
        </div>
      </div>

      <!-- Canvas area -->
      <div class="flex-1 overflow-auto flex items-center justify-center p-4">
        <div
          class="relative rounded-lg shadow-2xl shadow-black/50"
          [style.transform]="'scale(' + ui.currentZoom() + ')'"
          style="transform-origin: center center; transition: transform 0.2s ease;"
        >
          <canvas #documentCanvas class="block rounded-lg"></canvas>
          @if (overlaysVisible()) {
            <canvas #overlayCanvas class="absolute top-0 left-0 pointer-events-none rounded-lg"></canvas>
          }
        </div>
      </div>
    </div>
  `,
})
export class DocumentViewerComponent {
  ui = inject(UiService);
  pdfService = inject(PdfService);

  activePage = input(1);
  documentStructure = input<DocumentStructure | null>(null);

  readonly overlaysVisible = signal(true);

  private documentCanvas = viewChild<ElementRef<HTMLCanvasElement>>('documentCanvas');
  private overlayCanvas = viewChild<ElementRef<HTMLCanvasElement>>('overlayCanvas');

  constructor() {
    // Re-render when page changes
    effect(() => {
      const page = this.activePage();
      const canvas = this.documentCanvas();
      if (canvas) {
        this.pdfService.renderPage(page, canvas.nativeElement, 1.5);
      }
    });

    // Draw overlays when structure changes
    effect(() => {
      const structure = this.documentStructure();
      const page = this.activePage();
      const overlayRef = this.overlayCanvas();
      const docRef = this.documentCanvas();
      if (structure && overlayRef && docRef && this.overlaysVisible()) {
        this.drawOverlays(structure, page, overlayRef.nativeElement, docRef.nativeElement);
      }
    });
  }

  zoomPercent() {
    return Math.round(this.ui.currentZoom() * 100);
  }

  toggleOverlays(): void {
    this.overlaysVisible.update(v => !v);
  }

  private drawOverlays(structure: DocumentStructure, pageNumber: number, overlay: HTMLCanvasElement, doc: HTMLCanvasElement): void {
    overlay.width = doc.width;
    overlay.height = doc.height;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const page = structure.pages.find(p => p.pageNumber === pageNumber);
    if (!page) return;

    const colorMap: Record<DocumentElement['type'], string> = {
      title: 'rgba(99, 102, 241, 0.3)',
      paragraph: 'rgba(16, 185, 129, 0.2)',
      list: 'rgba(245, 158, 11, 0.2)',
      figure: 'rgba(239, 68, 68, 0.2)',
      other: 'rgba(148, 163, 184, 0.2)',
    };

    const borderMap: Record<DocumentElement['type'], string> = {
      title: 'rgba(99, 102, 241, 0.8)',
      paragraph: 'rgba(16, 185, 129, 0.6)',
      list: 'rgba(245, 158, 11, 0.6)',
      figure: 'rgba(239, 68, 68, 0.6)',
      other: 'rgba(148, 163, 184, 0.4)',
    };

    const scale = 1.5;

    for (const element of page.elements) {
      const { x, y, width, height } = element.bbox;
      ctx.fillStyle = colorMap[element.type];
      ctx.fillRect(x * scale, y * scale, width * scale, height * scale);
      ctx.strokeStyle = borderMap[element.type];
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x * scale, y * scale, width * scale, height * scale);

      ctx.fillStyle = borderMap[element.type];
      ctx.font = '10px system-ui';
      ctx.fillText(element.type, x * scale + 2, y * scale - 3);
    }

    for (const table of page.tables) {
      const { x, y, width, height } = table.bbox;
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x * scale, y * scale, width * scale, height * scale);
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
      ctx.font = '10px system-ui';
      ctx.fillText('table', x * scale + 2, y * scale - 3);
    }
  }
}
