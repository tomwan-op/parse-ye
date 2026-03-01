import { Component, inject, OnInit, signal, viewChild, ElementRef } from '@angular/core';
import { BrowserSupportService } from './services/browser-support.service';
import { UiService } from './services/ui.service';
import { PdfService } from './services/pdf.service';
import { OcrService } from './services/ocr.service';
import { StructureService } from './services/structure.service';
import { ExportService } from './services/export.service';
import { HkbrParserService } from './services/hkbr-parser.service';
import { HkbrValidatorService } from './services/hkbr-validator.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ThumbnailsSidebarComponent } from './components/thumbnails-sidebar/thumbnails-sidebar.component';
import { DocumentViewerComponent } from './components/document-viewer/document-viewer.component';
import { UploadZoneComponent } from './components/upload-zone/upload-zone.component';
import { ResultsPanelComponent } from './components/results-panel/results-panel.component';
import { SettingsModalComponent } from './components/settings-modal/settings-modal.component';
import { BrowserNotSupportedComponent } from './components/browser-not-supported/browser-not-supported.component';
import { DocumentStructure, DocumentType, HkbrData, Page } from './models/document.models';
import { SUPPORTED_UPLOAD_ACCEPT } from './constants/upload.constants';

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
  readonly pdfService = inject(PdfService);
  readonly ocrService = inject(OcrService);
  readonly structureService = inject(StructureService);
  readonly exportService = inject(ExportService);
  readonly hkbrParser = inject(HkbrParserService);
  readonly hkbrValidator = inject(HkbrValidatorService);

  readonly hasDocument = signal(false);
  readonly thumbnails = signal<{ pageNumber: number }[]>([]);
  readonly activePage = signal(1);
  readonly documentStructure = signal<DocumentStructure | null>(null);
  readonly isProcessing = signal(false);
  readonly documentType = signal<DocumentType>('OTHER');
  readonly hkbrData = signal<HkbrData | null>(null);
  readonly supportedUploadAccept = SUPPORTED_UPLOAD_ACCEPT;

  private hiddenFileInput = viewChild<ElementRef<HTMLInputElement>>('hiddenFileInput');

  ngOnInit(): void {
    this.browserSupport.checkBrowserSupport();
  }

  triggerUpload(): void {
    this.hiddenFileInput()?.nativeElement.click();
  }

  onHiddenFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length > 0) {
      this.onFilesSelected(files);
    }
    input.value = '';
  }

  async onFilesSelected(files: File[]): Promise<void> {
    if (files.length === 0) return;
    const file = files[0];

    this.documentStructure.set(null);
    this.ui.resetProgress();

    try {
      await this.pdfService.loadFile(file);
      this.hasDocument.set(true);
      this.activePage.set(1);

      const pages = this.pdfService.pages();
      this.thumbnails.set(pages.map(p => ({ pageNumber: p.pageNumber })));
      this.ui.sidebarOpen.set(true);
    } catch (error) {
      console.error('Failed to load file:', error);
      this.hasDocument.set(false);
      this.thumbnails.set([]);
      this.ui.sidebarOpen.set(false);
      this.ui.updateProgress({
        status: 'error',
        currentPage: 0,
        totalPages: 0,
        message: `Failed to load file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        percent: 0,
      });
    }
  }

  async processDocument(): Promise<void> {
    if (!this.hasDocument() || this.isProcessing()) return;

    this.isProcessing.set(true);
    const startTime = performance.now();
    const pages = this.pdfService.pages();
    const totalPages = pages.length;
    const processedPages: Page[] = [];

    try {
      this.ui.updateProgress({
        status: 'loading',
        currentPage: 0,
        totalPages,
        message: 'Loading OCR model...',
        percent: 5,
      });
      await this.ocrService.ensureModel();

      for (let i = 0; i < pages.length; i++) {
        const pageData = pages[i];
        const pageNum = pageData.pageNumber;

        this.ui.updateProgress({
          status: 'rendering',
          currentPage: pageNum,
          totalPages,
          message: `Rendering page ${pageNum}...`,
          percent: 10 + ((i / totalPages) * 80) * 0.1,
        });
        const canvas = await this.pdfService.getPageCanvas(pageNum, 1.0);

        this.ui.updateProgress({
          status: 'recognizing',
          currentPage: pageNum,
          totalPages,
          message: `Recognizing text on page ${pageNum}...`,
          percent: 10 + ((i / totalPages) * 80) * 0.5,
        });
        const ocrLines = await this.ocrService.detectFromCanvas(canvas);

        this.ui.updateProgress({
          status: 'structuring',
          currentPage: pageNum,
          totalPages,
          message: `Analyzing structure on page ${pageNum}...`,
          percent: 10 + (((i + 0.8) / totalPages) * 80),
        });
        const page = this.structureService.processPage(pageNum, ocrLines, pageData.width, pageData.height);
        processedPages.push(page);
      }

      const structure: DocumentStructure = {
        pages: processedPages,
        metadata: {
          totalPages,
          processingTimeMs: Math.round(performance.now() - startTime),
          model: 'donut',
          languages: ['en'],
        },
      };

      this.documentStructure.set(structure);

      if (this.documentType() === 'HKBR') {
        const parsed = this.hkbrParser.parse(structure);
        this.hkbrData.set(this.hkbrValidator.validate(parsed));
      } else {
        this.hkbrData.set(null);
      }

      this.ui.updateProgress({
        status: 'complete',
        currentPage: totalPages,
        totalPages,
        message: `Done! Processed ${totalPages} page(s) in ${(structure.metadata.processingTimeMs / 1000).toFixed(1)}s`,
        percent: 100,
      });
    } catch (error) {
      console.error('Processing failed:', error);
      this.ui.updateProgress({
        status: 'error',
        currentPage: 0,
        totalPages,
        message: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        percent: 0,
      });
    } finally {
      this.isProcessing.set(false);
    }
  }

  onPageSelected(page: number): void {
    this.activePage.set(page);
  }

  clearDocument(): void {
    this.pdfService.reset();
    this.hasDocument.set(false);
    this.thumbnails.set([]);
    this.activePage.set(1);
    this.documentStructure.set(null);
    this.hkbrData.set(null);
    this.isProcessing.set(false);
    this.ui.resetProgress();
    this.ui.sidebarOpen.set(false);
    this.ui.resultsPanelOpen.set(false);
  }

  async onExport(format: string): Promise<void> {
    const structure = this.documentStructure();
    if (!structure) return;

    switch (format) {
      case 'json':
        await this.exportService.exportJson(structure);
        break;
      case 'markdown':
        await this.exportService.exportMarkdown(structure);
        break;
      case 'text':
        await this.exportService.exportPlainText(structure);
        break;
      case 'pdf':
        await this.exportService.exportSearchablePdf(structure);
        break;
    }
  }
}
