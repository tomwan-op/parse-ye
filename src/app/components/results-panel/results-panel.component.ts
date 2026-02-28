import { Component, inject } from '@angular/core';
import { UiService } from '../../services/ui.service';
import { ResultTab } from '../../models/document.models';

@Component({
  selector: 'app-results-panel',
  standalone: true,
  template: `
    <aside class="w-80 bg-slate-900/60 border-l border-slate-800 flex flex-col overflow-hidden shrink-0">
      <!-- Header with close -->
      <div class="flex items-center justify-between p-3 border-b border-slate-800">
        <h3 class="text-sm font-semibold text-slate-200">Results</h3>
        <button
          class="btn btn-ghost btn-xs text-slate-400 hover:text-slate-200"
          (click)="ui.toggleResultsPanel()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-slate-800 overflow-x-auto">
        @for (tab of tabs; track tab.id) {
          <button
            class="flex-1 px-2 py-2.5 text-[11px] font-medium whitespace-nowrap transition-colors"
            [class]="ui.activeResultTab() === tab.id ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
            (click)="ui.setActiveTab(tab.id)"
          >
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Tab content -->
      <div class="flex-1 overflow-y-auto p-4">
        @switch (ui.activeResultTab()) {
          @case ('overlay') {
            <div class="text-center py-12">
              <div class="w-12 h-12 mx-auto rounded-xl bg-indigo-600/10 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
              </div>
              <p class="text-sm text-slate-400">Process a document to see visual overlays</p>
            </div>
          }
          @case ('tree') {
            <div class="text-center py-12">
              <p class="text-sm text-slate-400">Hierarchical tree view will appear here</p>
            </div>
          }
          @case ('tables') {
            <div class="text-center py-12">
              <p class="text-sm text-slate-400">Detected tables will appear here</p>
            </div>
          }
          @case ('markdown') {
            <div class="text-center py-12">
              <p class="text-sm text-slate-400">Markdown preview will appear here</p>
            </div>
          }
          @case ('json') {
            <div class="text-center py-12">
              <p class="text-sm text-slate-400">Raw JSON output will appear here</p>
            </div>
          }
        }
      </div>
    </aside>
  `,
})
export class ResultsPanelComponent {
  ui = inject(UiService);

  readonly tabs: { id: ResultTab; label: string }[] = [
    { id: 'overlay', label: 'Overlay' },
    { id: 'tree', label: 'Tree' },
    { id: 'tables', label: 'Tables' },
    { id: 'markdown', label: 'Markdown' },
    { id: 'json', label: 'JSON' },
  ];
}
