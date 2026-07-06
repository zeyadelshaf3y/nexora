import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  Injector,
  input,
  isDevMode,
  type OnDestroy,
} from '@angular/core';

import { OVERLAY_SELECTOR_PANE } from '../defaults/overlay-attributes';

import {
  parseDrawerPanePlacement,
  resolveDrawerDragHandleEdge,
} from './drawer-drag-dismiss-vector';
import { getDrawerDragController } from './drawer-drag-registry';

/**
 * Marks an element as the drag handle for drawer drag-to-close.
 * Requires `dragToClose: true` (or config) on {@link DrawerService.open}.
 *
 * Sets `data-nxr-drawer-drag-edge` on the host for placement-aware styling:
 * `block-end` (top drawer), `block-start` (bottom), `inline-end` (start), `inline-start` (end).
 *
 * @example
 * ```html
 * <div class="drawer-handle" nxrDrawerDragHandle aria-hidden="true"></div>
 * ```
 */
@Directive({
  selector: '[nxrDrawerDragHandle]',
  standalone: true,
  host: {
    class: 'nxr-drawer-drag-handle',
    '[style.touch-action]': '"none"',
  },
})
export class DrawerDragHandleDirective implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  /** Override dismiss threshold (0–1) for this handle. */
  readonly nxrDrawerDragHandleThreshold = input<number | undefined>(undefined);

  /** Override min dismiss velocity (px/ms) for this handle. */
  readonly nxrDrawerDragHandleMinVelocity = input<number | undefined>(undefined);

  private unregister: (() => void) | null = null;
  private registered = false;

  constructor() {
    afterNextRender(() => this.registerHandle(), { injector: this.injector });
  }

  ngOnDestroy(): void {
    this.unregister?.();
    this.unregister = null;
  }

  private registerHandle(): void {
    if (this.registered || this.destroyRef.destroyed) return;

    const handle = this.el.nativeElement;
    const pane = handle.closest(OVERLAY_SELECTOR_PANE) as HTMLElement | null;

    if (!pane) {
      if (isDevMode()) {
        console.warn('Nexora: nxrDrawerDragHandle must be used inside drawer content.');
      }

      return;
    }

    const placement = parseDrawerPanePlacement(pane);

    if (!placement) {
      if (isDevMode()) {
        console.warn(
          'Nexora: nxrDrawerDragHandle must be used inside a drawer overlay pane (data-placement not ready).',
        );
      }

      return;
    }

    const controller = getDrawerDragController(pane);

    if (!controller) {
      if (isDevMode()) {
        console.warn(
          'Nexora: nxrDrawerDragHandle has no effect without dragToClose: true on DrawerService.open().',
        );
      }

      return;
    }

    handle.setAttribute('data-nxr-drawer-drag-edge', resolveDrawerDragHandleEdge(placement));

    const threshold = this.nxrDrawerDragHandleThreshold();
    const minVelocity = this.nxrDrawerDragHandleMinVelocity();
    const configOverride =
      threshold != null || minVelocity != null
        ? {
            ...(threshold != null ? { threshold } : {}),
            ...(minVelocity != null ? { minVelocity } : {}),
          }
        : undefined;

    controller.registerHandle(handle, configOverride);

    this.unregister = () => controller.unregisterHandle(handle);
    this.registered = true;
  }
}
