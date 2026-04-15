/**
 * @fileoverview Document-level overlay behavior: Escape (closes top overlay) and
 * pointerdown (backdrop / outside click). Single service; listeners attached once when stack is first used.
 */
import { inject, Injectable } from '@angular/core';
import type { OnDestroy } from '@angular/core';
import { canUseDOM, listen, ownerDocument } from '@nexora-ui/core';

import type { CloseReason } from '../ref/close-reason';
import type { OverlayRef } from '../ref/overlay-ref';
import { OverlayStackService } from '../stack/overlay-stack.service';

/**
 * Global Escape and pointerdown handling for overlays.
 * Registers document-level listeners when first used (via OverlayService).
 *
 * Performance: one keydown and one pointerdown listener on document (attached once).
 * Pointer handling is O(stack length) per click; close-ref-and-descendants is O(stack length).
 * Typical stacks are small (dialog + popover + tooltip); no hard cap on depth.
 */
@Injectable({ providedIn: 'root' })
export class OverlayEventsService implements OnDestroy {
  private readonly stack = inject(OverlayStackService);

  private listenersAttached = false;
  private keydownCleanup: (() => void) | null = null;
  private pointerdownCleanup: (() => void) | null = null;

  constructor() {
    this.attachListeners();
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  private attachListeners(): void {
    if (this.listenersAttached || !canUseDOM()) return;

    const doc = ownerDocument();

    if (!doc) return;

    this.listenersAttached = true;
    this.keydownCleanup = listen(
      doc,
      'keydown',
      (e: Event) => this.handleKeydown(e as KeyboardEvent),
      true,
    );
    this.pointerdownCleanup = listen(
      doc,
      'pointerdown',
      (e: Event) => this.handlePointerDown(e as PointerEvent),
      true,
    );
  }

  ngOnDestroy(): void {
    this.keydownCleanup?.();
    this.pointerdownCleanup?.();
    this.keydownCleanup = null;
    this.pointerdownCleanup = null;
    this.listenersAttached = false;
  }

  // ─── Keyboard ──────────────────────────────────────────────────────────────

  private async handleKeydown(event: KeyboardEvent): Promise<void> {
    if (event.key !== 'Escape') return;
    const stack = this.stack.getStack();
    if (stack.length === 0) return;
    const refToClose = this.getTopEscapeClosableRef(stack);
    if (!refToClose) return;

    const closed = await refToClose.close('escape');
    if (closed) {
      event.preventDefault();
      // Only stop propagation when the overlay doesn't want the event to bubble
      // (default behavior). Use escapePropagation: 'bubble' for cases like menus
      // where parent overlays should also receive the Escape event.
      if (refToClose.getClosePolicy().escapePropagation !== 'bubble') {
        event.stopPropagation();
      }
    }
  }

  // ─── Pointer (stack order: top-first so topmost overlay handles the click) ─

  private async handlePointerDown(event: PointerEvent): Promise<void> {
    if (!(event.target instanceof Node)) return;
    const target = event.target;
    const stack = this.stack.getStack();
    if (stack.length === 0) return;

    for (let i = stack.length - 1; i >= 0; i--) {
      const consumed = await this.processPointerDown(stack[i], target, event);
      if (consumed) return;
    }
  }

  private getTopEscapeClosableRef(stack: readonly OverlayRef[]): OverlayRef | null {
    // Find topmost overlay that closes on Escape (skip overlays with escape: 'none' like snackbars).
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].getClosePolicy().escape === 'top') return stack[i];
    }

    return null;
  }

  /**
   * Returns true if the event was handled (inside pane, on backdrop, or outside close).
   */
  private async processPointerDown(
    ref: OverlayRef,
    target: Node,
    event: PointerEvent,
  ): Promise<boolean> {
    if (ref.getPaneElement()?.contains(target)) return true;

    if (ref.getBackdropElement()?.contains(target)) {
      await this.onBackdropClick(ref, event);

      return true;
    }

    return this.onOutsideClick(ref, target, event);
  }

  private async onBackdropClick(ref: OverlayRef, event: PointerEvent): Promise<void> {
    const policy = ref.getClosePolicy().backdrop;

    if (policy === 'self') {
      const closed = await this.closeRefAndDescendants(ref, 'backdrop');

      if (closed) event.preventDefault();
    } else {
      event.preventDefault();
    }
  }

  private async onOutsideClick(
    ref: OverlayRef,
    target: Node,
    event: PointerEvent,
  ): Promise<boolean> {
    const { outside } = ref.getClosePolicy();

    if (outside === 'none') {
      ref.notifyOutsideClickAttempted();

      return false;
    }

    if (outside !== 'top') return false;
    if (ref.containsAnchor(target)) return false;

    // When boundary is set (e.g. dashboard root), clicks inside it do not close the overlay.
    const boundary = ref.getOutsideClickBoundary?.();

    if (boundary?.contains(target)) return false;

    const refToClose = this.resolveOutsideClickCloseTarget(ref, target);

    const closed = await this.closeRefAndDescendants(refToClose, 'outside');

    if (closed) event.preventDefault();

    return closed;
  }

  private resolveOutsideClickCloseTarget(ref: OverlayRef, target: Node): OverlayRef {
    return this.findAncestorWithBackdropContaining(ref, target) ?? ref;
  }

  // ─── Close: ref + descendants (nested overlays in parent chain) ────────────

  /**
   * Closes the given ref and all stack overlays that have it in their parent chain.
   * Closes top-first (reverse order) so each ref is removed from the stack before closing the next;
   * ref.close() is idempotent (no-op if already closed).
   */
  private async closeRefAndDescendants(ref: OverlayRef, reason: CloseReason): Promise<boolean> {
    const stack = this.stack.getStack().slice();
    const idx = stack.indexOf(ref);

    if (idx === -1) return ref.close(reason);

    const refsToClose: OverlayRef[] = [ref];

    for (let j = idx + 1; j < stack.length; j++) {
      if (this.isDescendantOf(stack[j], ref)) refsToClose.push(stack[j]);
    }

    let didCloseAny = false;

    for (let k = refsToClose.length - 1; k >= 0; k--) {
      if (await refsToClose[k].close(reason)) didCloseAny = true;
    }

    return didCloseAny;
  }

  private isDescendantOf(child: OverlayRef, ancestor: OverlayRef): boolean {
    let cur: OverlayRef | null = child;

    while (cur) {
      if (cur === ancestor) return true;

      cur = cur.getParentRef();
    }

    return false;
  }

  /**
   * First ancestor (parent, grandparent, …) whose backdrop element contains the target.
   * Used to close dialog/drawer + nested overlays when user clicks the dark backdrop,
   * while closing only the popover when they click the dialog content (pane).
   */
  private findAncestorWithBackdropContaining(ref: OverlayRef, target: Node): OverlayRef | null {
    let cur: OverlayRef | null = ref.getParentRef();

    while (cur) {
      if (cur.getBackdropElement()?.contains(target)) return cur;

      cur = cur.getParentRef();
    }

    return null;
  }
}
