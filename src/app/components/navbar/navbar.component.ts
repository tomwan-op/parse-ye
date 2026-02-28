import { Component, inject, output, input } from '@angular/core';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `
    <nav class="h-14 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between px-4 backdrop-blur-sm shrink-0 z-30">
      <!-- Left: Logo + sidebar toggle -->
      <div class="flex items-center gap-3">
        <button
          class="btn btn-ghost btn-sm text-slate-400 hover:text-indigo-400 lg:flex hidden"
          (click)="ui.toggleSidebar()"
          title="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <!-- Mobile hamburger toggle for sidebar -->
        <button
          class="btn btn-ghost btn-sm text-slate-400 hover:text-indigo-400 lg:hidden flex"
          (click)="ui.toggleSidebar()"
          title="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <button class="flex items-center gap-2 hover:opacity-80 transition-opacity" (click)="clearClicked.emit()" title="Reset to empty state">
          <div class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span class="text-white text-xs font-bold">P</span>
          </div>
          <span class="text-base font-semibold text-slate-100 tracking-tight hidden sm:inline">ParseYe</span>
        </button>
      </div>

      <!-- Center: Upload + New + Process -->
      <div class="flex items-center gap-2">
        <button class="btn btn-sm bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600 hover:text-slate-100 gap-2" (click)="uploadClicked.emit()">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          <span class="hidden sm:inline">Upload</span>
        </button>
        @if (hasDocument()) {
          <button
            class="btn btn-sm btn-ghost text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            (click)="clearClicked.emit()"
            title="Clear document"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            <span class="hidden sm:inline">New</span>
          </button>
        }
        <div class="relative group">
          <button
            class="btn btn-sm btn-primary gap-2 hover:bg-indigo-500 hover:border-indigo-500"
            [disabled]="!hasDocument() || isProcessing()"
            (click)="processClicked.emit()"
            [title]="!hasDocument() ? 'Upload a document first' : isProcessing() ? 'Processing...' : 'Process document'"
          >
            @if (isProcessing()) {
              <span class="loading loading-spinner loading-xs"></span>
              <span class="hidden sm:inline">Processing...</span>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              <span class="hidden sm:inline">Process</span>
            }
          </button>
          @if (!hasDocument() && !isProcessing()) {
            <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-slate-400 text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Upload a document first
            </div>
          }
        </div>
      </div>

      <!-- Right: Export + Settings + Results toggle -->
      <div class="flex items-center gap-1">
        <div class="dropdown dropdown-end">
          <button
            tabindex="0"
            class="btn btn-ghost btn-sm text-slate-400 hover:text-emerald-400 gap-1"
            [class.btn-disabled]="!hasResults()"
            [title]="!hasResults() ? 'Process a document first' : 'Export results'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span class="hidden sm:inline">Export</span>
          </button>
          @if (hasResults()) {
            <ul tabindex="0" class="dropdown-content menu bg-slate-800 border border-slate-700 rounded-xl p-2 w-48 shadow-xl mt-2 z-50">
              <li><a class="text-slate-300 hover:bg-slate-700 rounded-lg text-sm" (click)="exportClicked.emit('json')">JSON</a></li>
              <li><a class="text-slate-300 hover:bg-slate-700 rounded-lg text-sm" (click)="exportClicked.emit('markdown')">Markdown</a></li>
              <li><a class="text-slate-300 hover:bg-slate-700 rounded-lg text-sm" (click)="exportClicked.emit('text')">Plain Text</a></li>
              <li><a class="text-slate-300 hover:bg-slate-700 rounded-lg text-sm" (click)="exportClicked.emit('pdf')">Searchable PDF</a></li>
            </ul>
          }
        </div>

        <button
          class="btn btn-ghost btn-sm text-slate-400 hover:text-indigo-400 hidden sm:flex"
          (click)="ui.toggleSettings()"
          title="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </button>

        <button
          class="btn btn-ghost btn-sm text-slate-400 hover:text-indigo-400"
          (click)="ui.toggleResultsPanel()"
          title="Toggle results panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
          </svg>
        </button>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  ui = inject(UiService);
  uploadClicked = output<void>();
  processClicked = output<void>();
  exportClicked = output<string>();
  clearClicked = output<void>();
  hasDocument = input(false);
  isProcessing = input(false);
  hasResults = input(false);
}
