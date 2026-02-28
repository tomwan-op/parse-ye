import { Component, input, output, inject, ElementRef, viewChildren, effect } from '@angular/core';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-thumbnails-sidebar',
  standalone: true,
  template: `
    <aside class="w-48 bg-slate-900/80 border-r border-slate-800 flex flex-col overflow-hidden shrink-0
                  max-lg:fixed max-lg:inset-y-14 max-lg:left-0 max-lg:z-40 max-lg:w-56 max-lg:shadow-2xl max-lg:shadow-black/50">
      <!-- Header -->
      <div class="p-3 border-b border-slate-800 flex items-center justify-between">
        <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Pages
          @if (thumbnails().length > 0) {
            <span class="ml-1 text-indigo-400 normal-case">({{ thumbnails().length }})</span>
          }
        </h3>
        @if (thumbnails().length > 0) {
          <button
            class="btn btn-ghost btn-xs text-slate-500 hover:text-red-400"
            (click)="clearAllClicked.emit()"
            title="Clear all pages"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        }
      </div>

      <!-- Thumbnails list -->
      <div class="flex-1 overflow-y-auto p-2 space-y-2">
        @for (thumb of thumbnails(); track thumb.pageNumber) {
          <button
            class="w-full rounded-lg overflow-hidden border-2 transition-all duration-200 hover:border-indigo-500/50"
            [class]="thumb.pageNumber === activePage()
              ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'
              : 'border-slate-700'"
            (click)="pageSelected.emit(thumb.pageNumber)"
          >
            <div class="aspect-[3/4] bg-slate-800 flex items-center justify-center overflow-hidden">
              <canvas #thumbCanvas class="max-w-full max-h-full object-contain"></canvas>
            </div>
            <div class="bg-slate-800/50 px-2 py-1 flex items-center justify-center">
              <span
                class="text-[10px] font-medium"
                [class]="thumb.pageNumber === activePage() ? 'text-indigo-400' : 'text-slate-400'"
              >Page {{ thumb.pageNumber }}</span>
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
  clearAllClicked = output<void>();

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
