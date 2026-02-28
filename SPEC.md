## 1. Project Overview
ParseYe is a beautiful, modern, **100% pure frontend** (no backend, no server, no API keys) web app that lets users drag-and-drop PDFs or images, processes them entirely in the browser using PaddleOCR, extracts rich hierarchical document structure (text + bounding boxes + reading order + tables + semantic grouping), displays interactive results with colored overlays, and exports clean JSON, Markdown, TXT, or searchable PDF.

## 2. Tech Stack (DO NOT CHANGE WITHOUT UPDATING THIS SECTION FIRST)

- Angular 18+ (standalone components only, signals for state, no NgModules)
- Tailwind CSS v3 + DaisyUI (for components, dark mode, beautiful UI)
- pdf.js (Mozilla) – PDF rendering to canvas, thumbnails, page navigation
- **@gutenye/ocr-browser** (PaddleOCR PP-OCRv4/v5 via ONNX Runtime Web) – **ONLY** OCR and structure engine
- Native Canvas API + optional OpenCV.js WASM (for preprocessing: contrast, deskew, binarize)
- All heavy processing (rendering, preprocessing, inference) must run in Web Workers + Comlink
- Exports: jsPDF, file-saver, marked (Markdown)
- Storage: Angular Signals + IndexedDB (for recent files and cached models)
- Deployment: static hosting only (Vercel, Netlify, GitHub Pages)

## 3. Browser Compatibility (MUST IMPLEMENT)

- On app bootstrap: BrowserSupportService must check:
  - WebAssembly support
  - ONNX Runtime Web capability (lightweight init test)
- If unsupported: Show full-screen friendly message (no partial UI, no fallbacks):
  
  > "ParseYe requires a modern browser with WebAssembly and WebGPU/WebGL support.<br><br>Please open this app in the latest Google Chrome or Microsoft Edge for the best (and fastest) experience."
- Supported browsers: Chrome 90+, Edge 90+, Firefox 90+, Safari 15+

## 4. Core Architecture

- Services (all injectable, singleton where possible):
  - BrowserSupportService
  - PdfService (rendering, thumbnails, canvas extraction)
  - OcrService (only @gutenye/ocr-browser, lazy model loading, Web Worker)
  - StructureService (post-process PaddleOCR output → hierarchical structure + table detection)
  - ExportService
  - UiService (theme, progress, overlays)
- Components (standalone):
  - UploadZoneComponent
  - DocumentViewerComponent (canvas + zoom + overlays)
  - ThumbnailsSidebarComponent
  - ResultsPanelComponent (tabs)
  - SettingsModalComponent
  - BrowserNotSupportedComponent
- Data flow: Upload → PdfService → (optional preprocess) → OcrService → StructureService → UI

## 5. Features (MVP – must be complete before v1.0)

1. Drag-and-drop upload zone (PDF, PNG, JPG, multiple files supported)
2. Multi-page document viewer with vertical thumbnails sidebar, page navigation, zoom/pan
3. Toggleable colored bounding-box overlays on the canvas (color per element type)
4. Process button with options: language selector (multi-select), preprocessing toggle
5. Real-time progress indicators with step-by-step status
6. Results panel (tabs):
   - Visual Overlay (live on preview)
   - Hierarchical Tree (interactive)
   - Tables (editable HTML tables)
   - Markdown preview
   - Raw JSON viewer
7. One-click exports: Full JSON, Markdown, Plain TXT, Searchable PDF
8. Dark mode default, responsive design (mobile-friendly collapse)

## 6. Output Data Schema (exact TypeScript interfaces – must match)

```ts
export interface DocumentStructure {
  pages: Page[];
  metadata: {
    totalPages: number;
    processingTimeMs: number;
    model: 'pp-ocr-v4';
    languages: string[];
  };
}

export interface Page {
  pageNumber: number;
  elements: DocumentElement[];
  tables: Table[];
}

export interface DocumentElement {
  type: 'title' | 'paragraph' | 'list' | 'figure' | 'other';
  text: string;
  bbox: { x: number; y: number; width: number; height: number };
  confidence: number;
  children?: DocumentElement[];
}

export interface Table {
  bbox: { x: number; y: number; width: number; height: number };
  rows: string[][];
}
```

## 7. Processing Pipeline (exact order – must be followed)

1. pdf.js → render each page to canvas
2. Optional preprocessing (Canvas + OpenCV.js)
3. @gutenye/ocr-browser: detect + recognize (in Web Worker)
4. StructureService: 
   - Group boxes by position & reading order
   - Paragraph & section clustering
   - Table detection & reconstruction
5. Generate overlays, tree, tables, Markdown, JSON

## 8. UI/UX Spec – Theme: "Clean Tech Document Hub"

- Dark mode default: `bg-slate-950 text-slate-100`
- Primary accent: Indigo-600 (#4f46e5)
- Success / processed: Emerald-500
- Layout (desktop first):
  - Top navbar: Logo "ParseYe", Upload button, Settings, Export dropdown, Theme toggle
  - Left sidebar: Vertical scrollable thumbnails
  - Center: Interactive document preview (canvas with zoom controls, page counter)
  - Right panel (collapsible): Results tabs
- Typography: Clean sans-serif (system or Inter)
- Style: High whitespace, subtle shadows, rounded-xl cards, smooth transitions, modern SaaS feel (inspired by Notion + Adobe Acrobat + Claude)

## 9. Spec-Driven Development Rules (for Copilot / any agent)

1. ALWAYS read the entire SPEC.md first.
2. ONLY implement what is explicitly listed or approved here.
3. After every change, update this file (version, date, status, mark completed items).
4. Never add libraries or features outside this spec without my explicit instruction to update section 2 first.

**Next step for Copilot:** See section 11 (Next Tasks) below.

## 10. Implementation Status

**Version:** 0.5.0  
**Last updated:** 2026-02-28

### Completed (v0.1.0 — Project Skeleton)
- [x] Tailwind CSS v3 + DaisyUI v4 configured with custom "parseye" dark theme
- [x] Global styles (dark mode, custom scrollbar, system sans-serif font stack)
- [x] Data models (`document.models.ts` — DocumentStructure, Page, DocumentElement, Table, BBox, ProcessingProgress, ResultTab)
- [x] BrowserSupportService (WebAssembly check on bootstrap)
- [x] UiService (sidebar, results panel, zoom, tabs, progress state via signals)
- [x] BrowserNotSupportedComponent (full-screen friendly message)
- [x] NavbarComponent (logo, upload, process, export dropdown, settings, panel toggles)
- [x] UploadZoneComponent (drag-and-drop + click file picker)
- [x] ThumbnailsSidebarComponent (page list with active state)
- [x] DocumentViewerComponent (canvas + zoom controls)
- [x] ResultsPanelComponent (5 tabs: Overlay, Tree, Tables, Markdown, JSON)
- [x] SettingsModalComponent (language selector, preprocessing toggle)
- [x] AppComponent wired with layout: navbar + sidebar + viewer/upload + results panel + settings modal
- [x] Build passes with zero errors

### Completed (v0.1.1 — Security Upgrade)
- [x] Upgraded Angular 18.2.14 → 19.2.19 to fix multiple security vulnerabilities (XSRF token leakage, XSS via SVG attributes, Stored XSS via SVG/MathML, i18n XSS — none had patches for v18)
- [x] Updated TypeScript 5.5 → 5.7, zone.js 0.14 → 0.15 for Angular 19 compatibility
- [x] Build passes with zero errors, no security advisories remaining

### Completed (v0.2.0 — PdfService + Canvas Rendering)
- [x] PdfService (`pdf.service.ts`) — loads PDFs via pdfjs-dist, loads images (PNG/JPG), renders pages to canvas at configurable scale, generates thumbnails (0.3x), extracts page dimensions, provides `getPageCanvas()` for downstream OCR pipeline
- [x] angular.json updated: pdf.js worker (`pdf.worker.min.mjs`) and OCR model assets (`@gutenye/ocr-models`) copied to build/test output
- [x] ThumbnailsSidebarComponent upgraded to render canvas-based thumbnails via PdfService
- [x] DocumentViewerComponent upgraded: renders active page via PdfService, overlay canvas for bounding boxes, overlay toggle, page counter from PdfService.totalPages
- [x] Build passes with zero errors

### Completed (v0.3.0 — OCR + Structure + Export Services)
- [x] OcrService (`ocr.service.ts`) — lazy-loads @gutenye/ocr-browser OCR model, converts canvas to data URL for detection, returns raw OcrLine[] with text/confidence/box, tracks loading state via signals
- [x] StructureService (`structure.service.ts`) — takes raw OCR lines + page dimensions, classifies elements (title/paragraph/list), detects table structures via grid-aligned box analysis, groups consecutive paragraphs, returns Page with DocumentElement[] and Table[]
- [x] ExportService (`export.service.ts`) — exports DocumentStructure to JSON, Markdown, Plain Text, and searchable PDF (jsPDF with image layer + invisible text layer); uses file-saver for downloads; lazy-loads jspdf and file-saver
- [x] Build passes with zero errors

### Completed (v0.4.0 — Full Processing Pipeline Wiring)
- [x] AppComponent: injects all services (PdfService, OcrService, StructureService, ExportService, UiService), manages documentStructure signal, processDocument() runs full Upload → Render → OCR → Structure pipeline with progress updates
- [x] Hidden file input wired to navbar Upload button via viewChild + triggerUpload()
- [x] onFilesSelected() loads file via PdfService, populates thumbnails, sets hasDocument
- [x] processDocument() orchestrates: load OCR model → render each page → detect text → analyze structure → build DocumentStructure with metadata
- [x] Export methods (JSON, Markdown, Plain Text, Searchable PDF) connected to ExportService
- [x] Progress bar in app template shows real-time status (loading/rendering/recognizing/structuring/complete/error)
- [x] NavbarComponent: added processClicked/exportClicked outputs, hasDocument/isProcessing/hasResults inputs; Process button disabled when no doc or processing; spinner during processing; Export dropdown conditional on results
- [x] ResultsPanelComponent: accepts documentStructure input; Overlay tab shows legend + stats; Tree tab shows hierarchical elements by page with type badges; Tables tab renders detected tables; Markdown tab shows structureToMarkdown output; JSON tab shows formatted JSON
- [x] DocumentViewerComponent receives activePage + documentStructure inputs from AppComponent for overlay rendering
- [x] angular.json: added externalDependencies for fs/path (opencv.js Node built-ins used by @gutenye/ocr-common)
- [x] Fixed StructureService spread type error (TypeScript strict narrowing issue with nullable variable)
- [x] Build passes with zero errors

### Completed (v0.5.0 — UI Polish & Responsive Layout)
- [x] DocumentViewerComponent: responsive canvas with CSS max-width/max-height fit modes, ResizeObserver for viewport changes, floating controls bar with Fit to Width / Fit to Height / Original Size toggles, zoom in/out/reset, overlays toggle, page counter
- [x] NavbarComponent: Process button disabled with tooltip "Upload a document first"; "New/Clear" button next to Upload; ParseYe logo clickable to reset state; improved hover states (indigo-500); Export dropdown with tooltip when disabled; responsive labels hidden on mobile
- [x] ThumbnailsSidebarComponent: page count label ("X Pages"); enhanced active page highlight with glow/shadow; "Clear all" trash icon button; collapsible on mobile via fixed overlay with backdrop
- [x] ResultsPanelComponent: renamed "Tree" tab → "Structure"; close button with arrow icon; improved empty-state with pulsing animation and "Waiting for results" text; bottom sheet on mobile via fixed overlay
- [x] Mobile responsive (<1024px): left sidebar collapses to hamburger overlay; right results panel becomes bottom sheet overlay; backdrop click to dismiss; center preview takes full width; navbar text labels hidden on small screens
- [x] UploadZoneComponent: responsive padding (p-4 sm:p-8, p-6 sm:p-12); responsive text sizes
- [x] UiService: added FitMode type and fitMode signal; setFitMode(), updated zoomIn/zoomOut to switch to original mode, resetZoom resets to fit-width
- [x] AppComponent: added clearDocument() method; footer "100% client-side · Powered by PaddleOCR"; mobile backdrop overlays for sidebar and results panel
- [x] Build passes with zero errors

## 11. Next Tasks (for next agent session)

### v0.6.0 — Web Worker OCR + Preprocessing (SPEC §7.2, §7.3, §4)
- [ ] Move OCR inference into a dedicated Web Worker using Comlink (SPEC §2 requirement: "All heavy processing must run in Web Workers + Comlink")
- [ ] Implement optional image preprocessing pipeline (SPEC §7.2): contrast enhancement, deskew, binarize using Native Canvas API
- [ ] Wire preprocessing toggle from SettingsModalComponent to the processing pipeline
- [ ] Add language selector state management (SettingsModalComponent → OcrService)

### v0.7.0 — Enhanced UI Features (SPEC §5)
- [ ] Multi-file support: handle multiple files in upload, show file list, switch between files
- [ ] Editable HTML tables in Results Panel Tables tab (SPEC §5.6)
- [ ] Markdown preview with rendered HTML using `marked` library (SPEC §5.6)
- [ ] Theme toggle (light/dark mode) in navbar (SPEC §8)
- [ ] Keyboard shortcuts for navigation (zoom, page switching)
- [ ] Make results panel resizable with draggable divider

### v0.8.0 — IndexedDB + Performance (SPEC §2)
- [ ] IndexedDB integration for caching OCR models (SPEC §2: "IndexedDB for cached models")
- [ ] IndexedDB for recent files (SPEC §2: "IndexedDB for recent files")
- [ ] Lazy-load heavy dependencies (onnxruntime-web, jspdf) for faster initial load
- [ ] Performance: optimize large PDF rendering with viewport-based lazy page rendering

### v1.0.0 — MVP Release (SPEC §5)
- [ ] End-to-end testing of all features in SPEC §5
- [ ] Production build optimization and bundle size audit
- [ ] Deployment setup for static hosting (Vercel/Netlify/GitHub Pages) (SPEC §2)
- [ ] README.md with usage instructions, screenshots, and deployment guide
