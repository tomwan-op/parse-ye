import { Component, inject, OnInit, signal } from '@angular/core';
import { BrowserSupportService } from './services/browser-support.service';
import { UiService } from './services/ui.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ThumbnailsSidebarComponent } from './components/thumbnails-sidebar/thumbnails-sidebar.component';
import { DocumentViewerComponent } from './components/document-viewer/document-viewer.component';
import { UploadZoneComponent } from './components/upload-zone/upload-zone.component';
import { ResultsPanelComponent } from './components/results-panel/results-panel.component';
import { SettingsModalComponent } from './components/settings-modal/settings-modal.component';
import { BrowserNotSupportedComponent } from './components/browser-not-supported/browser-not-supported.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavbarComponent,
    ThumbnailsSidebarComponent,
    DocumentViewerComponent,
    UploadZoneComponent,
    ResultsPanelComponent,
    SettingsModalComponent,
    BrowserNotSupportedComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  readonly browserSupport = inject(BrowserSupportService);
  readonly ui = inject(UiService);

  readonly hasDocument = signal(false);
  readonly thumbnails = signal<{ pageNumber: number }[]>([]);
  readonly activePage = signal(1);

  ngOnInit(): void {
    this.browserSupport.checkBrowserSupport();
  }

  triggerUpload(): void {
    // Will be wired to file input in future
  }

  onFilesSelected(files: File[]): void {
    console.log('Files selected:', files.map(f => f.name));
    // Will be connected to PdfService in future
  }

  onPageSelected(page: number): void {
    this.activePage.set(page);
  }
}
