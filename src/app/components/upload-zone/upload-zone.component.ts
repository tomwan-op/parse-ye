import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-upload-zone',
  standalone: true,
  template: `
    <div
      class="flex flex-col items-center justify-center h-full w-full p-4 sm:p-8"
    >
      <label
        class="relative block w-full max-w-2xl rounded-2xl border-2 border-dashed transition-all duration-300 p-6 sm:p-12 text-center cursor-pointer"
        [class]="isDragging() ? 'border-indigo-500 bg-indigo-600/10 scale-[1.02]' : 'border-slate-700 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-900/80'"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <!-- Upload icon -->
        <div class="mx-auto w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        </div>

        <h2 class="text-lg sm:text-xl font-semibold text-slate-100 mb-2">
          Drop your documents here
        </h2>
        <p class="text-slate-400 mb-4 text-sm sm:text-base">
          or click to browse files
        </p>
        <p class="text-xs text-slate-500">
          Supports PDF, PNG, JPG · Multiple files allowed
        </p>

        <input
          #fileInput
          type="file"
          class="sr-only"
          accept=".pdf,.png,.jpg,.jpeg"
          multiple
          (change)="onFileSelected($event)"
        />
      </label>
    </div>
  `,
})
export class UploadZoneComponent {
  filesSelected = output<File[]>();
  isDragging = signal(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length > 0) {
      this.filesSelected.emit(files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length > 0) {
      this.filesSelected.emit(files);
    }
    input.value = '';
  }
}
