import type { ElementRef } from '@angular/core';

import { ComboboxDisplaySync } from './combobox-display-sync';

function createInputRef(initialValue = ''): ElementRef<HTMLInputElement> {
  const input = document.createElement('input');
  input.value = initialValue;

  return { nativeElement: input } as ElementRef<HTMLInputElement>;
}

describe('ComboboxDisplaySync', () => {
  it('writes display value to input when different', () => {
    const sync = new ComboboxDisplaySync();
    const inputRef = createInputRef('old');

    sync.sync(inputRef, 'new');

    expect(inputRef.nativeElement.value).toBe('new');
  });

  it('is safe with missing input ref', () => {
    const sync = new ComboboxDisplaySync();
    expect(() => sync.sync(undefined, 'value')).not.toThrow();
  });

  it('avoids redundant writes when already in sync', () => {
    const sync = new ComboboxDisplaySync();
    const inputRef = createInputRef('same');
    const valueSetter = vi.fn();
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    if (!descriptor?.get || !descriptor?.set) {
      throw new Error('Missing input value descriptor');
    }
    Object.defineProperty(inputRef.nativeElement, 'value', {
      configurable: true,
      get: descriptor.get.bind(inputRef.nativeElement),
      set(next: string) {
        valueSetter(next);
        descriptor.set?.call(inputRef.nativeElement, next);
      },
    });

    sync.sync(inputRef, 'same');
    sync.sync(inputRef, 'same');

    expect(valueSetter).toHaveBeenCalledTimes(0);
  });
});
