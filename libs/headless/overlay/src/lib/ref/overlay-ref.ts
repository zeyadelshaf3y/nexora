import type { Observable } from 'rxjs';

import type { Portal } from '../portal/portal';

import type { ClosePolicy } from './close-policy';
import type { CloseReason } from './close-reason';
import type { BeforeCloseCallback, PanelDimensionOptions } from './overlay-config';

/**
 * Public reference to an overlay instance.
 * Created by {@link OverlayService.create} or {@link OverlayService.open}.
 *
 * Consumers and strategies should depend only on this interface. The overlay stack
 * and event handling use the same interface (e.g. {@link getClosePolicy}, {@link containsAnchor}).
 */
export interface OverlayRef {
  /** Unique overlay id. */
  readonly id: string;
  /** Scope id used for stacking and close scope (e.g. 'global' or custom). */
  readonly scopeId: string;

  /** Attaches the portal. Resolves to true if opened, false if prevented by beforeOpen. */
  attach(portal: Portal): Promise<boolean>;
  /** Detaches the portal from the DOM; does not run close animation. */
  detach(): void;
  /** Disposes the overlay (triggers close). Use afterClosed() or await close() to run logic after close. */
  dispose(): void;
  /** Closes the overlay. Resolves to true if closed, false if prevented by beforeClose. */
  close(reason?: CloseReason): Promise<boolean>;
  /** Overrides close animation duration for subsequent close calls. */
  setCloseAnimationDurationMs(durationMs: number | undefined): void;
  /** True while the overlay is attached (open) and has not been closed/disposed. */
  isOpen(): boolean;
  /** Emits once after the overlay is attached and content is created; completes after one emission. */
  afterOpened(): Observable<void>;
  /**
   * Emits the close reason at the moment close is committed (after guards pass, before the close
   * animation). Use to react as closing begins; completes after one emission. For "fully closed",
   * use {@link afterClosed}.
   */
  beforeClosed(): Observable<CloseReason | undefined>;
  /** Emits the close reason when the overlay has closed; completes after one emission. */
  afterClosed(): Observable<CloseReason | undefined>;

  /**
   * Updates the pane size at runtime and repositions. Merges with the size given at open time;
   * pass only the dimensions you want to change. Useful from inside the opened component (via
   * {@link OVERLAY_REF}) to grow/shrink the overlay in response to user actions. No-op when detached.
   */
  updateSize(size: Partial<PanelDimensionOptions>): void;
  /**
   * Adds CSS class(es) to the pane at runtime. No-op when detached. Useful from inside the opened
   * component (via {@link OVERLAY_REF}) to toggle a modifier class (e.g. an "expanded" state).
   */
  addPanelClass(classes: string | string[]): void;
  /** Removes CSS class(es) from the pane at runtime. No-op when detached. */
  removePanelClass(classes: string | string[]): void;
  /**
   * Registers an extra before-close guard. Runs after the `beforeClose` passed at open time and
   * after any previously added guards; returning `false` (or a promise of `false`) prevents close.
   * Returns a function that removes the guard. Useful from inside the opened component (via
   * {@link OVERLAY_REF}) to veto close based on its own state (e.g. unsaved changes).
   */
  addCloseGuard(guard: BeforeCloseCallback): () => void;

  /** Pane element when attached; null when detached. Use for focus or measuring. */
  getPaneElement(): HTMLElement | null;
  /** Backdrop element when attached and hasBackdrop; null otherwise. */
  getBackdropElement(): HTMLElement | null;
  /** Current close policy (escape, outside, backdrop). Read-only. */
  getClosePolicy(): Readonly<ClosePolicy>;
  /** True if the node is the overlay anchor or inside it (e.g. trigger). Used to avoid closing on trigger click. */
  containsAnchor(node: Node): boolean;
  /**
   * Element that counts as "inside" for outside-click. When set, clicks inside this element do not close the overlay.
   * Used for dashboard layouts so clicks on header/sidebar do not close a content-scoped dialog.
   */
  getOutsideClickBoundary(): HTMLElement | null;
  /** Parent overlay when opened from inside another (e.g. popover in dialog). Null for root overlays. */
  getParentRef(): OverlayRef | null;
  /** Called when an outside click is attempted and policy is 'none'. Overlay may show feedback; default is no-op. */
  notifyOutsideClickAttempted(): void;
  /** Re-applies the position strategy (e.g. after stack order changed). No-op when detached. */
  reposition(): void;
  /** Updates z-index (used by the overlay stack). No-op when detached. */
  setZIndex(z: number): void;
  /**
   * When set in config, this overlay uses that z-index instead of stack order.
   * Used by the stack to support per-overlay override (e.g. one modal above everything).
   */
  getBaseZIndex?(): number | undefined;
}
