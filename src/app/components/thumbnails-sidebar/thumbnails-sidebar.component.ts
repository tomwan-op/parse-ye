import { Component, input, output, inject, ElementRef, viewChildren, effect } from '@angular/core';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-thumbnails-sidebar',
  standalone: true,
  template: `
    <aside class="w-48 bg-slate-900/80 border-r border-slate-800 flex flex-col overflow-hidden shrink-0">
      <!-- Header -->
      <div class="p-3 border-b border-slate-800">
        <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pages</h3>
      </div>

      <!-- Thumbnails list -->
      <div class="flex-1 overflow-y-auto p-2 space-y-2">
        @for (thumb of thumbnails(); track thumb.pageNumber) {
          <button
            class="w-full rounded-lg overflow-hidden border-2 transition-all duration-200 hover:border-indigo-500/50"
            [class]="thumb.pageNumber === activePage() ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-700'"
            (click)="pageSelected.emit(thumb.pageNumber)"
          >
            <div class="aspect-[3/4] bg-slate-800 flex items-center justify-center overflow-hidden">
              <canvas #thumbCanvas class="max-w-full max-h-full object-contain"></canvas>
            </div>
            <div class="bg-slate-800/50 px-2 py-1">
              <span class="text-[10px] text-slate-400">{{ thumb.pageNumber }}</span>
            </div>
          </button>
        } @empty {
          <div class="text-center py-8">
            <p class="text-xs text-slate-500">No pages loaded</p>
          </div>
        }
      </div>
    </aside>
  `,
})
export class ThumbnailsSidebarComponent {
  thumbnails = input<{ pageNumber: number }[]>([]);
  activePage = input(1);
  pageSelected = output<number>();

  private pdfService = inject(PdfService);
  private thumbCanvases = viewChildren<ElementRef<HTMLCanvasElement>>('thumbCanvas');

  constructor() {
    effect(() => {
      const canvases = this.thumbCanvases();
      const thumbs = this.thumbnails();
      if (canvases.length > 0 && thumbs.length > 0) {
        canvases.forEach((canvasRef, index) => {
          if (thumbs[index]) {
            this.pdfService.renderThumbnail(thumbs[index].pageNumber, canvasRef.nativeElement);
          }
        });
      }
    });
  }
}
