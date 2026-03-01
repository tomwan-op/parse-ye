import { OcrService } from './ocr.service';

describe('OcrService', () => {
  it('should pass a data URL string to the pipeline when detecting from canvas', async () => {
    const service = new OcrService();
    const pipelineSpy = jasmine
      .createSpy('pipeline')
      .and.resolveTo([{ generated_text: '<s_text>Hello</s_text>' }]);

    (service as any).pipeline = pipelineSpy;
    spyOn(service, 'ensureModel').and.resolveTo();

    const canvas = {
      width: 200,
      height: 100,
      toDataURL: jasmine.createSpy('toDataURL').and.returnValue('data:image/png;base64,abc'),
    } as unknown as HTMLCanvasElement;

    const lines = await service.detectFromCanvas(canvas);

    expect(canvas.toDataURL).toHaveBeenCalledWith('image/png');
    expect(pipelineSpy).toHaveBeenCalledWith('data:image/png;base64,abc');
    expect(lines.length).toBe(1);
    expect(lines[0].text).toBe('Hello');
  });

  it('should downscale large canvases for inference and remap boxes to original size', async () => {
    const service = new OcrService();
    const pipelineSpy = jasmine
      .createSpy('pipeline')
      .and.resolveTo([{ generated_text: '<s_text>Hello</s_text>' }]);

    (service as any).pipeline = pipelineSpy;
    spyOn(service, 'ensureModel').and.resolveTo();

    const drawImageSpy = jasmine.createSpy('drawImage');
    const resizedCanvas = {
      width: 1600,
      height: 800,
      getContext: jasmine.createSpy('getContext').and.returnValue({ drawImage: drawImageSpy }),
      toDataURL: jasmine.createSpy('toDataURL').and.returnValue('data:image/png;base64,resized'),
    } as unknown as HTMLCanvasElement;

    spyOn(document, 'createElement').and.returnValue(resizedCanvas);

    const sourceCanvas = {
      width: 4000,
      height: 2000,
      toDataURL: jasmine.createSpy('toDataURL').and.returnValue('data:image/png;base64,source'),
    } as unknown as HTMLCanvasElement;

    const lines = await service.detectFromCanvas(sourceCanvas);
    const expectedScaleX = sourceCanvas.width / resizedCanvas.width;
    const expectedScaleY = sourceCanvas.height / resizedCanvas.height;

    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(drawImageSpy).toHaveBeenCalledWith(sourceCanvas, 0, 0, 1600, 800);
    expect(sourceCanvas.toDataURL).not.toHaveBeenCalled();
    expect(resizedCanvas.toDataURL).toHaveBeenCalledWith('image/png');
    expect(pipelineSpy).toHaveBeenCalledWith('data:image/png;base64,resized');
    expect(lines.length).toBe(1);
    expect(lines[0].box[0][0]).toBeCloseTo(10 * expectedScaleX, 5);
    expect(lines[0].box[0][1]).toBeCloseTo(10 * expectedScaleY, 5);
  });

  it('should extract leaf text values from nested Donut tags instead of collapsing to one numeric line', async () => {
    const service = new OcrService();
    const pipelineSpy = jasmine.createSpy('pipeline').and.resolveTo([{
      generated_text: '<s_receipt><s_shop>正潮樓</s_shop><s_item>炒銀魚仔</s_item><s_total>2004.0</s_total></s_receipt>',
    }]);

    (service as any).pipeline = pipelineSpy;
    spyOn(service, 'ensureModel').and.resolveTo();

    const canvas = {
      width: 600,
      height: 900,
      toDataURL: jasmine.createSpy('toDataURL').and.returnValue('data:image/png;base64,abc'),
    } as unknown as HTMLCanvasElement;

    const lines = await service.detectFromCanvas(canvas);

    expect(lines.map((line) => line.text)).toEqual(['正潮樓', '炒銀魚仔', '2004.0']);
  });
});
