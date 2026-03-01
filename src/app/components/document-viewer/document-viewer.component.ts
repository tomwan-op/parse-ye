import { Component, inject, input, effect, viewChild, ElementRef, signal } from '@angular/core';
import { UiService, FitMode } from '../../services/ui.service';
import { PdfService } from '../../services/pdf.service';
import { DocumentStructure, DocumentElement } from '../../models/document.models';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  template: `
    <div class="flex-1 flex flex-col overflow-hidden bg-slate-950 relative">
      <!-- Canvas area -->
      <div class="flex-1 overflow-auto flex items-center justify-center p-4">
        <div
          class="relative rounded-lg shadow-2xl shadow-black/50"
          [style.transform]="ui.fitMode() === 'original' ? 'scale(' + ui.currentZoom() + ')' : undefined"
          [style.max-width]="ui.fitMode() === 'fit-width' ? '100%' : undefined"
          [style.max-height]="ui.fitMode() === 'fit-height' ? '100%' : undefined"
          style="transform-origin: center center; transition: transform 0.2s ease;"
        >
          <canvas
            #documentCanvas
            class="block rounded-lg"
            [style.max-width]="ui.fitMode() === 'fit-width' ? '100%' : undefined"
            [style.max-height]="ui.fitMode() === 'fit-height' ? '100%' : undefined"
            [style.height]="ui.fitMode() === 'fit-height' ? 'auto' : undefined"
            [style.width]="ui.fitMode() === 'fit-width' ? 'auto' : undefined"
            [class.object-contain]="ui.fitMode() !== 'original'"
          ></canvas>
          @if (overlaysVisible()) {
            <canvas
              #overlayCanvas
              class="absolute top-0 left-0 pointer-events-none rounded-lg"
              [style.max-width]="ui.fitMode() === 'fit-width' ? '100%' : undefined"
              [style.max-height]="ui.fitMode() === 'fit-height' ? '100%' : undefined"
              [style.height]="ui.fitMode() === 'fit-height' ? 'auto' : undefined"
              [style.width]="ui.fitMode() === 'fit-width' ? 'auto' : undefined"
              [class.object-contain]="ui.fitMode() !== 'original'"
            ></canvas>
          }
        </div>
      </div>

      <!-- Floating controls -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl px-3 py-1.5 shadow-xl z-10">
        <!-- Fit mode buttons -->
        <button
          class="btn btn-ghost btn-xs px-2"
          [class]="ui.fitMode() === 'fit-width' ? 'text-indigo-400' : 'text-slate-400 hover:text-indigo-400'"
          (click)="ui.setFitMode('fit-width')"
          title="Fit to width"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        </button>
        <button
          class="btn btn-ghost btn-xs px-2"
          [class]="ui.fitMode() === 'fit-height' ? 'text-indigo-400' : 'text-slate-400 hover:text-indigo-400'"
          (click)="ui.setFitMode('fit-height')"
          title="Fit to height"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5M16.5 20.25H18A2.25 2.25 0 0020.25 18v-1.5M7.5 20.25H6A2.25 2.25 0 013.75 18v-1.5" />
          </svg>
        </button>

        <div class="w-px h-5 bg-slate-700 mx-1"></div>

        <!-- Zoom controls -->
        <button class="btn btn-ghost btn-xs text-slate-400 hover:text-indigo-400 px-2" (click)="ui.zoomOut()" title="Zoom out">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
          </svg>
        </button>
        <span class="text-[11px] text-slate-300 w-10 text-center font-mono select-none">{{ zoomPercent() }}%</span>
        <button class="btn btn-ghost btn-xs text-slate-400 hover:text-indigo-400 px-2" (click)="ui.zoomIn()" title="Zoom in">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m-7-7h14" />
          </svg>
        </button>
        <button
          class="btn btn-ghost btn-xs text-slate-400 hover:text-indigo-400 px-2"
          [class]="ui.fitMode() === 'original' && ui.currentZoom() === 1 ? 'text-indigo-400' : 'text-slate-400 hover:text-indigo-400'"
          (click)="ui.resetZoom()"
          title="Reset zoom / Fit to width"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
          </svg>
        </button>

        <div class="w-px h-5 bg-slate-700 mx-1"></div>

        <!-- Overlays toggle -->
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" class="toggle toggle-xs toggle-primary" [checked]="overlaysVisible()" (change)="toggleOverlays()" />
          <span class="text-[11px] text-slate-400">Overlays</span>
        </label>

        <div class="w-px h-5 bg-slate-700 mx-1"></div>

        <!-- Page counter -->
        <div class="text-[11px] text-slate-500 whitespace-nowrap">
          {{ activePage() }} / {{ pdfService.totalPages() }}
        </div>
      </div>
    </div>
  `,
})
export class DocumentViewerComponent {
  private static readonly RENDER_SCALE = 1.5;
  // Cap rendered canvas side length to keep large-image viewing stable in browser memory.
  private static readonly MAX_RENDER_DIMENSION = 2200;

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
        this.pdfService.renderPage(page, canvas.nativeElement, this.getRenderScale(page));
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

    const pageData = this.pdfService.pages().find((p) => p.pageNumber === pageNumber);
    const computedScale = pageData && pageData.width > 0 && doc.width > 0
      ? doc.width / pageData.width
      : DocumentViewerComponent.RENDER_SCALE;
    const scale = Number.isFinite(computedScale) && computedScale > 0
      ? computedScale
      : DocumentViewerComponent.RENDER_SCALE;

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

  private getRenderScale(pageNumber: number): number {
    const pageData = this.pdfService.pages().find((p) => p.pageNumber === pageNumber);
    if (!pageData) {
      return DocumentViewerComponent.RENDER_SCALE;
    }
    const maxSide = Math.max(pageData.width, pageData.height);
    if (maxSide === 0) {
      return DocumentViewerComponent.RENDER_SCALE;
    }
    return Math.min(
      DocumentViewerComponent.RENDER_SCALE,
      DocumentViewerComponent.MAX_RENDER_DIMENSION / maxSide,
    );
  }
}
