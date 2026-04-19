import type { Observable } from 'rxjs';

export interface SnackbarAutoCloseState {
  /** Initial auto-close duration in ms. `0` means no auto-close. */
  durationMs: number;
  /** Remaining time until auto-close. */
  remainingMs: number;
  /** Remaining progress ratio (`1` -> `0`). */
  progress: number;
  /** Whether auto-close countdown is currently paused. */
  paused: boolean;
}

/**
 * Reference to an open snackbar. Use to close it (with an optional value) and to
 * subscribe to afterClosed. The value passed to close() is emitted by afterClosed().
 */
export interface SnackbarRef<T = unknown> {
  /** Closes the snackbar and emits the value on afterClosed(). */
  close(value?: T): void;
  /** Alias for close(). */
  dismiss(value?: T): void;
  /** Emits once when the snackbar is closed; emits the value passed to close(value). */
  afterClosed(): Observable<T | undefined>;
  /** The snackbar pane element when attached; null when detached. */
  getPaneElement(): HTMLElement | null;
  /** Emits current auto-close state changes (`duration`, `remaining`, `progress`, `paused`). */
  autoCloseState(): Observable<SnackbarAutoCloseState>;
  /** Pauses the auto-close countdown. No-op when auto-close is disabled. */
  pauseAutoClose(): void;
  /** Resumes the auto-close countdown. No-op when auto-close is disabled. */
  resumeAutoClose(): void;
}
