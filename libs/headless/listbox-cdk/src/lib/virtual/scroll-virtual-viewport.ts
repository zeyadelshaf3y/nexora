import type { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import type { ListboxScrollAlignment } from '@nexora-ui/listbox';

/**
 * Overlap between the viewport element and the containing listbox strip.
 * Search starts at `parentElement` so the CDK viewport root is never mistaken for `role="listbox"`.
 */
export function getViewportVisibleHeightClippedByListbox(viewportEl: HTMLElement): number {
  if (typeof viewportEl.getBoundingClientRect !== 'function') {
    return viewportEl.clientHeight;
  }

  const listbox = viewportEl.parentElement?.closest('[role="listbox"]');
  if (listbox == null) {
    return viewportEl.clientHeight;
  }

  const vr = viewportEl.getBoundingClientRect();
  const lr = listbox.getBoundingClientRect();
  const overlap = Math.min(vr.bottom, lr.bottom) - Math.max(vr.top, lr.top);

  return Math.max(0, Math.min(viewportEl.clientHeight, overlap));
}

export interface VirtualViewportLike {
  elementRef: { nativeElement: HTMLElement };
  scrollToIndex(index: number): void;
  scrollToOffset?(offset: number): void;
  checkViewportSize?(): void;
}

/** CDK viewport matches {@link VirtualViewportLike}; kept explicit for callers and tests. */
export type VirtualScrollViewport = CdkVirtualScrollViewport | VirtualViewportLike;

export function scheduleVirtualViewportSync(viewport: VirtualViewportLike): void {
  const checkViewportSize = viewport.checkViewportSize;
  if (typeof checkViewportSize !== 'function') return;

  requestAnimationFrame(() => {
    checkViewportSize.call(viewport);
    requestAnimationFrame(() => checkViewportSize.call(viewport));
  });
}

export function scrollVirtualViewportToIndex(
  viewport: VirtualScrollViewport,
  index: number,
  alignment: ListboxScrollAlignment,
  itemSizePx: number,
  totalCount: number,
): void {
  const el = viewport.elementRef.nativeElement;
  const portHeight = el.clientHeight;
  const visibleHeight = getViewportVisibleHeightClippedByListbox(el);
  const rowWindowHeight = visibleHeight > 0 ? visibleHeight : portHeight;
  const scrollTop = el.scrollTop;
  const maxScroll = Math.max(0, totalCount * itemSizePx - portHeight);

  if (alignment === 'start') {
    viewport.scrollToIndex(index);
    scheduleVirtualViewportSync(viewport);
    return;
  }

  let effectiveAlignment: ListboxScrollAlignment = alignment;
  if (alignment === 'nearest') {
    if (itemSizePx > 0 && rowWindowHeight > 0 && totalCount > 0) {
      const rowTop = index * itemSizePx;
      const rowBottom = (index + 1) * itemSizePx;
      const winEnd = scrollTop + rowWindowHeight;
      const tol = 1;
      if (rowTop >= scrollTop - tol && rowBottom <= winEnd + tol) {
        return;
      }
      effectiveAlignment = rowTop < scrollTop - tol ? 'start' : 'end';
    } else {
      effectiveAlignment = 'end';
    }
  }

  if (effectiveAlignment === 'start') {
    viewport.scrollToIndex(index);
    scheduleVirtualViewportSync(viewport);
    return;
  }

  if (effectiveAlignment === 'end') {
    const targetOffset = Math.max(
      0,
      Math.min(maxScroll, (index + 1) * itemSizePx - rowWindowHeight),
    );
    if (typeof viewport.scrollToOffset === 'function') {
      viewport.scrollToOffset(targetOffset);
    } else {
      el.scrollTop = targetOffset;
    }
    scheduleVirtualViewportSync(viewport);
  }
}
