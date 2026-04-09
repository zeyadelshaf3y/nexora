/**
 * DropdownRef — encapsulates overlay lifecycle, focus restore, and resize observation
 * for dropdown-style panels (select, menu, combobox).
 *
 * Consumers create a ref with options, call open(portal) to attach content, and
 * delegate trigger keydown (when open) via handleTriggerKeydown. Focus is restored
 * to the anchor on close unless the user tabbed away (Tab closes and skips restore).
 */

import { createRafThrottled, observeResize, safeFocus } from '@nexora-ui/core';
import {
  CLOSE_REASON_OUTSIDE,
  CLOSE_REASON_PROGRAMMATIC,
  type CloseReason,
  type OverlayRef,
  type Portal,
  subscribeOnceAfterClosed,
} from '@nexora-ui/overlay';
import { afterClosedOnceUntilDestroyed } from '@nexora-ui/overlay/internal';

import { resolveDropdownOption } from '../utils/resolve-option';

import type { DropdownRefOptions } from './dropdown-ref-options';
import {
  buildDropdownOverlayConfig,
  resolveDropdownOverlayOptions,
} from './dropdown-ref-overlay-config';

export type { DropdownConfigPreset, DropdownRefOptions } from './dropdown-ref-options';
export type { DropdownOption } from '../utils/resolve-option';

/**
 * Manages overlay lifecycle, focus restore, and trigger resize observation
 * for a single dropdown instance. Create with DropdownRef.create(options),
 * then open(portal), close(), and handleTriggerKeydown as needed. Call destroy() on teardown.
 */
export class DropdownRef {
  private readonly options: Readonly<DropdownRefOptions>;
  private overlayRef: OverlayRef | null = null;
  /** Resolves after the current overlay's afterClosed (close animation + teardown). */
  private closingInFlight: Promise<void> | null = null;
  private resolveClosing: (() => void) | null = null;
  private afterClosedSubscription: { unsubscribe(): void } | null = null;
  private resizeCleanup: (() => void) | null = null;
  private skipFocusRestore = false;

  private constructor(options: DropdownRefOptions) {
    this.options = options;
  }

  static create(options: DropdownRefOptions): DropdownRef {
    return new DropdownRef(options);
  }

  /** Whether the dropdown panel is currently open. */
  isOpen(): boolean {
    return this.overlayRef != null;
  }

  /**
   * Opens the dropdown with the given portal.
   * Returns false if already open, no anchor, or attach failed.
   *
   * If a close is still finishing, this method **awaits** that work before attempting to open.
   * Callers should not rely on overlapping open calls; rapid open-after-close is serialized.
   */
  async open(portal: Portal): Promise<boolean> {
    if (this.closingInFlight) {
      await this.closingInFlight;
    }
    if (this.overlayRef) return false;

    const anchor = this.options.getAnchor();

    if (!anchor) return false;

    const resolved = resolveDropdownOverlayOptions(this.options);
    const config = buildDropdownOverlayConfig(anchor, resolved);
    const ref = this.options.overlay.create(config);
    this.overlayRef = ref;
    let attached = false;

    try {
      attached = await ref.attach(portal);
    } catch {
      return this.failOpenAndDispose(ref);
    }

    if (!attached) {
      return this.failOpenAndDispose(ref);
    }

    this.subscribeAfterClosed(ref);

    this.options.onOpened?.();
    this.attachResizeObserver(anchor, ref);

    return true;
  }

  /**
   * Closes the dropdown. No-op when already closed.
   * @param reason Close reason passed to overlay and onClosed
   * @param options When `skipFocusRestore` is true, focus is not restored to the trigger/input on close.
   */
  close(reason?: CloseReason, options?: { skipFocusRestore?: boolean }): void {
    if (!this.overlayRef) {
      this.skipFocusRestore = false;

      return;
    }

    if (options?.skipFocusRestore) {
      this.skipFocusRestore = true;
    }

    const ref = this.overlayRef;
    if (!this.closingInFlight) {
      this.closingInFlight = new Promise<void>((resolve) => {
        this.resolveClosing = resolve;
      }).finally(() => {
        this.closingInFlight = null;
      });
    }

    void ref.close(reason ?? CLOSE_REASON_PROGRAMMATIC);
  }

  /**
   * Handles keydown on the trigger when the panel is open.
   * Tab → close and skip focus restore; Escape → close; otherwise forwards to forwardToPanel.
   * When closed, does nothing (caller handles OPEN_KEYS and opening).
   */
  handleTriggerKeydown(event: KeyboardEvent, forwardToPanel?: (ev: KeyboardEvent) => void): void {
    if (!this.overlayRef) return;

    if (this.handleTabClose(event) || this.handleEscapeClose(event)) return;

    forwardToPanel?.(event);
  }

  /** Disposes the overlay and clears state. Call on destroy. */
  destroy(): void {
    this.overlayRef?.dispose();
    this.teardown();
    this.releaseClosingWaiters();
  }

  /** Returns the current overlay ref when open; null when closed. For advanced use (e.g. focus panel). */
  getOverlayRef(): OverlayRef | null {
    return this.overlayRef;
  }

  private handleOverlayClosed(reason: CloseReason | undefined): void {
    if (reason === CLOSE_REASON_OUTSIDE) {
      this.skipFocusRestore = true;
    }
    const shouldRestoreFocus = !this.skipFocusRestore;
    this.skipFocusRestore = false;
    this.teardown();
    this.options.onClosed?.(reason);
    if (shouldRestoreFocus) {
      const target = this.resolveFocusRestoreTarget();

      if (target) safeFocus(target);
    }
    this.releaseClosingWaiters();
  }

  private subscribeAfterClosed(ref: OverlayRef): void {
    const next = (reason: CloseReason | undefined) => this.handleOverlayClosed(reason);
    if (this.options.destroyRef) {
      afterClosedOnceUntilDestroyed(ref, this.options.destroyRef).subscribe(next);

      return;
    }
    this.afterClosedSubscription = subscribeOnceAfterClosed(ref, next);
  }

  private handleTabClose(event: KeyboardEvent): boolean {
    if (event.key !== 'Tab') return false;
    this.skipFocusRestore = true;
    this.close();

    return true;
  }

  private handleEscapeClose(event: KeyboardEvent): boolean {
    if (event.key !== 'Escape') return false;
    event.preventDefault();
    this.close();

    return true;
  }

  private resolveFocusRestoreTarget(): HTMLElement | null {
    return this.options.getFocusRestoreTarget?.() ?? this.options.getAnchor();
  }

  private failOpenAndDispose(ref: OverlayRef): false {
    ref.dispose();

    if (this.overlayRef === ref) this.overlayRef = null;

    return false;
  }

  private releaseClosingWaiters(): void {
    const resolve = this.resolveClosing;
    this.resolveClosing = null;
    resolve?.();
  }

  private teardown(): void {
    this.resizeCleanup?.();
    this.resizeCleanup = null;
    this.afterClosedSubscription?.unsubscribe();
    this.afterClosedSubscription = null;
    this.overlayRef = null;
  }

  private attachResizeObserver(anchor: HTMLElement, ref: OverlayRef): void {
    if (resolveDropdownOption(this.options.matchTriggerWidth, true) !== true) return;

    let lastAppliedWidth = anchor.offsetWidth;

    const throttled = createRafThrottled(() => {
      const pane = ref.getPaneElement();

      if (!pane) return;

      const nextWidth = anchor.offsetWidth;

      if (nextWidth === lastAppliedWidth) return;

      pane.style.width = `${nextWidth}px`;
      lastAppliedWidth = nextWidth;
      ref.reposition();
    });

    const stopObserving = observeResize(anchor, throttled.run);
    this.resizeCleanup = () => {
      throttled.cancel();

      stopObserving();
    };
  }
}
