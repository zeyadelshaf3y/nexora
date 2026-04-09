import { inject, Injectable } from '@angular/core';
import { reindexStackIndicesAfterRemoval } from '@nexora-ui/core';

import { OVERLAY_BASE_Z_INDEX } from '../defaults/overlay-z-index';
import type { OverlayRef } from '../ref/overlay-ref';

/**
 * Contract for the overlay stack: register/unregister refs and query order.
 * Used by overlay ref implementation and events service; the default implementation
 * is {@link OverlayStackService}.
 */
export interface IOverlayStack {
  /** Registers an overlay ref. Throws if id is already registered. */
  register(ref: OverlayRef): void;
  /** Unregisters an overlay ref. */
  unregister(ref: OverlayRef): void;
  /** Returns the topmost overlay ref, or null if stack is empty. */
  getTop(): OverlayRef | null;
  /** Returns a read-only snapshot of the stack (bottom to top). */
  getStack(): ReadonlyArray<OverlayRef>;
}

/**
 * Default overlay stack: keeps refs in registration order and assigns z-index
 * so the topmost overlay is on top. Uses {@link OVERLAY_BASE_Z_INDEX} so apps
 * can place overlays above header/sidebar (e.g. base 10002 when chrome uses 10001).
 */
@Injectable({ providedIn: 'root' })
export class OverlayStackService implements IOverlayStack {
  private readonly baseZIndex = inject(OVERLAY_BASE_Z_INDEX);
  private readonly stack: OverlayRef[] = [];
  private readonly ids = new Set<string>();
  /** Stack slot per ref; avoids `indexOf` on unregister when stacks are deep. */
  private readonly refStackIndex = new Map<OverlayRef, number>();

  register(ref: OverlayRef): void {
    const { id } = ref;

    if (this.ids.has(id)) {
      throw new Error(`Overlay with duplicate id already registered: ${id}`);
    }

    this.ids.add(id);
    this.stack.push(ref);
    this.refStackIndex.set(ref, this.stack.length - 1);
    this.updateZIndices();
  }

  unregister(ref: OverlayRef): void {
    let i = this.refStackIndex.get(ref);

    if (i === undefined) {
      i = this.stack.indexOf(ref);
    }

    if (i !== -1) {
      this.ids.delete(ref.id);
      this.stack.splice(i, 1);
      this.refStackIndex.delete(ref);

      reindexStackIndicesAfterRemoval(this.stack, this.refStackIndex, i);
    }

    this.updateZIndices();
  }

  getTop(): OverlayRef | null {
    return this.stack.at(-1) ?? null;
  }

  getStack(): ReadonlyArray<OverlayRef> {
    return this.stack;
  }

  private updateZIndices(): void {
    const base = this.baseZIndex;
    const s = this.stack;

    for (const [index, ref] of s.entries()) {
      const override = ref.getBaseZIndex?.();

      ref.setZIndex(override !== undefined && Number.isFinite(override) ? override : base + index);
    }
  }
}
