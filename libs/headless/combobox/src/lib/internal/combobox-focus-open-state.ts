export class ComboboxFocusOpenState {
  private skipNextOpenOnFocus = false;

  private queueSkipResetInternal(): void {
    queueMicrotask(() => {
      this.skipNextOpenOnFocus = false;
    });
  }

  consumeFocusRestore(): boolean {
    const skip = this.skipNextOpenOnFocus;
    if (skip) {
      this.queueSkipResetInternal();
    }

    return skip;
  }

  markSkipNextOpen(): void {
    this.skipNextOpenOnFocus = true;
  }

  queueSkipReset(): void {
    this.queueSkipResetInternal();
  }
}
