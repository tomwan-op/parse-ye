import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BrowserSupportService {
  readonly isSupported = signal<boolean | null>(null);
  readonly checkComplete = signal(false);
  readonly unsupportedReason = signal('');

  async checkBrowserSupport(): Promise<boolean> {
    try {
      // Check WebAssembly support
      if (typeof WebAssembly === 'undefined') {
        this.unsupportedReason.set('WebAssembly is not supported in this browser.');
        this.isSupported.set(false);
        this.checkComplete.set(true);
        return false;
      }

      // Validate WebAssembly can compile and instantiate
      const wasmBytes = new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, // magic number
        0x01, 0x00, 0x00, 0x00, // version
      ]);
      const wasmModule = await WebAssembly.compile(wasmBytes);
      if (!wasmModule) {
        this.unsupportedReason.set('WebAssembly compilation failed.');
        this.isSupported.set(false);
        this.checkComplete.set(true);
        return false;
      }

      this.isSupported.set(true);
      this.checkComplete.set(true);
      return true;
    } catch {
      this.unsupportedReason.set('Browser capability check failed. Please use the latest Chrome or Edge.');
      this.isSupported.set(false);
      this.checkComplete.set(true);
      return false;
    }
  }
}
