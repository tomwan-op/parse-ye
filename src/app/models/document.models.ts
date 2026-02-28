export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DocumentElement {
  type: 'title' | 'paragraph' | 'list' | 'figure' | 'other';
  text: string;
  bbox: BBox;
  confidence: number;
  children?: DocumentElement[];
}

export interface Table {
  bbox: BBox;
  rows: string[][];
}

export interface Page {
  pageNumber: number;
  elements: DocumentElement[];
  tables: Table[];
}

export interface DocumentStructure {
  pages: Page[];
  metadata: {
    totalPages: number;
    processingTimeMs: number;
    model: 'pp-ocr-v4';
    languages: string[];
  };
}

export type ProcessingStatus = 'idle' | 'loading' | 'rendering' | 'preprocessing' | 'recognizing' | 'structuring' | 'complete' | 'error';

export interface ProcessingProgress {
  status: ProcessingStatus;
  currentPage: number;
  totalPages: number;
  message: string;
  percent: number;
}

export type ResultTab = 'overlay' | 'tree' | 'tables' | 'markdown' | 'json';
