import { Component, inject, input, computed } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { UiService } from '../../services/ui.service';
import { ExportService } from '../../services/export.service';
import { DocumentStructure, ResultTab } from '../../models/document.models';

@Component({
  selector: 'app-results-panel',
  standalone: true,
  imports: [SlicePipe],
  template: `
    <aside class="w-80 bg-slate-900/60 border-l border-slate-800 flex flex-col overflow-hidden shrink-0
                  max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:w-full max-lg:h-[60vh] max-lg:z-40 max-lg:rounded-t-2xl max-lg:shadow-2xl max-lg:shadow-black/50 max-lg:border-t max-lg:border-slate-700">
      <!-- Header with close -->
      <div class="flex items-center justify-between p-3 border-b border-slate-800">
        <h3 class="text-sm font-semibold text-slate-200">Results</h3>
        <button
          class="btn btn-ghost btn-xs text-slate-400 hover:text-slate-200"
          (click)="ui.toggleResultsPanel()"
          title="Close panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
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
        @if (!documentStructure()) {
          <div class="text-center py-12">
            <div class="w-12 h-12 mx-auto rounded-xl bg-indigo-600/10 flex items-center justify-center mb-3 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            </div>
            <p class="text-sm text-slate-400 mb-1">Waiting for results</p>
            <p class="text-xs text-slate-500">Process a document to see analysis here</p>
          </div>
        } @else {
          @switch (ui.activeResultTab()) {
            @case ('overlay') {
              <div class="space-y-3">
                <p class="text-xs text-slate-400 mb-3">Toggle overlays in the viewer controls</p>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded bg-indigo-500/50 border border-indigo-500"></div>
                    <span class="text-xs text-slate-300">Title</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500"></div>
                    <span class="text-xs text-slate-300">Paragraph</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded bg-amber-500/30 border border-amber-500"></div>
                    <span class="text-xs text-slate-300">List</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded bg-red-500/30 border border-red-500"></div>
                    <span class="text-xs text-slate-300">Figure</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded bg-violet-500/30 border border-violet-500 border-dashed"></div>
                    <span class="text-xs text-slate-300">Table</span>
                  </div>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-800">
                  <p class="text-xs text-slate-500">
                    {{ documentStructure()!.metadata.totalPages }} page(s) &middot;
                    {{ totalElements() }} elements &middot;
                    {{ totalTables() }} table(s) &middot;
                    {{ documentStructure()!.metadata.processingTimeMs }}ms
                  </p>
                </div>
              </div>
            }
            @case ('tree') {
              <div class="space-y-1">
                @for (page of documentStructure()!.pages; track page.pageNumber) {
                  <div class="mb-4">
                    @if (documentStructure()!.pages.length > 1) {
                      <div class="text-xs font-semibold text-slate-300 mb-2 px-1">Page {{ page.pageNumber }}</div>
                    }
                    @for (el of page.elements; track $index) {
                      <div class="flex items-start gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                        <span class="shrink-0 mt-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded"
                          [class]="getTypeClass(el.type)"
                        >{{ el.type }}</span>
                        <span class="text-xs text-slate-300 leading-relaxed">{{ el.text | slice:0:120 }}{{ el.text.length > 120 ? '...' : '' }}</span>
                      </div>
                    }
                  </div>
                }
              </div>
            }
            @case ('tables') {
              @if (totalTables() === 0) {
                <div class="text-center py-8">
                  <p class="text-sm text-slate-400">No tables detected</p>
                </div>
              } @else {
                @for (page of documentStructure()!.pages; track page.pageNumber) {
                  @for (table of page.tables; track $index) {
                    <div class="mb-4">
                      <div class="text-xs text-slate-400 mb-2">Table (Page {{ page.pageNumber }})</div>
                      <div class="overflow-x-auto rounded-lg border border-slate-700">
                        <table class="table table-xs w-full">
                          <tbody>
                            @for (row of table.rows; track $index) {
                              <tr class="border-b border-slate-700/50">
                                @for (cell of row; track $index) {
                                  <td class="text-slate-300 text-xs px-2 py-1.5">{{ cell }}</td>
                                }
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  }
                }
              }
            }
            @case ('markdown') {
              <div class="prose prose-sm prose-invert max-w-none">
                <pre class="text-xs text-slate-300 whitespace-pre-wrap bg-slate-800/50 rounded-lg p-3 leading-relaxed">{{ markdownOutput() }}</pre>
              </div>
            }
            @case ('json') {
              <pre class="text-[10px] text-emerald-400 font-mono whitespace-pre-wrap bg-slate-800/50 rounded-lg p-3 leading-relaxed overflow-x-auto">{{ jsonOutput() }}</pre>
            }
          }
        }
      </div>
    </aside>
  `,
})
export class ResultsPanelComponent {
  ui = inject(UiService);
  exportService = inject(ExportService);

  documentStructure = input<DocumentStructure | null>(null);

  readonly tabs: { id: ResultTab; label: string }[] = [
    { id: 'overlay', label: 'Overlay' },
    { id: 'tree', label: 'Structure' },
    { id: 'tables', label: 'Tables' },
    { id: 'markdown', label: 'Markdown' },
    { id: 'json', label: 'JSON' },
  ];

  totalElements = computed(() => {
    const s = this.documentStructure();
    if (!s) return 0;
    return s.pages.reduce((sum, p) => sum + p.elements.length, 0);
  });

  totalTables = computed(() => {
    const s = this.documentStructure();
    if (!s) return 0;
    return s.pages.reduce((sum, p) => sum + p.tables.length, 0);
  });

  markdownOutput = computed(() => {
    const s = this.documentStructure();
    if (!s) return '';
    return this.exportService.structureToMarkdown(s);
  });

  jsonOutput = computed(() => {
    const s = this.documentStructure();
    if (!s) return '';
    return JSON.stringify(s, null, 2);
  });

  getTypeClass(type: string): string {
    const classes: Record<string, string> = {
      title: 'bg-indigo-500/20 text-indigo-400',
      paragraph: 'bg-emerald-500/20 text-emerald-400',
      list: 'bg-amber-500/20 text-amber-400',
      figure: 'bg-red-500/20 text-red-400',
      other: 'bg-slate-500/20 text-slate-400',
    };
    return classes[type] ?? classes['other'];
  }
}
