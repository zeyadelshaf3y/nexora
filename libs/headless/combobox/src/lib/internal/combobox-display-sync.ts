import type { ElementRef } from '@angular/core';

export class ComboboxDisplaySync {
  private lastSyncedDisplayValue = '';

  sync(inputRef: ElementRef<HTMLInputElement> | undefined, displayValue: string): void {
    const inputEl = inputRef?.nativeElement;
    if (!inputEl) return;
    if (this.lastSyncedDisplayValue === displayValue && inputEl.value === displayValue) {
      return;
    }
    if (inputEl.value !== displayValue) {
      inputEl.value = displayValue;
    }
    this.lastSyncedDisplayValue = displayValue;
  }
}
