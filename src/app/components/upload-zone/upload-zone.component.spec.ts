import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadZoneComponent } from './upload-zone.component';

describe('UploadZoneComponent', () => {
  let fixture: ComponentFixture<UploadZoneComponent>;
  let component: UploadZoneComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadZoneComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should restrict picker accept types to supported document/image formats', () => {
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toBe('.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg');
  });

  it('should emit only supported file types from file selection', () => {
    const emitSpy = spyOn(component.filesSelected, 'emit');
    const supported = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    const unsupported = new File(['x'], 'notes.txt', { type: 'text/plain' });

    component.onFileSelected({
      target: {
        files: [supported, unsupported],
        value: '',
      },
    } as unknown as Event);

    expect(emitSpy).toHaveBeenCalledWith([supported]);
  });
});
