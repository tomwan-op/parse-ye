import { Component, inject } from '@angular/core';
import { UiService } from '../../services/ui.service';

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
        <div class="text-xs text-slate-500">
          Page 1 of 1
        </div>
      </div>

      <!-- Canvas area -->
      <div class="flex-1 overflow-auto flex items-center justify-center p-4">
        <div
          class="bg-white rounded-lg shadow-2xl shadow-black/50"
          [style.transform]="'scale(' + ui.currentZoom() + ')'"
          style="transform-origin: center center; transition: transform 0.2s ease;"
        >
          <canvas #documentCanvas width="612" height="792" class="block"></canvas>
        </div>
      </div>
    </div>
  `,
})
export class DocumentViewerComponent {
  ui = inject(UiService);

  zoomPercent() {
    return Math.round(this.ui.currentZoom() * 100);
  }
}
