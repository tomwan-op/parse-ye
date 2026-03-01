import { Injectable, signal } from '@angular/core';

export interface OcrLine {
  text: string;
  confidence: number;
  box: [number, number][];
}

@Injectable({ providedIn: 'root' })
export class OcrService {
  readonly isModelLoaded = signal(false);
  readonly isModelLoading = signal(false);
  readonly lastRawDonutOutput = signal('');

  private pipeline: any = null;

  private static readonly MODEL_ID = 'Xenova/donut-base-finetuned-cord-v2';
  private static readonly SYNTHETIC_CONFIDENCE = 0.8;
  private static readonly BBOX_MARGIN = 10;
  static readonly MAX_INFERENCE_DIMENSION = 1600;

  async ensureModel(): Promise<void> {
    if (this.pipeline) return;
    this.isModelLoading.set(true);
    try {
      const { env, pipeline } = await import('@xenova/transformers/dist/transformers.min.js');
      env.backends.onnx.wasm.wasmPaths = new URL('assets/onnxruntime/', document.baseURI).href;
      this.pipeline = await pipeline(
        'image-to-text',
        OcrService.MODEL_ID,
        { quantized: true },
      );
      this.isModelLoaded.set(true);
    } finally {
      this.isModelLoading.set(false);
    }
  }

  async detectFromCanvas(canvas: HTMLCanvasElement): Promise<OcrLine[]> {
    await this.ensureModel();

    const { inferenceCanvas, scaleX, scaleY } = this.prepareCanvasForInference(canvas);
    const imageDataUrl = inferenceCanvas.toDataURL('image/png');
    const result = await this.pipeline(imageDataUrl);
    const rawText: string = result?.[0]?.generated_text ?? '';
    this.lastRawDonutOutput.set(rawText);
    const lines = this.parseDonutOutput(rawText, inferenceCanvas.width, inferenceCanvas.height);

    if (scaleX === 1 && scaleY === 1) {
      return lines;
    }

    return lines.map((line) => ({
      ...line,
      box: line.box.map(([x, y]): [number, number] => [x * scaleX, y * scaleY]),
    }));
  }

  private prepareCanvasForInference(canvas: HTMLCanvasElement): {
    inferenceCanvas: HTMLCanvasElement;
    scaleX: number;
    scaleY: number;
  } {
    const maxDimension = Math.max(canvas.width, canvas.height);
    if (maxDimension <= OcrService.MAX_INFERENCE_DIMENSION) {
      return { inferenceCanvas: canvas, scaleX: 1, scaleY: 1 };
    }

    const ratio = OcrService.MAX_INFERENCE_DIMENSION / maxDimension;
    const targetWidth = Math.max(1, Math.round(canvas.width * ratio));
    const targetHeight = Math.max(1, Math.round(canvas.height * ratio));
    const inferenceCanvas = document.createElement('canvas');
    inferenceCanvas.width = targetWidth;
    inferenceCanvas.height = targetHeight;

    const ctx = inferenceCanvas.getContext('2d');
    if (!ctx) {
      return { inferenceCanvas: canvas, scaleX: 1, scaleY: 1 };
    }
    ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

    return {
      inferenceCanvas,
      scaleX: canvas.width / targetWidth,
      scaleY: canvas.height / targetHeight,
    };
  }

  private parseDonutOutput(rawText: string, canvasWidth: number, canvasHeight: number): OcrLine[] {
    const lines: OcrLine[] = [];

    // Donut cord-v2 outputs XML-like tokens such as <s_menu><s_nm>text</s_nm>...
    // Match tags whose direct content does not start another <s_...> tag.
    // Inline helper tags (e.g. <sep/>) remain in the match and are stripped later.
    const tagPattern = /<s_([^>]+)>((?:(?!<s_)[\s\S])*?)<\/s_\1>/g;
    let match: RegExpExecArray | null;
    const items: { label: string; value: string }[] = [];
    const seenLabelValuePairs = new Set<string>();

    while ((match = tagPattern.exec(rawText)) !== null) {
      const label = match[1];
      const rawValue = match[2];
      const value = rawValue.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const key = `${label}:${value}`;
      if (value && !seenLabelValuePairs.has(key)) {
        seenLabelValuePairs.add(key);
        items.push({ label, value });
      }
    }

    // If no tag-based items found, extract text segments between tags first.
    if (items.length === 0) {
      const segmentPattern = />\s*([^<]+?)\s*</g;
      while ((match = segmentPattern.exec(rawText)) !== null) {
        const value = match[1].replace(/\s+/g, ' ').trim();
        if (value) {
          items.push({ label: 'text', value });
        }
      }
    }

    // Final fallback: strip tags into a single text line.
    if (items.length === 0) {
      const plainText = rawText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (plainText) {
        items.push({ label: 'text', value: plainText });
      }
    }

    // Create OcrLine entries with estimated bounding boxes
    const rowHeight = items.length > 0 ? canvasHeight / items.length : canvasHeight;
    const margin = OcrService.BBOX_MARGIN;

    for (let i = 0; i < items.length; i++) {
      const yStart = i * rowHeight;
      lines.push({
        text: items[i].value,
        confidence: OcrService.SYNTHETIC_CONFIDENCE,
        box: [
          [margin, yStart + margin],
          [canvasWidth - margin, yStart + margin],
          [canvasWidth - margin, yStart + rowHeight - margin],
          [margin, yStart + rowHeight - margin],
        ],
      });
    }

    return lines;
  }
}
