import type { Observable } from 'rxjs';

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
}
