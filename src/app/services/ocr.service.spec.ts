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
});
