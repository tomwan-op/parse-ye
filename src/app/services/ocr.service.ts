import { Injectable, signal } from '@angular/core';

export interface OcrLine {
  text: string;
  confidence: number;
  box: number[][];
}

@Injectable({ providedIn: 'root' })
export class OcrService {
  readonly isModelLoaded = signal(false);
  readonly isModelLoading = signal(false);

  private ocrInstance: any = null;

  async ensureModel(): Promise<void> {
    if (this.ocrInstance) return;
    this.isModelLoading.set(true);
    try {
      const { default: Ocr } = await import('@gutenye/ocr-browser');
      this.ocrInstance = await Ocr.create({
        models: {
          detectionPath: '/assets/ocr-models/ch_PP-OCRv4_det_infer.onnx',
          recognitionPath: '/assets/ocr-models/ch_PP-OCRv4_rec_infer.onnx',
          dictionaryPath: '/assets/ocr-models/ppocr_keys_v1.txt',
        },
      });
      this.isModelLoaded.set(true);
    } finally {
      this.isModelLoading.set(false);
    }
  }

  async detectFromCanvas(canvas: HTMLCanvasElement): Promise<OcrLine[]> {
    await this.ensureModel();
    const dataUrl = canvas.toDataURL('image/png');
    const results = await this.ocrInstance.detect(dataUrl);

    return results.map((line: any) => ({
      text: line.text,
      confidence: line.mean ?? line.score ?? 0,
      box: line.box ?? [],
    }));
  }
}
