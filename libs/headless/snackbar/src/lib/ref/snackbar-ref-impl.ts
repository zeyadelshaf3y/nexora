import { type OverlayRef, subscribeOnceAfterClosed } from '@nexora-ui/overlay';
import { Subject, type Observable } from 'rxjs';

import type { SnackbarRef } from './snackbar-ref';

/**
 * Wraps an {@link OverlayRef} and adds typed close-with-value semantics for snackbars.
 * @internal — consumers should depend on {@link SnackbarRef} only.
 */
export class SnackbarRefImpl<T = unknown> implements SnackbarRef<T> {
  private readonly closedSubject = new Subject<T | undefined>();
  private closed = false;

  constructor(private readonly overlayRef: OverlayRef) {
    subscribeOnceAfterClosed(this.overlayRef, () => this.onOverlayClosed());
  }

  close(value?: T): void {
    if (this.closed) return;

    this.closed = true;
    this.closedSubject.next(value);
    this.closedSubject.complete();
    void this.overlayRef.close();
  }

  dismiss(value?: T): void {
    this.close(value);
  }

  afterClosed(): Observable<T | undefined> {
    return this.closedSubject.asObservable();
  }

  getPaneElement(): HTMLElement | null {
    return this.overlayRef.getPaneElement();
  }

  /** Re-applies position (e.g. after another snackbar in the stack closed). No-op when closed. */
  reposition(): void {
    if (!this.closed) this.overlayRef.reposition();
  }

  /** Handles the overlay closing externally (Escape, outside click, programmatic). */
  private onOverlayClosed(): void {
    if (!this.closed) {
      this.closed = true;
      this.closedSubject.next(undefined);
      this.closedSubject.complete();
    }
  }
}
