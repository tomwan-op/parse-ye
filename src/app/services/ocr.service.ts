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

  private pipeline: any = null;

  private static readonly MODEL_ID = 'Xenova/donut-base-finetuned-cord-v2';

  async ensureModel(): Promise<void> {
    if (this.pipeline) return;
    this.isModelLoading.set(true);
    try {
      const { pipeline } = await import('@xenova/transformers');
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

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });

    const result = await this.pipeline(blob);
    const rawText: string = result?.[0]?.generated_text ?? '';

    return this.parseDonutOutput(rawText, canvas.width, canvas.height);
  }

  private parseDonutOutput(rawText: string, canvasWidth: number, canvasHeight: number): OcrLine[] {
    const lines: OcrLine[] = [];

    // Donut cord-v2 outputs XML-like tokens such as <s_menu><s_nm>text</s_nm>...
    // Extract text values from token pairs like <s_TAG>value</s_TAG>
    const tagPattern = /<s_([^>]+)>(.*?)<\/s_\1>/gs;
    let match: RegExpExecArray | null;
    const items: { label: string; value: string }[] = [];

    while ((match = tagPattern.exec(rawText)) !== null) {
      const label = match[1];
      const value = match[2].trim();
      if (value && !value.startsWith('<')) {
        items.push({ label, value });
      }
    }

    // If no tag-based items found, try to extract plain text
    if (items.length === 0) {
      const plainText = rawText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (plainText) {
        items.push({ label: 'text', value: plainText });
      }
    }

    // Create OcrLine entries with estimated bounding boxes
    const rowHeight = items.length > 0 ? canvasHeight / items.length : canvasHeight;
    const margin = 10;

    for (let i = 0; i < items.length; i++) {
      const yStart = i * rowHeight;
      lines.push({
        text: items[i].value,
        confidence: 0.8,
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
