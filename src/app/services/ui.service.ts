import { Injectable, signal } from '@angular/core';
import { ProcessingProgress, ResultTab } from '../models/document.models';

export type FitMode = 'fit-width' | 'fit-height' | 'original';

@Injectable({ providedIn: 'root' })
export class UiService {
  readonly sidebarOpen = signal(false);
  readonly resultsPanelOpen = signal(false);
  readonly activeResultTab = signal<ResultTab>('overlay');
  readonly settingsOpen = signal(false);
  readonly currentZoom = signal(1);
  readonly fitMode = signal<FitMode>('fit-width');
  readonly progress = signal<ProcessingProgress>({
    status: 'idle',
    currentPage: 0,
    totalPages: 0,
    message: '',
    percent: 0,
  });

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  toggleResultsPanel(): void {
    this.resultsPanelOpen.update(v => !v);
  }

  setActiveTab(tab: ResultTab): void {
    this.activeResultTab.set(tab);
  }

  toggleSettings(): void {
    this.settingsOpen.update(v => !v);
  }

  setFitMode(mode: FitMode): void {
    this.fitMode.set(mode);
  }

  zoomIn(): void {
    this.fitMode.set('original');
    this.currentZoom.update(z => Math.min(z + 0.25, 5));
  }

  zoomOut(): void {
    this.fitMode.set('original');
    this.currentZoom.update(z => Math.max(z - 0.25, 0.25));
  }

  resetZoom(): void {
    this.currentZoom.set(1);
    this.fitMode.set('fit-width');
  }

  updateProgress(progress: Partial<ProcessingProgress>): void {
    this.progress.update(p => ({ ...p, ...progress }));
  }

  resetProgress(): void {
    this.progress.set({
      status: 'idle',
      currentPage: 0,
      totalPages: 0,
      message: '',
      percent: 0,
    });
  }
}
