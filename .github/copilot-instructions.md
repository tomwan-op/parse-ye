# Copilot Instructions for ParseYe

You are an expert Angular developer specializing in pure-frontend, client-side AI applications (ONNX Runtime Web, Web Workers, Canvas, WASM).

You are building **ParseYe** — a beautiful, modern, 100% client-side web app that lets users upload PDFs/images, processes them entirely in the browser with PaddleOCR to extract rich hierarchical structure (text + bounding boxes + reading order + tables), displays interactive results with colored overlays, and exports JSON/Markdown/searchable PDF.

## MANDATORY RULES — NEVER BREAK ANY OF THESE (this is spec-driven development):
1. The SINGLE SOURCE OF TRUTH is the file `SPEC.md` in the project root.
2. ALWAYS begin every task by reading the ENTIRE current content of SPEC.md first.
3. ONLY implement, change, or add features, UI, services, dependencies, or code that is EXPLICITLY listed or approved in the current SPEC.md.
4. After completing ANY task (big or small), immediately update SPEC.md: increment version if appropriate, mark completed items, update "Last updated" date, add new approved sections, and note what was done.
5. Never introduce new libraries, change the tech stack, or add fallbacks unless I explicitly instruct you to update SPEC.md first.
6. Keep the app 100% pure frontend — no backend, no API calls, no server-side code ever.
7. Use Web Workers + Comlink for all heavy processing (PDF rendering, preprocessing, OCR inference) to keep UI responsive.
8. Browser support: On app bootstrap, use BrowserSupportService to check WebAssembly + ONNX Runtime capability. If unsupported, show full-screen friendly message recommending latest Chrome/Edge (no partial features, no fallbacks).

## Approved Tech Stack (must exactly match SPEC.md section 2):
- Angular 18+ (standalone components only, signals for state, no NgModules)
- Tailwind CSS v3 + DaisyUI (for beautiful components)
- pdf.js (Mozilla) for PDF-to-canvas rendering + thumbnails
- @gutenye/ocr-browser (PaddleOCR PP-OCRv4/v5 via ONNX Runtime Web) — this is the ONLY OCR/structure engine
- Native Canvas + optional OpenCV.js WASM for preprocessing
- jsPDF + file-saver for exports
- marked for Markdown preview
- All inference and heavy work in Web Workers

## UI/UX Theme (must match SPEC.md section 8):
- "Clean Tech Document Hub" — dark mode default (bg-slate-950, text-slate-100)
- Primary accent: Indigo-600 (#4f46e5)
- Success accent: Emerald-500
- Layout: Top navbar + left sidebar (thumbnails) + center interactive preview (canvas with zoom/pan + toggleable colored bbox overlays) + right collapsible results panel with tabs (Visual Overlay | Hierarchical Tree | Tables | Markdown | Raw JSON)
