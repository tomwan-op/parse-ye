import { Injectable, signal } from '@angular/core';
import { ProcessingProgress, ResultTab } from '../models/document.models';

@Injectable({ providedIn: 'root' })
export class UiService {
  readonly sidebarOpen = signal(true);
  readonly resultsPanelOpen = signal(true);
  readonly activeResultTab = signal<ResultTab>('overlay');
  readonly settingsOpen = signal(false);
  readonly currentZoom = signal(1);
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

  zoomIn(): void {
    this.currentZoom.update(z => Math.min(z + 0.25, 5));
  }

  zoomOut(): void {
    this.currentZoom.update(z => Math.max(z - 0.25, 0.25));
  }

  resetZoom(): void {
    this.currentZoom.set(1);
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
