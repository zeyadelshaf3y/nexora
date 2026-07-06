/** Dismiss axis and direction for drag-to-close. */
export type DragDismissAxis = 'x' | 'y';

export interface DragDismissVector {
  readonly axis: DragDismissAxis;
  /** +1 when positive delta along axis dismisses; -1 when negative delta dismisses. */
  readonly dismissSign: 1 | -1;
}

/** Strategy for resolving drag dismiss behavior per overlay surface (drawer, snackbar, …). */
export interface DragDismissStrategy {
  resolveDismissVector(pane: HTMLElement): DragDismissVector;
  getPaneSizeAlongAxis(pane: HTMLElement, axis: DragDismissAxis): number;
  getOffScreenOffset(pane: HTMLElement, axis: DragDismissAxis, dismissSign: 1 | -1): number;
  onDragStart?(pane: HTMLElement): void;
  onDragEnd?(pane: HTMLElement): void;
}
