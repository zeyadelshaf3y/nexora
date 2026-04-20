import { type OverlayRef, subscribeOnceAfterClosed } from '@nexora-ui/overlay';
import { BehaviorSubject, Subject, type Observable } from 'rxjs';

import type { SnackbarAutoCloseState, SnackbarRef } from './snackbar-ref';

interface SnackbarAutoCloseControls {
  pause: () => void;
  resume: () => void;
}

/**
 * Wraps an {@link OverlayRef} and adds typed close-with-value semantics for snackbars.
 * @internal — consumers should depend on {@link SnackbarRef} only.
 */
export class SnackbarRefImpl<T = unknown> implements SnackbarRef<T> {
  private readonly closedSubject = new Subject<T | undefined>();
  private readonly autoCloseStateSubject = new BehaviorSubject<SnackbarAutoCloseState>({
    durationMs: 0,
    remainingMs: 0,
    progress: 0,
    paused: false,
  });
  private autoCloseControls: SnackbarAutoCloseControls | null = null;
  private closeValue: T | undefined;
  private closed = false;

  constructor(private readonly overlayRef: OverlayRef) {
    subscribeOnceAfterClosed(this.overlayRef, () => this.onOverlayClosed());
  }

  close(value?: T): void {
    if (this.closed) return;

    this.closed = true;
    this.closeValue = value;
    this.autoCloseControls = null;
    void this.overlayRef.close();
  }

  dismiss(value?: T): void {
    this.close(value);
  }

  afterClosed(): Observable<T | undefined> {
    return this.closedSubject.asObservable();
  }

  autoCloseState(): Observable<SnackbarAutoCloseState> {
    return this.autoCloseStateSubject.asObservable();
  }

  pauseAutoClose(): void {
    if (this.closed) return;
    this.autoCloseControls?.pause();
  }

  resumeAutoClose(): void {
    if (this.closed) return;
    this.autoCloseControls?.resume();
  }

  getPaneElement(): HTMLElement | null {
    return this.overlayRef.getPaneElement();
  }

  /** Re-applies position (e.g. after another snackbar in the stack closed). No-op when closed. */
  reposition(): void {
    if (!this.closed) this.overlayRef.reposition();
  }

  /** @internal */
  setAutoCloseState(state: SnackbarAutoCloseState): void {
    if (!this.closed) {
      this.autoCloseStateSubject.next(state);
    }
  }

  /** @internal */
  bindAutoCloseControls(controls: SnackbarAutoCloseControls | null): void {
    this.autoCloseControls = controls;
  }

  /** Handles the overlay closing externally (Escape, outside click, programmatic). */
  private onOverlayClosed(): void {
    if (!this.closed) {
      this.closed = true;
      this.autoCloseControls = null;
    }
    this.closedSubject.next(this.closeValue);
    this.closedSubject.complete();
    this.autoCloseStateSubject.complete();
  }
}
