import { Component } from '@angular/core';

@Component({
  selector: 'app-browser-not-supported',
  standalone: true,
  template: `
    <div class="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 p-4">
      <div class="max-w-lg w-full text-center space-y-6">
        <!-- Icon -->
        <div class="mx-auto w-20 h-20 rounded-2xl bg-indigo-600/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>

        <!-- Title -->
        <h1 class="text-2xl font-bold text-slate-100">Browser Not Supported</h1>

        <!-- Message -->
        <p class="text-slate-400 leading-relaxed">
          ParseYe requires a modern browser with <span class="text-indigo-400 font-medium">WebAssembly</span> and
          <span class="text-indigo-400 font-medium">WebGPU/WebGL</span> support.
        </p>
        <p class="text-slate-400 leading-relaxed">
          Please open this app in the latest <span class="text-emerald-400 font-medium">Google Chrome</span> or
          <span class="text-emerald-400 font-medium">Microsoft Edge</span> for the best (and fastest) experience.
        </p>

        <!-- Recommended browsers -->
        <div class="flex justify-center gap-4 pt-2">
          <a href="https://www.google.com/chrome/" target="_blank" rel="noopener"
             class="btn btn-outline btn-sm border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-indigo-500 hover:text-indigo-400">
            Download Chrome
          </a>
          <a href="https://www.microsoft.com/edge" target="_blank" rel="noopener"
             class="btn btn-outline btn-sm border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-indigo-500 hover:text-indigo-400">
            Download Edge
          </a>
        </div>
      </div>
    </div>
  `,
})
export class BrowserNotSupportedComponent {}
