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

**Next step for Copilot:** Start with project skeleton + Tailwind + DaisyUI + dark mode + BrowserSupportService.

## 10. Implementation Status

**Version:** 0.1.0  
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
