import { Component, inject } from '@angular/core';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  template: `
    @if (ui.settingsOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="ui.toggleSettings()"></div>

        <!-- Modal -->
        <div class="relative bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-md mx-4 p-6 space-y-6">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-100">Settings</h2>
            <button
              class="btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-slate-200"
              (click)="ui.toggleSettings()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Language selection -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-300">OCR Languages</label>
            <select class="select select-bordered w-full bg-slate-800 border-slate-700 text-slate-200">
              <option selected>English</option>
              <option>Chinese (Simplified)</option>
              <option>Japanese</option>
              <option>Korean</option>
              <option>French</option>
              <option>German</option>
              <option>Spanish</option>
            </select>
          </div>

          <!-- Preprocessing toggle -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-300">Image Preprocessing</p>
              <p class="text-xs text-slate-500">Contrast, deskew, binarize</p>
            </div>
            <input type="checkbox" class="toggle toggle-primary" checked />
          </div>

          <!-- Close button -->
          <div class="pt-2">
            <button class="btn btn-primary w-full" (click)="ui.toggleSettings()">
              Done
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class SettingsModalComponent {
  ui = inject(UiService);
}
