import {
  inject,
  Injectable,
  type TemplateRef,
  type Type,
  type ViewContainerRef,
} from '@angular/core';
import {
  type OverlayConfig,
  type ComponentPortal,
  isComponent,
  NoopFocusStrategy,
  NoopScrollStrategy,
  OverlayService,
  subscribeOnceAfterClosed,
} from '@nexora-ui/overlay';
import {
  applyComponentInputs,
  registerCloseableRef,
  resolveViewContainerRefFromExplicitOptions,
  subscribeComponentOutputs,
  unsubscribeComponentOutputSubscriptions,
} from '@nexora-ui/overlay/internal';

import type { SnackbarOpenOptions } from '../options/snackbar-open-options';
import type { SnackbarPlacement } from '../position/snackbar-placement';
import { SnackbarPositionStrategy } from '../position/snackbar-position-strategy';
import type { SnackbarRef } from '../ref/snackbar-ref';
import { SnackbarRefImpl } from '../ref/snackbar-ref-impl';

import {
  createSnackbarContentPortal,
  createSnackbarOpenInjector,
  type SnackbarInternalRef,
  SNACKBAR_OVERLAY_CLOSE_POLICY,
} from './internal/snackbar-open-helpers';
import { SnackbarStackRegistry } from './internal/snackbar-stack-registry';

/** Default auto-close duration in ms. Override via `options.duration`. */
export const DEFAULT_SNACKBAR_DURATION = 4000;

/** Default snackbar placement. Override via `options.placement`. */
export const DEFAULT_SNACKBAR_PLACEMENT: SnackbarPlacement = 'bottom-end';

/**
 * Headless snackbar service. Opens snackbars with template or component content.
 * Snackbars are positioned at viewport edges and stack per placement. No default
 * styling — user provides panelClass/panelStyle and content. Tree-shakable: only
 * import when using snackbars.
 */
@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly overlay = inject(OverlayService);
  private readonly stack = new SnackbarStackRegistry();

  /**
   * Opens a snackbar. Returns a ref to close it and subscribe to `afterClosed()`.
   * Duration `0` = no auto-close. Pass `groupId` to replace an existing snackbar in the same group.
   *
   * @throws Error if a ViewContainerRef cannot be obtained (pass viewContainerRef in options, pass an injector that provides ViewContainerRef, or ensure the overlay container can be created (DOM available).
   */
  open<T = unknown>(
    content: TemplateRef<unknown> | Type<T>,
    options: SnackbarOpenOptions = {},
  ): SnackbarRef<T> {
    const placement = options.placement ?? DEFAULT_SNACKBAR_PLACEMENT;
    const duration = options.duration ?? DEFAULT_SNACKBAR_DURATION;
    const groupId = options.groupId;

    const vcr = this.resolveViewContainerRef(options);
    this.stack.closeExistingInGroup(groupId);

    const refHolder: { current: SnackbarRefImpl<T> | null } = { current: null };

    const getStackOffset = (): number =>
      this.stack.getStackOffsetForRef(placement, refHolder.current, options);

    const overlayRef = this.overlay.create(
      this.buildOverlayConfig(placement, options, getStackOffset),
    );
    refHolder.current = new SnackbarRefImpl<T>(overlayRef);
    const snackbarRef = refHolder.current;
    this.stack.registerRef(placement, snackbarRef);

    subscribeOnceAfterClosed(snackbarRef, () => {
      this.stack.unregisterRef(placement, snackbarRef);
      if (groupId) this.stack.unregisterRefByGroupId(groupId, snackbarRef);
      this.stack.repositionPlacementStack(placement);
    });

    if (groupId) this.stack.registerRefByGroupId(groupId, snackbarRef);

    const injector = createSnackbarOpenInjector(content, options, snackbarRef);
    const portal = createSnackbarContentPortal(content, vcr, injector);

    overlayRef.attach(portal).then((opened) => {
      this.handleAttachResult(opened, {
        overlayRef,
        placement,
        snackbarRef,
        groupId,
        portal,
        content,
        options,
        duration,
      });
    });

    return snackbarRef;
  }

  // ---------------------------------------------------------------------------
  // Private: open flow — view container, group, config, portal, attach
  // ---------------------------------------------------------------------------

  private resolveViewContainerRef(options: SnackbarOpenOptions): ViewContainerRef {
    const vcr = resolveViewContainerRefFromExplicitOptions(
      { viewContainerRef: options.viewContainerRef, injector: options.injector },
      () => this.overlay.getDefaultViewContainerRef(),
    );
    if (!vcr) {
      throw new Error(
        'SnackbarService.open(): could not obtain a ViewContainerRef. Pass viewContainerRef in options, pass an injector that provides ViewContainerRef, or ensure the overlay container can be created (DOM available).',
      );
    }

    return vcr;
  }

  private buildOverlayConfig(
    placement: SnackbarPlacement,
    options: SnackbarOpenOptions,
    getStackOffset: () => number,
  ): OverlayConfig {
    const positionStrategy = new SnackbarPositionStrategy(placement, getStackOffset, {
      padding: options.padding,
    });

    return {
      ...(options.host != null && { host: options.host }),
      positionStrategy,
      scrollStrategy: new NoopScrollStrategy(),
      focusStrategy: new NoopFocusStrategy(),
      hasBackdrop: false,
      closePolicy: SNACKBAR_OVERLAY_CLOSE_POLICY,
      closeAnimationDurationMs: options.closeAnimationDurationMs ?? 0,
      width: options.width,
      maxWidth: options.maxWidth,
      panelClass: options.panelClass,
      panelStyle: options.panelStyle,
      ariaLabel: options.ariaLabel,
      ariaLabelledBy: options.ariaLabelledBy,
    };
  }

  private handleAttachResult(
    opened: boolean,
    params: {
      overlayRef: { dispose: () => void; getPaneElement: () => HTMLElement | null };
      placement: SnackbarPlacement;
      snackbarRef: SnackbarInternalRef;
      groupId: string | undefined;
      portal: ComponentPortal<unknown>;
      content: TemplateRef<unknown> | Type<unknown>;
      options: SnackbarOpenOptions;
      duration: number;
    },
  ): void {
    const { overlayRef, placement, snackbarRef, groupId, portal, content, options, duration } =
      params;
    if (!opened) {
      this.stack.unregisterRef(placement, snackbarRef);
      if (groupId) this.stack.unregisterRefByGroupId(groupId, snackbarRef);
      overlayRef.dispose();

      return;
    }
    this.setupAttachedPane(overlayRef, placement, snackbarRef);
    this.applyComponentBindings(portal, content, options, snackbarRef);
    this.scheduleAutoClose(snackbarRef, duration);
  }

  private setupAttachedPane(
    overlayRef: { getPaneElement: () => HTMLElement | null },
    placement: SnackbarPlacement,
    snackbarRef: SnackbarInternalRef,
  ): void {
    const pane = overlayRef.getPaneElement();
    if (!pane) return;

    registerCloseableRef(pane, snackbarRef);
    pane.setAttribute('role', 'status');
    pane.setAttribute('aria-live', 'polite');
    pane.setAttribute('aria-atomic', 'true');
    this.stack.stackMetrics.trackPane(snackbarRef, pane, () =>
      this.stack.repositionPlacementStack(placement),
    );
  }

  // ---------------------------------------------------------------------------
  // Private: component bindings
  // ---------------------------------------------------------------------------

  private applyComponentBindings(
    portal: ComponentPortal<unknown>,
    content: TemplateRef<unknown> | Type<unknown>,
    options: SnackbarOpenOptions,
    ref: SnackbarInternalRef,
  ): void {
    if (!isComponent(content)) return;

    const compRef = portal.componentRef;

    if (!compRef) return;

    if (options.inputs) {
      applyComponentInputs(compRef, options.inputs);
    }

    if (options.outputs) {
      const subs = subscribeComponentOutputs(compRef, content, options.outputs);

      if (subs.length > 0) {
        subscribeOnceAfterClosed(ref, () => unsubscribeComponentOutputSubscriptions(subs));
      }
    }
  }

  private scheduleAutoClose(ref: SnackbarInternalRef, duration: number): void {
    if (duration <= 0) return;

    const tid = setTimeout(() => ref.close(), duration);
    subscribeOnceAfterClosed(ref, () => clearTimeout(tid));
  }
}
